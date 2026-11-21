# Cross-review

## Panel setup

Assign stable IDs to every round-one finding. Reuse the three reviewer briefs, retaining each original lens and all inspection and safety instructions. Add every labeled round-one result. Replace the round-one result contract with the Peer examination section below, plus the finding schema, Traces, and Findings requirements from the [shared contract](../SKILL.md#round-one-result-contract).

Dispatch three new reviews using the shared Dispatch rule. Validate each result against the cross-review contract and calculate Round health. This step is complete when all three reviews have settled, every returned decision and addition is checked, and round health is recorded. Continue to synthesis only if the round has not aborted.

## Peer examination

Act as a peer examiner while retaining the assigned lens. Evaluate every round-one finding from the other two personas, including whether its trace reaches the stated mechanism and impact.

For each finding, return one decision:

- `validate`: evidence supports the stated mechanism and impact.
- `challenge`: evidence shows a false assumption, false positive, or overstated severity.
- `defer`: the evidence is insufficient for this lens to judge.

Add a new finding only when the other reviews reveal a distinct root cause, using the supplied finding schema and requirements.

Use this shape:

```text
Decisions:
- Finding ID: ...
  Decision: validate | challenge | defer
  Reason: concrete evidence
  Evidence trace: independently checked entry-to-effect path, or why evidence is insufficient

Added findings:
- ...complete finding using the supplied schema...
```

`Decisions: none` is valid only when the other personas returned no findings. `Added findings: none` is valid. A validation or challenge requires an independently checked `Evidence trace` citing code or an execution path; a defer explains the missing evidence there. The result is valid only when every finding from the other personas has exactly one decision, every decision satisfies this contract, and every added finding satisfies the supplied finding requirements.
