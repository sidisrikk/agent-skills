---
name: low-cognitive-guidelines
description: Tiered coding principles that minimize cognitive load on AI agents — deep modules, strong typing, SRP, pure functions, fail-fast. Use when writing new code, designing module APIs, reviewing code for AI-readability, or when asked about AI-optimized code structure and architecture.
---

# Low Cognitive Guidelines

Universal coding principles — apply regardless of framework. Full examples → [EXAMPLES.md](EXAMPLES.md)

3 tiers by impact. A = highest, C = optional.

## Tier A — Blockers (always apply)

**1. Deep Modules** — one call hides complexity inside

- ✅ `userService.create(dto)` — validation, DB write, events all hidden inside
- ❌ caller assembles: `validate(dto)` → `repo.save()` → `events.emit()` → `mailer.send()`

**2. Strong Typing** — explicit types = no guessing

- ✅ `type UserId = string & { __brand: 'UserId' }` — compiler rejects wrong IDs
- ❌ `id: string`, `data: any`, untyped params — AI guesses what's valid

**3. Consistency** — same shape everywhere → AI predicts accurately

- ✅ every async op returns `Result<T> = { ok: true; data: T } | { ok: false; error: string }`
- ❌ fn A returns `T | null`, fn B throws, fn C returns `boolean` — no pattern to predict

**4. SRP** — one module, one job → clean context window

- ✅ `parser.ts` parses · `validator.ts` validates · `repository.ts` handles DB — each isolated
- ❌ `utils.ts` with parse + validate + hash + send email — AI must read all to understand any

## Tier B — Warnings (fix before shipping)

**5. Pure Functions** — no side effects → certain reasoning, easy tests

- ✅ `calculateTotal(items: Item[]): number` — same input always yields same output
- ❌ fn reads global state / fires analytics / mutates external array — untestable in isolation
- Rule: side effects at edges only (DB/API/I/O)

**6. Fail-Fast** — explicit errors → fast debug

- ✅ `if (!id) throw new Error('id required, got: ' + JSON.stringify(id))` at fn entry
- ❌ `return null` on bad input — caller discovers failure 3 layers deep
- Rule: validate at fn entry, throw immediately, never swallow

**7. Rule of 100** — short fns → AI holds all logic in working memory

- ✅ `parseRow()` → `validateRecord()` → `toDto()` → `save()` — each ≤ 100 lines
- ❌ 500-line fn: reads file + parses + validates + transforms + saves + notifies
- Rule: if a section needs a comment to explain it → extract named fn

## Tier C — Suggestions (fix opportunistically)

**8. Declarative Code** — intent readable without tracing logic

- ✅ `users.filter(isActive).map(toDto)` — reads like a description of the result
- ❌ for-loop + index + nested if + push — must trace line by line to understand

**9. Data / Logic Split** — shapes separate from behavior

- ✅ `types.ts` holds interfaces; `user-service.ts` imports and operates on them
- ❌ class mixing `id: string` fields + `validate()` + `save()` + `toJSON()` in one place

**10. Law of Demeter** — pass what you need, not the whole world

- ✅ `sendEmail(user.email, user.name)` — fn gets exactly what it uses
- ❌ `sendEmail(user)` then inside: `user.contact.primary.email`, `user.profile.personal.firstName`

## Review Priority

| Priority   | Tier | Violations                                                                        |
| ---------- | ---- | --------------------------------------------------------------------------------- |
| Blocker    | A    | `any` types · multi-job modules · inconsistent return shapes · leaky abstractions |
| Warning    | B    | side effects in logic fns · `return null` · fn > 50 lines                         |
| Suggestion | C    | imperative loops · mixed data+logic · deep object chains                          |
