---
name: init-deep
description: Generate hierarchical AGENTS.md files with complexity-scored subdirectories. Use when the user wants to initialize or update deep agent documentation or invokes /init-deep.
---

# /init-deep

Generate hierarchical `AGENTS.md` files. Root + complexity-scored subdirectories. This skill is designed to be agent and framework agnostic.

## Quick start

```bash
/init-deep                      # Update mode: modify existing + create new where warranted
/init-deep --create-new         # Read existing → remove all → regenerate from scratch
/init-deep --max-depth=2        # Limit directory depth (default: 3)
```

## Workflows

**IMPORTANT**: Track progress in real-time by outputting a Todo list during execution:

```json
[
  {
    "id": "discovery",
    "content": "Fire explore agents + LSP codemap + read existing",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "scoring",
    "content": "Score directories, determine locations",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "generate",
    "content": "Generate AGENTS.md files (root + subdirs)",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "review",
    "content": "Deduplicate, validate, trim",
    "status": "pending",
    "priority": "medium"
  }
]
```

### Phase 1: Discovery + Analysis (Concurrent)

- Fire background explore tasks immediately for project structure, entry points, conventions, and anti-patterns.
- Spawn dynamic background tasks based on project scale (total files, depth, monorepo status).
- Concurrently in the main session: analyze directory structure, read existing `AGENTS.md` files, and extract LSP codemap data.
- Collect background results.

### Phase 2: Scoring & Location Decision

- Score directories based on file count, code ratio, module boundary, symbol density, export count, etc.
- Decide where to generate files (always root; score >15 generate; score <8 skip).

### Phase 3: Generate AGENTS.md

- **Root AGENTS.md**: Generate full overview, structure, code map, conventions, anti-patterns, commands.
- **Subdirectory AGENTS.md**: Generate in parallel. Never repeat parent content. 30-80 lines max.

### Phase 4: Review & Deduplicate

- Remove generic advice and parent duplicates from all generated files.
- Produce a final report of the generated hierarchy.

## Advanced features

For detailed prompts, scoring matrices, file structure requirements, and strict anti-patterns, see [REFERENCE.md](REFERENCE.md).
