---
name: verification-gate-review
description: Review verification effort and value, prioritize checks, or assess safe unattended-work scheduling.
---

# Verification Gate Review

Review a plan and recommend a schedule that reduces avoidable effort without delaying needed evidence.
This review does not authorize implementation, check execution, plan edits, or release actions.

Follow governing rules: required gates and approval boundaries remain binding.

## 1. Find the gates

Read the named plan and applicable instructions. Identify the outcome, acceptance criteria, dependencies,
checkpoints, requested unattended scope, and who may approve schedule changes.

- Account for every check and evidence obligation with a plan reference, procedure, expected result,
  prerequisites, and operator when known.
- Group repeated checks by purpose and coverage, retaining task/checkpoint references. The same command
  after changed code is not automatically redundant; note dependencies beyond the requested work.
- Mark missing procedures or unavailable test states unknown, not passing. Inspect repo evidence only
  when it resolves material uncertainty; do not expand required coverage to estimate effort.

## 2. Rate effort and value

Effort is an ordinal score, not a time or percentage estimate. Use `?` when effort is unknown or unbounded.

| Effort | Anchor                                                                 |
| ------ | ---------------------------------------------------------------------- |
| 1      | Ready, deterministic check or lookup; negligible setup.                |
| 2      | Several focused checks or a small test change.                         |
| 3      | Cross-module checks or bounded setup with known interfaces.            |
| 4      | Substantial harness/environment work or coordinated manual/live check. |
| 5      | Multi-system setup or tightly coordinated high-risk work.              |

- Separate running a check from writing tests/harnesses, obtaining prerequisites, and human coordination
  when their effort differs. A live check is not automatically expensive; an offline check is not cheap by default.
- Rate value independently as high, medium, or low: consider unique failures caught, their consequences,
  and alternative evidence. Security, authorization, data loss, compatibility, and irreversible actions
  can make an expensive check essential.
- Give a brief reason. State assumptions or confidence only when they materially affect a rating; do not
  combine effort and value into a score that hides risk.

## 3. Recommend a safe schedule

Choose one action per gate; split repeated checks when their first required task or decision differs.

| Action             | Use when                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **KEEP LOCAL**     | Focused feedback or prerequisite evidence is needed before dependent work.                 |
| **FINAL**          | Repeated broad checks can be replaced by a named integration gate before it is needed.     |
| **FOLLOW-UP**      | Evidence is not needed earlier but must pass before a named release or operational action. |
| **DROP DUPLICATE** | A retained check fully covers the same obligation on the matching code state.              |

- Keep cheap, decisive checks near the change. Obtain needed version, contract, authorization, classification,
  security, or data-loss evidence before dependent code or decisions.
- Preserve required checkpoints. Mocks cannot replace required rendered, security, or real behavioral evidence.
  Do not defer a failing check just to get a green run.
- For each move or drop, give the coverage/risk reason and name the retained/replacement check, procedure,
  pass condition, and when it must pass. Add owner or prerequisites when they matter.
- Request explicit, permitted human acceptance for any uncovered risk; a recommendation is not approval.
  Keep follow-up evidence visibly pending.
- An unattended sequence needs ordered tasks, entry evidence/approvals, available prerequisites, local checks,
  a final code gate, and a stop point. Keep live/release work separate.
- Mark unattended work ready only when decisions are settled, tools and prerequisites are available, and no
  required human interruption falls inside it.
- Stop dependent work when required evidence fails or is unavailable; follow applicable repair limits.
  Reuse evidence only for matching code, configuration, target, and scope; rerun checks invalidated by change.
- Do not present unfinished follow-up work as complete.

## 4. Present the decision

Return, in order:

1. A concise table ranked by blockers and high-consequence risk, then avoidable repetition:

   | Gate (plan ref) | Effort | Value | Action | Why |
   | --------------- | ------ | ----- | ------ | --- |

2. The proposed schedule and its readiness status, including where unattended work stops.
3. Batched decisions needed for permitted schedule changes or risk acceptance, plus material unknowns
   that could change the recommendation.

Do not imply that silence waives a gate or claim that checks were run.
