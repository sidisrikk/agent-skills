# Cross-review

Conduct peer examination of round-one findings from the other two reviewer lenses while retaining the assigned perspective.

Evaluate every round-one finding from peer reviewers: determine whether the trace legitimately proves the claimed mechanism and impact.

## Decisions

For each peer finding, issue exactly one decision:

- `validate`: Concrete code evidence confirms the mechanism and impact.
- `challenge`: Concrete code evidence demonstrates a false assumption, false positive, or inflated severity.
- `defer`: Evidence is outside this lens's domain or insufficient to reach a definitive conclusion.

A `validate` or `challenge` decision must cite code or an independently checked execution path.

## Added findings

Introduce new findings only when examining peer traces reveals a distinct, previously uncovered root cause. Added findings must satisfy the complete round-one finding contract.

## Output shape

```text
Decisions:
- Finding ID: ...
  Decision: validate | challenge | defer
  Reason: concrete evidence
  Evidence trace: independently checked entry-to-effect path, or explanation of why evidence is insufficient

Added findings:
- Severity: critical | warning | info
  Location: repository-relative path:line
  Title: short noun phrase
  Trace: compact entry-to-effect path and the concrete input or state that exposes it
  Mechanism: how the issue occurs
  Impact: concrete consequence
  Fix: smallest credible remediation
```

`Added findings: none` is valid. A `validate` or `challenge` decision requires an independently checked `Evidence trace`; a `defer` explains the missing evidence there.

**Completion criterion**: Every finding from the other two personas receives exactly one decision with an evidence trace, and every added finding satisfies the round-one finding contract.
