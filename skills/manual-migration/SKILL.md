---
name: manual-migration
description: Generate a prod-safe SQL migration script from a Prisma migration. Use when you need to deploy a Prisma migration to a production database that only accepts raw SQL (no prisma CLI access). Trigger phrases: "generate manual migration", "manual migrate", "prod sql script", "can't use prisma cli on prod".
---

# Manual Migration Skill

See [REFERENCE.md](REFERENCE.md) for DDL transform table, checksum algorithm, `_prisma_migrations` schema, and the full generator script source.

## Project config

| Variable               | This project                                        |
| ---------------------- | --------------------------------------------------- |
| `<migrations_dir>`     | `apps/db/src/migrations`                            |
| `<manual_scripts_dir>` | `apps/db/src/manual-migrate-scripts`                |
| `<generator_script>`   | `apps/db/src/scripts/generate-manual-migration.mjs` |

> If `<generator_script>` doesn't exist in the repo yet, copy it from [REFERENCE.md §Script](REFERENCE.md#generator-script-source).

---

## Workflow

### Step 1 — After every `prisma migrate dev`

```bash
# Preview first (nothing written)
node <generator_script> <migration-name> --dry-run

# Generate the manual script
node <generator_script> <migration-name>
```

- `<migration-name>` = folder name under `<migrations_dir>/`
- `--dry-run` prints full output to stdout, writes nothing
- Interactive overwrite prompt if the manual script already exists

### Step 2 — Review output

Open `<manual_scripts_dir>/<name>/migration.sql` and check:

- Lines with `-- TODO: verify idempotency` → DDL the generator couldn't safely auto-wrap (e.g. `CREATE TYPE`, `ADD CONSTRAINT`). Decide: add a manual guard or confirm run-once is safe.
- Checksum is auto-computed from the Prisma source — trust it unless you modified the source migration after generating.

### Step 3 — Commit both files together

```bash
git add <migrations_dir>/<name>/migration.sql
git add <manual_scripts_dir>/<name>/migration.sql
git commit -m "feat(db): add migration <name>"
```

**One Prisma migration = one manual script. Always committed together.**

### Step 4 — CI / pre-push check (optional)

```bash
node <generator_script> --check-all
```

Exits `0` if all migrations have a matching manual script with correct checksum. Safe for CI or a pre-push hook.

### Step 5 — Deployment handoff

Hand the DBA the files. Multiple pending migrations = separate files, **run in timestamp order** (the folder name prefix is the order).

---

## Gotchas

- Checksum is computed from `<migrations_dir>/<name>/migration.sql` — **not** the manual wrapper.
- Never modify files in `<migrations_dir>/` after applying — Prisma detects checksum drift. Create a new migration instead.
- `CREATE TYPE … AS ENUM` has no `IF NOT EXISTS` before Postgres 12. See [REFERENCE.md §Gotchas](REFERENCE.md#gotchas).
