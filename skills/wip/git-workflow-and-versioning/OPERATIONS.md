# Git Operation Playbooks

Load only the section selected by the preflight in [`SKILL.md`](SKILL.md).

## Commit

Use this playbook when the user explicitly requests staging or a commit.

1. Read the full unstaged and staged diffs. Use recent history to infer the repository's message style.
2. Define the atomic change represented by the commit. Stage explicit paths that belong to it. If a file mixes intended work with unrelated edits, leave it unstaged and ask how to partition it.
3. Inspect `git diff --cached` and account for every staged path. Ask before changing pre-existing staged content outside the requested scope. Check for credentials, private keys, tokens, generated artifacts, debug residue, and accidental formatting churn.
4. For a staging-only request, verify the final staged diff and confirm that `HEAD` matches the preflight.
5. For a commit, run the repository's policy-required checks and the tests, lint, type checks, or build relevant to the staged change. Stop before committing when a required check fails or is unavailable unless the user explicitly accepts that known result.
6. Commit in the repository's established style. Use Conventional Commits only when the repository does. State intent in the subject; add a body when the rationale is not evident from the diff.
7. Verify the new commit with `git show --stat --oneline --decorate HEAD` and inspect the remaining worktree state.

Staging is complete when the index contains exactly the requested paths or hunks, every staged change is accounted for, `HEAD` is unchanged, and remaining worktree changes are preserved. A commit is complete when `HEAD` advances to a new commit whose diff contains one intended logical change, every included path is accounted for, required checks pass or have an explicit override, and remaining worktree changes are preserved.

## Branches, worktrees, and integration

Choose the subsection matching the requested branch operation.

### Create, switch, or isolate

1. Discover the default branch, local naming pattern, upstream configuration, available local base refs, and current worktrees.
2. Proceed in the current worktree only when its local changes belong to this operation. Otherwise use a clean worktree or ask whether to stash the inventoried changes.
3. Select the locally available base named by the request or repository policy. Fetch when remote freshness is part of the request.
4. Use a branch for one stream of work. Use a worktree when concurrent streams need separate directories and branches.
5. Use `git switch <branch>` for an existing branch, `git switch -c <branch> <base>` for a new branch, `git worktree add <path> <branch>` for an existing branch, or `git worktree add -b <branch> <path> <base>` for a new branch.
6. Confirm the checked-out branch, base relationship, worktree path, and worktree status.

Creation or switching is complete when each requested stream has one unambiguous branch and location, points at the intended base, and all pre-existing work is still present in its recorded location.

### Rename a branch

1. Identify the current name, requested name, checked-out worktree, upstream, and corresponding remote ref.
2. Rename only the requested local branch with `git branch -m <old> <new>` and inspect its upstream afterward.
3. Route any requested publication of the new name through [Integrate or publish](#integrate-or-publish). Treat deletion of the old local or remote ref as a separate cleanup mutation.
4. Verify local worktrees and every remote ref affected by the request.

Renaming is complete when the branch has the requested name in its worktree, its upstream state is known, requested remote refs are verified, and the old ref remains or is removed exactly as authorized.

### Integrate or publish

1. Identify the exact source, target, remote, upstream ref, integration policy, and current local and remote object IDs.
2. Require the integrating worktree to contain only changes intended for the operation. Use a clean worktree when unrelated changes are present.
3. Fetch the target ref immediately before an operation that depends on remote freshness, including a push, and record its object ID.
4. Apply the repository's merge or rebase policy only within the requested refs. Route any conflict through [Resolve conflicts](#resolve-conflicts).
5. Use a normal push for additive history. After an explicitly requested history rewrite, use `--force-with-lease=<ref>:<expected-object-id>` with the object ID fetched in step 3.
6. Verify local refs and the exact remote ref with `git ls-remote` after a push.

Integration is complete when the target contains the intended source changes, required checks pass, and local plus remote refs resolve to the expected object IDs.

### Clean up

1. List worktrees and compare the branch with its intended integration target.
2. Account for local changes and commits unique to the branch before removal.
3. Remove the worktree and delete the branch only as explicitly requested and in repository-policy order.
4. Verify the remaining worktrees and refs.

Cleanup is complete when the requested worktree or branch is absent, its work is preserved at a known ref, and unrelated worktrees and refs retain their recorded object IDs.

## Conflicts and history

Use this playbook for conflict resolution, `bisect`, `blame`, regression searches, recovery, or history rewrites.

### Investigate history

Choose the narrowest evidence-producing command:

- `git log -- <path>` for a path's history
- `git log -S<string>` for when text was added or removed
- `git log -G<regex>` for diffs matching a pattern
- `git blame -L <start>,<end> <path>` for line provenance
- `git bisect` with a reproducible pass/fail check for the first bad commit
- `git reflog` for recovering prior local ref positions

State the search boundary and evidence. History investigation is complete when the answer identifies the relevant commit or narrows the remaining range, and the worktree is back in its original state after temporary checkouts or a bisect.

### Resolve conflicts

1. Use `git status` to identify the active merge, rebase, cherry-pick, or revert and list unmerged paths with `git diff --name-only --diff-filter=U`.
2. Read the base and both sides of every conflict. Resolve toward the intended combined behavior rather than selecting a side mechanically.
3. Remove every conflict marker, run `git diff --check`, and run the checks relevant to the resolved behavior.
4. Stage only resolved paths. Continue the active operation when that continuation is within the user's request; otherwise report the ready state.
5. Verify that no unmerged paths remain and that `git status` shows the expected operation state.

Conflict resolution is complete when every unmerged path is resolved, the resulting behavior is checked, and the operation is either completed or paused at an explicit, recoverable boundary.

### Apply or revert commits

1. Identify the exact source commits, destination ref, ordering, and expected effect.
2. Apply `cherry-pick` or `revert` only to that set and inspect each resulting diff.
3. Route conflicts through [Resolve conflicts](#resolve-conflicts), then run checks relevant to the changed behavior.
4. Verify the resulting commit range against the requested source or reversal.

The operation is complete when the destination contains exactly the requested commit effects, each new commit is accounted for, and required checks pass.

### Change or recover history

1. Identify the exact commits and refs affected, whether they are published, and whether collaborators may depend on them.
2. Create a recovery ref before an invasive local rewrite and record the current ref from `git reflog`.
3. Prefer additive recovery (`git revert`) for published history. Use local rewrite tools only for the explicitly requested range.
4. Use destructive reset or restore only when the user explicitly requests discarding the fully inventoried changes.
5. Compare the rewritten range with the original and run checks affected by the rewrite.
6. Route an explicitly requested push through [Integrate or publish](#integrate-or-publish), using the fetched remote object ID as the lease.

A history change is complete when the intended commits and refs are proven, the recovery point is known, published-history impact is accounted for, and the worktree has the expected state.

## Releases and versioning

Use this playbook for version recommendations, release preparation, tags, or changelog changes.

1. Discover the repository's release policy, latest relevant tag, version source of truth, release tooling, prerelease convention, and changelog format.
2. Inventory every consumer-visible change since the previous release. Include APIs, behavior, schemas, configuration, command output, data formats, and supported environments.

### Recommend a version

Apply the repository's version policy. Under Semantic Versioning:

   - `MAJOR` covers incompatible consumer-visible changes.
   - `MINOR` covers backward-compatible functionality.
   - `PATCH` covers backward-compatible fixes.
   - `0.x`, prerelease, and ecosystem-specific rules follow the repository's documented convention.

Recommend a version and cite each consumer-visible change that determines it. The recommendation is complete when every consumer-visible change is classified, the bump follows repository policy, and repository state matches the preflight.

### Prepare or publish a release

1. Update the canonical version through repository tooling whose commit, tag, and push side effects fit the authorized mutations. Select side-effect-limiting flags or ask before proceeding when the tool would exceed them. Keep generated mirrors synchronized from the canonical source.
2. Update the changelog in its existing format. Describe consumer impact; include migration instructions for breaking changes and upgrade cautions where needed.
3. Run every policy-required release check and inspect the final diff. A failed or unavailable required check blocks publication unless the user explicitly accepts that known result.
4. Create an annotated or signed tag according to repository policy only when explicitly requested, then verify its target and metadata.
5. Push commits or tags only when explicitly requested. Fetch the destination first and verify the exact remote refs afterward.

Preparation is complete when the version source, generated mirrors, changelog, and artifact metadata agree and the working diff contains only intended release changes. Publication is complete when those sources and requested tags agree on the exact commit, required checks pass or have an explicit override, and requested remote refs are verified.
