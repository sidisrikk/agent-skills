# Agent Skills

Welcome to the **Agent Skills** repository! This project contains a curated collection of specialized behaviors, workflows, and tools (skills) that enhance AI agent capabilities. These skills enforce best practices, improve token efficiency, and standardize outputs across various tasks.

## 🛠️ Available Skills

Skills under [`skills/core-diy/`](skills/core-diy/) are my own. Skills under [`skills/core/`](skills/core/) are cloned from others. Both install under the **Core** group.

### 🗳️ Planning, Ideation & Review

| Skill Name | Description |
| --- | --- |
| [**scrutinize**](skills/core/scrutinize/SKILL.md) | Reviews plans, designs, PRs, and diffs from an outsider perspective to challenge assumptions and scope. |
| [**adverse-review**](skills/core-diy/adverse-review/SKILL.md) | Conducts read-only adversarial code review through three independent lenses (Adversary, Auditor, Pragmatist). |

### 🛡️ Code Quality & Conventions

| Skill Name | Description |
| --- | --- |
| [**codebase-cleanup-deps-audit**](skills/core/codebase-cleanup-deps-audit/SKILL.md) | Audits project dependencies for known vulnerabilities, license compliance risks, and outdated packages. |
| [**clean-comments**](skills/core-diy/clean-comments/SKILL.md) | Sweeps a path or repository for comment sediment (plan labels, dead code, stale names/paths) and cleans them after approval. |
| [**naming-analyzer**](skills/core/naming-analyzer/SKILL.md) | Evaluates and suggests clearer names for variables, functions, and classes across codebases. |

### 🎨 UI Design & Exploration

| Skill Name | Description |
| --- | --- |
| [**ascii-ui-explorer**](skills/core-diy/ascii-ui-explorer/SKILL.md) | Generates ASCII wireframes for screens, components, user flows, and responsive UI states without writing code. |

### 📊 Git & Productivity Analytics

| Skill Name | Description |
| --- | --- |
| [**git-weekly-report**](skills/core-diy/git-weekly-report/SKILL.md) | Generates git-sourced team updates, sprint summaries, or commit digests filtered by author, date, and audience. |
| [**split-commits**](skills/core-diy/split-commits/SKILL.md) | Cuts working-tree changes or unpushed commits into clean commits by a single split rule with a rollback receipt. |
| [**worktime-by-gitlog**](skills/core-diy/worktime-by-gitlog/SKILL.md) | Estimates development time by analyzing git commit timestamps and generates an interactive HTML report with Chart.js. |

### 📄 Documentation & Reverse Engineering

| Skill Name | Description |
| --- | --- |
| [**code-documentation-code-explain**](skills/core/code-documentation-code-explain/SKILL.md) | Explains complex code and architecture through clear narratives, step-by-step breakdowns, and visual diagrams. |

### ⚙️ Meta-Skills & Agent Orchestration

| Skill Name | Description |
| --- | --- |
| [**normalize-skill**](skills/core-diy/normalize-skill/SKILL.md) | Refactors existing skills into standardized tiers (SKILL.md ≤ 100 lines + REFERENCE.md) for cross-project reuse. |

### 🚧 Work In Progress (WIP)

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
│   └── marketplace.json       # Groups skills into `core` (core-diy + core folders) and `wip`
└── skills/
    ├── core-diy/              # Production-ready skills I wrote myself
    │   ├── adverse-review/
    │   └── ...
    ├── core/                  # Production-ready skills cloned from others
    │   ├── scrutinize/
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

Install interactively with Vercel's [`skills`](https://github.com/vercel-labs/skills) CLI (skills appear grouped under **Core** and **Wip**):

```bash
# Interactive grouped picker
npx skills add sidisrikk/agent-skills

# Preview grouped skills without installing
npx skills add sidisrikk/agent-skills --list

# Install specific skills directly
npx skills add sidisrikk/agent-skills --skill adverse-review --skill scrutinize
```

When interacting with your AI agent, activate an installed skill by mentioning its name or using your agent's skill invocation mechanism.
