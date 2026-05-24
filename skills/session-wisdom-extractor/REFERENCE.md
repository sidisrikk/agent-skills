# Session Wisdom Extractor — Reference

## Supported Platforms

| Platform    | Storage                   | Location                                           |
| :---------- | :------------------------ | :------------------------------------------------- |
| Claude Code | JSONL files               | `~/.claude/projects/` and `~/.claude/transcripts/` |
| OpenCode    | SQLite DB + JSON fallback | `~/.local/share/opencode/opencode.db`              |

---

## Claude Code Session Structure

### Directory Layout

```
~/.claude/
├── projects/
│   └── -home-user-project/           # Encoded workspace path (slashes → hyphens)
│       ├── sessions-index.json       # Contains originalPath
│       ├── <session-uuid>.jsonl      # Session log
│       └── <session-uuid>/subagents/ # Subagent logs (agent-*.jsonl)
└── transcripts/
    └── ses_*.jsonl                   # Raw execution traces
```

### Directory Naming

Project directories encode the workspace path: `/home/user/my-project` → `-home-user-my-project`

Resolve original path from `sessions-index.json`:

```json
{ "originalPath": "/home/user/my-project" }
```

### Session Log Entry Types (`<session-uuid>.jsonl`)

Each JSONL line is a `RawLogEntry`:

```json
{
  "uuid": "f1aac3fc-...",
  "parentUuid": null,
  "sessionId": "43c401fd-...",
  "timestamp": "2026-05-16T17:00:50.343Z",
  "type": "user", // user | assistant | system | summary | file-history-snapshot
  "message": { "role": "user", "content": "..." },
  "cwd": "/home/user/project",
  "isMeta": false,
  "isSidechain": false
}
```

**Key types:**

- `user` / `assistant` — conversation turns with `message.role`, `message.content`, `message.model`, `message.usage`
- `system` — stdout from commands, hooks output
- `summary` — compressed context summary (skip in listings)
- `file-history-snapshot` — file backup metadata before edits

**Assistant content blocks** (inside `message.content` array):

- `{ "type": "thinking", "thinking": "..." }` — reasoning trace
- `{ "type": "text", "text": "..." }` — response text
- `{ "type": "tool_use", "name": "...", "input": {...} }` — tool invocation

### Raw Transcript Entry Types (`transcripts/ses_*.jsonl`)

```json
// User input
{ "type": "user", "timestamp": "...", "content": "..." }

// Tool call
{ "type": "tool_use", "timestamp": "...", "tool_name": "glob", "tool_input": { "pattern": "**/*.ts" } }

// Tool result
{ "type": "tool_result", "timestamp": "...", "tool_name": "glob", "tool_input": {...}, "tool_output": { "output": "..." } }

// Assistant response
{ "type": "assistant", "timestamp": "...", "message": { "model": "...", "content": [...], "usage": {...} } }
```

---

## OpenCode Session Structure

### Directory Layout

```
~/.local/share/opencode/              # or $XDG_DATA_HOME/opencode/ or $OPENCODE_HOME
├── opencode.db                       # Primary SQLite database
├── opencode.db-shm / -wal            # WAL files
└── storage/                          # JSON fallback
    ├── project/<project-id>.json
    ├── session/<project-id>/<session-id>.json
    ├── message/<session-id>/<message-uuid>.json
    └── part/<message-uuid>/<part-index>.json
```

### Database Schema

**`project`** — workspace registration:

```sql
CREATE TABLE project (
  id TEXT PRIMARY KEY,
  worktree TEXT NOT NULL,        -- absolute workspace path
  name TEXT,
  time_created INTEGER NOT NULL, -- epoch ms
  time_updated INTEGER NOT NULL
);
```

**`session`** — conversation groups:

```sql
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  time_created INTEGER NOT NULL,
  time_updated INTEGER NOT NULL,
  cost REAL DEFAULT 0,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_reasoning INTEGER DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);
```

**`message`** — individual turns:

```sql
CREATE TABLE message (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  time_created INTEGER NOT NULL,
  time_updated INTEGER NOT NULL,
  data TEXT NOT NULL,  -- JSON: { role, modelID, parentID, tokens, cost }
  FOREIGN KEY (session_id) REFERENCES session(id) ON DELETE CASCADE
);
```

**`part`** — message content blocks:

```sql
CREATE TABLE part (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  time_created INTEGER NOT NULL,
  time_updated INTEGER NOT NULL,
  data TEXT NOT NULL,  -- JSON content block
  FOREIGN KEY (message_id) REFERENCES message(id) ON DELETE CASCADE
);
```

### Part Data Types

```json
// Text
{ "type": "text", "text": "Hello, how can I help?" }

// Reasoning/Thinking
{ "type": "reasoning", "text": "The user is asking for..." }

// Tool invocation
{ "type": "tool", "tool": "glob", "callID": "...", "state": { "status": "completed", "input": { "pattern": "**/*.ts" } } }
```

### Reconstructing a Session

```sql
-- 1. Get messages in order
SELECT id, data FROM message WHERE session_id = ? ORDER BY time_created ASC, id ASC;

-- 2. For each message, get parts in order
SELECT data FROM part WHERE message_id = ? ORDER BY id ASC;
```

---

## Unified Schema

Both platforms normalize to this common format for analysis:

```json
{
  "session": {
    "id": "session-uuid",
    "platform": "claude-code | opencode",
    "project": "/absolute/path/to/workspace",
    "title": "Session title or first user message",
    "startTime": "ISO-8601",
    "endTime": "ISO-8601",
    "tokenUsage": { "input": 0, "output": 0, "reasoning": 0 }
  },
  "turns": [
    {
      "index": 0,
      "role": "user | assistant | system",
      "timestamp": "ISO-8601",
      "content": {
        "text": "Main text content",
        "thinking": "Reasoning trace (if any)",
        "toolCalls": [
          {
            "tool": "tool-name",
            "input": {},
            "output": {},
            "status": "completed | error"
          }
        ]
      }
    }
  ]
}
```

---

## Analysis Dimensions

When analyzing sessions for wisdom extraction, evaluate along these dimensions:

### 1. Problem Decomposition

- How was the initial request broken into sub-tasks?
- Were tasks executed sequentially or in parallel?
- What was the dependency graph between tasks?

### 2. Tool Selection Strategy

- Which tools were chosen for each sub-task?
- Were there unnecessary tool calls that could be eliminated?
- What tool sequences formed effective "recipes"?

### 3. Error Recovery Patterns

- What errors occurred and how were they diagnosed?
- How many attempts were needed to resolve each error?
- Were there systematic vs. one-off failures?

### 4. Iteration Efficiency

- How many edit→test→fix cycles per feature?
- Did later iterations converge faster (learning within session)?
- What patterns led to first-attempt success?

### 5. Communication Quality

- Which user prompts produced the best outcomes?
- How did prompt specificity correlate with result quality?
- What clarifying questions led to breakthroughs?

---

## Educational Output Formats

### Case Study Template

```markdown
# Case Study: [Title]

## Context

- Project: [description]
- Goal: [what the user wanted]
- Session duration: [time]

## Key Interactions

### Step 1: [Phase name]

> **User**: [prompt excerpt]
> **Agent**: [action summary]
> **Result**: [outcome]

## Lessons Learned

1. [Insight with supporting evidence]
2. [Pattern that emerged]

## Applicable Patterns

- [Pattern name]: [when to use, how to apply]
```

### Pattern Card Template

```markdown
## Pattern: [Name]

**When to use**: [Trigger conditions]
**How it works**: [Step-by-step]
**Example prompt**: `[actual prompt from session]`
**Expected outcome**: [what happens]
**Common pitfalls**: [what to avoid]
```

---

## Tips

- **Filter noise**: Skip `summary`, `file-history-snapshot`, and `isMeta: true` entries
- **Track sidechains**: `isSidechain: true` in Claude Code marks branched explorations
- **Cross-reference**: Compare session logs with raw transcripts for full picture
- **Cost analysis**: Use token/cost data to identify expensive patterns
- **Temporal patterns**: Analyze timestamps to find where the agent spent the most time
