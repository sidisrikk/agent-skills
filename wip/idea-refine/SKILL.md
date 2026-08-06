---
name: idea-refine
description: Refines ideas through a gated funnel. Use when the user brings a raw concept, wants materially different directions, needs to stress-test an idea before planning, or wants a confirmed direction turned into a testable brief.
---

# Idea Refine

Funnel an idea into a clear user, one job, a riskiest bet, and a cheap test.

## Route The Entry

First establish the frame: target user, job or pain, observable success, and binding constraints. Reuse facts the user supplied. Then route the user's most specific requested action:

- A raw or vague concept, or a request for more directions, enters Phase 1.
- A concrete idea or candidate directions to stress-test enters Phase 2 once the frame is complete; prior variations are optional.
- A request to sharpen a confirmed option or evidence-gathering test enters Phase 3 only with a decision record: evidence, core bet, riskiest **Must be true** assumption, kill condition, and cheapest test.

Ask only for missing entry evidence. State the starting phase, then keep the conversation there until its gate passes.

## Operating Rules

- Ask one highest-value question at a time and wait for the answer.
- State weak value, high complexity, and unsupported assumptions directly, with the evidence and cheapest next test.
- For an existing project, inspect relevant architecture, constraints, and prior art with `Glob`, `Grep`, and `Read` before making codebase-specific claims. Cite files that change the options.
- Evidence is observed behavior, costly commitment, repeated target-user reports, repository or operational facts, or a comparable case. Label its absence **unknown**.
- End the funnel at an approved one-pager. Implementation and planning are later work.

## Phase 1: Frame And Diverge

Open the idea before narrowing it.

1. Restate the idea as **How might we [outcome] for [user] within [constraint]?** Add a one-sentence interpretation.
2. Resolve the target user, job or pain, observable success, and binding constraints. Ask about prior attempts or urgency only when the answer could change the directions.
3. When the idea concerns an existing project, inspect the codebase now. Record the files that constrain the options or state that the inspection found none.
4. Generate 5-8 variations that differ in target user, mechanism, or core bet. For each, name the lens, direction, core bet, and reason it deserves consideration. If fewer than five meet that distinction test, read [`frameworks.md`](frameworks.md) and replace the weak variations.
5. Ask which variations resonate, which do not, and what the reaction reveals. Wait for the answer.

**Phase 1 gate:** the frame is complete; project-specific claims cite inspected files or an explicit no-constraint result, otherwise repository evidence is marked not applicable; 5-8 variations pass the distinction test and have bets and reasons; and the user has reacted to them.

## Phase 2: Evaluate And Converge

Turn the framed idea or the user's reaction into a small set of bets worth testing.

1. Form 2-3 meaningful options. Cluster selected variations; for one supplied idea, include the status quo and the smallest credible alternative.
2. Read [`refinement-criteria.md`](refinement-criteria.md), then assess each option's user value, feasibility, and differentiation. State the strongest evidence or **unknown**, hardest constraint, and reason a user would switch from the current workaround.
3. For each option, run a pre-mortem across adoption, core mechanism, uncontrolled dependencies, delivery, and constraints. Record a failure for each domain or **none found** with a reason. Convert every failure into an assumption and classify it by consequence:
   - **Must be true:** if false, the direction fails.
   - **Should be true:** if false, the approach needs adjustment.
   - **Might be true:** useful later, but irrelevant to the first test.
4. Give each option a kill condition and cheapest test. Specify the participant or input, action, time box, and pass/fail threshold.
5. Recommend either one option or, when none has credible evidence, the evidence-gathering test that resolves the highest-consequence unknown. Explain the decisive trade-off and intentional exclusions, then wait for confirmation.

If none resonate, ask what made them miss. Regenerate only after the answer adds an actionable constraint; replace prior bets rather than repeating them. Return to framing when no actionable constraint emerges.

**Phase 2 gate:** 2-3 options are compared on all three criteria; every option has a recorded result for every pre-mortem domain and every failure is classified; each option has at least one **Must be true** assumption, evidence or **unknown**, a kill condition, and a fully specified cheapest test; and the user has confirmed an option or evidence-gathering test.

## Phase 3: Sharpen And Ship

Convert the confirmed option or evidence-gathering test into a testable one-pager.

1. Carry forward the confirmed decision record. Return to Phase 2 for any missing field.
2. Define the smallest time-boxed experiment around one user job, using the confirmed riskiest assumption and cheapest test.
3. Make trade-offs visible in a specific **Not Doing** list with a reason for every cut.
4. Draft:

   ```markdown
   # [Idea Name]

   ## Problem Statement
   [One-sentence How Might We statement]

   ## Recommended Direction
   [Direction, evidence, and decisive trade-off]

   ## Key Assumptions To Validate
   - [ ] [Assumption] - [test] - [pass/fail threshold]

   ## MVP Scope
   [One-job experiment, time box, and boundary]

   ## Not Doing (And Why)
   - [Cut] - [reason]

   ## Open Questions
   - [Question that can change the next decision, or None]
   ```

5. Present the draft. Revise it until the user approves the content.
6. Ask whether to save it. If yes, confirm the exact path, create its parent directory when needed, write the approved draft, and report the path. If no, leave the approved draft in the conversation.

**Phase 3 gate:** the problem names the user, outcome, and constraint; the recommendation names the choice, evidence, and trade-off; assumptions include the confirmed riskiest bet with its test and threshold; the MVP names one job, time box, boundary, and kill condition; at least one tempting cut has a reason; open questions are decision-changing or explicitly **None**; and the user either declined saving or the saved file contains the approved draft.

Read [`examples.md`](examples.md) only when the user asks to see an example run.
