# nestjs-zod-audit — Reference

## Schema patterns

### Pattern A — simple schema

```ts
// <contracts-lib>/schemas/<domain>/<name>.schema.ts
import { z } from 'zod';

export const CreateItemBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export type CreateItemBody = z.infer<typeof CreateItemBodySchema>;
```

### Pattern B — discriminated union with shared base

Use when one endpoint accepts multiple structurally different payloads.

```ts
// <contracts-lib>/schemas/<domain>/<name>.schema.ts
import { z } from 'zod';

// ─── Shared base fields (file-private — do NOT export) ───────────────────────

const BaseFields = z.object({
  label: z.string().min(1),
  notes: z.string().optional(),
});

// ─── Per-type variants (extend base, add discriminant + own fields) ───────────

const TypeASchema = BaseFields.extend({
  kind: z.literal('TypeA'),
  valueA: z.string().optional(),
});

const TypeBSchema = BaseFields.extend({
  kind: z.literal('TypeB'),
  valueB: z.number().optional(),
});

// ─── Discriminated union (the exported schema) ────────────────────────────────

export const CreateItemBodySchema = z.discriminatedUnion('kind', [TypeASchema, TypeBSchema]);

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateItemBody = z.infer<typeof CreateItemBodySchema>;

// Per-variant types for narrowed consumers (handlers, services)
export type TypeABody = z.infer<typeof TypeASchema>;
export type TypeBBody = z.infer<typeof TypeBSchema>;
```

## DTO patterns

### Pattern A — simple schema (use for most DTOs)

```ts
// <backend-src>/features/<feature>/dto/<action>.request.dto.ts
import { createZodDto } from 'nestjs-zod';
import { CreateItemBodySchema } from '<contracts-package>';

export class CreateItemRequestDto extends createZodDto(CreateItemBodySchema) {}
```

### Pattern B — discriminated union (cannot use `class extends`)

TypeScript class inheritance requires a plain-object constructor return type, not a union.
Use `const + InstanceType` instead:

```ts
import { createZodDto } from 'nestjs-zod';
import { CreateItemBodySchema } from '<contracts-package>';

export const CreateItemRequestDto = createZodDto(CreateItemBodySchema);
export type CreateItemRequestDto = InstanceType<typeof CreateItemRequestDto>;
```

**Rule:** If the schema is `z.discriminatedUnion(...)` → always Pattern B. Otherwise → Pattern A.

### Pattern C — response DTO

Response shapes must also go through `createZodDto` so `@ZodSerializerDto` can strip extra fields.

```ts
// <backend-src>/features/<feature>/dto/<action>.response.dto.ts
import { createZodDto } from 'nestjs-zod';
import { CreateItemResponseSchema } from '<contracts-package>';

export class CreateItemResponseDto extends createZodDto(CreateItemResponseSchema) {}
```

Use with `@ZodSerializerDto` on the handler:

```ts
@ZodSerializerDto(CreateItemResponseDto)
async create(@Body() body: CreateItemRequestDto): Promise<CreateItemResponseDto> { ... }
```

## Hard borders

| What                     | Where                                      | Never                                   |
| ------------------------ | ------------------------------------------ | --------------------------------------- |
| Zod schema definition    | `<contracts-lib>/schemas/`                 | Inside `dto/` files or backend services |
| `z.infer<>` type aliases | Same file as the schema, right below it    | Re-declared anywhere else               |
| `createZodDto(...)` call | `<backend-src>/features/<feature>/dto/`    | Directly in controllers                 |
| DTO class body           | Empty `{}` unless adding Swagger overrides | Business logic                          |
| Discriminated union DTO  | `const + InstanceType` (Pattern B)         | `class extends createZodDto(union)`     |
| Base schema (private)    | File-private — no `export`                 | Exported or copy-pasted into variants   |
| Response DTO             | `createZodDto(ResponseSchema)` + `@ZodSerializerDto` | Plain interface or untyped `any` |

## Fix examples

### 1. Raw `@Body()` / `@Query()` → ZodDto

```ts
// step 1 — add schema to contracts
// <contracts-lib>/schemas/<domain>/<name>.schema.ts
export const MyActionSchema = z.object({ field: z.string() });
export type MyAction = z.infer<typeof MyActionSchema>;

// step 2 — create DTO
// <backend-src>/features/<feature>/dto/<action>.request.dto.ts
export class MyActionDto extends createZodDto(MyActionSchema) {}

// step 3 — use in controller
async handler(@Body() body: MyActionDto) { ... }
```

### 2. Missing Swagger decorators

```ts
@ApiOperation({ summary: 'One-line description of what this endpoint does' })
@ZodResponse({ status: 200, description: '...', type: ResponseDto })
@ApiResponse({ status: 400, type: HttpErrorDto, description: 'Invalid input' })
@ApiResponse({ status: 404, type: HttpErrorDto, description: 'Not found' })
```

For controller-level auth and grouping:

```ts
@ApiTags('items')
@ApiBearerAuth()          // if the whole controller is authenticated
@Controller('items')
export class ItemsController { ... }
```

### 3. Inline schema → move to contracts

Move to `<contracts-lib>/schemas/<domain>/<name>.schema.ts`, export from barrel, import in DTO.

### 4. Bare `@Param()` → `@ApiParam` + validation pipe

Always document path params in Swagger. Add a format-validation pipe when the param is a UUID or integer.

```ts
// String param — Swagger doc only
@ApiParam({ name: 'slug', type: String, description: 'URL slug' })
async findBySlug(@Param('slug') slug: string) { ... }

// UUID param — Swagger doc + pipe
@ApiParam({ name: 'id', type: String, format: 'uuid' })
async findOne(@Param('id', ParseUUIDPipe) id: string) { ... }

// Integer param — Swagger doc + pipe
@ApiParam({ name: 'page', type: Number })
async list(@Param('page', ParseIntPipe) page: number) { ... }
```

### 5. Missing response DTO

```ts
// step 1 — add response schema to contracts
// <contracts-lib>/schemas/<domain>/<name>.schema.ts
export const ItemResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});
export type ItemResponse = z.infer<typeof ItemResponseSchema>;

// step 2 — create response DTO
// <backend-src>/features/<feature>/dto/<action>.response.dto.ts
export class ItemResponseDto extends createZodDto(ItemResponseSchema) {}

// step 3 — attach to handler
@ZodSerializerDto(ItemResponseDto)
@ZodResponse({ status: 200, type: ItemResponseDto })
async findOne(...): Promise<ItemResponseDto> { ... }
```

### 6. ZodValidationPipe not globally registered

Pick **one** of the following approaches — do not use both.

```ts
// Option A — main.ts (bootstrap)
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  await app.listen(3000);
}

// Option B — app.module.ts (DI-aware, preferred for testing)
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

@Module({
  providers: [{ provide: APP_PIPE, useClass: ZodValidationPipe }],
})
export class AppModule {}
```

## Known legitimate exceptions

- Query params that are truly free-form strings with no schema validation can stay as
  `@Query('param') param: string` — but still add `@ApiQuery` manually.
- Route params that carry no format constraint (arbitrary string slug) need `@ApiParam` but no pipe.
