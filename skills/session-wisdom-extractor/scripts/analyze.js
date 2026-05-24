#!/usr/bin/env node
/**
 * Session Analyzer
 *
 * Analyzes normalized session data to extract patterns, wisdom, and insights.
 * Reads unified JSON from stdin or file.
 *
 * Usage:
 *   node extract_claude.js --project /path | node analyze.js
 *   node analyze.js --input session.json
 *   node analyze.js --input session.json --format case-study
 *   node analyze.js --input session.json --format patterns
 *   node analyze.js --input session.json --format stats
 */

const fs = require("fs");

// --- Read input ---

function readInput() {
  const inputFile =
    process.argv.indexOf("--input") >= 0
      ? process.argv[process.argv.indexOf("--input") + 1]
      : null;

  if (inputFile) {
    return JSON.parse(fs.readFileSync(inputFile, "utf-8"));
  }

  // Read from stdin
  const chunks = [];
  const fd = fs.openSync("/dev/stdin", "r");
  const buf = Buffer.alloc(65536);
  let bytesRead;
  while ((bytesRead = fs.readSync(fd, buf, 0, buf.length)) > 0) {
    chunks.push(buf.slice(0, bytesRead).toString());
  }
  return JSON.parse(chunks.join(""));
}

// --- Analysis functions ---

function analyzeToolUsage(sessions) {
  const toolFreq = {};
  const toolSequences = [];

  for (const session of sessions) {
    const turns = session.turns || [];
    let currentSequence = [];

    for (const turn of turns) {
      const calls = turn.content?.toolCalls || [];
      for (const call of calls) {
        toolFreq[call.tool] = (toolFreq[call.tool] || 0) + 1;
        currentSequence.push(call.tool);
      }
      if (calls.length === 0 && currentSequence.length > 0) {
        toolSequences.push([...currentSequence]);
        currentSequence = [];
      }
    }
    if (currentSequence.length > 0) toolSequences.push(currentSequence);
  }

  // Find common sequences (bigrams)
  const bigrams = {};
  for (const seq of toolSequences) {
    for (let i = 0; i < seq.length - 1; i++) {
      const key = `${seq[i]} → ${seq[i + 1]}`;
      bigrams[key] = (bigrams[key] || 0) + 1;
    }
  }

  return {
    frequency: Object.entries(toolFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([tool, count]) => ({ tool, count })),
    commonSequences: Object.entries(bigrams)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([sequence, count]) => ({ sequence, count })),
    totalToolCalls: Object.values(toolFreq).reduce((a, b) => a + b, 0),
  };
}

function analyzeConversationPatterns(sessions) {
  const patterns = {
    avgTurnsPerSession: 0,
    longestSession: null,
    shortestSession: null,
    userPromptLengths: [],
    assistantResponseLengths: [],
    thinkingPresence: 0,
    totalSessions: sessions.length,
  };

  let totalTurns = 0;
  let thinkingSessions = 0;

  for (const session of sessions) {
    const turns = session.turns || [];
    totalTurns += turns.length;

    const turnCount = turns.length;
    if (!patterns.longestSession || turnCount > patterns.longestSession.turns) {
      patterns.longestSession = {
        id: session.session?.id,
        turns: turnCount,
        title: session.session?.title,
      };
    }
    if (
      !patterns.shortestSession ||
      turnCount < patterns.shortestSession.turns
    ) {
      patterns.shortestSession = {
        id: session.session?.id,
        turns: turnCount,
        title: session.session?.title,
      };
    }

    let hasThinking = false;
    for (const turn of turns) {
      if (turn.role === "user" && turn.content?.text) {
        patterns.userPromptLengths.push(turn.content.text.length);
      }
      if (turn.role === "assistant" && turn.content?.text) {
        patterns.assistantResponseLengths.push(turn.content.text.length);
      }
      if (turn.content?.thinking) hasThinking = true;
    }
    if (hasThinking) thinkingSessions++;
  }

  patterns.avgTurnsPerSession =
    sessions.length > 0 ? Math.round(totalTurns / sessions.length) : 0;
  patterns.thinkingPresence =
    sessions.length > 0
      ? Math.round((thinkingSessions / sessions.length) * 100)
      : 0;

  const avgPromptLen =
    patterns.userPromptLengths.length > 0
      ? Math.round(
          patterns.userPromptLengths.reduce((a, b) => a + b, 0) /
            patterns.userPromptLengths.length,
        )
      : 0;
  const avgResponseLen =
    patterns.assistantResponseLengths.length > 0
      ? Math.round(
          patterns.assistantResponseLengths.reduce((a, b) => a + b, 0) /
            patterns.assistantResponseLengths.length,
        )
      : 0;

  return {
    totalSessions: patterns.totalSessions,
    avgTurnsPerSession: patterns.avgTurnsPerSession,
    longestSession: patterns.longestSession,
    shortestSession: patterns.shortestSession,
    avgUserPromptLength: avgPromptLen,
    avgAssistantResponseLength: avgResponseLen,
    thinkingPresencePercent: patterns.thinkingPresence,
  };
}

function analyzeErrorPatterns(sessions) {
  const errors = [];

  for (const session of sessions) {
    for (const turn of session.turns || []) {
      for (const call of turn.content?.toolCalls || []) {
        if (call.status === "error") {
          errors.push({
            session: session.session?.id,
            tool: call.tool,
            input: call.input,
            timestamp: turn.timestamp,
          });
        }
      }
    }
  }

  const errorsByTool = {};
  for (const e of errors) {
    errorsByTool[e.tool] = (errorsByTool[e.tool] || 0) + 1;
  }

  return {
    totalErrors: errors.length,
    byTool: Object.entries(errorsByTool)
      .sort((a, b) => b[1] - a[1])
      .map(([tool, count]) => ({ tool, count })),
    recentErrors: errors.slice(-10),
  };
}

function extractWisdom(sessions) {
  const insights = [];

  // Find sessions with effective problem-solving
  for (const session of sessions) {
    const turns = session.turns || [];
    const userTurns = turns.filter((t) => t.role === "user");
    const assistantTurns = turns.filter((t) => t.role === "assistant");

    // Extract effective prompts (short prompts that led to multi-tool responses)
    for (let i = 0; i < userTurns.length; i++) {
      const userTurn = userTurns[i];
      const nextAssistant = turns.find(
        (t) => t.role === "assistant" && t.index > userTurn.index,
      );
      if (
        nextAssistant &&
        userTurn.content?.text?.length < 200 &&
        (nextAssistant.content?.toolCalls?.length || 0) >= 2
      ) {
        insights.push({
          type: "effective-prompt",
          prompt: userTurn.content.text,
          toolsTriggered: nextAssistant.content.toolCalls.map((c) => c.tool),
          session: session.session?.id,
        });
      }
    }

    // Identify iteration patterns (same tool called multiple times)
    const toolCallsByTurn = turns
      .filter((t) => t.content?.toolCalls?.length > 0)
      .map((t) => t.content.toolCalls.map((c) => c.tool))
      .flat();

    const toolCounts = {};
    for (const t of toolCallsByTurn) {
      toolCounts[t] = (toolCounts[t] || 0) + 1;
    }

    const iteratedTools = Object.entries(toolCounts)
      .filter(([, count]) => count > 3)
      .map(([tool, count]) => ({ tool, count }));

    if (iteratedTools.length > 0) {
      insights.push({
        type: "iteration-heavy",
        session: session.session?.id,
        title: session.session?.title,
        tools: iteratedTools,
      });
    }
  }

  return insights;
}

function generateCaseStudy(session) {
  const turns = session.turns || [];
  const meta = session.session || {};

  let md = `# Case Study: ${meta.title || meta.id}\n\n`;
  md += `## Context\n`;
  md += `- **Platform**: ${meta.platform || "unknown"}\n`;
  md += `- **Project**: ${meta.project || "unknown"}\n`;
  md += `- **Duration**: ${meta.startTime} → ${meta.endTime}\n`;
  md += `- **Turns**: ${turns.length}\n\n`;

  md += `## Key Interactions\n\n`;

  let stepNum = 1;
  for (const turn of turns) {
    if (turn.role === "user" && turn.content?.text) {
      md += `### Step ${stepNum}: User Request\n`;
      md += `> ${turn.content.text.slice(0, 500)}\n\n`;
    } else if (turn.role === "assistant") {
      if (turn.content?.toolCalls?.length > 0) {
        const tools = turn.content.toolCalls
          .map((c) => `\`${c.tool}\``)
          .join(", ");
        md += `### Step ${stepNum}: Agent Action\n`;
        md += `**Tools used**: ${tools}\n\n`;
      }
      if (turn.content?.text) {
        md += `### Step ${stepNum}: Agent Response\n`;
        md += `> ${turn.content.text.slice(0, 300)}...\n\n`;
      }
    }
    stepNum++;
  }

  md += `## Lessons Learned\n\n`;
  md += `1. _[Analyze the interaction patterns above to extract insights]_\n`;
  md += `2. _[Identify what made certain prompts effective]_\n`;
  md += `3. _[Note tool selection strategies that worked well]_\n\n`;

  return md;
}

// --- Main ---

const data = readInput();
const sessions = Array.isArray(data) ? data : [data];

const format =
  process.argv.indexOf("--format") >= 0
    ? process.argv[process.argv.indexOf("--format") + 1]
    : "stats";

switch (format) {
  case "stats": {
    const result = {
      conversationPatterns: analyzeConversationPatterns(sessions),
      toolUsage: analyzeToolUsage(sessions),
      errorPatterns: analyzeErrorPatterns(sessions),
      wisdom: extractWisdom(sessions),
    };
    console.log(JSON.stringify(result, null, 2));
    break;
  }
  case "patterns": {
    const result = {
      toolUsage: analyzeToolUsage(sessions),
      wisdom: extractWisdom(sessions),
    };
    console.log(JSON.stringify(result, null, 2));
    break;
  }
  case "case-study": {
    // Generate case study for the first (or only) session
    console.log(generateCaseStudy(sessions[0]));
    break;
  }
  default:
    console.error(
      "Unknown format:",
      format,
      "\nSupported: stats, patterns, case-study",
    );
    process.exit(1);
}
