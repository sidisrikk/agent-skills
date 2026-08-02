---
name: incremental-implementation
description: Tracer bullets for substantial implementation. Use when a change has multiple independently verifiable behaviors, carries integration uncertainty, or is producing a large unverified diff.
---

# Incremental Implementation

Ship tracer bullets: the smallest end-to-end changes that prove behavior with evidence. Each cycle leaves the repository in a working state before the next slice begins.

When the work lacks clear acceptance criteria or a usable decomposition, invoke `planning-and-task-breakdown` before implementation. Start this cycle once the next slice can be bounded and verified.

## The Cycle

### 1. Bound one tracer bullet

Read the accepted requirements and the affected code path. Select one observable behavior or one uncertainty to retire, then state:

- the behavior this slice will deliver or prove;
- what is inside and outside the slice;
- the focused evidence that will verify it.

The slice is bounded when its behavior, scope, and verification are explicit and it can reach a working checkpoint independently of later slices.

### 2. Implement only that slice

Follow established repository patterns and build the simplest complete path through the affected layers. Add regression coverage at the nearest useful boundary when the behavior can be tested.

Implementation is complete when the bounded behavior exists in code with any applicable regression coverage, and every changed path belongs to this slice rather than a future one.

### 3. Close the feedback loop

Run the narrowest relevant check first, then every repository check affected by the slice: tests, build, type checking, linting, migration validation, or a manual behavior check. A failed check keeps the current slice red; fix it before expanding scope. For a suspected pre-existing failure, compare against the baseline or collect equivalent evidence.

Verification is complete when every applicable check passes. If an external blocker makes that impossible, stop at the current slice and report the blocker, evidence, and repository state. Repeat a successful command only after relevant code or configuration changes.

### 4. Inspect the checkpoint

Review the diff and repository status. Confirm the change has one coherent purpose, unrelated concurrent work remains untouched, and incomplete user-facing behavior stays behind the repository's existing exposure mechanism when one is required.

The checkpoint is sound when the repository is working, every changed path is accounted for, and the slice can be reviewed or reverted without depending on a future slice.

### 5. Continue from evidence

Record the delivered behavior and its verification, then name the next tracer bullet. Carry the proven path forward instead of rebuilding it. When the user explicitly requested commits, invoke `git-workflow-and-versioning` and commit the verified slice atomically.

The cycle is complete when its evidence is recorded and either the next bounded slice is identified or all accepted requirements are satisfied.

## Choosing a Slice

Use the first strategy that fits:

- **Vertical:** Deliver the thinnest observable path through the required layers. This is the default.
- **Risk-first:** Prove the uncertain dependency, protocol, migration, or performance assumption, then turn that proof into the tested production path before broadening it.
- **Contract-first:** When components must advance independently, establish an executable shared contract, then implement each side against it.
- **Foundation-first:** When no vertical path can exist yet, make the minimum foundation observable through a focused test or validation, and stop once it unlocks the next vertical slice.

Prefer behavioral boundaries over file counts or line limits. A slice may span several files while still proving one thing; one file may contain several slices.

## Final Gate

After the last slice, run the repository's full applicable verification gate and exercise the complete requested behavior. Inspect the aggregate diff for accidental scope and integration gaps.

The task is complete when every accepted requirement is evidenced, every applicable project check passes, and all changed paths are accounted for. Report any unavailable check or external blocker explicitly.
