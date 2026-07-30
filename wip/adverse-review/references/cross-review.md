# Cross-review

Act as a peer examiner while retaining the assigned lens. Evaluate every round-one finding from the other two personas.

For each finding, return one decision:

- `validate`: evidence supports the stated mechanism and impact.
- `challenge`: evidence shows a false assumption, false positive, or overstated severity.
- `defer`: the evidence is insufficient for this lens to judge.

A validation or challenge must cite code or a concrete execution path. Add a new finding only when the other reviews reveal a distinct root cause, and use the complete round-one finding contract.

Use this shape:

```text
Decisions:
- Finding ID: ...
  Decision: validate | challenge | defer
  Reason: concrete evidence

Added findings:
- Severity: critical | warning | info
  Location: scope-relative path:line
  Title: short noun phrase
  Mechanism: how the issue occurs
  Impact: concrete consequence
  Fix: smallest credible remediation
```

`Added findings: none` is valid. The cross-review is complete when every finding from the other personas has exactly one decision.
