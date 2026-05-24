# Examples

## 1. Quick Stats from Claude Code

```bash
# List all projects
node scripts/extract_claude.js --list-projects

# Extract all sessions for a project and analyze
node scripts/extract_claude.js --project /home/user/my-app \
  | node scripts/analyze.js --format stats
```

Sample output:

```json
{
  "conversationPatterns": {
    "totalSessions": 12,
    "avgTurnsPerSession": 18,
    "avgUserPromptLength": 87,
    "avgAssistantResponseLength": 1240,
    "thinkingPresencePercent": 75
  },
  "toolUsage": {
    "frequency": [
      { "tool": "Read", "count": 142 },
      { "tool": "Write", "count": 89 },
      { "tool": "Bash", "count": 67 }
    ],
    "commonSequences": [
      { "sequence": "Read → Write", "count": 45 },
      { "sequence": "Write → Bash", "count": 32 }
    ]
  }
}
```

## 2. Generate a Case Study

```bash
# Extract a single session and generate a case study
node scripts/extract_claude.js --session abc123-def456 \
  | node scripts/analyze.js --format case-study > case_study.md
```

## 3. Extract OpenCode Sessions

```bash
# List projects in OpenCode
node scripts/extract_opencode.js --list-projects

# Extract and analyze a specific session
node scripts/extract_opencode.js --session sess_abc123 \
  | node scripts/analyze.js --format patterns
```

## 4. Cross-Platform Comparison

```bash
# Extract from both platforms and merge
node scripts/extract_claude.js --project /path/to/project > /tmp/claude.json
node scripts/extract_opencode.js --all --project proj_id > /tmp/opencode.json

# Combine and analyze (jq required)
jq -s 'add' /tmp/claude.json /tmp/opencode.json \
  | node scripts/analyze.js --format stats
```

## 5. Find Effective Prompts

```bash
# Extract wisdom insights
node scripts/extract_claude.js --project /path/to/project \
  | node scripts/analyze.js --format patterns \
  | jq '.wisdom[] | select(.type == "effective-prompt")'
```

## 6. OpenCode JSON Fallback (no SQLite)

```bash
# Use JSON storage files directly when SQLite is unavailable
node scripts/extract_opencode.js --session sess_abc123 --fallback \
  --storage-dir ~/.local/share/opencode/storage
```
