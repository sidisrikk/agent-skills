---
name: init-deep
description: Initialize, audit, prune, or rebuild sparse hierarchical AGENTS.md files. Use when the user asks to create or refresh repository agent instructions, or invokes /init-deep.
---

# init-deep

Build an **instruction map**, not a code index.

## Ownership

| Source          | Owns                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------- |
| CodeGraph       | Live topology, symbols, exports, references, call paths, and blast radius                 |
| `AGENTS.md`     | Stable intent, verified procedures, semantic boundaries, local deviations, and guardrails |
| Code and config | Authoritative current structure and executable commands                                   |

When descriptive guidance conflicts with inspected code or config, follow repository state and repair or report the stale claim. Explicit project policy and intent remain authoritative unless the repository provides a newer policy source.

Use repository search when CodeGraph is unavailable, unsupported, or uncertain. The fallback changes discovery mechanics, not content ownership: do not cache structural inventories in `AGENTS.md`.

## Inputs

- Default `update`: refresh qualified locations and report redundant existing children without removing them.
- `--prune`: in update mode, back up and remove reported redundant children.
- `--create-new`: read the existing hierarchy, preserve protected content, then rebuild the editable in-scope hierarchy.
- `--max-depth=N`: limit child placement; default `4`.

`--prune` is redundant with `--create-new`; ask the user to choose one mode if both are supplied. Files outside the requested root or maximum depth remain untouched.

Load [REFERENCE.md](REFERENCE.md) before step 1. It owns scope, evidence, activation, placement, protected-content, content-shape, and audit rules.

## Workflow

Track these five steps as live todos. Keep exactly one in progress.

### 1. Fix Scope

Parse mode and depth. Inventory tracked project files, existing instruction files, package or deployable boundaries, command/config sources, and protected regions. Apply reference exclusions, including `.codegraph/`.

Detect CodeGraph availability and index state. Respect pending-file or staleness warnings; do not treat warned results as current evidence.

For destructive modes, copy every removable file byte-for-byte to a reported temporary backup immediately before removal. VCS is additional recovery, not a substitute. Complete the protected-content ledger before any removal.

**Complete when:** mode, depth, exclusions, existing hierarchy, protected regions, recoverability, project boundaries, and CodeGraph state are recorded.

### 2. Explore in Parallel

Run four bounded, non-overlapping lanes:

1. semantic package and domain boundaries;
2. entry points and public surfaces, retaining only stable semantic findings;
3. commands, CI, tests, migrations, and deployment procedures;
4. conventions, vocabulary, policy sources, and safety guardrails.

Structural lanes use CodeGraph first. Configuration and policy lanes inspect authoritative files directly. Every delegated lane receives the tool protocol from [REFERENCE.md](REFERENCE.md), including the built-in-read activation requirement and search fallback conditions.

Add package-specific lanes only when the four base lanes cannot cover a major boundary. Merge results after every lane returns.

**Complete when:** every major boundary has evidence-backed coverage, every lane reports inspected scope and unresolved uncertainty, and volatile structural facts are separated from durable instruction candidates.

### 3. Place the Instruction Map

Always select root. Apply the instruction-value gate in [REFERENCE.md](REFERENCE.md) to each eligible child. File count, symbol density, exports, and centrality may prioritize exploration but never justify a child file.

Apply mode behavior:

- `update`: refresh qualifying locations; retain and report redundant existing locations.
- `update --prune`: refresh qualifying locations; back up and remove redundant locations.
- `--create-new`: back up and remove every editable, unselected in-scope `AGENTS.md`; rewrite selected locations; leave whole-file-managed locations unchanged.

Put shared rules in the nearest useful ancestor. Select a child only when it adds local behavioral value beyond that ancestor.

**Complete when:** the ledger records `select`, `retain`, `redundant`, or `remove` for every existing and candidate location, with an evidence-backed instruction-value reason.

### 4. Activate and Write Top-Down

Pass the activation gate in [REFERENCE.md](REFERENCE.md) before the first edit or write under each distinct local-instruction boundary. A CodeGraph source result or directory listing does not pass this gate.

Write root first, then independent children in parallel. Preserve protected sections byte-for-byte and honor whole-file ownership markers. Keep each file behavioral and sparse:

- Root: repository contract, semantic boundaries, high-level routing, verified procedures, global conventions, precedence, and hard guardrails.
- Child: local responsibility, commands, deviations, vocabulary, risks, stable routing, and required verification.

Point to authoritative policy documents instead of copying them. Leave live symbol, topology, caller/callee, export, and implementation-flow inventories to CodeGraph or repository search.

**Complete when:** every selected location has an instruction file, every protected region is unchanged, and every retained line changes agent behavior or materially improves stable routing.

### 5. Audit the Hierarchy

Read the generated hierarchy ancestor-to-child using the built-in file read. Apply every audit in [REFERENCE.md](REFERENCE.md): ownership, evidence, duplication, command validity, protected bytes, activation guidance, unresolved uncertainty, and hierarchy sparsity.

Report mode, depth, CodeGraph status or fallback, analyzed directories, created/updated/removed files, redundant retained locations, protected regions, line counts, hierarchy, backups, and exceptions.

**Complete when:** every generated file passes every audit rule, every reported path exists, and the on-disk hierarchy exactly matches the report.
