# Manual Migration — Reference

## DDL Idempotency Transforms

The generator auto-applies these transforms. Sections tagged `-- TODO: verify idempotency` need manual review.

| Prisma comment     | Original                  | Transformed                               |
| ------------------ | ------------------------- | ----------------------------------------- |
| `-- CreateTable`   | `CREATE TABLE "X"`        | `CREATE TABLE IF NOT EXISTS "X"`          |
| `-- AlterTable`    | `ADD COLUMN "x"`          | `ADD COLUMN IF NOT EXISTS "x"`            |
| `-- CreateIndex`   | `CREATE INDEX "x"`        | `CREATE INDEX IF NOT EXISTS "x"`          |
| `-- CreateIndex`   | `CREATE UNIQUE INDEX "x"` | `CREATE UNIQUE INDEX IF NOT EXISTS "x"`   |
| `-- DropTable`     | `DROP TABLE "x"`          | `DROP TABLE IF EXISTS "x"`                |
| `-- DropColumn`    | `DROP COLUMN "x"`         | `DROP COLUMN IF EXISTS "x"`               |
| `-- DropIndex`     | `DROP INDEX "x"`          | `DROP INDEX IF EXISTS "x"`                |
| `-- CreateEnum`    | `CREATE TYPE "x" AS ENUM` | unchanged + `-- TODO: verify idempotency` |
| `-- AddForeignKey` | `ADD CONSTRAINT`          | unchanged + `-- TODO: verify idempotency` |
| `-- RenameTable`   | any                       | unchanged + `-- TODO: verify idempotency` |
| `-- RenameColumn`  | any                       | unchanged + `-- TODO: verify idempotency` |

---

## Checksum Algorithm

Matches Prisma's internal `schema-engine` exactly (source: `prisma-engines/schema-engine/connectors/schema-connector/src/checksum.rs`).

```
SHA-256(migration.sql content, CRLF → LF normalized) → lowercase hex, 64 chars
```

- Input: file content only — not path, migration name, or timestamps
- Node.js: `crypto.createHash('sha256').update(content.replace(/\r\n/g, '\n')).digest('hex')`
- Must be **64 characters** (zero-padded). Older Prisma versions had a bug producing 62–63 char strings.

---

## `_prisma_migrations` Table Schema

The first manual script creates this table. Subsequent scripts only INSERT.

```sql
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                  VARCHAR(36)   NOT NULL,
  "checksum"            VARCHAR(64)   NOT NULL,
  "finished_at"         TIMESTAMPTZ,
  "migration_name"      VARCHAR(255)  NOT NULL,
  "logs"                TEXT,
  "rolled_back_at"      TIMESTAMPTZ,
  "started_at"          TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INT           NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
```

INSERT template (idempotent via `WHERE NOT EXISTS`):

```sql
INSERT INTO "_prisma_migrations" ("id","checksum","started_at","finished_at","migration_name","applied_steps_count")
SELECT '<uuid-v4>', '<sha256>', NOW(), NOW(), '<migration-name>', 1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = '<migration-name>'
);
```

---

## Gotchas

- **`CREATE TYPE … AS ENUM` has no `IF NOT EXISTS` before Postgres 12.** Workaround for older versions:
  ```sql
  DO $$ BEGIN
    CREATE TYPE "MyEnum" AS ENUM ('A', 'B');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  ```
- **`ADD CONSTRAINT` has no `IF NOT EXISTS`.** Check `information_schema.table_constraints` before running, or accept it as a run-once statement.
- **Never modify `<migrations_dir>/` files after applying.** Prisma detects checksum drift on next `migrate status`. Create a new migration instead.
- **Multiple pending migrations** must run in timestamp order. The folder name prefix is the canonical order.
- **Checksum is computed from the Prisma source**, not the manual wrapper — the generator always reads from `<migrations_dir>/`, not `<manual_scripts_dir>/`.

---

## Generator Script Source

Save as `<generator_script>` (e.g. `apps/db/src/scripts/generate-manual-migration.mjs`).

Adjust `REPO_ROOT` resolution at the top to match how many directory levels deep the script lives.

```js
#!/usr/bin/env node
/**
 * Generate a prod-safe manual migration script from a Prisma migration.
 *
 * Usage:
 *   node <generator_script> <migration-name> [--dry-run]
 *   node <generator_script> --check-all
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Adjust depth to match script location in your repo
const REPO_ROOT = path.resolve(__dirname, '../../../../');
const MIGRATIONS_DIR = path.join(REPO_ROOT, '<migrations_dir>');
const MANUAL_DIR = path.join(REPO_ROOT, '<manual_scripts_dir>');

function computePrismaChecksum(content) {
  return crypto.createHash('sha256').update(content.replace(/\r\n/g, '\n')).digest('hex');
}

const TRANSFORMS = [
  { pattern: /^(CREATE TABLE\s+)((?:"[^"]+"|`[^`]+`|\S+))/gm, replace: '$1IF NOT EXISTS $2' },
  { pattern: /^(CREATE INDEX\s+)((?:"[^"]+"|`[^`]+`|\S+))/gm, replace: '$1IF NOT EXISTS $2' },
  { pattern: /^(CREATE UNIQUE INDEX\s+)((?:"[^"]+"|`[^`]+`|\S+))/gm, replace: '$1IF NOT EXISTS $2' },
  { pattern: /^(DROP TABLE\s+)((?:"[^"]+"|`[^`]+`|\S+))/gm, replace: '$1IF EXISTS $2' },
  { pattern: /^(DROP INDEX\s+)((?:"[^"]+"|`[^`]+`|\S+))/gm, replace: '$1IF EXISTS $2' },
  { pattern: /(ADD COLUMN\s+)((?:"[^"]+"|`[^`]+`|\S+))/g, replace: '$1IF NOT EXISTS $2' },
  { pattern: /(DROP COLUMN\s+)((?:"[^"]+"|`[^`]+`|\S+))/g, replace: '$1IF EXISTS $2' },
];

const TODO_TAGS = ['-- CreateEnum', '-- AddForeignKey', '-- RenameTable', '-- RenameColumn'];

function applyIdempotencyTransforms(sql) {
  let result = sql;
  for (const { pattern, replace } of TRANSFORMS) result = result.replace(pattern, replace);
  for (const tag of TODO_TAGS) {
    result = result.replace(new RegExp(`(${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g'), `$1 -- TODO: verify idempotency`);
  }
  return result;
}

const PRISMA_MIGRATIONS_TABLE_DDL = `

-- Prisma migrations tracking table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) NOT NULL, "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMPTZ, "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT, "rolled_back_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INT NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);`;

function buildInsertBlock(name, checksum) {
  return `\n-- Mark migration as applied\nINSERT INTO "_prisma_migrations" ("id","checksum","started_at","finished_at","migration_name","applied_steps_count")\nSELECT '${crypto.randomUUID()}','${checksum}',NOW(),NOW(),'${name}',1\nWHERE NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = '${name}');\n`;
}

function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((r) =>
    rl.question(q, (a) => {
      rl.close();
      r(a.trim().toLowerCase());
    }),
  );
}

function isFirstMigration(name) {
  if (!fs.existsSync(MANUAL_DIR)) return true;
  const existing = fs.readdirSync(MANUAL_DIR).filter((d) => fs.existsSync(path.join(MANUAL_DIR, d, 'migration.sql')));
  return existing.length === 0 || [...existing, name].sort()[0] === name;
}

function listMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((d) => fs.existsSync(path.join(MIGRATIONS_DIR, d, 'migration.sql')))
    .sort();
}

function buildOutput(name, src) {
  const checksum = computePrismaChecksum(src);
  const ddl = applyIdempotencyTransforms(src);
  const parts = [ddl.trimEnd()];
  if (isFirstMigration(name)) parts.push(PRISMA_MIGRATIONS_TABLE_DDL);
  parts.push(buildInsertBlock(name, checksum));
  return { output: parts.join('\n'), checksum };
}

async function cmdGenerate(name, dryRun) {
  const src = path.join(MIGRATIONS_DIR, name, 'migration.sql');
  if (!fs.existsSync(src)) {
    console.error(`❌ Not found: ${src}`);
    process.exit(1);
  }
  const { output, checksum } = buildOutput(name, fs.readFileSync(src, 'utf8'));
  const todos = (output.match(/-- TODO: verify idempotency/g) || []).length;
  if (dryRun) {
    console.log(`── DRY RUN: ${name}\n── Checksum: ${checksum}${todos ? `\n── ⚠️  ${todos} TODO(s)` : ''}\n`);
    console.log(output);
    return;
  }
  const out = path.join(MANUAL_DIR, name, 'migration.sql');
  if (fs.existsSync(out)) {
    const a = await ask(`⚠️  Already exists: ${path.relative(REPO_ROOT, out)}\n   Overwrite? (y/n): `);
    if (a !== 'y' && a !== 'yes') {
      console.log('Skipped.');
      return;
    }
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, output, 'utf8');
  console.log(`✅  ${path.relative(REPO_ROOT, out)}\n    Checksum: ${checksum}`);
  if (todos) console.log(`\n⚠️  ${todos} TODO(s) need review before deploying.`);
}

async function cmdCheckAll() {
  const migrations = listMigrations();
  let fail = 0;
  console.log(`Checking ${migrations.length} migration(s)...\n`);
  for (const name of migrations) {
    const manual = path.join(MANUAL_DIR, name, 'migration.sql');
    if (!fs.existsSync(manual)) {
      console.log(`❌ MISSING  ${name}`);
      fail++;
      continue;
    }
    const expected = computePrismaChecksum(fs.readFileSync(path.join(MIGRATIONS_DIR, name, 'migration.sql'), 'utf8'));
    if (!fs.readFileSync(manual, 'utf8').includes(expected)) {
      console.log(`⚠️ CHECKSUM ${name}`);
      fail++;
      continue;
    }
    console.log(`✅ OK       ${name}`);
  }
  if (fail) {
    console.error(`\n${fail} issue(s). Run generator to fix.`);
    process.exit(1);
  }
  console.log(`\nAll ${migrations.length} migration(s) in sync.`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--check-all')) return cmdCheckAll();
  const name = args.find((a) => !a.startsWith('--'));
  if (!name) {
    console.error('Usage: node <script> <migration-name> [--dry-run]\n       node <script> --check-all');
    process.exit(1);
  }
  await cmdGenerate(name, args.includes('--dry-run'));
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
```
