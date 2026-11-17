---
name: split-commits
description: Cut working-tree changes or unpushed commits into commits by one split rule (context, kind, layer, feature, refactor-first, mechanical, atomic), after a preview you approve.
disable-model-invocation: true
---

# Split commits

A **split rule** cuts one change into commits; each commit is one **slice** of that rule. Pick the rule for the question `git log` must answer later.

Arguments: a rule from [Split rules](#split-rules), plus `redo` to re-cut unpushed commits. With no rule, recommend one and ask.

## Steps

1. **Preview.** List the changes. For `redo`, propose the base (the parent of the oldest commit to re-cut) and confirm `git branch -r --contains` is empty for every commit after it. Mark anything you did not make this session as **owner's work**. Assign every file, or hunk, to exactly one slice; order slices so contracts come before their callers. Show:
   - a matrix: slices of the chosen rule × slices of the closest alternative rule, cells = file counts;
   - the planned `git log --oneline` with messages and file counts.

   Ask whether owner's work joins a slice. Stop for approval.
   _Done when_ the user approves the preview.

2. **Commit.** Record the current tip as the **restore point**. For `redo`, run `git reset --soft <base>`. Commit each slice in preview order with `git commit -- <paths>`; stage a split file's hunks with `git apply --cached`.
   _Done when_ every approved slice is a commit.

3. **Verify.** For `redo`, `git diff --quiet <restore point> HEAD` passes: the tree is unchanged. The working tree holds only owner's work kept out. Each commit's file set matches the preview. For `atomic`, run the narrowest check at each commit with `git rebase --exec`.
   _Done when_ every check passes, or the failure is reported with `git reset --hard <restore point>` as the way back.

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
- **trailer**: the attribution lines the session requires.
