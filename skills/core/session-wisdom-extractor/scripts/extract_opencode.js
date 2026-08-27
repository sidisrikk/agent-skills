#!/usr/bin/env node
/**
 * OpenCode Session Extractor
 *
 * Extracts and normalizes session data from OpenCode's SQLite database
 * into the unified schema for analysis.
 *
 * Usage:
 *   node extract_opencode.js --db ~/.local/share/opencode/opencode.db
 *   node extract_opencode.js --session <session-id>
 *   node extract_opencode.js --list-projects
 *   node extract_opencode.js --list-sessions --project <project-id>
 *   node extract_opencode.js --fallback --storage-dir ~/.local/share/opencode/storage
 *
 * Requires: better-sqlite3 (npm install better-sqlite3)
 *           Falls back to JSON storage if SQLite is unavailable.
 */

const fs = require("fs");
const path = require("path");

// --- Resolve default DB location ---

function resolveDbPath() {
  if (process.env.OPENCODE_HOME) {
    return path.join(process.env.OPENCODE_HOME, "opencode.db");
  }
  const xdg =
    process.env.XDG_DATA_HOME ||
    path.join(require("os").homedir(), ".local", "share");
  return path.join(xdg, "opencode", "opencode.db");
}

function resolveStorageDir() {
  if (process.env.OPENCODE_HOME) {
    return path.join(process.env.OPENCODE_HOME, "storage");
  }
  const xdg =
    process.env.XDG_DATA_HOME ||
    path.join(require("os").homedir(), ".local", "share");
  return path.join(xdg, "opencode", "storage");
}

// --- SQLite extraction ---

function openDb(dbPath) {
  try {
    const Database = require("better-sqlite3");
    return new Database(dbPath, { readonly: true });
  } catch (e) {
    console.error(
      "Could not open SQLite database. Install better-sqlite3:\n  npm install better-sqlite3\n" +
        "Or use --fallback mode with JSON storage files.\n\n" +
        "Error:",
      e.message,
    );
    process.exit(1);
  }
}

function normalizePart(partData) {
  const d = typeof partData === "string" ? JSON.parse(partData) : partData;
  if (d.type === "text") {
    return { type: "text", text: d.text };
  }
  if (d.type === "reasoning") {
    return { type: "thinking", text: d.text };
  }
  if (d.type === "tool") {
    return {
      type: "toolCall",
      tool: d.tool,
      callID: d.callID,
      input: d.state?.input || {},
      status: d.state?.status || "unknown",
    };
  }
  return { type: d.type || "unknown", raw: d };
}

function extractSessionFromDb(db, sessionId) {
  const session = db
    .prepare("SELECT * FROM session WHERE id = ?")
    .get(sessionId);
  if (!session) {
    console.error("Session not found:", sessionId);
    process.exit(1);
  }

  const project = db
    .prepare("SELECT * FROM project WHERE id = ?")
    .get(session.project_id);

  const messages = db
    .prepare(
      "SELECT * FROM message WHERE session_id = ? ORDER BY time_created ASC, id ASC",
    )
    .all(sessionId);

  const turns = messages.map((msg, index) => {
    const msgData = JSON.parse(msg.data);
    const parts = db
      .prepare("SELECT * FROM part WHERE message_id = ? ORDER BY id ASC")
      .all(msg.id);

    const normalizedParts = parts.map((p) => normalizePart(p.data));

    const textParts = normalizedParts
      .filter((p) => p.type === "text")
      .map((p) => p.text);
    const thinkingParts = normalizedParts
      .filter((p) => p.type === "thinking")
      .map((p) => p.text);
    const toolCalls = normalizedParts
      .filter((p) => p.type === "toolCall")
      .map((p) => ({
        tool: p.tool,
        input: p.input,
        output: null,
        status: p.status,
      }));

    return {
      index,
      role: msgData.role || "unknown",
      timestamp: new Date(msg.time_created).toISOString(),
      content: {
        text: textParts.join("\n") || null,
        thinking: thinkingParts.join("\n") || null,
        toolCalls,
      },
      model: msgData.modelID || null,
      usage: msgData.tokens || null,
      cost: msgData.cost || null,
    };
  });

  return {
    session: {
      id: sessionId,
      platform: "opencode",
      project: project?.worktree || null,
      projectName: project?.name || null,
      title: session.title,
      startTime: new Date(session.time_created).toISOString(),
      endTime: new Date(session.time_updated).toISOString(),
      tokenUsage: {
        input: session.tokens_input || 0,
        output: session.tokens_output || 0,
        reasoning: session.tokens_reasoning || 0,
        cacheRead: session.tokens_cache_read || 0,
        cacheWrite: session.tokens_cache_write || 0,
      },
      cost: session.cost || 0,
      turnCount: turns.length,
    },
    turns,
  };
}

// --- JSON Fallback extraction ---

function extractFromJsonStorage(storageDir, sessionId) {
  const messageDir = path.join(storageDir, "message", sessionId);
  if (!fs.existsSync(messageDir)) {
    console.error("No messages found for session:", sessionId);
    process.exit(1);
  }

  const messageFiles = fs
    .readdirSync(messageDir)
    .filter((f) => f.endsWith(".json"));
  const messages = messageFiles
    .map((f) => {
      const data = JSON.parse(
        fs.readFileSync(path.join(messageDir, f), "utf-8"),
      );
      return { id: path.basename(f, ".json"), ...data };
    })
    .sort((a, b) => (a.time_created || 0) - (b.time_created || 0));

  const turns = messages.map((msg, index) => {
    const msgData =
      typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data || {};
    const partDir = path.join(storageDir, "part", msg.id);
    let parts = [];
    if (fs.existsSync(partDir)) {
      parts = fs
        .readdirSync(partDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((f) => {
          const raw = JSON.parse(
            fs.readFileSync(path.join(partDir, f), "utf-8"),
          );
          return normalizePart(raw.data || raw);
        });
    }

    const textParts = parts.filter((p) => p.type === "text").map((p) => p.text);
    const thinkingParts = parts
      .filter((p) => p.type === "thinking")
      .map((p) => p.text);
    const toolCalls = parts
      .filter((p) => p.type === "toolCall")
      .map((p) => ({
        tool: p.tool,
        input: p.input,
        output: null,
        status: p.status,
      }));

    return {
      index,
      role: msgData.role || "unknown",
      timestamp: msg.time_created
        ? new Date(msg.time_created).toISOString()
        : null,
      content: {
        text: textParts.join("\n") || null,
        thinking: thinkingParts.join("\n") || null,
        toolCalls,
      },
      model: msgData.modelID || null,
    };
  });

  // Try to load session metadata
  let sessionMeta = {};
  const sessionDir = path.join(storageDir, "session");
  if (fs.existsSync(sessionDir)) {
    for (const projDir of fs.readdirSync(sessionDir)) {
      const sessionFile = path.join(sessionDir, projDir, sessionId + ".json");
      if (fs.existsSync(sessionFile)) {
        sessionMeta = JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
        break;
      }
    }
  }

  return {
    session: {
      id: sessionId,
      platform: "opencode",
      type: "json-fallback",
      title: sessionMeta.title || null,
      turnCount: turns.length,
    },
    turns,
  };
}

// --- CLI ---

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

const dbPath = getArg("--db") || resolveDbPath();

if (args.includes("--list-projects")) {
  const db = openDb(dbPath);
  const projects = db
    .prepare("SELECT * FROM project ORDER BY time_updated DESC")
    .all();
  console.log(
    JSON.stringify(
      projects.map((p) => ({
        id: p.id,
        path: p.worktree,
        name: p.name,
        created: new Date(p.time_created).toISOString(),
        updated: new Date(p.time_updated).toISOString(),
      })),
      null,
      2,
    ),
  );
  db.close();
} else if (args.includes("--list-sessions")) {
  const projectId = getArg("--project");
  const db = openDb(dbPath);
  let query = "SELECT * FROM session";
  const params = [];
  if (projectId) {
    query += " WHERE project_id = ?";
    params.push(projectId);
  }
  query += " ORDER BY time_updated DESC";
  const sessions = db.prepare(query).all(...params);
  console.log(
    JSON.stringify(
      sessions.map((s) => ({
        id: s.id,
        projectId: s.project_id,
        title: s.title,
        created: new Date(s.time_created).toISOString(),
        updated: new Date(s.time_updated).toISOString(),
        cost: s.cost,
        tokensInput: s.tokens_input,
        tokensOutput: s.tokens_output,
      })),
      null,
      2,
    ),
  );
  db.close();
} else if (getArg("--session")) {
  const sessionId = getArg("--session");
  if (args.includes("--fallback")) {
    const storageDir = getArg("--storage-dir") || resolveStorageDir();
    console.log(
      JSON.stringify(extractFromJsonStorage(storageDir, sessionId), null, 2),
    );
  } else {
    const db = openDb(dbPath);
    console.log(JSON.stringify(extractSessionFromDb(db, sessionId), null, 2));
    db.close();
  }
} else if (args.includes("--all")) {
  const db = openDb(dbPath);
  const projectId = getArg("--project");
  let query = "SELECT id FROM session";
  const params = [];
  if (projectId) {
    query += " WHERE project_id = ?";
    params.push(projectId);
  }
  query += " ORDER BY time_created ASC";
  const sessions = db.prepare(query).all(...params);
  const results = sessions.map((s) => extractSessionFromDb(db, s.id));
  console.log(JSON.stringify(results, null, 2));
  db.close();
} else {
  console.log(`Usage:
  node extract_opencode.js --list-projects [--db path]
  node extract_opencode.js --list-sessions [--project <project-id>] [--db path]
  node extract_opencode.js --session <session-id> [--db path]
  node extract_opencode.js --session <session-id> --fallback [--storage-dir path]
  node extract_opencode.js --all [--project <project-id>] [--db path]`);
}
