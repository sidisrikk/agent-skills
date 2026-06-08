# Component Patterns

Use this file when the user needs a focused sketch for a part of a screen.

## Filter Toolbar

### When to use

- Search + filter + sort controls above lists or tables

### Why it works

- Centralizes high-frequency controls
- Keeps result-changing actions visible

### Tradeoffs

- Easy to overcrowd

### ASCII example

```text
+----------------------------------------------------------------------------------+
| [Search____] [Status v] [Owner v] [Date v]                 [Reset] [Save view]   |
+----------------------------------------------------------------------------------+
```

### Common refinements

- collapse low-priority filters
- split primary vs advanced filters

### State considerations

- disabled controls during refresh
- saved-view confirmation

## Form Section

### When to use

- Profile, settings, checkout, create/edit forms

### Why it works

- Groups related fields cleanly
- Easy to repeat across larger forms

### Tradeoffs

- Too many fields in one block hurts scan speed

### ASCII example

```text
+--------------------------------------------------------------+
| Billing details                                              |
+--------------------------------------------------------------+
| Full name                                                    |
| [____________________________________]                       |
|                                                              |
| Address                                                      |
| [____________________________________]                       |
| [____________________________________]                       |
|                                                              |
| [Save section]  (Cancel)                                     |
+--------------------------------------------------------------+
```

### Common refinements

- split into two columns on desktop
- add inline helper text

### State considerations

- field validation
- save success message

## Card

### When to use

- Browseable collections
- Summary snapshots
- Lightweight detail previews

### Why it works

- Simple visual chunking
- Easy to repeat in grids or lists

### Tradeoffs

- Can hide comparability across items

### ASCII example

```text
+------------------------------+
| Project Atlas                |
| Active plan                  |
| 12 open items                |
| Updated 2h ago               |
| [Open]                       |
+------------------------------+
```

### Common refinements

- add status strip
- add secondary metadata row

### State considerations

- loading placeholder card
- archived state badge

## List Item

### When to use

- Feeds, queues, inboxes, search results

### Why it works

- Dense and scan-friendly
- Better than cards for repetitive comparison

### Tradeoffs

- Lower emotional emphasis than cards

### ASCII example

```text
+--------------------------------------------------------------------------+
| High priority issue                       Waiting on user        [Open]   |
| Customer cannot complete checkout         Updated 8m ago                   |
+--------------------------------------------------------------------------+
```

### Common refinements

- add left status marker
- add compact action row

### State considerations

- unread/new marker
- optimistic update after action

## Tabs

### When to use

- A few peer sections share one container

### Why it works

- Fast switching without route changes

### Tradeoffs

- Breaks down when there are too many sections

### ASCII example

```text
[Overview]  Activity  Settings  Permissions
+--------------------------------------------------------------------------+
| Tab content                                                              |
+--------------------------------------------------------------------------+
```

### Common refinements

- turn into segmented control for tiny scope
- move overflow into dropdown

### State considerations

- preserve loading per tab
- remember last active tab

## Modal

### When to use

- Confirmations
- Short focused tasks
- Context-preserving edits

### Why it works

- Keeps the user anchored to the parent screen

### Tradeoffs

- Poor for long workflows
- Easy to stack too much content

### ASCII example

```text
+--------------------------------------------------+
| Confirm deletion                              [x] |
+--------------------------------------------------+
| This cannot be undone.                           |
|                                                  |
| [Delete]  (Cancel)                               |
+--------------------------------------------------+
```

### Common refinements

- convert to drawer for richer forms
- add warning callout

### State considerations

- destructive confirmation
- in-progress submit lock

## Stats Strip

### When to use

- Dashboards
- Summary rows above detailed content

### Why it works

- Quick orientation before deeper analysis

### Tradeoffs

- Becomes noise if metrics do not drive action

### ASCII example

```text
+----------------------------------------------------------------------------------+
| [Open: 12]   [Blocked: 3]   [Due today: 7]   [Avg response: 2h]                  |
+----------------------------------------------------------------------------------+
```

### Common refinements

- add delta text
- collapse to one highlighted metric

### State considerations

- loading values
- stale data warning

## Empty State Panel

### When to use

- A list, dashboard, or section has no useful data yet

### Why it works

- Turns dead space into guidance

### Tradeoffs

- Weak if it lacks a next action

### ASCII example

```text
+--------------------------------------------------------------+
| No saved views yet                                           |
| Create a saved view to reuse filters and sort order.         |
| [Create view]                                                |
+--------------------------------------------------------------+
```

### Common refinements

- add example content preview
- add secondary learn-more link

### State considerations

- first-run empty vs filtered empty are different messages
