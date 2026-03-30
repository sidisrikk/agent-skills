---
name: git-weekly-report
description: Use when the user wants a git-sourced team update, sprint review, or commit recap for a meeting. Supports filtering by author, date range, and audience (dev / manager / stakeholder). Triggered by mentions of weekly update, team summary, standup notes, review period, or commit digest.
---

# Git Weekly Report

## Overview

Generate a detailed weekly team update from git commit history, **always grouped by theme**. Contributors are noted per item, not as top-level sections. Output is a markdown file saved to `docs/weekly-review/`.

## Parameters

| Parameter  | Flag         | Default                                   | Example                              |
| ---------- | ------------ | ----------------------------------------- | ------------------------------------ |
| Authors    | `--author`   | Current git user (`git config user.name`) | `--author "agent1,john,somsak"`      |
| Start date | `--since`    | 7 days ago (ISO date)                     | `--since 2026-03-17`                 |
| End date   | `--until`    | Tomorrow (ISO date, to include today)     | `--until 2026-03-27`                 |
| Output dir | `--out`      | `docs/weekly-review/`                     | `--out reports/`                     |
| Audience   | `--audience` | `dev`                                     | `--audience manager`                 |

### Audience Modes

| Mode          | Tone              | Differences from `dev` default                                         |
| ------------- | ----------------- | ---------------------------------------------------------------------- |
| `dev`         | Technical         | Default. Full output — scopes, file paths, impact sizes, stats.        |
| `manager`     | Business          | Drop file paths and scope tags. Lead with user-facing impact.          |
|               |                   | Use plain language ("we shipped X" not "refactored Y module").         |
|               |                   | Keep stats table. Remove "What's Next" unless significant work pending.|
| `stakeholder` | Executive         | Replace full report with a 3-bullet "Shipped / In Progress / Risks"    |
|               |                   | summary. No stats table, no file paths, no commit details.             |

**Invocation examples:**

```
/weekly-review
/weekly-review --author "author1,author2" --since 2026-03-17 --until 2026-03-27
/weekly-review --author "all" --since 2026-03-17
/weekly-review --audience manager
```

`--author "all"` includes every committer in the period.

## Process

### Step 1: Gather git data

Run these commands to collect raw data:

```bash
# Get all commits in range, grouped by author
git log --since="<START_DATE>" --until="<END_DATE>" --all \
  --author="<AUTHOR1>\|<AUTHOR2>" \
  --pretty=format:"%h %ad %an: %s" --date=short

# Get file-level diff stats per author for impact sizing
git log --since="<START_DATE>" --until="<END_DATE>" --all \
  --author="<AUTHOR1>\|<AUTHOR2>" \
  --pretty=format:"" --shortstat

```

**Scope extraction:** For each commit, parse the conventional commit scope from the subject:
- Pattern: `<type>(<scope>): <description>` → extract `<scope>`
- Common scopes in this repo: `web`, `backend`, `db`
- If no scope is present, leave untagged

**Impact aggregation:** For each logical item (group of related commits), sum the
`insertions` and `deletions` from `--shortstat` output to compute total lines changed
and files touched. This feeds the impact indicator in the report.

- `<START_DATE>` = `--since` value (default: today minus 7 days, ISO format `YYYY-MM-DD`)
- `<END_DATE>` = `--until` value (default: tomorrow in ISO format, to include today's commits)
- For `--author "all"`, omit the `--author` flag

### Step 2: Analyze and categorize

Group commits into **themes** by reading commit prefixes and messages:

| Prefix           | Theme                     |
| ---------------- | ------------------------- |
| `feat`           | New Features              |
| `fix`            | Bug Fixes                 |
| `refactor`       | Refactoring               |
| `chore`, `build` | Infrastructure / Chores   |
| `docs`           | Documentation             |
| `test`           | Testing                   |
| Merge commits    | note under relevant theme |

For each theme, write a **subsection** that:

1. States WHAT was done (summarize related commits into coherent items, don't list each commit)
2. States WHY it matters (infer from commit messages and code context)
3. Lists key files/modules affected
4. Prefixes each bullet with the affected scope tag(s) in brackets: `[web]`, `[backend]`, `[db]`
   - If a single item spans multiple scopes, list all: `[web][backend]`
   - Omit the tag if commits have no conventional scope

### Step 3a: Apply audience translation

After grouping commits into themes, rewrite the bullet text to match `--audience`:

**`dev` (default):** No changes. Use technical language, include file paths, scope tags, impact sizes.

**`manager`:**
- Remove scope tags (`[web]`, `[backend]`) from bullet prefixes
- Remove `Affected: <path>` lines
- Rewrite bullet text to lead with the user-visible outcome:
  - Instead of: "`[web]` **Zodresolver on login form** — added zodResolver to Login form with local Zod schema"
  - Write: "**Login form validation** — users now see inline error messages as they type"
- Keep contributor names and impact sizes

**`stakeholder`:**
- Collapse the entire themed report into three bullets:
  1. **Shipped:** what was completed and is live/merged
  2. **In Progress:** what is actively being worked on (infer from recent commit patterns)
  3. **Risks / Blockers:** anything that looks stuck, broken, or delayed
- No stats table, no file paths, no per-item authors
- Tone: one sentence per bullet, plain business English

### Step 3: Generate report

> **Audience note:** For `stakeholder` mode, skip the themed sections entirely and output
> only the 3-bullet summary (Shipped / In Progress / Risks). For `manager` mode, use the
> full template below but apply the rewrites from Step 3a.

**File naming:** `<START_DATE>-to-<END_DATE>.md`

**Always group by theme.** Contributors are noted in parentheses per item.

```markdown
# Weekly Update — <START_DATE> to <END_DATE>

**Project:** <repo name>
**Branch:** `<current branch>`
**Contributors:** <list>

---

## Summary

<2-3 sentence high-level summary of the week's focus areas>

---

## New Features

- `[scope]` **<Item title>** — <what and why, 1-2 sentences> (<author>) · _~N lines, M files_
  - Affected: `<module/path>`

## Refactoring

- `[scope]` **<Item title>** — <what and why> (<author>) · _~N lines, M files_
  - Affected: `<module/path>`

## Bug Fixes

- ...

## Infrastructure / Chores

- ...

## Documentation

- ...

## Testing

- ...

---

## Stats

| Contributor | Commits | Files Changed |
| ----------- | ------- | ------------- |
| ...         | ...     | ...           |

---

## What's Next

<Infer from recent commit direction — what seems in-progress or upcoming>
```

Only include theme sections that have commits. Each bullet includes the author name in parentheses.

### Step 4: Save and confirm

1. Create output directory if needed (`mkdir -p`)
2. Write file to `<output_dir>/<START_DATE>-to-<END_DATE>.md`
3. Print file path and brief summary to user

## Common Mistakes

- **Listing every commit verbatim** — Group related commits into coherent items. A refactor across 12 commits is ONE bullet point.
- **Missing the "why"** — Don't just say "refactored auth module". Say "refactored auth module to separate business logic from infrastructure concerns".
- **Ignoring merge commits** — They reveal branch work. Note the merged branch name as context.
- **Wrong date math** — `--since` is inclusive, `--until` is exclusive. Add 1 day to end date.
- **Skipping the impact indicator** — Always include `~N lines, M files` per bullet.
  If shortstat produced no output for a set of commits, write `~0 lines` rather than omitting it.
- **Wrong tone for audience** — `manager` output must not contain file paths or scope tags.
  `stakeholder` output must not exceed 3 bullets. When in doubt, be more concise.
