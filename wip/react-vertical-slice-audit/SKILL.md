---
name: react-vertical-slice-audit
description: Audits React frontend for vertical-slice architecture compliance. Finds pages with embedded domain logic (should be thin wrappers), components importing api/ directly (should go through hooks), shared/ files importing from features/ (forbidden direction), and cross-feature imports (should lift to shared/ or an entity layer). Fixes by moving logic to the correct slice layer and updating imports. Use when reviewing React code structure, auditing a PR for architecture compliance, checking feature/page/shared boundaries, or enforcing no-domain-logic-in-pages and no-direct-api-calls-in-components rules.
---

# react-vertical-slice-audit

## Project config

| Variable        | This project            |
| --------------- | ----------------------- |
| `FEATURES_ROOT` | `apps/web/src/features` |
| `SHARED_ROOT`   | `apps/web/src/shared`   |
| `PAGE_ROOT`     | `apps/web/src/pages`    |
| `CONTRACTS_PKG` | `libs/contracts`        |
| `TYPECHECK_CMD` | `nx typecheck web`      |

```bash
FEATURES_ROOT="apps/web/src/features"
SHARED_ROOT="apps/web/src/shared"
PAGE_ROOT="apps/web/src/pages"
```

> Architecture rules and fix patterns: [REFERENCE.md](REFERENCE.md)

## Quick audit

```bash
# 1. Pages with domain logic (state, event handlers — should be thin wrappers)
grep -rln "useState\|useReducer\|useCallback\|useMemo\|const handle" $PAGE_ROOT --include="*.tsx"

# 2. Components importing api/ at runtime (not type-only)
grep -rn "from '.*\/api\/" $FEATURES_ROOT $PAGE_ROOT --include="*.tsx" | grep -v "import type"

# 3. Shared importing from features/ (forbidden direction)
grep -rn "from '.*features\/" $SHARED_ROOT --include="*.ts" --include="*.tsx"

# 4. Cross-feature imports (features importing each other)
grep -rn "from '\.\.\/\.\.\/" $FEATURES_ROOT --include="*.ts" --include="*.tsx" \
  | grep -v "shared\/" | grep "features/"

# 5. Domain components placed in shared/ (feature-specific names in shared/components/)
grep -rln "Modal\|Form\|Manager\|Card\|Panel\|Detail\|Row\|Queue\|Viewer" \
  $SHARED_ROOT/components --include="*.tsx" 2>/dev/null
```

## Audit checklist

**Pages layer** — orchestration only

- [ ] Pages are thin wrappers: no `useState` / `useReducer` / `useMemo` for domain state
- [ ] No event handlers defined inline in pages (e.g. `const handleSubmit = ...`)
- [ ] Pages import from `features/<feature>/` — not directly from `features/<feature>/api/`
- [ ] Max ~30–50 lines per page file (>100 lines is a red flag)

**Features layer** — smart business slices

- [ ] Components use hooks for server state — no runtime `import ... from '../api/'` in `.tsx`
- [ ] `import type` from `api/` is acceptable (type-only is safe)
- [ ] No cross-feature imports: `features/orders/` must not import from `features/products/`
- [ ] If two features share a type or util, it lives in `shared/` or `$CONTRACTS_PKG`

**Shared layer** — generic, zero domain knowledge

- [ ] `shared/` never imports from `features/` or `pages/` — any direction
- [ ] `shared/components/` contains only reusable primitives (Buttons, DataTable, StatusChip)
- [ ] Domain-specific modals/forms live in `features/<feature>/components/`, not `shared/`
- [ ] `shared/hooks/` contains only cross-feature utilities (useDebounce, useLocalStorage)

## Verification

```bash
$TYPECHECK_CMD
```
