# Screen Patterns

Use this file for page-level and screen-level layout exploration.

## Preferred Defaults

Start here unless the brief suggests otherwise:

- dashboard or back-office app: sidebar + content
- browsing/discovery: top nav + filter bar + card or list area
- data-heavy admin work: toolbar + table + detail panel
- guided tasks: single-column form or wizard
- phone-first product: stacked mobile layout

## Dashboard Shell

### When to use

- Multiple destinations
- Frequent switching between sections
- Persistent tools or filters

### Why it works

- Stable navigation
- Strong scan path from nav to summary to detail
- Easy to expand with modules

### Tradeoffs

- Can feel dense fast
- Sidebar may waste space on narrow screens

### ASCII example

```text
+----------------------------------------------------------------------------------+
| Product Ops                              [Date v] [Team v]              [Export] |
+------------------+---------------------------------------------------------------+
| > Overview       | [Metric]   [Metric]   [Metric]   [Metric]                     |
|   Queue          |                                                               |
|   Reports        | +-------------------------+  +------------------------------+ |
|   Settings       | | Activity                |  | Alerts                       | |
|                  | | - Item                  |  | - Issue                      | |
|                  | | - Item                  |  | - Issue                      | |
|                  | +-------------------------+  +------------------------------+ |
|                  | +-----------------------------------------------------------+ |
|                  | | Recent changes                                            | |
|                  | +-----------------------------------------------------------+ |
+------------------+---------------------------------------------------------------+
```

### Common refinements

- collapse sidebar
- convert summary cards into a single trend strip
- add right-side detail drawer

### State considerations

- loading metrics
- empty dashboard for new teams
- alert failure banner

## Sidebar + List + Detail

### When to use

- Queue processing
- Inbox or ticketing tools
- Master-detail workflows

### Why it works

- Good for repeated comparison
- Keeps list context visible while working details

### Tradeoffs

- Tight on smaller screens
- Can over-emphasize list density over task focus

### ASCII example

```text
+--------------------------------------------------------------------------------------------------+
| Queue Review                                                                    [Assign] [Close] |
+----------------+--------------------------------+-----------------------------------------------+
| > All          | [Search____]  [Status v]       | Item 1842                                      |
|   Mine         | +----------------------------+ | --------------------------------------------- |
|   Escalated    | | High priority issue        | | Summary                                       |
|                | | Customer blocked           | |                                               |
|                | +----------------------------+ | Details                                       |
|                | | Billing mismatch           | |                                               |
|                | +----------------------------+ | Notes                                         |
|                | | Import timeout             | |                                               |
|                | +----------------------------+ | [Reply] (Snooze)                              |
+----------------+--------------------------------+-----------------------------------------------+
```

### Common refinements

- make detail panel dominant
- move filters above list
- convert left nav into tabs for smaller scope

### State considerations

- empty queue
- selected item not found
- partial loading in list vs detail

## Top Nav + Filter Bar + Card Grid

### When to use

- Discovery and browsing
- Catalogs, content, marketplaces
- Users compare items before drilling in

### Why it works

- Familiar browse pattern
- Flexible for search, facets, sort, and pagination

### Tradeoffs

- Cards can hide important comparison data
- Filters may sprawl if the brief is complex

### ASCII example

```text
+------------------------------------------------------------------------------------------------+
| Brand        Browse   Collections   Pricing                             [Search____]   [User] |
+------------------------------------------------------------------------------------------------+
| [Category v] [Price v] [Status v] [Sort v]                                             [Reset] |
+------------------------------------------------------------------------------------------------+
| +----------------------+  +----------------------+  +----------------------+                  |
| | Item title           |  | Item title           |  | Item title           |                  |
| | Short description    |  | Short description    |  | Short description    |                  |
| | Meta meta            |  | Meta meta            |  | Meta meta            |                  |
| | [View]               |  | [View]               |  | [View]               |                  |
| +----------------------+  +----------------------+  +----------------------+                  |
+------------------------------------------------------------------------------------------------+
```

### Common refinements

- switch cards to list rows for denser comparison
- pin selected filters
- add saved-view chip bar

### State considerations

- no results
- loading cards with placeholder blocks
- filter error or stale results banner

## Form Page

### When to use

- Create or edit workflows
- Settings pages
- Focused data entry tasks

### Why it works

- Clear vertical rhythm
- Easy to chunk into sections

### Tradeoffs

- Long forms can become exhausting
- Weak for side-by-side comparison tasks

### ASCII example

```text
+----------------------------------------------------------------------------------+
| Create Project                                                                    |
+----------------------------------------------------------------------------------+
| Project name                                                                      |
| [____________________________________________]                                   |
|                                                                                  |
| Owner                                                                             |
| [Select owner_______________________________v]                                    |
|                                                                                  |
| Visibility                                                                        |
| (*) Private    ( ) Shared    ( ) Public                                           |
|                                                                                  |
| Notes                                                                             |
| [______________________________________________________________]                 |
| [______________________________________________________________]                 |
|                                                                                  |
| [Create project]  (Cancel)                                                        |
+----------------------------------------------------------------------------------+
```

### Common refinements

- split into sections
- convert to stepper when inputs have dependencies
- add sticky action bar for long forms

### State considerations

- validation errors
- save success state
- unsaved-changes prompt

## Table + Toolbar + Detail Drawer

### When to use

- Structured data review
- Admin, operations, analytics
- Bulk actions and repeated inspection

### Why it works

- High information density
- Strong for scanning, sorting, filtering, and batch work

### Tradeoffs

- Tables are hostile on narrow screens
- Easy to overload with controls

### ASCII example

```text
+------------------------------------------------------------------------------------------------+
| Users                                                      [Search____] [Role v] [Add user]   |
+------------------------------------------------------------------------------------------------+
| [ ] Name            Email              Role        Status      Last seen          Actions       |
| [ ] Ada Lovelace    ada@site.test      Admin       Active      2m ago             [View]        |
| [ ] Grace Hopper    grace@site.test    Editor      Invited     1d ago             [View]        |
| [ ] Linus Torvalds  linus@site.test    Viewer      Disabled    5d ago             [View]        |
+------------------------------------------------------------------------------------------------+
| Drawer: Selected user details                                                             [x]   |
+------------------------------------------------------------------------------------------------+
```

### Common refinements

- freeze key columns
- add segmented tabs above table
- move detail drawer into full detail page

### State considerations

- empty table
- partial row loading
- bulk action success and failure states

## Mobile Stacked Layout

### When to use

- Phone-first products
- Simplified versions of larger desktop screens
- Important content needs single-column focus

### Why it works

- Strong task focus
- Predictable reading order

### Tradeoffs

- Deep vertical scrolling
- Harder to keep multiple contexts visible at once

### ASCII example

```text
+--------------------------------------+
| Menu                Orders      [+]  |
+--------------------------------------+
| [Search____]                         |
| [Status v] [Date v]                  |
+--------------------------------------+
| Order #1842                          |
| Waiting for review                   |
| [Open]                               |
+--------------------------------------+
| Order #1841                          |
| Customer replied                     |
| [Open]                               |
+--------------------------------------+
```

### Common refinements

- compress filters into one sheet
- replace cards with compact list rows
- move secondary actions into detail view

### State considerations

- offline banner
- pull-to-refresh loading
- full-screen error and retry
