# normalize-skill — Reference

## Classification tiers

### 🟡 Common — keep as-is

Covers everything from language/framework agnostic patterns up through technology-specific conventions. The range is wide by design — the point is simply "this content travels with the skill to any project."

Examples:

- Plain TypeScript patterns, generic Zod schema shapes (language-agnostic)
- `createZodDto`, `@ApiOperation`, `nestjs-zod` DTO rules (technology-specific)
- File-private variable conventions, discriminated union rules

**Action:** Keep. This is the skill's portable value.

### 🟠 Specific — parameterize

Project conventions that differ between projects: paths, package names, build commands.

Examples: `libs/contracts/src`, `@myorg/contracts`, `apps/backend/src`, `nx build backend`.

**Action:** Extract to `<variable>`, add to Project config table with current project value.

**Config table format:**

```md
## Project config

| Variable            | Description                     | This project value                 |
| ------------------- | ------------------------------- | ---------------------------------- |
| `<schemas-lib>`     | Path to shared schemas          | `libs/contracts/src`               |
| `<schemas-package>` | Import alias for shared schemas | `@myorg/contracts`                 |
| `<backend-src>`     | Backend source root             | `apps/backend/src`                 |
| `<build-cmd>`       | Build command that must exit 0  | `nx build backend --skip-nx-cache` |
```

Every `<variable>` must appear in this table. Every hardcoded project path/package/command in the skill body must become a `<variable>`.

### 🔴 Too specific — replace with generic example

Business domain content: real entity names, domain field names, business-specific schemas.

Examples: `OrderSchema`, `customerId`, `shippingAddress`, `lineItems`, `discountCode`.

**Action:** Replace with a generic structural dummy that preserves the lesson without the domain noise.

| Instead of                              | Use                                   |
| --------------------------------------- | ------------------------------------- |
| `OrderSchema` with 14 domain fields     | `TypeASchema` with 2-3 neutral fields |
| `@myorg/contracts` import in code block | `<schemas-package>`                   |
| `CreateOrderRequestDto`                 | `CreateItemRequestDto`                |

## SKILL.md structure guide

### What stays in SKILL.md (≤ 100 lines)

- Frontmatter (4 lines)
- Link to REFERENCE.md (1 line)
- Project config table
- Quick start commands
- Audit checklist
- Fix workflow — headings + one-liner per step + `§` link to REFERENCE.md
- Verification block

### What moves to REFERENCE.md

- Full code examples (schema patterns, DTO patterns)
- Reference tables (hard borders, tier taxonomy)
- Fix workflow code blocks
- Known exceptions / edge cases

### Linking pattern

In SKILL.md fix workflow:

```md
1. **Raw `@Body()`** → create schema + DTO. See [REFERENCE.md §Fix 1](REFERENCE.md#1-raw-body--zodDto).
```

In SKILL.md header:

```md
See [REFERENCE.md](REFERENCE.md) for full patterns, hard borders, and fix code examples.
```

## Common normalization mistakes

- Leaving one hardcoded path while parameterizing others — be exhaustive
- Parameterizing examples inside code blocks but not in prose text
- Adding `<variable>` to Project config table without a concrete "this project" value column
- Splitting aggressively — only split when SKILL.md is over 100 lines, not pre-emptively
