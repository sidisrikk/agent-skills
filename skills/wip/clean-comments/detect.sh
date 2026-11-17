#!/usr/bin/env bash
# Comment-noise detectors for clean-comments. Prints `bucket<TAB>path:line:text`.
# Usage: bash .agents/skills/clean-comments/detect.sh [path ...]   (paths from repo root; default: apps libs tools)
# Hits are candidates, not verdicts: classify each one with SKILL.md before editing.
set -euo pipefail
SKIP="$(cd "$(dirname "$0")" && pwd)/skip-paths"
cd "$(git rev-parse --show-toplevel)"
[ $# -gt 0 ] || set -- apps libs tools
# rg never filters the roots it is handed, so drop a scope that .gitignore or skip-paths covers.
scope=()
for p in "$@"; do
  if [ ! -e "$p" ]; then echo "skip: $p does not exist" >&2
  elif git -c core.excludesFile="$SKIP" check-ignore -q --no-index "${p%/}"; then
    echo "skip: $p is ignored by .gitignore or skip-paths" >&2
  else scope+=("$p"); fi
done
[ ${#scope[@]} -gt 0 ] || exit 0
set -- "${scope[@]}"

# Skip guardrail: rg honours every .gitignore/.ignore/.rgignore and skips hidden dirs;
# skip-paths adds tracked paths that must never be edited. Select files with -t, never -g:
# a -g glob overrides --ignore-file and silently re-includes skipped paths.
RG=(rg --no-heading --line-number --color never --ignore-file "$SKIP"
  --type-add 'src:*.{ts,tsx,js,mjs,cjs,cts,mts,prisma,yml,yaml}' --type-add 'src:Dockerfile*' -t src)
# A line counts as a comment when the match sits after a comment opener.
C='(//|/\*|^\s*\*|^\s*#)'

hit() { "${RG[@]}" -e "$2" "${@:3}" | sed "s/^/$1\t/" || true; }

hit plan-label     "$C.*\b(Phase [0-9]+|Task [0-9]+|refact[0-9]+|M[0-9]+|T[0-9]{2}|G[0-9]+\.[0-9]+)\b" "$@"
hit marker         "$C.*\b(TODO|FIXME|HACK|XXX)\b" "$@"
hit banner         '^\s*(//|#) ?(-{3,}|={3,}|#{3,})' "$@"
hit dead-code      '^\s*//\s*(const |let |var |await |return |import |export |if \(|for \(|[A-Za-z_$][\w.$]*\(.*\);\s*$)' "$@"
hit old-name       "$C.*(UIFactory|UI Factory)" "$@"
hit abs-path       "$C.*(file:///|/home/[a-z])" "$@"
hit adr-form       'ADR-[0-9]{4}' "$@"
hit shortcut       "$C\s*shortcut:" "$@"
# A directive with its reason after ` -- ` (eslint) or any text (ts) passes.
"${RG[@]}" -e '(eslint-disable(-next-line|-line)?|@ts-ignore|@ts-expect-error|@ts-nocheck)' "$@" \
  | rg -v -e 'eslint-disable[^*]* -- \S' -e '@ts-(ignore|expect-error|nocheck)\s+\S' \
  | sed 's/^/bare-directive\t/' || true

# Named npm scripts must exist in package.json.
"${RG[@]}" -o -e "$C.*npm run ([\w:.-]+)" -r 'npm run $2' "$@" 2>/dev/null \
  | while IFS= read -r line; do
      script=${line##*npm run }
      node -e "process.exit(require('./package.json').scripts[process.argv[1]] ? 0 : 1)" "$script" \
        || printf 'missing-script\t%s\n' "$line"
    done || true
