---
name: clean-comments
description: Sweep a path or the whole repo for comment sediment (plan labels, dead code, stale names and paths), classify each hit, and fix it after approval.
disable-model-invocation: true
---

# Clean comments

A comment stays when it is **load-bearing**. Everything else is **sediment**: layers that settled while the code moved on. This skill finds sediment, classifies it, and removes or fixes it without changing behaviour.

See [REFERENCE.md](REFERENCE.md) for guarded detector recipes, portable false positives, verification discovery, and optional repo overlays.

Scope is the path in the arguments, else `.` (repo root).

## Load-bearing rubric

- **Keep (load-bearing):** Explains *why* (non-obvious invariant, workaround, bug/issue/ADR link, public API contract, or linter directive with a reason).
- **Remove or Fix (sediment):** Restates *what* the code does, plan/phase/milestone/task labels, commented-out code, divider banners, stale paths/symbols/scripts, or bare suppression directives.
- **Project precedence:** If the repo defines a comment policy (for example in `CODING_STANDARDS.md`, `AGENTS.md`, or `CLAUDE.md`), read it before Step 2; its rules override this rubric.

## Skip guardrail

Edit only clean, non-ignored source files. Never scan or edit:

- anything matched by `.gitignore`, `.ignore`, `.rgignore`, or hidden directories;
- universal protected paths in [REFERENCE.md §Universal skips](REFERENCE.md#1-universal-skips--guardrail) plus any repo-root `.clean-comments.ignore` (gitignore syntax);
- **dirty files:** before Step 1, record `git status --porcelain -- <scope>`. Report hits in those files as Skipped and edit none of them.

## Steps

1. **Detect.** Check for optional repo overlays (`.clean-comments.ignore`, `.clean-comments.rules`, and any repo comment policy). Run the guarded detector block in [REFERENCE.md §Detector recipes](REFERENCE.md#2-detector-recipes) on `<scope>` and save the exact command for Step 5. For more than ~200 files of manual review on top of regex hits, fan out one read-only subagent per top-level directory or package in `<scope>` to catch restating and stale comments. Re-check every subagent claim with `rg` or `git ls-files` before reporting it.
   _Done when_ every bucket has a count, dirty files are recorded, and you hold the verified raw hits.

2. **Classify.** Apply the load-bearing rubric, any repo comment policy, and [REFERENCE.md §Classification & false positives](REFERENCE.md#3-classification--false-positives) to every hit. Sort each hit into **Keep**, **Fix**, or **Remove**. Discard known false positives. Confirm every path, symbol, or task/script name referenced by a comment actually exists.
   _Done when_ every hit is assigned and every named path, symbol, and script is verified.

3. **Report and stop.** Present one table per group (**Remove**, **Fix**) with `path:line`, the comment, and the planned edit. Include edit counts, any Skipped dirty files, and any tests asserting a changed string. Wait for the user's approval or edits to the list.
   _Done when_ the user approves a list.

4. **Edit comments only.** Apply the approved list. Re-check that no target path is dirty or ignored before writing. When removing a plan label, keep any surrounding *why* and point it at the owning file, issue, or ADR (matching repo convention). When a log or output string changes and a test asserts it, update that test in the same edit. Leave test structure labels alone unless explicitly approved.
   _Done when_ every approved item is applied and `git diff` touches only comment lines plus listed strings and their asserting tests.

5. **Verify.** Replay the exact Step 1 detector command on `<scope>`; confirm every remaining hit was approved as Keep. Discover and run the repo's formatter check, linter on touched areas, and any tests asserting changed strings (see [REFERENCE.md §Verification discovery](REFERENCE.md#4-verification-discovery)). Report exact commands and results.
   _Done when_ every check passes or its failure is reported verbatim.
