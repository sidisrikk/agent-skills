# Pattern Catalog

This file holds practical UI exploration defaults, comparison rules, and a broad catalog of common UI directions.

## How to Compare Options

Use these dimensions when recommending one option:

- task clarity
- information hierarchy
- interaction cost
- density and readability
- responsiveness risk
- state complexity

## Preferred Defaults

Reach for these first unless the brief suggests a different shape:

- dashboard: sidebar + content + summary strip
- data work: toolbar + table + detail drawer
- discovery: top nav + filters + grid or list
- focused data entry: single-column form
- long guided task: wizard or stepper
- mobile-first: stacked single-column view

## Option-Making Rules

When exploring, make options materially different. Good variation axes:

- navigation model: sidebar vs top nav vs tabbed
- density: cards vs rows vs table
- focus model: overview-first vs detail-first
- action model: inline actions vs detail page vs modal
- workflow shape: one page vs stepped flow

Avoid fake-different options like tiny spacing changes presented as distinct ideas.

## Responsive Transformations

Common transformations from desktop to smaller screens:

- sidebar -> top tabs, menu, or drawer
- multi-column detail -> stacked sections
- wide table -> priority columns + row drill-in
- filter bar -> compact chips + filter sheet
- persistent detail panel -> separate detail screen
- dense metrics row -> one key metric + collapsible secondary stats

## Screen Pattern Families

Use these families for page-level exploration:

- top nav + hero/content
- sidebar + content
- sidebar + list + detail
- toolbar + table
- top nav + filters + card grid
- single-column form
- wizard or stepper
- dashboard summary + modules
- content page with secondary rail
- mobile stacked list/detail

See `screens.md` for detailed entries.

## Component Pattern Families

Useful building blocks:

- filter toolbar
- card
- list row
- form section
- tab set
- modal
- drawer
- stat strip
- empty state panel
- comparison tray
- alert banner

See `components.md` for detailed entries.

## Flow Pattern Families

Common journey shapes:

- onboarding
- checkout
- create -> review -> publish
- queue -> review -> approve
- search -> compare -> detail
- settings -> save -> confirm

See `flows.md` for detailed entries.

## State Pattern Families

Common state views:

- empty first-run
- empty filtered
- loading skeleton
- panel-level error
- page-level error
- success banner
- success completion screen
- validation errors
- in-progress action lock
- offline or stale data warning

See `states.md` for detailed entries.

## Practical Upper Bound

Be broad within practical UI exploration work, but stop before turning this into a universal design encyclopedia.

Good scope:

- product screens
- admin tools
- dashboards
- mobile app surfaces
- commerce flows
- settings and CRUD tools

Out of scope:

- implementation specs
- pixel-perfect visual styling systems
- production-ready code structure

## Quick Routing Guide

- Need page shape? Start with `screens.md`.
- Need a focused widget? Start with `components.md`.
- Need multiple steps? Start with `flows.md`.
- Need failure or empty handling? Start with `states.md`.
- Need default tradeoffs or responsive moves? Stay here.
