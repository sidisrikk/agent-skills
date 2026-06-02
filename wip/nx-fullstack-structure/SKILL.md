---
name: nx-fullstack-structure
description: Use when adding, moving, or reviewing files in an Nx fullstack TypeScript repo with React apps, NestJS apps, workers, shared Zod schemas, Prisma db, feature folders, vertical slices, or import-boundary decisions.
license: MIT
---

# Nx Fullstack Structure

## Core Rule

Grow the repo in three layers: Nx owns deployable/runtime boundaries, React apps own feature-based UI boundaries, and NestJS apps own vertical-slice backend boundaries. Keep business context colocated, but define cross-runtime contracts once in `libs/schemas`.

## Quick Reference

| Question                                       | Put it here                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| Deployable React runtime                       | `apps/web` or explicit future app like `apps/admin`               |
| Deployable Nest API                            | `apps/api`                                                        |
| Worker/job runtime                             | `apps/worker`                                                     |
| Request, response, form, mutation, job schemas | `libs/schemas`                                                    |
| Prisma schema/client/database ownership        | `libs/db`                                                         |
| Pure browser-safe helpers                      | `libs/utils`                                                      |
| React domain UI/query/form logic               | `apps/<react-app>/src/features/<feature>`                         |
| React route composition                        | `apps/<react-app>/src/pages` or existing router composition layer |
| Nest domain/use-case/adapter slice             | `apps/api/src/modules/<feature>`                                  |
| Nest guards/interceptors/filters/middleware    | `apps/api/src/common`                                             |

## Combined Blueprint

```text
.
|-- apps/
|   |-- web/                      # React runtime
|   |   `-- src/
|   |       |-- app/              # providers/router/shell
|   |       |-- components/ui/    # primitive UI only
|   |       |-- features/<name>/  # domain UI/hooks/services/index.ts
|   |       `-- pages/            # route composition
|   |-- api/                      # NestJS runtime
|   |   `-- src/
|   |       |-- common/           # guards/interceptors/filters
|   |       `-- modules/<name>/
|   |           |-- domain/       # entities, ports, errors; no Nest
|   |           |-- use-cases/    # orchestration
|   |           |-- adapters/     # controllers, DTOs, repos, clients
|   |           `-- <name>.module.ts
|   |-- worker/                   # jobs, queues, cron
|   `-- web-e2e/                  # e2e tests
|-- libs/
|   |-- schemas/                  # Zod schemas + inferred TypeScript types
|   |-- db/                       # Prisma owner, server-only
|   `-- utils/                    # pure shared helpers only
`-- package.json                  # one root package file
```

Only add future runtimes such as `apps/admin` or Dockerfiles when the user asks or the repo already has backing implementation.

## Import Boundaries

```text
apps/web      -> libs/schemas, libs/utils
apps/api      -> libs/schemas, libs/utils, libs/db
apps/worker   -> libs/schemas, libs/utils, libs/db
libs/schemas  -> no apps/*, no libs/db, no React, no Nest, no Prisma
libs/utils    -> no apps/*, no libs/db, no React, no Nest, no Prisma
libs/db       -> libs/utils only; server-only
apps/*        -> never import another app
```

Prefer Nx tags and `@nx/enforce-module-boundaries` so these rules are enforced by tooling, not memory.

## React Rules

- Use feature folders: `features/<domain>/{components,hooks,services,types,index.ts}`.
- Keep the feature root limited to `index.ts` and existing route-facing page conventions; put API clients in `services/` and query hooks in `hooks/`.
- Import another feature only through its public `index.ts` gate; avoid deep cross-feature imports.
- Keep `pages/`/router composition and `components/ui/` business-free; domain logic belongs in `features/<domain>`.
- TanStack Query calls live in feature hooks/services and use `libs/schemas` types for inputs and parsing.

## NestJS Rules

- Use `modules/<domain>` vertical slices instead of global `controllers/`, `services/`, and `repositories/` folders.
- Keep Nest decorators, pipes, guards, interceptors, and HTTP response mapping in `adapters/` or `common/`.
- Keep `domain/` and `use-cases/` framework-agnostic: no Nest decorators, no HTTP exceptions, no Prisma client calls.
- Put Prisma access in an adapter repository that imports `libs/db`; expose a domain port/interface to use cases.
- Use shared Zod schemas with thin Nest DTO wrappers, not duplicated class-validator DTOs unless explicitly required.

## Shared Contract Rule

Define each request/response/job payload once in `libs/schemas/src/lib/<domain>.ts`, export it through the existing library barrels, then reuse it in React Hook Form, TanStack Query, NestJS DTO wrappers, and worker payload validation.

## File Size Rule

Any file under `src/` has a 400-line soft limit and a 800-line hard limit. Past 400 lines, prefer to split the file; past 800 lines, split it before it grows further.

Split by responsibility - extract a hook, sub-component, use-case, port, or schema module - rather than mechanically chunking lines. Never inflate the public `index.ts` barrel to dodge the limit.

## Common Mistakes

- Do not duplicate DTOs, form types, mutation types, or worker payload types outside `libs/schemas`.
- Do not import `@org/db`, Prisma, or server-only code from browser apps.
- Do not import from `apps/api` inside `apps/worker` or `apps/web`; share through `libs/*` instead.
- Do not put business logic in `components/ui`, `libs/utils`, route files, or Nest controllers.
- Do not flatten Nest slices into `controller + service + dto` when the feature needs domain/use-case/repository separation.
- Do not let a `src/` file drift past 400 lines without splitting, or exceed 800 lines; extract a unit instead.
- Do not invent new root folders when an existing `apps/*` or `libs/*` boundary fits.
