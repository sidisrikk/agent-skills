---
name: normalize-skill
description: Improves an existing skill file for cross-project reuse by classifying content into generality tiers, normalizing project-specific values into config variables, and enforcing the SKILL.md ≤ 100 line structure with REFERENCE.md split. Use when user wants to improve, normalize, refine, or audit an existing skill, mentions "make skill reusable", "generalize skill", or "refine skill".
---

# normalize-skill

See [REFERENCE.md](REFERENCE.md) for classification taxonomy, normalization patterns, and splitting guide.

## Workflow

### Step 1 — Read and gather context

- Read the skill file in full
- If the skill is code-related: grep/explore the codebase to find real usage patterns the skill is describing. Replace invented examples with real structural patterns (genericized).

### Step 2 — Classify every section

Tag each section/block with one of three tiers (see [REFERENCE.md §Tiers](REFERENCE.md#classification-tiers)):

| Tier            | Meaning                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| 🟡 Common       | Framework/language agnostic through technology-specific — keep here         |
| 🟠 Specific     | Project conventions (paths, package names, commands) — parameterize         |
| 🔴 Too specific | Business domain (field names, entity names) — replace with generic examples |

Present the classification table to the user before proceeding.

### Step 3 — Normalize

For every 🟠 item:

- Extract the hardcoded value into a named `<variable>`
- Add/update a **Project config** table at the top of SKILL.md mapping each `<variable>` to its current project value

For every 🔴 item:

- Replace domain-specific examples (real entity names, business fields) with a generic 3–5 field dummy that conveys the same structural point

### Step 4 — Enforce structure

- SKILL.md must be ≤ 100 lines
- If over: move detailed code examples, reference tables, and rarely-used sections to REFERENCE.md
- Link from SKILL.md: `See [REFERENCE.md](REFERENCE.md)` at the top, and inline `§` anchors in the fix workflow
- Frequently-needed content stays in SKILL.md: project config, quick start, audit checklist, verification

### Step 5 — Final checklist

- [ ] Description ≤ 1024 chars with "Use when [triggers]"
- [ ] SKILL.md ≤ 100 lines
- [ ] Project config table present with all `<variables>` resolved for this project
- [ ] No domain-specific field/entity names in examples
- [ ] No time-sensitive info
- [ ] REFERENCE.md linked from SKILL.md (if created)
