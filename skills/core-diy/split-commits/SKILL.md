---
name: split-commits
description: Split working-tree changes or re-cut unpushed commits by a chosen rule, with an optional preview and an undo receipt.
disable-model-invocation: true
---

# Split commits

A **split rule** groups changes into **slices**. Each slice becomes one commit. Pick the rule for the question `git log` must answer later.

Pass a [split rule](#split-rules), `redo`, `preview`, or a combination. Default to `context` when uncertain.

## Steps

1. **Plan.** Inspect staged, unstaged, and untracked changes. Follow the scope the user gave. For a task-end request, include this session's changes and leave other work in place. For a general request to split the working tree, include all changes within the user's scope. If a file has both staged and unstaged edits or mixes in-scope and out-of-scope hunks, leave it out until the user approves what to commit and how to handle any staged edits.
   - For `redo`, choose the parent of the oldest commit to re-cut as the base. Require a clean index and working tree, including untracked files. Stop if `git branch -r --contains <commit>` lists a remote-tracking branch for any commit in `<base>..HEAD`. Plan from the diff between the base and `HEAD`.
   - Order slices so contracts precede their callers. The plan is complete when every change in the requested scope belongs to exactly one slice or has an exclusion reason.
   - For `preview`, show the proposed commit subjects, file counts, exclusions, and any hunks that need a decision. End the preview before changing Git state. After approval, recheck `HEAD`, the index, and the planned changes. If any differ from the approved plan, show an updated preview and wait for approval.

2. **Save the restore point.** Before changing Git state, record the current branch (or detached `HEAD`) and the `HEAD` commit. Copy the active index to a durable location outside the working tree, or record that the index was absent. Resolve its path with `git rev-parse --git-path index`. If a commit or verification step fails, check that the branch and `HEAD` still match the state reached by this run. Then run `git reset --soft <restore-point>` and restore the saved index, including its absence if applicable. If the branch or `HEAD` changed outside this run, report the restore point and index backup for manual recovery.

3. **Commit.** For `redo`, run `git reset --mixed <base>` to expose the changes as unstaged edits while keeping the working-tree files in place. Process slices in plan order.
   - **Full files.** Stage new paths with `git add -- <paths>`. Commit the slice with `git commit -- <paths>`. The path-limited commit takes the working-tree versions of those files.
   - **Slices with approved hunks.** Seed a temporary index from `HEAD` with `GIT_INDEX_FILE=<temp-index> git read-tree HEAD`. Under that index, use `git apply --cached` for the approved hunks and `git add -A -- <paths>` for any full files in the slice. Verify the staged diff matches the slice exactly, then commit under the same index. Update the real index for the committed paths with `git reset HEAD -- <paths>` to leave the remaining hunks unstaged. For partial files with staged edits, require the user's approval to replace their staged state with the committed version.
   - This step is complete when every planned slice has a commit.

4. **Verify and print the receipt.** Check that each commit matches its planned slice and excluded changes retain their working-tree content and staged state. For `redo`, require `git diff --quiet <restore-point> HEAD` to pass. For `atomic`, run the narrowest relevant check at each new commit in a temporary detached worktree.
   - Print the rule, `git log --oneline <base>..HEAD` (use the restore point as the base for a working-tree split), and any changes left outside the commits.
   - Include the branch, final `HEAD`, restore point, and index backup location or original absence. Record the final staged diff so the user can check it before undoing. If the branch, `HEAD`, and staged diff still match, use the recovery procedure in step 2 to restore the original tip and staged state while keeping working-tree files in place.

## Split rules

| Rule             | Slice by                                                                                                                                                         | Use when                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `context`        | Bounded context: a domain module folder, named with the repo's glossary terms. Shared contracts join the context they serve; config and tooling form `platform`. | A reviewer owns one area                                         |
| `kind`           | The type of edit or rule applied                                                                                                                                 | The risk sits in one kind of edit (a stale fact, a security fix) |
| `layer`          | Workspace project, in dependency order: libraries, apps, end-to-end suites                                                                                       | Bottom-up feature work                                           |
| `feature`        | One user-visible capability across layers                                                                                                                        | Each commit should ship alone                                    |
| `refactor-first` | The no-behaviour change, then the behaviour change                                                                                                               | A fix needs cleanup first                                        |
| `mechanical`     | Script or codemod output, then hand edits                                                                                                                        | A large rename plus manual fixes                                 |
| `atomic`         | The smallest step that builds and passes its tests                                                                                                               | `git bisect` matters                                             |

A commit convention in `AGENTS.md` or `CLAUDE.md` overrides this table. Nest two rules only when both questions matter.

## Message format

Every split rule uses this format; the rule only decides the scope.

```text
<type>(<scope>): <subject>

<body>

<attribution trailer>
```

- **type**, from Conventional Commits: `feat` (new behaviour), `fix` (wrong behaviour or a false fact corrected), `refactor` (no behaviour change), `test`, `docs`, `chore` (config, tooling, build).
- **scope** names the slice: the project for `layer`, the context name for `context`, the edit kind for `kind` (`comments`). One scope per commit: two scopes mean two slices.
- **subject**: imperative mood, lowercase start, no final period, at most 72 characters ("replace plan labels in identity comments").
- **body**: the why the diff cannot show, wrapped at 72. Cite the decision record or file that holds the reason. Omit the body when the subject says everything.
- **breaking**: a changed public API or schema contract gets `!` after the scope and a `BREAKING CHANGE:` body line.
- **trailer**: any attribution lines the session requires (omit when none apply).
