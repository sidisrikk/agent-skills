---
name: scrutinize
description: Scrutinizes a plan, design proposal, PR, diff, or code change from an outsider perspective. Use when the user asks for scrutiny or a sanity check of a plan or design, or for an end-to-end second-opinion review of a code change that questions scope as well as correctness.
---

# Scrutinize

Challenge necessity before correctness, then trace every claim to its observable effect.

A **behavioral claim** is an observable outcome or invariant the artifact says will become true. The **review target** is the artifact under review. **Inspection context** is unchanged surrounding code, configuration, tests, and documentation needed to evaluate the target.

Work read-only. Offer concrete changes in the report; modify files only on a separate user request.

## 1. Fix the Target and Claims

Resolve the review target from the artifact, paths, or Git range the user supplied. Ask for the missing target when none is available.

State the intended goal in one sentence. Derive every behavioral claim from the target and identify its expected return value, side effect, or invariant. For a plan, express each proposal as an observable system effect. Label a goal or claim as underspecified when the artifact and available context cannot support a testable interpretation; ask one question that could resolve it.

Keep the review target distinct from inspection context. Use context as evidence. Report a context defect only when the target causes it, exposes it, or depends on it.

**Complete when:** the target is explicit, the goal is stated, every testable behavioral claim is enumerated, and every material ambiguity is resolved or labeled underspecified.

## 2. Challenge the Premise

Stand outside the artifact. Establish whether the stated problem is real and whether the target is necessary to solve it. Compare it with:

- the status quo or doing nothing;
- an existing repository capability;
- the smallest credible change; and
- a solution at a more appropriate layer, such as configuration, framework, build, or runtime.

Judge alternatives by goal coverage, added surface, failure risk, migration cost, and operating cost. Name the simplest credible alternative and the decisive trade-off. When no alternative is better, state why the target earns its complexity.

If the user fixes scope explicitly, accept the goal and scrutinize the simplest implementation within that boundary.

**Complete when:** necessity is supported or challenged with evidence, every applicable alternative class has been considered, and the simplest credible approach is identified with its trade-off.

## 3. Trace Every Claim

For a code target, trace each claim through the actual path:

`entry point -> callers -> branches -> state changes -> return value or side effect`

Inspect unchanged seams around the target, including error handling, tests, configuration, persistence, and external contracts when they affect the path. Record concrete symbols and locations. Treat surprises as leads to verify, not findings by themselves.

For a plan or design:

- In an existing system, map each proposed step to current integration points, ownership, state, lifecycle, and contracts.
- Without an inspectable system, trace the described actors, components, data, errors, and effects. Label dependencies that supplied evidence cannot ground as assumptions.

**Complete when:** every claim has an entry-to-effect trace, or an explicit evidence gap names the missing link and why it prevents verification.

## 4. Try to Break the Claims

For every claim, record `holds`, `fails`, or `unverified` from the trace. Test applicable counterexamples: boundary inputs, empty or missing state, error paths, partial failure, retries, concurrency, ordering, scale, and hostile input.

Check for silent changes to contracts, error semantics, persistence or wire formats, performance, security boundaries, and observability. Inspect whether tests exercise the traced path and its material failure modes rather than only intermediate state or mocked substitutes.

Turn a failed claim or material regression into a finding. Keep an evidence gap as `unverified`; uncertainty is not proof of failure.

**Complete when:** every claim has one result backed by a trace, every applicable counterexample class has a recorded outcome, and test coverage is confirmed or its exact gap is named.

## 5. Report the Decision

Lead with a materially better alternative when one exists. Then order findings by severity: `blocker`, `major`, `minor`, `nit`. Omit style nits that do not affect the decision.

Use one compact section per finding:

```markdown
### [severity] Finding — path:line

**Why it matters:** [concrete consequence]
**Evidence:** [claim, trace, and exposing input or state]
**Suggested change:** [smallest credible remediation]
```

For plan findings, cite the plan section and repository evidence or unsupported assumption. Separate what the artifact claims from what the trace verifies. Every code claim cites a concrete path, symbol, or line.

If there are no findings, list the claims and traces checked so coverage remains visible. Close with one verdict — `ship`, `fix-then-ship`, `rework`, or `reject` — and the decisive reason.

**Complete when:** every failed claim and material regression is represented by an evidence-backed finding, every unverified claim is visible, coverage is stated, and the verdict follows from the reported evidence.
