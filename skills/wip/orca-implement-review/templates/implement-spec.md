# Task: implement <topic> (repo <repo path>, branch <branch>)

Read and follow AGENTS.md. Implement exactly the plan in: <plan file path>

## You may edit only

- <explicit file list, including new files>

Leave <excluded files> unchanged. Keep unrelated worktree changes intact. Do not commit or push.

## Safety

Run only non-destructive checks. The destructive lanes are off limits: `nx e2e api-e2e`, `nx e2e web-e2e`, `npm run e2e`, `db:*`, `test:db:e2e`, and anything that sets `ALLOW_DESTRUCTIVE_E2E`. On a server-booting Playwright config use `--list` only.

## Evidence (paste counts in worker_done)

1. <focused test command> → expect <N> pass
2. <discovery check: `jest --listTests`, `playwright --list`, …> → expect <…>
   When tests move, merge or split: before and after, run Jest with `--json --outputFile`,
   sort the `status<TAB>fullName` lines, and diff → no diff except the planned renames.
   Keep moved `describe` titles unchanged so `fullName` survives the move.
3. `npm run nx -- lint <project>` → no new errors
4. `npx prettier --check <changed files>`; `git diff --stat | tail -1`

Report changed files as a count plus that `git diff --stat` summary line; the coordinator reads the diff itself.

A non-zero exit means the task is not done: fix it, or report the exact failure in worker_done.
