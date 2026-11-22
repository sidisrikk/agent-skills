---
name: split-commits
description: Split working-tree changes or re-cut unpushed commits by a chosen rule, with an optional preview and an undo receipt.
disable-model-invocation: true
---

# Split commits

A split rule groups changes into slices. Each slice becomes one commit. Pass a rule, `preview`, `redo`, or a combination. For `redo`, read [Re-cut unpushed commits](REFERENCE.md#re-cut-unpushed-commits) before planning.

## Workflow

1. **Plan.** Inspect staged, unstaged, and untracked changes. Use all working-tree changes for a general split or this session’s changes for a task-end split, unless the user gives another scope. Assign each in-scope change to exactly one slice or give an exclusion reason. Order contracts before callers. Leave mixed-scope files and files with both staged and unstaged edits out until the user approves what to commit and how to handle staged edits.
2. **Preview.** When requested, show commit subjects, file counts, exclusions, and any hunks that need a decision. Stop before changing Git state. After approval, recheck `HEAD`, the index, and planned changes. If anything changed, show a new preview and wait for approval.
3. **Save the restore point.** Record the branch or detached `HEAD` and its commit. Copy the index (`git rev-parse --git-path index`) to a durable location outside the working tree, or record that it was absent. If committing or verification fails, follow [Index recovery](REFERENCE.md#index-recovery).
4. **Commit.** Work in plan order. For a whole-file slice, stage its untracked paths with `git add -- <paths>`. Run `git commit -- <slice-paths>` to commit the working-tree versions. For a slice with approved hunks, follow [Commit approved hunks](REFERENCE.md#commit-approved-hunks). Finish when every planned slice has a commit.
5. **Verify and report.** Check each commit against its slice. Verify excluded changes retain their content and staged state. For `atomic`, run the narrowest relevant check at each new commit in a temporary detached worktree. Report the rule, `git log --oneline <base>..HEAD` (use the restore point for a working-tree split), and changes left out. Record the final staged diff and give the user the branch, final `HEAD`, restore point, index backup location or original absence, and [undo instructions](REFERENCE.md#index-recovery).

## Split rules

Choose the rule for the question `git log` should answer. Default to `context` when uncertain. Follow repository commit conventions in `AGENTS.md` or `CLAUDE.md`. Nest rules only when both questions matter.

| Rule | Group changes by | Use when |
| --- | --- | --- |
| `context` | Domain module named with the repo glossary. Shared contracts join the context they serve. Config and tooling form `platform`. | Reviewers own different areas. |
| `kind` | Type of edit or rule applied, such as a factual correction or a security fix. | The risk sits in one kind of edit. |
| `layer` | Workspace project, ordered from libraries to apps to end-to-end suites. | Changes build on lower layers. |
| `feature` | User-visible capability across layers. | Each capability can ship on its own. |
| `refactor-first` | Behaviour-preserving cleanup, then the behaviour change. | A fix needs cleanup first. |
| `mechanical` | Script or codemod output, then hand edits. | Generated edits need manual fixes. |
| `atomic` | Smallest step that builds and passes its tests. | `git bisect` matters. |

## Commit messages

- Use `<type>(<scope>): <subject>`. Choose `feat` for new behaviour, `fix` for a correction, `refactor` for unchanged behaviour, `test`, `docs`, or `chore` for config, tooling, or build work. Name one slice in the scope. Start the subject with a lowercase imperative verb. Limit it to 72 characters and omit the final period.
- Add a body when the reason needs context. Wrap it at 72 characters and cite the decision record or file that explains the change.
- For a changed public API or schema contract, add `!` after the scope and a `BREAKING CHANGE:` line to the body. Add attribution trailers when the session requires them.
