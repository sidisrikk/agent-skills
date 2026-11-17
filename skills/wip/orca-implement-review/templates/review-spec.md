# Task: review `git diff <base sha>` in <repo path> (branch <branch>), read-only

The coordinator may commit during your review. Compare against `<base sha>`, never `HEAD`:
read old code with `git show <base sha>:<path>`.

Review method: <review skill>. If it is `ponytail-review`, read
`/home/wasuthep/.claude/plugins/cache/ponytail/ponytail/<version>/skills/ponytail-review/SKILL.md`
(or invoke the skill directly if your agent has it) and follow its method and output format.
Also apply every rule in CODING_STANDARDS.md and AGENTS.md.
You may use your own subagents if the review method calls for them.

## Intent

Plan: <plan file path>. Run `git status` and `git diff <base sha>`, and read the new files: <list>.
<2–5 lines: what moved where and why; what was intentionally left unchanged>

## Check especially

- <risk 1, e.g. a spec dropped from every lane, or now run twice>
- <risk 2, e.g. globs over-matching>
- Needless churn in the diff.

## Rules

Read-only: leave every file, the index, and the history untouched. Run only non-destructive checks (the plan's verification list); the destructive lanes in AGENTS.md are off limits.

## Deliverable (in worker_done)

Ranked findings: severity, file:line, the defect in one sentence, a concrete failure scenario, a suggested fix. Write "no findings" if none survive your own verification. Completing the review is success; findings do not mean the task failed.
