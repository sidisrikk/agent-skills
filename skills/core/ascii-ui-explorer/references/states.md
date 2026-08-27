# State Patterns

State coverage is required when async data, user actions, or branching outcomes matter.

## State Checklist

Check whether the sketch needs:

- empty
- loading
- error
- success
- disabled or in-progress action
- offline or stale-data warning

## Empty State

### When to use

- No data yet
- Filters return nothing
- Feature has not been configured

### Why it works

- Explains why the surface is empty
- Gives the user a next step

### Tradeoffs

- Generic empty states waste space and teach nothing

### ASCII example

```text
+--------------------------------------------------------------+
| No reports yet                                               |
| Create your first report or load a saved template.           |
| [Create report]  (Browse templates)                          |
+--------------------------------------------------------------+
```

### Common refinements

- distinguish first-run empty from filtered empty
- add a small preview of expected content

### State considerations

- filtered empty should include reset controls

## Loading State

### When to use

- Data fetch in progress
- Mutations block dependent views

### Why it works

- Sets expectation while preserving layout structure

### Tradeoffs

- Overly flashy loading distracts from the real task

### ASCII example

```text
+--------------------------------------------------------------+
| Dashboard                                                    |
+--------------------------------------------------------------+
| [Loading metric]  [Loading metric]  [Loading metric]         |
|                                                              |
| +------------------+  +------------------+                   |
| | Loading block    |  | Loading block    |                   |
| +------------------+  +------------------+                   |
+--------------------------------------------------------------+
```

### Common refinements

- preserve final layout shape
- show partial loading if some sections are already ready

### State considerations

- disable dependent actions until data arrives

## Error State

### When to use

- Fetch or save failed
- Permission or connectivity issue

### Why it works

- Gives the user recovery language and action

### Tradeoffs

- Full-screen errors can be too aggressive for recoverable partial failures

### ASCII example

```text
+--------------------------------------------------------------+
| Could not load results                                       |
| Check your connection or try again.                          |
| [Retry]  (Back)                                              |
+--------------------------------------------------------------+
```

### Common refinements

- localize the error to one panel
- add support path for repeated failures

### State considerations

- preserve user input after failed submit

## Success State

### When to use

- Save, submit, approval, or completion succeeded

### Why it works

- Confirms outcome and points to the next useful action

### Tradeoffs

- Overlong success pages can interrupt fast repeat work

### ASCII example

```text
+--------------------------------------------------------------+
| Project created                                              |
| Your workspace is ready.                                     |
| [Open project]  (Create another)                             |
+--------------------------------------------------------------+
```

### Common refinements

- use banner instead of full page for lightweight saves
- add summary of what changed

### State considerations

- success after optimistic update vs confirmed server save

## Form Validation State

### When to use

- User submits incomplete or invalid inputs

### Why it works

- Keeps recovery close to the fields that need attention

### Tradeoffs

- Top-only error summaries can hide the real issue

### ASCII example

```text
Email
[user@______________]
! Enter a valid email address.

[Submit]  (Cancel)
```

### Common refinements

- pair inline errors with summary for long forms
- keep submit visible while showing errors

### State considerations

- server-side validation after client passes

## In-Progress Action State

### When to use

- Submit, publish, delete, import, sync, approve

### Why it works

- Prevents duplicate actions
- Makes system status visible

### Tradeoffs

- Locked UI feels broken if progress is not obvious

### ASCII example

```text
[Saving...]  (Cancel disabled)
```

### Common refinements

- keep non-dependent areas interactive
- show progress steps for long operations

### State considerations

- retry path after failure

## Stale or Offline State

### When to use

- Data may be outdated
- Connectivity is intermittent

### Why it works

- Builds trust by surfacing limits

### Tradeoffs

- Warning noise if shown constantly

### ASCII example

```text
+--------------------------------------------------------------+
| You are offline. Changes will sync when connection returns.  |
+--------------------------------------------------------------+
```

### Common refinements

- add last synced timestamp
- queue actions locally if the product supports it

### State considerations

- conflict resolution after reconnect
