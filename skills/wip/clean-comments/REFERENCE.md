# Clean comments — Reference

Consult each section on demand during the matching step in [SKILL.md](SKILL.md).

## 1. Universal skips & guardrail

Build a temporary merged ignore file combining these universal defaults with repo-root `.clean-comments.ignore` (if present):

```gitignore
# Agent / tool metadata
.agents/
.claude/
.cursor/
.gemini/

# Checksummed migrations, generated artifacts, fixtures, snapshots, vendored code
**/migrations/
**/*.min.*
**/*.generated.*
**/__snapshots__/
**/fixtures/
vendor/
```

**Critical `rg` rule:** Always select files with `--type-add` + `-t`, never with `-g` globs. Passing `-g` to `rg` overrides `--ignore-file` and silently re-includes skipped paths.

Always filter explicit scope arguments with `git check-ignore` before scanning, because `rg` does not apply ignore files to root paths passed directly on the command line.

## 2. Detector recipes

Run from repo root (`SCOPE` defaults to `.`). Save the exact invocation so Step 5 replays the same checks.

```bash
set -euo pipefail
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

# 1. Merge universal skips + optional repo .clean-comments.ignore
SKIP_TMP="$(mktemp)"
trap 'rm -f "$SKIP_TMP"' EXIT
cat <<'EOF' > "$SKIP_TMP"
.agents/
.claude/
.cursor/
.gemini/
**/migrations/
**/*.min.*
**/*.generated.*
**/__snapshots__/
**/fixtures/
vendor/
EOF
[ -f .clean-comments.ignore ] && printf '\n' >> "$SKIP_TMP" && cat .clean-comments.ignore >> "$SKIP_TMP"

# 2. Resolve and filter scope (replace "." with user scope args if provided)
raw_scope=(.)
scope=()
for p in "${raw_scope[@]}"; do
  if [ ! -e "$p" ]; then
    echo "skip: $p does not exist" >&2
  elif [ "$p" != "." ] && git -c core.excludesFile="$SKIP_TMP" check-ignore -q --no-index "${p%/}" 2>/dev/null; then
    echo "skip: $p is ignored" >&2
  else
    scope+=("$p")
  fi
done
[ ${#scope[@]} -gt 0 ] || exit 0

# 3. Guarded rg wrapper (-t only, never -g)
RG=(rg --no-heading --line-number --color never --ignore-file "$SKIP_TMP"
  --type-add 'src:*.{ts,tsx,js,jsx,mjs,cjs,cts,mts,py,go,rs,java,kt,rb,sh,bash,zsh,sql,prisma,yml,yaml,tf,c,cc,cpp,h,hpp,cs,php,swift,vue,svelte}'
  --type-add 'src:Dockerfile*' -t src)
C='(//|/\*|^\s*\*|^\s*#|^\s*--)'
hit() { "${RG[@]}" -e "$2" "${@:3}" | sed "s/^/$1\t/" || true; }

# 4. Universal buckets
hit plan-label "$C.*\b(Phase [0-9]+|Task [0-9]+|refact[0-9]+|M[0-9]+|T[0-9]{2}|G[0-9]+\.[0-9]+)\b" "${scope[@]}"
hit marker     "$C.*\b(TODO|FIXME|HACK|XXX)\b" "${scope[@]}"
hit banner     '^\s*(//|#|--)\s*(-{3,}|={3,}|#{3,})' "${scope[@]}"
hit dead-code  '^\s*(//|#)\s*(const |let |var |await |return |import |from |export |def |func |fn |if \(|for \(|[A-Za-z_$][\w.$]*\(.*\);\s*$)' "${scope[@]}"
hit abs-path   "$C.*(file:///|/home/[a-z]|/Users/[A-Za-z]|[A-Za-z]:\\\\Users\\\\)" "${scope[@]}"

# 5. Bare suppression directives (missing inline reason)
"${RG[@]}" -e '(eslint-disable(-next-line|-line)?|@ts-ignore|@ts-expect-error|@ts-nocheck|biome-ignore|#\s*noqa\b|#\s*type:\s*ignore\b|//nolint\b)' "${scope[@]}" \
  | rg -v -e 'eslint-disable[^*]* -- \S' \
          -e '@ts-(ignore|expect-error|nocheck)\s+\S' \
          -e 'biome-ignore[^:]*:\s*\S' \
          -e '#\s*(noqa|type:\s*ignore)[^#]*#\s*\S' \
          -e '//nolint[^/]*//\s*\S' \
  | sed 's/^/bare-directive\t/' || true

# 6. JS/TS package.json scripts referenced in comments (runs only if package.json + node exist)
if [ -f package.json ] && command -v node >/dev/null 2>&1; then
  "${RG[@]}" -o -e "$C.*(npm|pnpm|yarn|bun) run ([\w:.-]+)" -r '$2 run $3' "${scope[@]}" 2>/dev/null \
    | while IFS= read -r line; do
        script=${line##* run }
        node -e "const s=require('./package.json').scripts||{}; process.exit(s[process.argv[1]]?0:1)" "$script" \
          || printf 'missing-script\t%s\n' "$line"
      done || true
fi

# 7. Optional repo-specific rules (.clean-comments.rules: `bucket<TAB>regex`)
if [ -f .clean-comments.rules ]; then
  while IFS=$'\t' read -r bucket pattern; do
    [ -z "${bucket:-}" ] && continue
    [[ "$bucket" =~ ^# ]] && continue
    hit "$bucket" "$pattern" "${scope[@]}"
  done < .clean-comments.rules
fi
```

**Fallback (no `rg` or no bash):** Run the equivalent regex buckets with your available search tool, manually excluding every pattern in §1 and every dirty file from `git status --porcelain`.

## 3. Classification & false positives

### Common sweep additions

- **Absolute personal paths** (`file:///home/...`, `/Users/...`, `C:\Users\...`): Fix to a repo-relative path.
- **Milestone / task tokens** (`M1`, `T02`, `G1.2`, `Phase 3`, `Task 4`): Remove the plan label; keep any *why* that surrounds it.
- **`NOTE:` prefix:** Keep the explanation, drop the `NOTE:` prefix when it adds nothing.
- **Given / When / Then labels** in tests: Keep unless the user explicitly asks to restyle specs.

### Portable false positives (Keep)

- **Live identifiers / filenames matching milestone tokens:** e.g., `seed-m1.ts`, `db:seed:m1`, `M1` chip/hardware checks. Only prose plan labels are sediment.
- **Tooling & compiler pragmas:** `/** @jest-environment ... */`, `/** @vitest-environment ... */`, `//go:generate`, `//go:build`, `// @ts-check`, `# -*- coding: utf-8 -*-`, `#[allow(...)]` with reason, `# noqa: ... # reason`.
- **Fixture / parser test inputs:** Commented code inside strings or test files specifically testing comment parsing.
- **License / SPDX headers:** `SPDX-License-Identifier:` or copyright headers.

## 4. Verification discovery

Inspect the repo root before Step 5 instead of assuming one toolchain:

| Repo marker | Formatter / Linter check | Asserting tests |
| --- | --- | --- |
| `package.json` | Check `scripts` for `format:check`, `prettier`, `biome`, `lint`, or workspace runner (`nx`, `turbo`, `pnpm -r`) | `npm`/`pnpm`/`yarn`/`bun test <file>` |
| `pyproject.toml` | `ruff check`, `ruff format --check`, or `flake8` / `black --check` | `pytest <file>` |
| `go.mod` | `gofmt -l <files>` and `golangci-lint run` (if configured) | `go test <pkg>` |
| `Cargo.toml` | `cargo fmt --check` and `cargo clippy` | `cargo test <filter>` |
| `Makefile` / `justfile` | Prefer declared `lint` / `format-check` targets | Declared `test` target |

Run checks scoped to touched files/packages where supported.

## 5. Optional project overlay

Target repos need zero setup. To add project-specific rules without modifying the shared skill, add either or both files at the target repo root:

**`.clean-comments.ignore`** (gitignore syntax for tracked files never to edit):

```gitignore
# Custom API collection and parser fixture
api-collections/
tools/parser-comment.test.ts
```

**`.clean-comments.rules`** (`bucket<TAB>regex`, lines starting with `#` are ignored):

```tsv
# Flag deprecated product name in comments
old-name	(//|/\*|^\s*\*|^\s*#).*(OldProduct|Old Product)
# Enforce ADR spacing convention
adr-form	ADR-[0-9]{4}
```

Project-specific classification rules and false positives (such as technical identifiers that intentionally retain an old name) belong in the repo's existing `CODING_STANDARDS.md`, `AGENTS.md`, or `CLAUDE.md`.
