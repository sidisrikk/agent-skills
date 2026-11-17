---
name: clean-comments
description: Sweep a path or the whole repo for comment sediment (plan labels, dead code, stale names and paths), classify each hit, and fix it after approval.
disable-model-invocation: true
---

# Clean comments

A comment stays when it is **load-bearing**, as defined in `CODING_STANDARDS.md` → `## Comments`. Everything else is **sediment**: layers that settled while the code moved on. This skill finds the sediment, classifies it, and removes or fixes it without touching behaviour.

Scope is the path in the arguments, else `apps libs tools`.

## Skip guardrail

Edit only files `detect.sh` scans. It skips:

- everything any `.gitignore`, `.ignore`, or `.rgignore` covers, and hidden directories;
- tracked paths listed in `skip-paths` (gitignore syntax), such as applied Prisma migrations and fixtures. To protect a new path, add a line there with a one-line reason;
- **dirty files**: before step 1, record `git status --porcelain -- <scope>`. Those files hold someone's uncommitted work: report their hits as Skipped and edit none of them.

## Steps

1. **Detect.** Run `bash .agents/skills/clean-comments/detect.sh <scope>`. Each output line is `bucket<TAB>path:line:text`. For more than ~200 files of manual review on top of that, fan out one Explore subagent per area (`apps/api`, `apps/web`, `libs` + `tools` + e2e) to find restating and stale comments the regexes miss. Re-check every subagent claim with `rg` or `git ls-files` before it enters the report: subagents have reported real files as missing and invented product names.
   _Done when_ every bucket has a count and you hold the raw hits.

2. **Classify.** Apply the load-bearing test and the bullets of `CODING_STANDARDS.md` → `## Comments` to every hit, plus the sweep additions below. Sort each hit into Keep, Fix, or Remove. Discard the known false positives. For every path, symbol, or `npm run` script a comment names, confirm it exists.
   _Done when_ no hit is unassigned and every named path has been checked.

3. **Report and stop.** Show one table per group (Remove, Fix) with `path:line`, the comment, and the planned edit. Note how many edits there are and which tests assert a changed string. Wait for the user's approval or edits to the list.
   _Done when_ the user approves a list.

4. **Edit comments only.** Apply the approved list. When removing a plan label, keep the why that surrounds it and point it at the owning file or `ADR NNNN`. When a string changes in a log line or output and a test asserts it, update that test in the same change. Leave spec structure alone (see Sweep additions).
   _Done when_ every approved item is applied, and `git diff` changes only comment lines plus the listed strings and their asserting tests.

5. **Verify.** Re-run `detect.sh` on the scope; the remaining hits are all ones the user approved as Keep. Run `npx prettier --check <changed files>`, `npm run nx -- lint <project>` for each touched project, and the tests that assert changed strings. Report the exact commands and results.
   _Done when_ every check passes or its failure is reported with output.

## Sweep additions

`CODING_STANDARDS.md` → `## Comments` is the classification authority; read it before step 2. A sweep also meets these cases, which a single diff rarely does:

- **Old product name** "UIFactory" or "UI Factory" in prose: Fix to "My AI Apps" (`AGENTS.md` Ground Truth).
- **Absolute personal paths** (`file:///home/...`): Fix to a repo-relative path.
- **`ADR-NNNN`**: Fix to `ADR NNNN`.
- **Milestone labels** `MN` and plan-task IDs `TNN`, `GN.N`: these are plan labels too.
- **`NOTE:` prefix**: keep the text, drop the prefix when it adds nothing.
- **Given / When / Then labels** in specs: Keep. Removing them restyles specs, which `docs/guides/test-style.md` section 9 allows only as a named, planned batch kept to one layer.

## Known false positives

- Technical identifiers that keep the old name (`AGENTS.md` Ground Truth): `uifactory_session`, `uifactory_auth_tx`, `window.UIFactory`, `uifactory/` crypto salts, database names. "The UIFactory bridge" in prose means `window.UIFactory`: Keep.
- Milestone tokens that are also live names: `seed-m1.ts`, `db:seed:m1`. Only the prose label is sediment; the identifier stays.
- `/** @jest-environment ... */` headers are config, not JSDoc.
