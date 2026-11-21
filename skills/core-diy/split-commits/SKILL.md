---
name: split-commits
description: Cut working-tree changes or unpushed commits into commits by one split rule (context, kind, layer, feature, refactor-first, mechanical, atomic) with a rollback receipt. Use autonomously at task end or when asked to split, re-cut (`redo`), or `preview` commits.
---

# Split commits

A **split rule** cuts one change into commits; each commit is one **slice** of that rule. Pick the rule for the question `git log` must answer later. Default to autonomous 1-pass execution and print a safe undo receipt.

Arguments: an optional rule from [Split rules](#split-rules) (defaults to `context` when uncertain), `redo` to re-cut unpushed commits, and `preview` to stop for approval before committing.

## Steps

1. **Plan & guard.** List the changes. For `redo`, pick the base (parent of the oldest commit to re-cut) and hard-stop if `git branch -r --contains` is non-empty for any commit after it. When invoked at task end, mark changes not made this session as **owner's work** and keep owner's work plus mixed files unstaged; when invoked directly on an existing dirty tree, include all working-tree changes unless told otherwise. Assign each remaining file to one slice, ordering contracts before their callers.
   - If `preview` is set: print the planned `git log --oneline` with file counts, ask whether owner's work or mixed hunks join a slice, and stop for approval.
   _Done when_ every session file belongs to one slice (and `preview` is approved, if set).

2. **Commit.** Record `HEAD` as the **restore point**. For `redo`, run `git reset --soft <base>`. Stage any untracked (`??`) files in the slice with `git add -- <paths>`, then commit each slice in order with `git commit -- <paths>` (or `git apply --cached` for approved `preview` hunks).
   _Done when_ every planned slice is a commit.

3. **Verify & receipt.** For `redo`, confirm `git diff --quiet <restore point> HEAD` passes. Confirm owner's work remains untouched in the working tree and each commit matches its slice. For `atomic`, run the narrowest check at each commit with `git rebase --exec`. Print the receipt: rule used, `git log --oneline` of the new commits, any unstaged files left behind, and `git reset <restore point>` to undo safely.
   _Done when_ all checks pass and the receipt is printed—or on failure, abort any active rebase, run `git reset <restore point>`, and report the error.

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
