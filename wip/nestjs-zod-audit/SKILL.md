---
name: nestjs-zod-audit
description: Audits NestJS backend controllers and DTOs for nestjs-zod compliance and Swagger decorator completeness. Finds raw @Body/@Query/@Param objects that bypass ZodDto, missing @ApiOperation/@ZodResponse/@ApiResponse/@ApiParam/@ApiQuery/@ApiTags decorators, inline schemas that should live in a shared contracts lib, and auto-generates missing Swagger docs via createZodDto. Use when auditing backend API docs, checking DTO patterns, verifying nestjs-zod compliance, or ensuring Swagger coverage.
---

# nestjs-zod-audit

See [REFERENCE.md](REFERENCE.md) for full schema/DTO patterns, hard borders, and fix code examples.

## Project config

| Variable              | Description                            | AI Hub value                       |
| --------------------- | -------------------------------------- | ---------------------------------- |
| `<contracts-lib>`     | Path to shared Zod schemas             | `libs/contracts/src`               |
| `<contracts-package>` | Import alias for shared schemas        | `@ai-hub/contracts`                |
| `<backend-src>`       | Backend source root                    | `apps/backend/src`                 |
| `<build-cmd>`         | Command that must exit 0 after changes | `nx build backend --skip-nx-cache` |

## Quick start

```bash
# Find all backend controllers
glob("<backend-src>/**/*.controller.ts")

# Find raw @Body types (violations)
ast_grep pattern: '@Body() $PARAM: { $$$ }'

# Find raw @Query types (violations)
ast_grep pattern: '@Query() $PARAM: { $$$ }'

# Find bare @Param with no pipe argument (potential missing validation)
ast_grep pattern: '@Param($KEY) $PARAM: string'

# Find DTOs not using createZodDto
grep pattern: "class.*Dto" — then verify each extends createZodDto(...)

# Find controllers missing @ApiTags
grep pattern: "@Controller" — check each file for @ApiTags above the class

# Verify ZodValidationPipe is globally registered
grep pattern: "ZodValidationPipe" in main.ts / app.module.ts
```

## Audit checklist

### Bootstrap (once per project)

- [ ] `ZodValidationPipe` is globally registered — `app.useGlobalPipes(new ZodValidationPipe())` in `main.ts` OR `APP_PIPE` provider in `app.module.ts` (if missing, all DTO validation silently skips)

### Every controller class

- [ ] `@ApiTags('domain-name')` present on the controller class
- [ ] `@ApiBearerAuth()` or `@ApiSecurity(...)` present if any route requires auth

### Every controller method

- [ ] `@Body()` / `@Query()` param type is a `createZodDto` class (never inline `{ field?: type }`)
- [ ] `@Param('x')` has `@ApiParam({ name: 'x', type: String })` for Swagger
- [ ] `@Param('x')` that must be a UUID or integer uses `ParseUUIDPipe` / `ParseIntPipe` (or a Zod pipe)
- [ ] `@Query()` DTO class fields have `@ApiProperty` **or** `@ApiQuery` is declared at method level
- [ ] `@ApiOperation({ summary: '...' })` present
- [ ] Success response has `@ZodResponse({ status: 2xx, type: ResponseDto })` or `@ApiResponse`
- [ ] Response shape uses a `createZodDto(ResponseSchema)` DTO with `@ZodSerializerDto` (not a plain interface)
- [ ] Every `throw new XxxException` has a matching `@ApiResponse({ status: NNN, type: HttpErrorDto })`
- [ ] DTO imports schema from `<contracts-package>` — never defines it inline
- [ ] Schema lives in `<contracts-lib>/schemas/` and is exported from the contracts barrel

## Fix workflow

1. **Raw `@Body()`/`@Query()`** → add schema to `<contracts-lib>/schemas/`, create DTO with `createZodDto`, use class in controller. See [REFERENCE.md §Fix 1](REFERENCE.md#1-raw-body--query--zodDto).
2. **Missing Swagger** → add `@ApiOperation`, `@ZodResponse`, `@ApiResponse` per thrown exception. See [REFERENCE.md §Fix 2](REFERENCE.md#2-missing-swagger-decorators).
3. **Inline schema** → move to `<contracts-lib>/schemas/<domain>/<name>.schema.ts`, export from barrel. See [REFERENCE.md §Fix 3](REFERENCE.md#3-inline-schema--move-to-contracts).
4. **Bare `@Param()`** → add `@ApiParam` for Swagger + validation pipe for format-constrained params. See [REFERENCE.md §Fix 4](REFERENCE.md#4-bare-param--apiparam--validation-pipe).
5. **Missing response DTO** → add response schema to contracts, create DTO with `createZodDto`, attach `@ZodSerializerDto`. See [REFERENCE.md §Fix 5](REFERENCE.md#5-missing-response-dto).
6. **`ZodValidationPipe` not registered** → register globally in `main.ts` or `app.module.ts`. See [REFERENCE.md §Fix 6](REFERENCE.md#6-zodvalidationpipe-not-globally-registered).

## Verification

```bash
<build-cmd>   # must exit 0
lsp_diagnostics on every changed .controller.ts and .dto.ts
```
