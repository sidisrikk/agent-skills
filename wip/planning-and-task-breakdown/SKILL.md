---
name: planning-and-task-breakdown
description: Work breakdown for implementation plans. Use when clear requirements need ordered, verifiable tasks, work is too large for one coherent change, or dependencies and safe parallel work need mapping.
---

# Work Breakdown

Turn settled requirements into one evidence-backed implementation plan. The plan is a trace from requirements through dependencies to independently verifiable task contracts.

## 1. Establish the Planning Basis

Read the requirements and inspect the relevant repository code, tests, configuration, documentation, and history before naming implementation details.

Record:

- the goal and observable success;
- requirements and constraints;
- explicit exclusions;
- repository evidence that affects the design; and
- assumptions, risks, and unresolved questions.

Resolve repository questions through investigation. Ask the user about a missing product decision when different answers would change externally visible behavior. Keep that decision open rather than planning against a guess.

**Complete when:** every known requirement and constraint is recorded, every repository claim is grounded in inspected evidence, and every unresolved item is classified as a blocking product decision or an implementation risk.

## 2. Map the Dependency Graph

List the deliverables and the prerequisites that connect them: contracts, data changes, shared interfaces, migrations, rollout controls, tests, and documentation where applicable. Draw directed dependencies, break cycles, and identify:

- the critical path;
- independent branches;
- high-risk integration seams; and
- technical uncertainties that repository investigation cannot resolve.

Turn a genuine technical uncertainty into a discovery task whose acceptance criterion is the evidence or decision needed by later tasks.

**Complete when:** every deliverable and prerequisite appears in the graph, every ordering constraint has a stated dependency, the graph is acyclic, and the critical path and independent branches are explicit.

## 3. Cut Verifiable Slices

Cut the graph into the smallest coherent outcomes that can be implemented and verified independently. Prefer vertical slices that expose usable behavior through the relevant layers. Use a horizontal foundation task only when multiple slices require the same prerequisite first.

A slice is still too broad when it contains independent outcomes, requires a later task before its acceptance criteria can pass, or cannot leave the repository in a coherent state. Judge size by outcome coherence and verification, not duration or file count. Place risk-reducing slices as early as their dependencies allow.

**Complete when:** every graph node has one owning slice, every slice produces one coherent outcome, and each slice can satisfy its acceptance criteria without implementing a later slice.

## 4. Write Task Contracts

Write each slice as a task with this contract:

```markdown
### Task [N]: [Observable outcome]

**Outcome:** [What becomes true]

**Scope:**
- In: [Required work]
- Out: [Adjacent work intentionally excluded]

**Acceptance criteria:**
- [ ] [Observable condition]

**Implementation landmarks:**
- [Evidence-backed path, interface, pattern, or migration]

**Verification:**
- [Exact focused command or check and expected signal]

**Dependencies:** [Task IDs or None]
**Parallel safety:** [Safe wave, shared seams, or reason it must be sequential]
**Risks/assumptions:** [Only those that affect execution]
```

Use exact repository commands when they are discoverable. Use a manual check only for behavior that automated verification cannot observe.

**Complete when:** every task contains each contract field, every acceptance criterion observes that task's outcome, and every implementation landmark comes from repository evidence.

## 5. Sequence and Audit

Topologically order tasks into execution waves. Tasks may share a wave only when they have no dependency between them and their files, contracts, state, and migration order do not create a coordination collision. Name the shared seam when coordination is required.

Produce one plan with:

1. **Planning basis** - goal, scope, evidence, assumptions, and open decisions.
2. **Dependency map** - nodes, edges, critical path, and risks.
3. **Execution waves** - ordered task contracts and parallel groups.
4. **Traceability** - a table mapping every requirement to its tasks and verification.

Return the plan in the response unless the user requested a file path. Keep one plan as the source of truth rather than maintaining a separate summary checklist. For a planning-only request, the plan is the final output. For a direct implementation request, use the plan as the execution order and continue according to the user's request.

**Complete when:** every requirement maps to at least one task and verification signal, every task maps back to a requirement or prerequisite, dependency order is valid, parallel claims account for coordination collisions, and all blocking decisions are visible before affected work begins.
