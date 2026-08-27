# Flow Patterns

Use this file when one screen is not enough to explain the design.

## Flow Rules

- Keep each step purpose-specific
- Show only the fields or actions needed to explain progression
- Mark the primary next action clearly
- Include failure or branch paths when they matter

## Onboarding Flow

### When to use

- New-user setup
- Guided activation

### Why it works

- Reduces first-run overwhelm
- Lets the user commit gradually

### Tradeoffs

- More steps can increase drop-off

### ASCII example

```text
1. Welcome -> 2. Basic info -> 3. Preferences -> 4. Done

+--------------------------+  +--------------------------+
| Welcome                  |  | Basic info               |
| Short value statement    |  | [Name________________]   |
| [Get started]            |  | [Role________________]   |
+--------------------------+  | [Continue]               |
                              +--------------------------+

+--------------------------+  +--------------------------+
| Preferences              |  | Done                     |
| [x] Updates              |  | You are ready to go.     |
| [ ] Weekly digest        |  | [Go to dashboard]        |
| [Finish]                 |  +--------------------------+
+--------------------------+
```

### Common refinements

- compress into fewer steps
- add progress reassurance

### State considerations

- skip path
- resume later state

## Checkout or Purchase Flow

### When to use

- Multi-step transaction
- User must review before committing

### Why it works

- Matches mental model of review before payment or submit

### Tradeoffs

- Friction if steps are too fragmented

### ASCII example

```text
Cart -> Shipping -> Payment -> Review -> Success

[Cart] -> [Address form] -> [Payment form] -> [Order summary] -> [Receipt]
```

### Common refinements

- move summary into sticky sidebar
- merge shipping and payment for short flows

### State considerations

- payment failure retry
- inventory changed mid-flow

## CRUD Management Flow

### When to use

- Create, inspect, edit, archive, or delete records

### Why it works

- Stable and teachable pattern for back-office tools

### Tradeoffs

- Can become modal-heavy if every action interrupts the list

### ASCII example

```text
Browse list -> Open detail -> Edit form -> Review changes -> Saved

[Table] -> [Detail page] -> [Editable fields] -> [Confirm summary] -> [Success banner]
```

### Common refinements

- keep edit inline for small changes
- separate create vs edit workflows

### State considerations

- optimistic save
- conflict resolution after stale edit

## Review and Approval Flow

### When to use

- Content moderation
- Operations approval
- Legal or compliance reviews

### Why it works

- Makes status progression explicit
- Clarifies who decides and when

### Tradeoffs

- Too many status values can confuse users

### ASCII example

```text
Queue -> Review -> Request changes or Approve -> Done

[Open queue] -> [Compare details] -> [Approve] / [Request changes] -> [Confirmation]
```

### Common refinements

- add side-by-side diff view
- add comment thread in review step

### State considerations

- locked-by-another-reviewer state
- approval failure or permission error

## Search and Compare Flow

### When to use

- Research tools
- Catalog selection
- Candidate or product comparison

### Why it works

- Supports narrowing and side-by-side evaluation

### Tradeoffs

- Comparison can become cluttered fast

### ASCII example

```text
Search -> Filter -> Browse results -> Compare selected -> Open detail

[Query] -> [Facet bar] -> [List or cards] -> [Comparison tray] -> [Detail page]
```

### Common refinements

- use list rows instead of cards for denser comparison
- add saved comparison set

### State considerations

- no results
- too many selected items to compare

## Settings and Save Flow

### When to use

- Preference editing
- Configuration tools

### Why it works

- Encourages clear chunking and stable save behavior

### Tradeoffs

- Unclear save model creates trust issues

### ASCII example

```text
Open settings -> Change section -> Save -> Success or validation error

[Settings nav] -> [Section form] -> [Save changes] -> [Banner]
```

### Common refinements

- auto-save low-risk fields
- sticky save bar for long sections

### State considerations

- unsaved changes warning
- partial save failure
