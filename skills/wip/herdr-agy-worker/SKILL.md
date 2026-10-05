---
name: herdr-agy-worker
description: Run a bounded agy Worker assignment through Herdr for Orchestra or Lead. Use when the user authorizes the agy spawn, result, and close lifecycle, or when recovering a worker created by that lifecycle.
---

# Herdr agy Worker

Run one bounded assignment, recover its evidence, reconcile its work, and close its owned tab. The loaded OpenCode v3 Protocol's **External agy workers** section owns authority, role boundaries, and acceptance. Load the `herdr` skill for CLI mechanics; if unavailable, use `herdr --skill` after the environment check below. Reuse instructions already loaded. If the protocol or required mechanics are inaccessible, report the missing prerequisite.

## 1. Prepare the handoff

Verify the caller is inside Herdr before inspecting or controlling the session:

```bash
test "${HERDR_ENV:-}" = 1
```

Stop if it fails. Confirm the installed syntax with `herdr --help` and the relevant command groups, each in a separate call. Check `jq` availability before using the filtered examples. Record the protocol's run fields in the caller's ledger, including a unique batch/attempt identifier and the baseline worktree state. For a Lead child, the parent contract must authorize this transport.

Prepare a self-contained Worker contract before spawning. Supply the applicable instructions rather than assuming agy loads them. Include required checks, permission/stop boundaries, repair budget, and the leaf-worker duty to return to this caller. For `Task: check`, explicitly include its no-edit/no-repair restrictions. Choose a unique permitted result-file path accessible to both caller and worker for fallback; include artifact-only write permission even for a source-read-only check. If no shared path is permitted, report that limitation when fallback is needed.

**Ready when:** the assignment and temporary-tab lifecycle are authorized, its instructions are available, and edit ownership can be handed off without overlap.

## 2. Spawn and identify

Choose a unique `name` such as `agy-<task>-<attempt>` matching `[a-z][a-z0-9_-]{0,31}`. Set `repo` to the contract's absolute repository directory. Discover live names once; the agent kind is not an assigned name. Create the temporary tab without changing user focus:

```bash
herdr tab create --workspace "$HERDR_WORKSPACE_ID" --cwd "$repo" --label "$name" --no-focus
```

Keep this creation response until `.result.tab.tab_id` and `.result.root_pane.pane_id` are recorded as `tab` and `pane`. Require nonempty string IDs; never guess IDs after an error. Start the worker in that pane:

```bash
herdr agent start "$name" --kind agy --pane "$pane"
```

Record the returned identity, including session identity when available. Verify the expected agy occupant, assigned cwd, readiness, and permission mode suitable for the contract before dispatch. OpenCode's permissions do not transfer to agy. Do not add permission-bypass flags to solve a startup block.

**Ready when:** the owned pane contains the intended ready worker. On startup failure, inspect the recorded tab/pane before retrying or closing; a failed start can still leave a live process. Manage this lifecycle's resources only.

## 3. Dispatch once

Hand off exclusive editing ownership before sending an implementation assignment. Set `prompt` to the prepared contract plus instructions and return requirements. Require the protocol's executor report, prefixed with `Batch: <batch/attempt>` and terminated with `END RESULT <batch/attempt>`. Include changed paths, check commands/cwd/outcomes, partial work, and repairs consumed where applicable. Markers identify a response; they are not acceptance evidence.

Set `timeout_ms` to a finite wait appropriate to the assignment, with the outer tool timeout longer. Preserve failures when filtering JSON. For example:

```bash
set -o pipefail
herdr agent prompt "$pane" "$prompt" --wait --timeout "$timeout_ms" \
  | jq -ce '.result.agent | select(type == "object")
      | {name, agent, agent_session, cwd, pane_id, agent_status}
      | select((.pane_id | type) == "string" and (.pane_id | length) > 0
          and (.agent_status | type) == "string" and (.agent_status | length) > 0)'
```

Compare returned identity with the recorded worker. `idle` and `done` both allow inspection. Any other state or failed command follows Recovery below. A timeout is not a cancellation. Do not resend the assignment until inspection establishes whether the original was received and whether it is still running.

## 4. Recover the complete result

Set `lines` from the expected response size, allowing for terminal chrome. Use a smaller initial capture for a short result and a larger one for a report; there is no fixed completion threshold:

```bash
herdr agent read "$pane" --source recent-unwrapped --lines "$lines"
```

Inspect the actual answer, not the echoed prompt, for the matching batch/attempt, required result fields, substantive evidence, and end marker. If content is missing, increase the capture and compare. Stop increasing once it recovers no additional result content. The documented read surface provides no automatic reply-length/completeness guarantee; lifecycle state cannot supply one.

When a larger read cannot recover the response, use Herdr's file fallback: once the worker is ready, ask it to write the complete result to the pre-authorized unique path and reply with only that path. This follow-up is evidence recovery, not a request to rerun the task. Read the file through permitted file tools, including later chunks through its end when necessary. Validate the batch/attempt and evidence. File output is a fallback, not an initial-prompt requirement. If recovery remains unavailable, retain the worker and report the exact blocker.

**Recovered when:** the complete assignment result or explicit partial-work/blocker report is available to the caller outside the soon-to-close terminal.

## 5. Reconcile, close, and report

Compare reported work with the baseline and live scoped diff; preserve pre-existing edits. Validate the assigned acceptance criteria and check evidence, reusing valid checks. Establish that execution has stopped, including any worker-started processes that could still modify the scope, before handing editing ownership back or to a replacement. Capture partial changes and remaining repair budget for unsuccessful work too.

Before closure, confirm the recorded tab still contains only this lifecycle's owned resources. If ownership or layout changed, inspect rather than closing blindly. Once evidence is preserved and work is reconciled, close the recorded tab:

```bash
herdr tab close "$tab"
```

Verify absence by exact tab ID, not a name substring or agent-list omission:

```bash
set -o pipefail
herdr tab list --workspace "$HERDR_WORKSPACE_ID" \
  | jq -e --arg tab "$tab" '.result.tabs
      | if type != "array" then error("missing tab list")
        elif all(.[]; (.tab_id | type) == "string" and (.tab_id | length) > 0)
        then all(.[]; .tab_id != $tab)
        else error("invalid tab identity") end'
```

Report the batch/attempt, worker identity, result/checks, reconciliation outcome, repairs consumed, and verified closure or the still-open resource with its owner and next action. Retain needed artifacts until the caller consumes them. Tab closure is cleanup; Orchestra's acceptance remains a separate decision.

## Recovery

| Observation | Next action |
| --- | --- |
| `blocked` | Inspect `agent get` and `agent read`. Resolve only within existing authority; otherwise return the question/blocker and keep the owned worker recorded. |
| `working`, wait timeout, stalled prompt, or `unknown` | Inspect identity, state, and output. Wait again with a finite deadline if it is still working; establish prompt delivery before resubmission. Retain ownership while execution is uncertain. |
| Incomplete result | Use adaptive capture, then the permitted file fallback. Do not label a missing result COMPLETE. |
| Assignment abandoned or worker must be replaced | Capture diagnostics and partial work, use an authorized stop procedure, verify stopped execution, reconcile the diff, then close/transfer. If stopping cannot be established, report the resource and retain its ownership record. |
| Close or absence check fails | Inspect exact recorded IDs and report unresolved cleanup. A cleanup failure does not erase the task result. |

Apply the protocol's repair budget to task failures across retries and replacements. Escalate uncertainty to the immediate caller; this skill does not authorize another delegation layer.
