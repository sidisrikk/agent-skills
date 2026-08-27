# react-vertical-slice-audit — Reference

## Architecture layers

```
src/
├── app/        Global init: providers, router, global styles
├── shared/     "Dumb" building blocks — zero domain knowledge
│   ├── api/        Base HTTP client only
│   ├── components/ ui/ form/ layout/ data-display/
│   ├── hooks/      Cross-feature utilities only
│   └── utils/      Pure formatters, validators
├── features/   "Smart" business slices — domain logic lives here
│   └── <feature>/
│       ├── api/        HTTP calls for this domain
│       ├── components/ Domain UI (modals, cards, forms)
│       └── hooks/      useQuery / useMutation wrappers
└── pages/      Thin routing wrappers — orchestration only
```

## Dependency rules

| From → To | Allowed? |
|-----------|----------|
| Feature → Shared | ✅ Always |
| Page → Feature | ✅ Always |
| Page → Shared | ✅ Always |
| Feature → Feature | ❌ Lift to Shared or Entity layer |
| Shared → Feature | ❌ Forbidden |
| Shared → Page | ❌ Forbidden |

## Fix patterns

### Violation 1 — Page with domain logic

**Before** (`pages/<section>/ItemList.tsx`, 200+ lines):
```tsx
export function ItemList() {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { mutate: deleteItem } = useDeleteItem()

  const handleDelete = async (id: string) => {  // ← domain logic in page
    await deleteItem(id)
    setDeleteOpen(false)
  }
  return <ItemCard onDelete={handleDelete} />
}
```

**After** — move logic into `features/<feature>/components/ItemCard.tsx`:
```tsx
// features/<feature>/components/ItemCard.tsx (owns its own action flow)
export function ItemCard({ itemId }: { itemId: string }) {
  const { mutate: deleteItem } = useDeleteItem()
  const handleDelete = () => deleteItem(itemId)
  return <Button onClick={handleDelete}>Delete</Button>
}

// pages/<section>/ItemList.tsx (~10 lines)
export function ItemList() {
  const { data: items } = useItems()
  return items?.map(i => <ItemCard key={i.id} itemId={i.id} />)
}
```

---

### Violation 2 — Component importing api/ directly

**Before** (`features/<feature>/components/ActionRow.tsx`):
```tsx
import { submitAction } from '../api/actions'  // ← bypasses hook

export function ActionRow({ id }: { id: string }) {
  const handleSubmit = () => submitAction(id)  // no loading/error state
  return <Button onClick={handleSubmit}>Submit</Button>
}
```

**After** — use the mutation hook:
```tsx
import { useSubmitAction } from '../hooks/useSubmitAction'

export function ActionRow({ id }: { id: string }) {
  const { mutate, isPending } = useSubmitAction()
  return <Button onClick={() => mutate(id)} loading={isPending}>Submit</Button>
}
```

> `import type { ActionItem } from '../api/actions'` is **always OK** — type-only imports don't bypass the hook layer.

---

### Violation 3 — Shared importing from features/

**Before** (`shared/components/ui/StatusBadge.tsx`):
```tsx
import { ITEM_STATUS_LABELS } from '../../features/orders/api/orders'  // ← forbidden
```

**Fix options (pick one):**
1. Move the constant to `shared/utils/constants.ts` or `$CONTRACTS_PKG`
2. Pass label as a prop (keep `shared/` purely presentational)
3. Move the component to `features/<feature>/components/` if it's domain-specific

---

### Violation 4 — Cross-feature import

**Before** (`features/cart/components/CartItem.tsx`):
```tsx
import { useCatalog } from '../../catalog/hooks/useCatalog'  // ← cross-feature
```

**Fix options:**
1. If the data is truly needed, lift the hook to `shared/hooks/`
2. If it's UI composition, lift the composed component to a page
3. Introduce an entity layer (`entities/<domain>/`) for shared domain primitives

---

### Violation 5 — Domain component in shared/

**Symptom**: `shared/components/ui/OrderConfirmModal.tsx` — name contains domain noun

**Fix**: Move to `features/<feature>/components/OrderConfirmModal.tsx` unless the component is 100% generic (no domain-specific props/logic). If it must stay in `shared/` (e.g. it's used by multiple features), document the intentional exception with an inline comment.

---

## Page size heuristic

| Lines | Signal |
|-------|--------|
| < 50  | Healthy thin wrapper |
| 50–100 | Review: likely some logic leaking in |
| > 100 | Red flag: extract domain logic to feature |
| > 200 | Definite violation: contains domain logic |

## Project exceptions template

Add project-specific exceptions here (intentional deviations from the rules):

```
# <FeatureName> exception
# Reason: <why this violates the rule and why it's acceptable>
# Used by: <which features/pages consume it>
```
