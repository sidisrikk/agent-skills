---
name: low-cognitive-guidelines
description: Tiered coding principles that minimize cognitive load on AI agents — deep modules, strong typing, SRP, pure functions, fail-fast. Use when writing new code, designing module APIs, reviewing code for AI-readability, or when asked about AI-optimized code structure and architecture.
---

# Low Cognitive Guidelines

Universal coding principles to minimize cognitive load. 
See [REFERENCE.md](REFERENCE.md) for full code examples.

## Quick start

Check code against Tier A Blockers:
- **Deep Modules**: One call hides complexity inside.
- **Strong Typing**: Use explicit types, avoid `any` or loose strings.
- **Consistency**: Use identical return shapes across similar operations.
- **SRP**: One module, one responsibility.

## Workflows

### Code Review Workflow

1. **Check Blockers (Tier A)**: Reject `any` types, multi-job modules, inconsistent return shapes, leaky abstractions. Fix immediately.
2. **Check Warnings (Tier B)**: Flag side effects in logic fns, silent `return null`, or functions > 100 lines. Fix before shipping.
3. **Check Suggestions (Tier C)**: Suggest declarative alternatives to imperative loops or mixed data+logic opportunistically.

### Implementation Workflow

1. **Design Deep Modules**: Expose a simple interface, hide implementation details inside the module.
2. **Validate Input (Fail-Fast)**: Validate at function entry, throw explicit typed errors immediately.
3. **Keep it Short (Rule of 100)**: If a block of code needs a comment to explain it, extract it to a named function.
4. **Separate Data/Logic**: Define shapes in types/interfaces, keep behavior separate.

## Review Priority

| Priority   | Tier | Violations                                                                        |
| ---------- | ---- | --------------------------------------------------------------------------------- |
| Blocker    | A    | `any` types · multi-job modules · inconsistent return shapes · leaky abstractions |
| Warning    | B    | side effects in logic fns · `return null` · fn > 100 lines                        |
| Suggestion | C    | imperative loops · mixed data+logic · deep object chains                          |
