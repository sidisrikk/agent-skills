# Evaluation Diagnostics

Read this only when Phase 2 directs you here. Apply the smallest set of diagnostics that could change the recommendation. Mark absent evidence as unknown.

## User Value

Look for behavior showing that a specific user wants the outcome enough to switch.

- Who experiences the problem now, and how frequently or intensely?
- What workaround do they use, including doing nothing?
- What time, money, risk, or frustration does the workaround cost?
- What evidence shows pull: requests, repeated workarounds, payment, or abandonment?
- Which promised outcome would make switching worthwhile?

Weak signals include a universal audience, polite interest without changed behavior, and an improvement users cannot describe.

## Feasibility

Find the shortest path to evidence and the dependency most likely to break it.

- Does the core mechanism work reliably enough for the test?
- Which API, data source, participant, regulation, or scarce expertise is outside the team's control?
- What is the critical path to first user value?
- Can a manual or narrower experiment test demand before the full system exists?
- What cost or operational burden grows with every user?

Weak signals include several dependencies needing simultaneous success, a research breakthrough on the critical path, and an MVP measured in months without intermediate evidence.

## Differentiation

Identify a user-visible reason to choose this direction over the workaround.

- What can the user do, reach, or avoid that was previously unavailable?
- Is the advantage structural or a feature a competitor can copy quickly?
- Does the difference affect the user's primary job?
- Can the user explain the difference in one sentence?

Prefer durable forms in this order when evidence is otherwise equal: new capability, order-of-magnitude improvement, newly served audience, newly served context, radically simpler experience, lower price.

## Evidence Quality

Rank evidence before comparing conclusions:

1. Observed behavior in the target context.
2. Paid commitment or costly user action.
3. Repeated direct reports from target users.
4. Repository or operational evidence.
5. Comparable external cases.
6. **Belief only:** team belief or a loose analogy; record this as unknown, not evidence.

State conflicts between evidence sources. A stronger source outweighs a larger pile of weaker signals.

## Tie-Break

Choose the option that tests the highest-consequence unknown with the least irreversible effort. Use differentiation only after value and a feasible test are credible. If no option clears that bar, recommend a specific evidence-gathering test rather than a build direction.
