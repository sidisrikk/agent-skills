---
name: grill-me-finite
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.

## Before first question

Use **todo tool**. Break interview into phases sized to the plan's complexity (e.g. "Goals & Scope", "Constraints", "Core Design", "Edge Cases", "Risks & Tradeoffs"). Each phase = one todo item. User sees full map, knows session is finite.

## Rules

- One phase **in_progress** at a time.
- Phase → **completed** when all its questions resolved.
- All phases done → write 1-paragraph decision summary.
- After summary, list **optional follow-up questions** (deeper edge cases, alternatives, rollout). Prefix: _"Want to go deeper? Here are questions worth revisiting:"_ — then stop. Wait for user to opt in. Never ask these automatically.
