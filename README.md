# Agent Skills

Welcome to the **Agent Skills** repository! This project contains a curated collection of specialized behaviors, workflows, and tools (skills) that enhance AI agent capabilities. These skills enforce best practices, improve token efficiency, and standardize outputs across various tasks.

## 🛠️ Available Skills

### 💻 Development & Process

| Skill Name                      | Description                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **brainstorming**               | Explores user intent, requirements, and design before implementation. Mandatory before creative work.          |
| **codebase-cleanup-deps-audit** | Analyzes project dependencies for known vulnerabilities, licensing issues, and outdated packages.              |
| **docker-cve-fix**              | Scans Docker images for CVEs with Trivy and fixes them by ownership: base-image packages vs OS-layer packages. |
| **git-weekly-report**           | Generates git-sourced team updates, sprint reviews, or commit recaps based on author, date, and audience.      |
| **grill-me-finite**             | Interview the user relentlessly about a plan or design until reaching shared understanding.                    |
| **karpathy-guidelines**         | Behavioral guidelines to reduce common LLM coding mistakes, favoring surgical changes and verifiable criteria. |
| **manual-migration**            | Generate a prod-safe SQL migration script from a Prisma migration when no prisma CLI access is available.      |
| **naming-analyzer**             | Suggests better variable, function, and class names based on context and conventions.                          |
| **worktime-by-gitlog**           | Estimates time spent on a project by analyzing git commit timestamps and generates an HTML report with Chart.js. |

### 📄 Documentation

| Skill Name                          | Description                                                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **code-documentation-code-explain** | Transforms difficult concepts into understandable explanations through narratives and visual diagrams.      |
| **code-to-prd**                     | Reverse-engineers any codebase into a complete PRD — pages, endpoints, state, and interactions documented.  |
| **markdown-mermaid-writing**        | Comprehensive markdown and Mermaid diagram writing standard, including style guides and document templates. |

### ⚙️ Meta-Skills

| Skill Name          | Description                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| **normalize-skill** | Improves an existing skill file for cross-project reuse by classifying content and enforcing structure. |

### 🚧 Work In Progress (WIP)

| Skill Name                     | Description                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **low-cognitive-guidelines**   | Tiered coding principles that minimize cognitive load on AI agents (deep modules, strong typing, SRP).   |
| **nestjs-zod-swagger-audit**   | Audits NestJS backend controllers and DTOs for nestjs-zod compliance and Swagger decorator completeness. |
| **react-vertical-slice-audit** | Audits React frontend for vertical-slice architecture compliance, enforcing domain boundaries.           |

## 🚀 How to Use

Each skill is located in its own directory under `skills/` or `wip/`. A standard skill folder contains:

- `SKILL.md`: The core instructions and rules for the agent.
- `README.md` / `REFERENCE.md`: Supplementary information or references (optional).
- `assets/` / `templates/` / `references/`: Any supporting files required by the skill.

When interacting with your AI agent, activate a skill by mentioning its name or using the appropriate invocation command for your environment (e.g., `activate_skill` in Gemini CLI).
