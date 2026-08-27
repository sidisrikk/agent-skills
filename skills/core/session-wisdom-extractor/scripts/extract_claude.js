#!/usr/bin/env node
/**
 * Claude Code Session Extractor
 *
 * Extracts and normalizes session data from Claude Code's JSONL files
 * into the unified schema for analysis.
 *
 * Usage:
 *   node extract_claude.js --project /path/to/project
 *   node extract_claude.js --session <session-uuid>
 *   node extract_claude.js --list-projects
 *   node extract_claude.js --list-sessions --project /path/to/project
 *   node extract_claude.js --transcript <transcript-id>
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const CLAUDE_DIR =
  process.env.CLAUDE_CONFIG_DIR ||
  path.join(require("os").homedir(), ".claude");
const PROJECTS_DIR = path.join(CLAUDE_DIR, "projects");
const TRANSCRIPTS_DIR = path.join(CLAUDE_DIR, "transcripts");

// --- Utilities ---

function parseJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
  const entries = [];
  for (const line of lines) {
    try {
      entries.push(JSON.parse(line));
    } catch {
      // skip malformed lines
    }
  }
  return entries;
}

function encodeProjectPath(absPath) {
  return absPath.replace(/\//g, "-");
}

function resolveProjectDir(projectPath) {
  const encoded = encodeProjectPath(projectPath);
  const dir = path.join(PROJECTS_DIR, encoded);
  if (fs.existsSync(dir)) return dir;
  // Fallback: scan all project dirs for matching originalPath
  if (!fs.existsSync(PROJECTS_DIR)) return null;
  for (const d of fs.readdirSync(PROJECTS_DIR)) {
    const indexFile = path.join(PROJECTS_DIR, d, "sessions-index.json");
    if (fs.existsSync(indexFile)) {
      try {
        const idx = JSON.parse(fs.readFileSync(indexFile, "utf-8"));
        if (idx.originalPath === projectPath) return path.join(PROJECTS_DIR, d);
      } catch {}
    }
  }
  return null;
}

function extractTextFromContent(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
  }
  return "";
}

function extractThinkingFromContent(content) {
  if (!Array.isArray(content)) return null;
  const thinking = content
    .filter((b) => b.type === "thinking")
    .map((b) => b.thinking)
    .join("\n");
  return thinking || null;
}

function extractToolCallsFromContent(content) {
  if (!Array.isArray(content)) return [];
  return content
    .filter((b) => b.type === "tool_use")
    .map((b) => ({
      tool: b.name,
      input: b.input || {},
      output: null,
      status: "completed",
    }));
}

// --- Core extraction ---

function normalizeSessionEntry(entry, index) {
  const role =
    entry.type === "user"
      ? "user"
      : entry.type === "assistant"
        ? "assistant"
        : "system";
  const msgContent = entry.message?.content || entry.content || "";

  return {
    index,
    role,
    timestamp: entry.timestamp || null,
    uuid: entry.uuid || null,
    parentUuid: entry.parentUuid || null,
    isSidechain: entry.isSidechain || false,
    isMeta: entry.isMeta || false,
    content: {
      text: extractTextFromContent(msgContent),
      thinking: extractThinkingFromContent(msgContent),
      toolCalls: extractToolCallsFromContent(msgContent),
    },
    model: entry.message?.model || null,
    usage: entry.message?.usage || entry.usage || null,
  };
}

function extractSession(sessionFilePath) {
  const entries = parseJsonl(sessionFilePath);
  const sessionId = path.basename(sessionFilePath, ".jsonl");

  // Filter out noise entries
  const meaningful = entries.filter(
    (e) => !["summary", "file-history-snapshot"].includes(e.type) && !e.isMeta,
  );

  const turns = meaningful.map((e, i) => normalizeSessionEntry(e, i));

  // Filter out sidechain turns for main flow (keep them tagged)
  const mainTurns = turns.filter((t) => !t.isSidechain);

  const firstTimestamp = entries[0]?.timestamp || null;
  const lastTimestamp = entries[entries.length - 1]?.timestamp || null;

  // Aggregate token usage
  const tokenUsage = { input: 0, output: 0, reasoning: 0 };
  for (const e of entries) {
    const u = e.message?.usage || e.usage;
    if (u) {
      tokenUsage.input += u.input_tokens || 0;
      tokenUsage.output += u.output_tokens || 0;
    }
  }

  // First user message as title
  const firstUser = mainTurns.find((t) => t.role === "user");
  const title = firstUser?.content?.text?.slice(0, 120) || sessionId;

  return {
    session: {
      id: sessionId,
      platform: "claude-code",
      project: null, // filled by caller
      title,
      startTime: firstTimestamp,
      endTime: lastTimestamp,
      tokenUsage,
      turnCount: mainTurns.length,
      sidechainCount: turns.length - mainTurns.length,
    },
    turns: mainTurns,
    sidechainTurns: turns.filter((t) => t.isSidechain),
  };
}

function extractTranscript(transcriptFilePath) {
  const entries = parseJsonl(transcriptFilePath);
  const transcriptId = path.basename(transcriptFilePath, ".jsonl");

  const turns = entries.map((e, i) => {
    if (e.type === "tool_use") {
      return {
        index: i,
        role: "assistant",
        timestamp: e.timestamp,
        content: {
          text: null,
          thinking: null,
          toolCalls: [
            {
              tool: e.tool_name,
              input: e.tool_input || {},
              output: null,
              status: "pending",
            },
          ],
        },
      };
    }
    if (e.type === "tool_result") {
      return {
        index: i,
        role: "system",
        timestamp: e.timestamp,
        content: {
          text: null,
          thinking: null,
          toolCalls: [
            {
              tool: e.tool_name,
              input: e.tool_input || {},
              output: e.tool_output || {},
              status: "completed",
            },
          ],
        },
      };
    }
    return normalizeSessionEntry(e, i);
  });

  return {
    session: {
      id: transcriptId,
      platform: "claude-code",
      type: "raw-transcript",
      startTime: entries[0]?.timestamp || null,
      endTime: entries[entries.length - 1]?.timestamp || null,
    },
    turns,
  };
}

// --- CLI ---

function listProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log("No projects found at", PROJECTS_DIR);
    return;
  }
  const dirs = fs
    .readdirSync(PROJECTS_DIR)
    .filter((d) => fs.statSync(path.join(PROJECTS_DIR, d)).isDirectory());
  const projects = [];
  for (const d of dirs) {
    const indexFile = path.join(PROJECTS_DIR, d, "sessions-index.json");
    let originalPath = d;
    if (fs.existsSync(indexFile)) {
      try {
        const idx = JSON.parse(fs.readFileSync(indexFile, "utf-8"));
        originalPath = idx.originalPath || d;
      } catch {}
    }
    // Count sessions
    const sessionFiles = fs
      .readdirSync(path.join(PROJECTS_DIR, d))
      .filter((f) => f.endsWith(".jsonl"));
    projects.push({
      directory: d,
      path: originalPath,
      sessions: sessionFiles.length,
    });
  }
  console.log(JSON.stringify(projects, null, 2));
}

function listSessions(projectPath) {
  const projectDir = resolveProjectDir(projectPath);
  if (!projectDir) {
    console.error("Project not found:", projectPath);
    process.exit(1);
  }
  const sessionFiles = fs
    .readdirSync(projectDir)
    .filter((f) => f.endsWith(".jsonl"));

  const sessions = sessionFiles.map((f) => {
    const filePath = path.join(projectDir, f);
    const entries = parseJsonl(filePath);
    const firstUser = entries.find((e) => e.type === "user");
    return {
      id: path.basename(f, ".jsonl"),
      file: filePath,
      messageCount: entries.length,
      firstTimestamp: entries[0]?.timestamp || null,
      preview: (firstUser?.message?.content || "").toString().slice(0, 100),
    };
  });
  console.log(JSON.stringify(sessions, null, 2));
}

// --- Main ---

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

if (args.includes("--list-projects")) {
  listProjects();
} else if (args.includes("--list-sessions")) {
  const project = getArg("--project");
  if (!project) {
    console.error("--project required with --list-sessions");
    process.exit(1);
  }
  listSessions(project);
} else if (getArg("--session")) {
  const sessionId = getArg("--session");
  const project = getArg("--project");
  let sessionFile;
  if (project) {
    const projectDir = resolveProjectDir(project);
    sessionFile = path.join(projectDir, sessionId + ".jsonl");
  } else {
    // Search all projects
    const dirs = fs.readdirSync(PROJECTS_DIR);
    for (const d of dirs) {
      const candidate = path.join(PROJECTS_DIR, d, sessionId + ".jsonl");
      if (fs.existsSync(candidate)) {
        sessionFile = candidate;
        break;
      }
    }
  }
  if (!sessionFile || !fs.existsSync(sessionFile)) {
    console.error("Session file not found:", sessionId);
    process.exit(1);
  }
  const result = extractSession(sessionFile);
  result.session.project = project || null;
  console.log(JSON.stringify(result, null, 2));
} else if (getArg("--transcript")) {
  const tid = getArg("--transcript");
  const tFile = path.join(
    TRANSCRIPTS_DIR,
    tid.startsWith("ses_") ? tid : "ses_" + tid,
  );
  const finalPath = tFile.endsWith(".jsonl") ? tFile : tFile + ".jsonl";
  if (!fs.existsSync(finalPath)) {
    console.error("Transcript not found:", finalPath);
    process.exit(1);
  }
  console.log(JSON.stringify(extractTranscript(finalPath), null, 2));
} else if (getArg("--project")) {
  const project = getArg("--project");
  const projectDir = resolveProjectDir(project);
  if (!projectDir) {
    console.error("Project not found:", project);
    process.exit(1);
  }
  const sessionFiles = fs
    .readdirSync(projectDir)
    .filter((f) => f.endsWith(".jsonl"));

  const allSessions = sessionFiles.map((f) => {
    const result = extractSession(path.join(projectDir, f));
    result.session.project = project;
    return result;
  });
  console.log(JSON.stringify(allSessions, null, 2));
} else {
  console.log(`Usage:
  node extract_claude.js --list-projects
  node extract_claude.js --list-sessions --project /path/to/project
  node extract_claude.js --project /path/to/project
  node extract_claude.js --session <session-uuid> [--project /path/to/project]
  node extract_claude.js --transcript <transcript-id>`);
}
