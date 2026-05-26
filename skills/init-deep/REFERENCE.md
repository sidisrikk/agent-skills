# init-deep Implementation Reference

## Detailed Phase Execution

### Phase 1: Discovery + Analysis (Concurrent)

**Fire Background Explore Agents IMMEDIATELY**
Fire all at once, collect results later:

- **Project structure**: PREDICT standard patterns for detected language → REPORT deviations only
- **Entry points**: FIND main files → REPORT non-standard organization
- **Conventions**: FIND config files → REPORT project-specific rules
- **Anti-patterns**: FIND forbidden patterns in comments (e.g. 'DO NOT', 'NEVER')
- **Build/CI**: FIND workflow and Makefile patterns
- **Test patterns**: FIND unique test conventions

**DYNAMIC AGENT SPAWNING**:
Measure project scale first (files, lines, depth).
| Factor | Threshold | Additional Agents |
|--------|-----------|-------------------|
| Total files | >100 | +1 per 100 files |
| Total lines | >10k | +1 per 10k lines |
| Directory depth | ≥4 | +2 for deep exploration |
| Large files (>500 lines) | >10 files | +1 for complexity hotspots |
| Monorepo | detected | +1 per package/workspace |
| Multiple languages | >1 | +1 per language |

**Main Session Concurrent Analysis**

1. **Structural Analysis**: Measure directory depth, file counts, code concentration by extension.
2. **Read Existing AGENTS.md**: Extract key insights, conventions, anti-patterns. If `--create-new`, read to preserve context, then delete, then regenerate.
3. **LSP Codemap**: Check entry points, key symbols (class, interface, function), centrality for top exports.

**Merge**: System structure + LSP + existing + explore findings.

### Phase 2: Scoring Matrix & Decision Rules

**Scoring Matrix**
| Factor | Weight | High Threshold | Source |
|--------|--------|----------------|--------|
| File count | 3x | >20 | analysis |
| Subdir count | 2x | >5 | analysis |
| Code ratio | 2x | >70% | analysis |
| Unique patterns | 1x | Has own config | explore |
| Module boundary | 2x | Has index/init | analysis |
| Symbol density | 2x | >30 symbols | LSP |
| Export count | 2x | >10 exports | LSP |
| Reference centrality | 3x | >20 refs | LSP |

**Decision Rules**

- **Root (.)**: ALWAYS create
- **Score >15**: Create AGENTS.md
- **Score 8-15**: Create if distinct domain
- **Score <8**: Skip (parent covers)

### Phase 3: Generating Files

**File Writing Rule**: If AGENTS.md already exists at the target path → use edit tools. If it does NOT exist → use create/write tools. NEVER overwrite an existing file directly without checking.

**Root AGENTS.md Structure**:

- OVERVIEW
- STRUCTURE (non-obvious purpose only)
- WHERE TO LOOK (Task / Location / Notes)
- CODE MAP (LSP references, roles)
- CONVENTIONS (only deviations from standard)
- ANTI-PATTERNS (explicitly forbidden here)
- UNIQUE STYLES
- COMMANDS
- NOTES

**Quality Gate**: 50-150 lines, no generic advice, no obvious info.

**Subdirectory AGENTS.md Rules**:

- 30-80 lines max
- NEVER repeat parent content
- Include: OVERVIEW, STRUCTURE (if >5 subdirs), WHERE TO LOOK, CONVENTIONS, ANTI-PATTERNS

### Phase 4: Review & Deduplicate

- Remove generic advice
- Remove parent duplicates
- Trim to size limits
- Verify telegraphic style

## Final Report Format

```
=== init-deep Complete ===

Mode: {update | create-new}

Files:
  [OK] ./AGENTS.md (root, {N} lines)
  [OK] ./src/hooks/AGENTS.md ({N} lines)

Dirs Analyzed: {N}
AGENTS.md Created: {N}
AGENTS.md Updated: {N}

Hierarchy:
  ./AGENTS.md
  └── src/hooks/AGENTS.md
```

## Strict Anti-Patterns

- **Static agent count**: MUST vary agents based on project size/depth
- **Sequential execution**: MUST parallel (explore + LSP concurrent)
- **Ignoring existing**: ALWAYS read existing first, even with --create-new
- **Over-documenting**: Not every dir needs AGENTS.md
- **Redundancy**: Child never repeats parent
- **Generic content**: Remove anything that applies to ALL projects
- **Verbose style**: Telegraphic or die
