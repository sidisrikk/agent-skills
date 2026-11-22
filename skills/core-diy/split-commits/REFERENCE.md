# Split commits reference

## Re-cut unpushed commits

1. **Plan from the base.** Use the parent of the oldest commit to re-cut as the base. Require a clean index and working tree, including untracked files. Stop if `git branch -r --contains <commit>` lists a remote-tracking branch for any commit in `<base>..HEAD`. Plan from the diff between the base and `HEAD`.
2. **Reset after saving the restore point.** Run `git reset --mixed <base>` to expose the changes as unstaged edits while keeping the working-tree files in place. Commit the slices in plan order.
3. **Verify the final tree.** Require `git diff --quiet <restore-point> HEAD` to pass. Use the chosen base when listing the new commits in the receipt.

## Commit approved hunks

1. For partial files with staged edits, obtain approval to replace their staged state with the committed version.
2. Seed a temporary index from `HEAD` with `GIT_INDEX_FILE=<temp-index> git read-tree HEAD`.
3. In that index, stage the approved patch with `git apply --cached` and any whole files in the slice with `git add -A -- <paths>`. Verify the staged diff matches the slice exactly, then commit using the same index.
4. Update the real index for the committed paths with `git reset HEAD -- <paths>`. The remaining hunks stay unstaged.

## Index recovery

1. For a failed commit or verification, check that the branch and `HEAD` match the state reached by this run. To undo a completed run, check that the branch, final `HEAD`, and staged diff still match the receipt. If the check fails, stop and report the restore point and index backup for manual recovery.
2. Run `git reset --soft <restore-point>` and restore the index backup at the active index path. If the original index was absent, remove the index created during the run. This restores the original tip and staged state while keeping working-tree files in place.
