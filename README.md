# Agent Skills

Welcome to the **Agent Skills** repository! This project contains a curated collection of specialized behaviors, workflows, and tools (skills) that enhance AI agent capabilities. These skills enforce best practices, improve token efficiency, and standardize outputs across various tasks.

## 🛠️ Available Skills

### 💻 Development & Process

| Skill Name | Description |
| ---------- | ----------- |
| **brainstorming** | Explores user intent, requirements, and design before implementation. Mandatory before creative work. |
| **codebase-cleanup-deps-audit** | Analyzes project dependencies for known vulnerabilities, licensing issues, and outdated packages. |
| **git-weekly-report** | Generates git-sourced team updates, sprint reviews, or commit recaps based on author, date, and audience. |
| **karpathy-guidelines** | Behavioral guidelines to reduce common LLM coding mistakes, favoring surgical changes and verifiable criteria. |
| **naming-analyzer** | Suggests better variable, function, and class names based on context and conventions. |

### 📄 Documentation

| Skill Name | Description |
| ---------- | ----------- |
| **code-documentation-code-explain** | Transforms difficult concepts into understandable explanations through narratives and visual diagrams. |
| **markdown-mermaid-writing** | Comprehensive markdown and Mermaid diagram writing standard, including style guides and 9 document templates. |

### ⚙️ Meta-Skills

| Skill Name | Description |
| ---------- | ----------- |
| **normalize-skill** | Improves an existing skill file for cross-project reuse by classifying content and enforcing structure. |
| **write-a-skill** | Creates new agent skills with proper structure, progressive disclosure, and bundled resources. |

### 💬 Token Optimize

| Skill Name | Description |
| ---------- | ----------- |
| **caveman** | Ultra-compressed communication mode. Cuts token usage ~75% by dropping filler while keeping technical accuracy. |

## 🚀 How to Use

Each skill is located in its own directory under `skills/`. A standard skill folder contains:

- `SKILL.md`: The core instructions and rules for the agent.
- `README.md` / `REFERENCE.md`: Supplementary information or references (optional).
- `assets/` / `templates/` / `references/`: Any supporting files required by the skill.

When interacting with your AI agent, activate a skill by mentioning its name or using the appropriate invocation command for your environment (e.g., `activate_skill` in Gemini CLI).
