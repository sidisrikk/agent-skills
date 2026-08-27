---
name: session-wisdom-extractor
description: Extract knowledge, patterns, and wisdom from AI coding agent interaction histories (Claude Code, OpenCode). Use when user wants to analyze past sessions, extract learnings, create tutorials, generate knowledge bases, or teach others from real agent interactions.
---

# Session Wisdom Extractor

Extract actionable knowledge from agent interaction histories and package it for human education.

## Quick Start

1. **Identify source** — determine if sessions come from Claude Code or OpenCode
2. **Locate sessions** — find session files on disk (see [REFERENCE.md](REFERENCE.md))
3. **Extract & analyze** — run extraction scripts to parse sessions
4. **Synthesize wisdom** — distill patterns, techniques, and lessons into educational content

## Workflows

### Extract Sessions

Use the scripts in `scripts/` to extract raw session data:

```bash
# Claude Code — extract all sessions for a project
node scripts/extract_claude.js --project /path/to/project

# OpenCode — extract all sessions from the database
node scripts/extract_opencode.js --db ~/.local/share/opencode/opencode.db

# Either — extract a single session by ID
node scripts/extract_claude.js --session <session-uuid>
node scripts/extract_opencode.js --session <session-id>
```

Output is normalized JSON (see [REFERENCE.md#unified-schema](REFERENCE.md#unified-schema)).

### Analyze Interaction Patterns

After extraction, analyze the normalized sessions to find:

- [ ] **Problem-solving strategies** — how the agent broke down complex tasks
- [ ] **Tool usage patterns** — which tools were used and in what sequences
- [ ] **Iteration cycles** — how many rounds of edit→test→fix occurred
- [ ] **Error recovery** — how failures were handled and resolved
- [ ] **Prompt techniques** — what user prompts led to the best outcomes

### Generate Educational Content

Transform analysis into teaching materials:

- [ ] **Case studies** — step-by-step walkthroughs of real sessions
- [ ] **Pattern catalogs** — reusable interaction patterns with examples
- [ ] **Anti-pattern guides** — common mistakes and how to avoid them
- [ ] **Cheat sheets** — quick-reference cards for effective agent interaction

## Advanced Features

See [REFERENCE.md](REFERENCE.md) for:

- Detailed session file schemas for both platforms
- Unified output schema specification
- Advanced filtering and search options
- Tips for cross-platform session comparison
