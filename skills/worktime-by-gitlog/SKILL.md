---
name: worktime-by-gitlog
description: Estimates time spent on a project by analyzing git commit timestamps and generates an HTML report with Chart.js visualizations (accumulated hours lines, daily stacked-bar breakdown, session histogram). Use when user asks to calculate, estimate, or visualize time spent on a project, mentions "git time tracking", "how many hours did I work", or wants a time report from git history. Supports multi-author tracking.
---

# Worktime by Gitlog

## Quick start

Replace `<REPO>` with the **absolute path to the target git repository** (i.e. the repo being analyzed, not this skill's directory).

```bash
# Basic: all commits grouped by author
git -C <REPO> log --format="%at|%aN" | npx ts-node --skip-project --compiler-options '{"module":"commonjs"}' <SKILL_DIR>/scripts/calculate_time.ts > <REPO>/time_report.html

# Filter by specific author
git -C <REPO> log --author="Name" --format="%at|%aN" | npx ts-node --skip-project --compiler-options '{"module":"commonjs"}' <SKILL_DIR>/scripts/calculate_time.ts > <REPO>/time_report.html

# Filter by date range
git -C <REPO> log --after="2025-01-01" --before="2025-06-01" --format="%at|%aN" | npx ts-node --skip-project --compiler-options '{"module":"commonjs"}' <SKILL_DIR>/scripts/calculate_time.ts > <REPO>/time_report.html
```

- `git -C <REPO>` ensures git always reads from the target repo regardless of the agent's working directory.
- `--skip-project --compiler-options '{"module":"commonjs"}'` prevents a project-level `tsconfig.json` from forcing ESM mode, which silently breaks stdin reading.
- Timezone is **fixed at UTC+7 (Thailand)**. No script edits needed.

Open `<REPO>/time_report.html` in a browser. The accumulated total hours are on the **right axis** of the top chart.

## Configuration (top of script)

| Constant | Default | Meaning |
|---|---|---|
| `SESSION_TIMEOUT_HOURS` | 1 | Gap > 1 hour = new session |
| `DEFAULT_COMMIT_MINUTES` | 20 | Time credited for first/isolated commit |
| `POST_LAST_COMMIT_BUFFER_MINUTES` | 10 | Buffer added after final commit |

**Timezone**: Fixed at **UTC+7 (Thailand)**. The script does not need to be edited for timezone.

## Workflow

1. Locate `scripts/calculate_time.ts` in this skill directory (`<SKILL_DIR>`)
2. Check if `ts-node` is available (`npx ts-node --version`); if not, it will be auto-installed via npx. Node.js must be present.
3. Confirm the **absolute path** of the target git repo (`<REPO>`)
4. Ask user: filter by author? date range? — build the `git -C <REPO> log` command accordingly
5. Run the command and write to `<REPO>/time_report.html`
6. Tell user: "Open `time_report.html` in your browser. The accumulated hours are shown on the right axis of the top chart."

## Output interpretation

- **Top chart (left axis)**: Daily work hours stacked by author — shows intensity per day and who contributed
- **Top chart (right axis)**: Running total of accumulated hours over the full period for each author
- **Bottom chart**: Histogram of session lengths — shows typical work patterns across all authors

## Common issues

- **No output / empty report**: `git log` returned nothing — check repo path, author spelling, or date range
- **Empty HTML (0 bytes, exit 0)**: Project has a `tsconfig.json` with `"module": "ESNext"` or similar — ts-node silently swallows stdin. Fix: add `--skip-project --compiler-options '{"module":"commonjs"}'` to the command (already included in Quick start above)
- **Hours seem too low**: Short work sessions with big gaps — lower `SESSION_TIMEOUT_HOURS` to 0.5
- **Hours seem too high**: Many rapid commits — lower `DEFAULT_COMMIT_MINUTES` to 5-10
