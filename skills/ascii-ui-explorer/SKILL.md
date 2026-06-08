---
name: ascii-ui-explorer
description: ASCII UI exploration for screens, components, flows, states, and responsive variants. Use when the user wants ASCII wireframes, multiple layout options, UI sketches, design iteration, empty/loading/error/success states, or responsive mockups without implementation code.
---

# ASCII UI Explorer

## Purpose

Standalone design skill. Explore and refine UI ideas in ASCII without implementation code.

- Supports screens, components, flows, state views, and responsive variants
- Broad UI scope with web-first examples
- Defaults to clear, polished low-to-mid fidelity
- Uses ASCII-first examples; Unicode box drawing is optional when higher fidelity helps
- Default width is 100 chars; max 120

## Hard Boundary

Do not produce HTML, CSS, React, design tokens, or implementation plans.

If the user asks for implementation:

- say implementation is out of scope for this skill
- offer either continued design refinement or stopping at the design

## When to Use

Use this skill when the user wants:

- ASCII wireframes or UI sketches
- 2-3 layout options for a new feature or screen
- refinement of an existing mockup
- empty/loading/error/success state exploration
- responsive layout variants
- multi-screen user-flow sketches
- help comparing layout directions before building

## Modes

- `explore`: generate multiple materially different directions
- `refine`: improve one chosen direction
- `states`: add empty/loading/error/success views
- `responsive`: adapt a direction across devices
- `flow`: sketch a user journey across screens

## Default Workflow

1. Clarify the goal and constraints.
2. If the brief is unclear, ask 3-5 high-value questions max.
3. If the brief is clear, skip questions and start sketching.
4. State the assumptions that matter.
5. Pick a mode.
6. For ambiguous or new problems, show 2-3 materially different options.
7. For constrained or refinement asks, show one focused option first.
8. Put every sketch in its own fenced code block.
9. Recommend one option every time.
10. Explain the rationale for each option using task clarity, hierarchy, interaction cost, density, responsiveness risk, and state complexity.
11. End with concrete next-pass prompts.

## Default Response Shape

Use this structure when the request is non-trivial:

1. `Goal`
2. `Constraints`
3. `Assumptions`
4. `Option A/B/C` or chosen mode output
5. `Recommendation`
6. `Next refinement questions`

For tiny requests, shorten the format without dropping clarity.

## Standard Notation

Use this notation by default. Override only when clarity improves.

- primary action: `[Save]`
- secondary action: `(Cancel)`
- text input: `[________]`
- search or compact input: `[Search____]`
- checkbox: `[x]` / `[ ]`
- radio: `(*)` / `( )`
- dropdown: `[Sort v]`
- tabs: `[Overview]  Details`
- current nav item: `> Dashboard`
- inactive nav item: `  Reports`
- step marker: `1. Info -> 2. Review -> 3. Done`

## Rules

- Stay design-only. No code.
- Make options genuinely different when exploring.
- Prefer ASCII-first examples; mention Unicode as optional only.
- Default to 100 chars wide or less. Never exceed 120.
- Ask only a small targeted question set before sketching.
- State assumptions when the brief leaves gaps.
- Include state variants when async data, user actions, or branching outcomes make them relevant.
- Offer responsive variants only when requested or clearly relevant.
- Always recommend one option.
- Always explain each option's rationale.
- Always end with concrete refinement moves, not generic feedback asks.

## Anti-Patterns

- Do not jump to code.
- Do not generate fake-different options.
- Do not over-decorate ASCII at the cost of readability.
- Do not skip important states when they matter.
- Do not ask an interview-length intake before sketching.
- Do not hide assumptions.

## Reference Map

- `references/screens.md` - screen and page layouts
- `references/components.md` - component-level sketches
- `references/flows.md` - multi-screen flows and journeys
- `references/states.md` - empty/loading/error/success handling
- `references/patterns.md` - preferred defaults, comparison rubric, responsive transforms, pattern catalog

## Mini Prompts

- `Explore 3 dashboard layouts for an ops team.`
- `Refine this checkout sketch and reduce visual density.`
- `Show empty/loading/error states for this table.`
- `Turn this desktop layout into tablet and mobile variants.`
- `Sketch the onboarding flow in 4 screens.`
