# Agent Skills

Welcome to the **Agent Skills** repository! This project contains a curated collection of specialized behaviors, workflows, and tools (skills) that enhance AI agent capabilities. These skills enforce best practices, improve token efficiency, and standardize outputs across various tasks.

## 🛠️ Available Skills

### Core (`skills/core/`)

Production-ready skills from other authors.

| Skill Name | Description |
| --- | --- |
| [**codebase-cleanup-deps-audit**](skills/core/codebase-cleanup-deps-audit/SKILL.md) | Audits project dependencies for known vulnerabilities, license compliance risks, and outdated packages. |
| [**context-engineering**](skills/core/context-engineering/SKILL.md) | Optimizes agent context setup: rules files, session starts, task switches, and recovery when output quality degrades. |
| [**naming-analyzer**](skills/core/naming-analyzer/SKILL.md) | Evaluates and suggests clearer names for variables, functions, and classes across codebases. |
| [**scrutinize**](skills/core/scrutinize/SKILL.md) | Reviews plans, designs, PRs, and diffs from an outsider perspective to challenge assumptions and scope. |

### Core Diy (`skills/core-diy/`)

Production-ready skills written for this repository.

| Skill Name | Description |
| --- | --- |
| [**adverse-review**](skills/core-diy/adverse-review/SKILL.md) | Conducts read-only adversarial code review through three independent lenses (Adversary, Auditor, Pragmatist). |
| [**ascii-ui-explorer**](skills/core-diy/ascii-ui-explorer/SKILL.md) | Generates ASCII wireframes for screens, components, user flows, and responsive UI states without writing code. |
| [**clean-comments**](skills/core-diy/clean-comments/SKILL.md) | Sweeps a path or repository for comment sediment (plan labels, dead code, stale names/paths) and cleans them after approval. |
| [**git-weekly-report**](skills/core-diy/git-weekly-report/SKILL.md) | Generates git-sourced team updates, sprint summaries, or commit digests filtered by author, date, and audience. |
| [**normalize-skill**](skills/core-diy/normalize-skill/SKILL.md) | Refactors existing skills into standardized tiers (SKILL.md ≤ 100 lines + REFERENCE.md) for cross-project reuse. |
| [**split-commits**](skills/core-diy/split-commits/SKILL.md) | Cuts working-tree changes or unpushed commits into clean commits by a single split rule with a rollback receipt. |
| [**worktime-by-gitlog**](skills/core-diy/worktime-by-gitlog/SKILL.md) | Estimates development time by analyzing git commit timestamps and generates an interactive HTML report with Chart.js. |

### Wip (`skills/wip/`)

Skills located in [`skills/wip/`](skills/wip/) are actively undergoing design iteration or testing.

| Skill Name | Description |
| --- | --- |
| [**docker-cve-fix**](skills/wip/docker-cve-fix/SKILL.md) | Scans Docker images with Trivy and resolves CVEs by separating base-image toolchains from OS packages. |
| [**library-first**](skills/wip/library-first/SKILL.md) | Evaluates repository, platform, and package dependencies before writing custom commodity code. |
| [**low-cognitive-guidelines**](skills/wip/low-cognitive-guidelines/SKILL.md) | Applies tiered coding principles (deep modules, strong typing, SRP, pure functions) to minimize AI cognitive load. |
| [**nestjs-zod-swagger-audit**](skills/wip/nestjs-zod-swagger-audit/SKILL.md) | Audits NestJS backend controllers and DTOs for `nestjs-zod` compliance and Swagger OpenAPI decorator coverage. |
| [**nx-fullstack-structure**](skills/wip/nx-fullstack-structure/SKILL.md) | Defines architectural boundaries for Nx monorepos containing React apps, NestJS backends, and shared Zod schemas. |
| [**orca-implement-review**](skills/wip/orca-implement-review/SKILL.md) | Coordinates an Orca implement → review → judge → fix → commit loop with external worker agents. |
| [**verification-gate-review**](skills/wip/verification-gate-review/SKILL.md) | Assesses verification effort, prioritizes checks, and schedules safe unattended agent tasks. |

## 📂 Repository Structure

```text
.
├── .claude-plugin/
│   └── marketplace.json       # Maps each skill folder to its installer group
└── skills/
    ├── core/                  # Production-ready skills cloned from others
    │   ├── scrutinize/
    │   └── ...
    ├── core-diy/              # Production-ready skills I wrote myself
    │   ├── adverse-review/
    │   └── ...
    └── wip/                   # Work-in-progress and experimental skills
        ├── docker-cve-fix/
        └── ...
```

A standard skill directory contains:
- `SKILL.md`: Core instructions, triggers, and rules for the agent (concise entry point).
- `REFERENCE.md` / `README.md`: Detailed guides, examples, and deep reference material (optional).
- `scripts/` / `references/` / `templates/`: Supporting execution scripts, prompt lenses, or templates (optional).

## 🚀 How to Install & Use

Install interactively with Vercel's [`skills`](https://github.com/vercel-labs/skills) CLI. The picker groups skills under **Core**, **Core Diy**, and **Wip**.

```bash
# Interactive grouped picker
npx skills add sidisrikk/agent-skills

# Preview grouped skills without installing
npx skills add sidisrikk/agent-skills --list

# Install specific skills directly
npx skills add sidisrikk/agent-skills --skill adverse-review --skill scrutinize
```

When interacting with your AI agent, activate an installed skill by mentioning its name or using your agent's skill invocation mechanism.
