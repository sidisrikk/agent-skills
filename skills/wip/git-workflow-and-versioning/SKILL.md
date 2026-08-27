---
name: git-workflow-and-versioning
description: Git preflight for commits, branches, history, and releases. Use when creating a commit; managing branches, worktrees, merges, or pushes; resolving conflicts or investigating/changing history; or versioning, tagging, and updating release changelogs.
---

# Git Workflow and Versioning

Treat each Git operation as a guarded state transition: inspect the repository, perform one requested operation, then prove the resulting state.

## 1. Preflight

Find the repository root. Read applicable instruction files from the root through every affected path, then operation-specific policy such as `CONTRIBUTING.md`, release configuration, package metadata, and CI workflows. The nearest path-scoped instruction governs its files; operation-specific configuration governs that operation. Ask when applicable sources conflict without a clear precedence rule.

Inspect at least:

```bash
git status --short --branch
git diff --stat
git diff --cached --stat
git log --oneline -10
```

Inspect full diffs before staging or changing history. Treat existing staged, unstaged, and untracked content as concurrent work to preserve. Before switching branches or worktrees, establish whether that work belongs to the operation; otherwise stay in place, use a clean worktree, or ask whether to stash it. Map the user's request to the exact refs, paths, and mutations it authorizes. Commits, tags, pushes, merges, rebases, history rewrites, branch or worktree deletion, and releases require explicit user intent.

The preflight is complete when the branch or detached state, upstream or its absence, applicable policy sources, dirty state, preservation plan, requested scope, and authorized mutations are recorded. Ask one concise question when any of these remain ambiguous.

## 2. Run one operation

Load only the matching section from [`OPERATIONS.md`](OPERATIONS.md):

- [Commit](OPERATIONS.md#commit) for staging changes or creating an atomic commit
- [Branches, worktrees, and integration](OPERATIONS.md#branches-worktrees-and-integration) for branch, parallel workspace, merge, or push management
- [Conflicts and history](OPERATIONS.md#conflicts-and-history) for conflict resolution, cherry-pick or revert, history investigation, recovery, or rewriting
- [Releases and versioning](OPERATIONS.md#releases-and-versioning) for version selection, changelogs, tags, or release preparation

Apply repository policy first and the playbook's generic defaults only where policy is silent. If a request spans operations, finish and verify each operation before loading the next playbook.

The operation is complete when its playbook's completion criterion is met or execution has stopped at a clearly reported, recoverable blocker.

## 3. Postflight

Re-run `git status --short --branch`, then collect evidence specific to the operation:

- Commit: `git show --stat --oneline --decorate HEAD`
- Branch or worktree: `git branch --show-current` and `git worktree list`
- Conflict: `git diff --name-only --diff-filter=U` and `git diff --check`
- History change: compare the affected range and inspect `git reflog`
- Release advice: confirm repository state matches the preflight
- Release execution: inspect the version diff and verify requested tag target and metadata

Report the operation performed, its evidence, check results, and remaining unrelated work. The postflight is complete when every requested mutation is evidenced, every changed or untracked path is accounted for, and pre-existing unrelated work remains preserved.
