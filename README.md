# Agent Skills

Welcome to the **Agent Skills** repository! This project contains a curated collection of specialized behaviors, workflows, and tools (skills) that enhance AI agent capabilities. These skills enforce best practices, improve token efficiency, and standardize outputs across various tasks.

## 🛠️ Available Skills

### 🗳️ Planning, Ideation & Review

| Skill Name | Description |
| --- | --- |
| [**brainstorming**](skills/core/brainstorming/SKILL.md) | Explores user intent, requirements, and design before implementation. Mandatory before creative work. |
| [**scrutinize**](skills/core/scrutinize/SKILL.md) | Reviews plans, designs, PRs, and diffs from an outsider perspective to challenge assumptions and scope. |
| [**adverse-review**](skills/core/adverse-review/SKILL.md) | Conducts read-only adversarial code review through three independent lenses (Adversary, Auditor, Pragmatist). |

### 🛡️ Code Quality & Conventions

| Skill Name | Description |
| --- | --- |
| [**codebase-cleanup-deps-audit**](skills/core/codebase-cleanup-deps-audit/SKILL.md) | Audits project dependencies for known vulnerabilities, license compliance risks, and outdated packages. |
| [**naming-analyzer**](skills/core/naming-analyzer/SKILL.md) | Evaluates and suggests clearer names for variables, functions, and classes across codebases. |

### 🎨 UI Design & Exploration

| Skill Name | Description |
| --- | --- |
| [**ascii-ui-explorer**](skills/core/ascii-ui-explorer/SKILL.md) | Generates ASCII wireframes for screens, components, user flows, and responsive UI states without writing code. |

### 📊 Git & Productivity Analytics

| Skill Name | Description |
| --- | --- |
| [**git-weekly-report**](skills/core/git-weekly-report/SKILL.md) | Generates git-sourced team updates, sprint summaries, or commit digests filtered by author, date, and audience. |
| [**worktime-by-gitlog**](skills/core/worktime-by-gitlog/SKILL.md) | Estimates development time by analyzing git commit timestamps and generates an interactive HTML report with Chart.js. |

### 📄 Documentation & Reverse Engineering

| Skill Name | Description |
| --- | --- |
| [**code-documentation-code-explain**](skills/core/code-documentation-code-explain/SKILL.md) | Explains complex code and architecture through clear narratives, step-by-step breakdowns, and visual diagrams. |
| [**code-to-prd**](skills/core/code-to-prd/SKILL.md) | Reverse-engineers an existing codebase into a comprehensive Product Requirements Document (PRD). |
| [**markdown-mermaid-writing**](skills/core/markdown-mermaid-writing/SKILL.md) | Enforces technical writing and diagramming standards with style guides, 24 diagram type references, and templates. |

### ⚙️ Meta-Skills & Agent Orchestration

| Skill Name | Description |
| --- | --- |
| [**init-deep**](skills/core/init-deep/SKILL.md) | Initializes, audits, prunes, and rebuilds sparse hierarchical `AGENTS.md` instructions for maintainable agent memory. |
| [**normalize-skill**](skills/core/normalize-skill/SKILL.md) | Refactors existing skills into standardized tiers (SKILL.md ≤ 100 lines + REFERENCE.md) for cross-project reuse. |

### 🚧 Work In Progress (WIP)

Skills located in [`skills/wip/`](skills/wip/) are actively undergoing design iteration or testing.

| Skill Name | Description |
| --- | --- |
| [**docker-cve-fix**](skills/wip/docker-cve-fix/SKILL.md) | Scans Docker images with Trivy and resolves CVEs by separating base-image toolchains from OS packages. |
| [**herdr-agy-worker**](skills/wip/herdr-agy-worker/SKILL.md) | Manages bounded `agy` worker lifecycles (spawn, result collection, termination) through Herdr for Orchestra or Lead agents. |
| [**library-first**](skills/wip/library-first/SKILL.md) | Evaluates repository, platform, and package dependencies before writing custom commodity code. |
| [**low-cognitive-guidelines**](skills/wip/low-cognitive-guidelines/SKILL.md) | Applies tiered coding principles (deep modules, strong typing, SRP, pure functions) to minimize AI cognitive load. |
| [**nestjs-zod-swagger-audit**](skills/wip/nestjs-zod-swagger-audit/SKILL.md) | Audits NestJS backend controllers and DTOs for `nestjs-zod` compliance and Swagger OpenAPI decorator coverage. |
| [**nx-fullstack-structure**](skills/wip/nx-fullstack-structure/SKILL.md) | Defines architectural boundaries for Nx monorepos containing React apps, NestJS backends, and shared Zod schemas. |
| [**verification-gate-review**](skills/wip/verification-gate-review/SKILL.md) | Assesses verification effort, prioritizes checks, and schedules safe unattended agent tasks. |

## 📂 Repository Structure

```text
skills/
├── core/                  # Production-ready skills
│   ├── adverse-review/
│   ├── ascii-ui-explorer/
│   ├── brainstorming/
│   └── ...
└── wip/                   # Work-in-progress and experimental skills
    ├── docker-cve-fix/
    ├── herdr-agy-worker/
    └── ...
```

A standard skill directory contains:
- `SKILL.md`: Core instructions, triggers, and rules for the agent (concise entry point).
- `REFERENCE.md` / `README.md`: Detailed guides, examples, and deep reference material (optional).
- `scripts/` / `references/` / `templates/`: Supporting execution scripts, prompt lenses, or templates (optional).

## 🚀 How to Use

When interacting with your AI agent, activate a skill by mentioning its name or using your environment's skill invocation mechanism (e.g., `activate_skill` in Gemini CLI, or referencing `SKILL.md` directly).
