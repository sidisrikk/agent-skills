---
name: orca-implement-review
description: Coordinate an Orca implement → review → judge → fix → commit loop with external worker agents (antigravity, codex, claude) the user names. Use when the user asks to delegate a fix, a test-report bucket, or a plan to an Orca implementer and then have a different Orca agent review it.
---

# Orca implement → review → fix loop

You are the **coordinator**. Workers write code; you triage, plan, judge, and commit. Load the version-matched Orca guide once before the first Orca command (`orchestration` skill, or `$ORCA skills get orchestration`), and resolve `$ORCA` the way that guide says.

## Inputs (from the user, else ask once)

| Role         | Default                                                 | User can override with, e.g.                  |
| ------------ | ------------------------------------------------------- | --------------------------------------------- |
| Implementer  | `antigravity` / `gemini-4-hydrogen-high`, `--keep-open` | `claude fable`, `codex sol high`              |
| Reviewer     | `antigravity` / `gemini-4-hydrogen-xhigh`, new worker   | `codex sol`, `agy argon high`, `claude fable` |
| Review skill | `ponytail-review`                                       | any review skill or checklist the user names  |

Map a spoken name to flags by looking it up; the catalog changes, so never guess a slug:

- `antigravity`: `agy models`. The effort lives **in the slug** (`gemini-4-argon-high`); pass `--model` only, no `--effort`.
- `codex`, `claude`: `~/.config/orca/agent-model-catalog.json`. Pass `--model <id> --effort <level>` (`codex sol` → newest `gpt-*-sol` id; `claude fable` → newest `claude-fable-*` id).

The reviewer is always a **fresh** worker, never the implementer.

## Steps

### 1. Triage (read-only)

Gather the target files (from a report, a plan, or the user), read each one plus the config/script that runs it, and check `git log -5` for work already done. Dry-run the proposed fix where it is cheap (focused test, `--list`, `--listTests`). Treat a report's recommendation as advice: prefer a lane, helper, or target the repo already has.

Done when every target file has a group, a proposed change or a reason to keep it, and dry-run evidence where one was possible.

### 2. Plan and decision gates

Write the plan (Context, Changes per group, Kept and why, Trade-offs, Verification) to a plan file. Then raise **every** open decision the user owns: zero, one, or several. A decision is the user's when the fix weakens a safety boundary, drops test coverage, widens scope, or the requirement is ambiguous. Batch them (up to 4 per `AskUserQuestion`), recommend one option each, and fold the answers into the plan. Decide everything else yourself and note it in the plan.

### 3. Implement

Fill [`templates/implement-spec.md`](templates/implement-spec.md) into the scratchpad and start the implementer:

```bash
$ORCA orchestration worker-start --spec-file <scratchpad>/implement-spec.md \
  --worktree current --agent <agent> --model <id> [--effort <level>] \
  --keep-open --task-title "<topic>: implement" --display-name impl-<model> --json
```

Record `dispatchId`, `runId`, and `git rev-parse HEAD` (the review's `<base sha>`), then end your turn; Orca wakes you. An antigravity `msg_stop_*` escalation during a long Nx command is normal: wait for `worker_done` unless the output shows a real failure. Each long Nx run (full `test api`, builds) costs one such wake, so prefer a Codex or Claude implementer for layers dominated by them.

### 4. Review

Fill [`templates/review-spec.md`](templates/review-spec.md) and start the reviewer in the same run:

```bash
$ORCA orchestration worker-start --spec-file <scratchpad>/review-spec.md \
  --worktree current --agent <agent> --model <id> [--effort <level>] \
  --run <runId> --task-title "<topic>: review" --display-name review-<model> --json
```

### 5. Judge the findings

The reviewer is fallible. Verify every finding against the code yourself (read the cited lines, run the cheap check it implies) before classifying it:

| Verdict          | Meaning                                                                                                             | Action                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **must-fix**     | Verified defect: wrong behaviour, lost or duplicated coverage, broken safety boundary, failing check, plan violated | Fix 100%                                                 |
| **should-fix**   | Verified, real but minor: in-scope clarity, a missed edge case, small cleanup the plan implies                      | Fix when cheap and in scope; otherwise list as follow-up |
| **nice-to-have** | Style taste, speculative hardening, out-of-scope refactor                                                           | Skip                                                     |
| **rejected**     | False positive, contradicts the plan or a user decision, or unverifiable                                            | Skip, with a one-line reason                             |

A finding that would reopen a user decision goes back to the user, not to the implementer.

Done when every finding carries a verdict and a one-line reason.

### 6. Fix

Skip when no must-fix or chosen should-fix remains. Otherwise send them to the **same** implementer:

```bash
$ORCA orchestration send --to dispatch:<impl dispatchId> --subject "Review fixes" \
  --body "<numbered verified findings, each with file:line and the expected fix>. Rerun the full evidence list from your spec and report it in worker_done."
```

Re-review with a fresh reviewer only when a must-fix changed behaviour, not just wording. Cap the loop at two review rounds; past that, report the open items to the user.

### 7. Commit and report

Commit only when the user asks. Split commits by **bounded context**: one commit per test lane, module, or concern. When one file holds hunks for two contexts, stage a single hunk without interactive `git add -p`: write `git diff <file>` to a patch, keep only the wanted `@@` hunks, `git apply --cached` it. Use `type(scope): what`, a body that says why, and the attribution trailer. Push only on request.

Report per task: outcome, the workers' evidence (relay it; rerun a check only for a gap or contradiction), every finding with its verdict, skipped checks, open trade-offs, and which workers remain open.
