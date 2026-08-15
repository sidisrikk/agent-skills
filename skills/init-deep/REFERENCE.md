# init-deep reference

Load this file before discovery and keep it available through audit.

## Scope and Inventory

### Eligible Locations

Root is always eligible. A child is eligible when it:

- is inside the requested root and maximum depth;
- contains tracked project files, owns an operational lifecycle, or is an explicit policy boundary;
- is not excluded below.

Use tracked files as project inventory in Git repositories. Otherwise use filesystem inventory plus repository ignore files. Enumerate existing in-scope `AGENTS.md` files separately from the filesystem so untracked instructions are not missed. Existing instruction files are evidence, not proof that their locations still qualify.

### Exclusions

Always exclude `.codegraph/`. It is a generated local database, not repository guidance.

Exclude VCS metadata, dependencies, vendored code, caches, coverage, binary assets, and untracked build output. Honor repository ignore files. Common examples include `.git`, `node_modules`, `vendor`, `dist`, `build`, `coverage`, `.next`, `.nx`, `.turbo`, and language caches.

Tracked generated-source directories may qualify only when they need an explicit generated-code guardrail. Inspect their generator or config rather than inventorying generated contents. Put the guardrail in the nearest non-generated ancestor when generation would overwrite a child `AGENTS.md`.

All modes leave files outside the requested root or maximum depth untouched. Removal applies only to files named exactly `AGENTS.md`; similarly named files remain untouched.

## Evidence and Authority

Every generated instruction needs durable repository evidence:

- explicit policy or existing repository instruction;
- package, build, CI, test, migration, or deployment config;
- representative source showing a project-specific convention;
- manifest or deployment config proving an independent boundary;
- CodeGraph-assisted discovery that is confirmed by code or config when expressed as stable intent.

CodeGraph output is transient structural evidence. Use it to find and understand relevant source, not as material for symbol lists, caller/callee lists, export inventories, topology trees, or current implementation flows.

Verify command names, flags, working directories, and required order against config or safe tooling output. Never run destructive, production, release, or migration commands merely to verify them.

Use this precedence:

```md
Code and configuration are authoritative for current structure.
AGENTS.md is authoritative for explicit project policy and intent.
When a descriptive AGENTS.md claim conflicts with inspected code or config,
follow the repository state and report or repair the stale claim.
```

Do not guess through conflicting or incomplete evidence. Record unresolved uncertainty in working notes and the final report; omit uncertain guidance.

## CodeGraph Protocol

When the project is indexed, use CodeGraph first for topology, symbols, references, call paths, and impact. Check status when the integration exposes it. If results report pending or stale files, wait and re-query or inspect those files directly with the built-in read tool; record the fallback.

Use built-in file reads for:

- instruction activation;
- existing `AGENTS.md` and policy documents;
- manifests, scripts, CI, and configuration;
- unresolved or stale CodeGraph coverage.

Use repository search for structural discovery only when CodeGraph has no index, lacks coverage, reports unresolved uncertainty, or is unavailable. Do not initialize or modify a CodeGraph index unless the user asks.

Give every structural exploration lane this protocol:

```text
Use CodeGraph first for topology, symbols, references, call paths, and impact.
Use built-in Read for configuration, commands, policies, existing AGENTS.md,
and local-instruction activation. Fall back to repository search only when
CodeGraph has no index, lacks coverage, reports staleness, or leaves a named
uncertainty unresolved. Return durable instruction candidates separately from
volatile structural observations. Do not turn graph inventories into AGENTS.md.
```

### Activation Gate

OpenCode resolves applicable child instructions through its built-in file read. CodeGraph source retrieval, edit/write calls, and directory listings do not perform the same activation.

Before the first edit or write under each distinct local-instruction boundary:

1. Use OpenCode's built-in read on an existing target or sibling file below that boundary with `limit: 1`.
2. Treat this as instruction activation, not structural re-verification; it is required even when CodeGraph already returned the source.
3. If the destination has no existing source file, read its nearest applicable `AGENTS.md` directly before writing.
4. If no applicable `AGENTS.md` exists, record that no activation read is possible and proceed.
5. Repeat once for every distinct boundary touched by the task.

Record `boundary | activation read path` in working notes. Reading a directory does not pass the gate.

When CodeGraph is available or configured for the repository, include this compact rule in the root file:

```md
## CodeGraph and local instructions

Use CodeGraph for discovery, source relationships, call paths, and impact.

Before the first edit or write within each distinct local-instruction boundary,
use OpenCode's built-in read on an existing target or sibling file with
`limit: 1`. This loads applicable nested AGENTS.md files and is required even
when CodeGraph already returned the source. A directory listing does not
activate instructions.

For a destination with no existing source file, read its nearest applicable
AGENTS.md directly before writing. If none exists, proceed without an activation
read. Repeat once per distinct local-instruction boundary.
```

## Exploration Lanes

Start the four lanes from `SKILL.md` in parallel. Cap total lanes at eight. Add lanes because evidence cannot be covered within the base split, not because a repository crosses a file-count threshold. Group related packages when the cap would otherwise be exceeded.

| Lane                             | Primary evidence                                             | Durable output                                                    |
| -------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| Semantic boundaries              | CodeGraph plus manifests and deployment config               | Major responsibilities, domain vocabulary, forbidden dependencies |
| Entry points and public surfaces | CodeGraph plus package config                                | Only stable, non-obvious routing or compatibility obligations     |
| Commands and lifecycle           | Package, build, CI, test, migration, and deployment config   | Copyable commands, working directory, order, safety constraints   |
| Conventions and guardrails       | Existing instructions, policy, config, representative source | Local rules, reasons, traps, and authoritative links              |

Each lane returns:

- inspected scope;
- evidence paths;
- durable instruction candidates;
- volatile observations used only for exploration;
- unresolved uncertainty.

A lane with no instruction candidates still returns scope and evidence so coverage gaps remain visible.

## Instruction-Value Gate

Always select root. Select a child only when at least one substantial reason below adds guidance that does not belong in its parent:

| Qualifying reason                                                                       | Required evidence                                           |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Local rule or convention differs from the parent                                        | Config, policy, or representative source                    |
| Destructive, security-sensitive, public-contract, migration, or generated-code boundary | Policy, config, ownership marker, or operational script     |
| Separate build, test, deploy, migration, or release procedure                           | Verified command source and working directory               |
| Independent package or deployable lifecycle                                             | Manifest, workspace, CI, or deployment config               |
| Distinct domain responsibility or vocabulary                                            | Domain docs plus corroborating code/config                  |
| Non-obvious stable task routing                                                         | Repeated semantic boundary confirmed by manifests or source |

A child fails the gate when it would contain only a directory description, standard framework guidance, or facts inherited from its parent. File count, child breadth, code ratio, symbol density, export count, and reference centrality are worth `0` for placement; use them only to prioritize exploration.

Before selecting a child, state the concrete line that would change agent behavior there. If no such line exists, keep the guidance in the parent or omit it.

Record the placement ledger before writing:

```text
path | select/retain/redundant/remove | qualifying reason | evidence
```

Mode rules:

- `update`: update qualifying files; leave redundant existing files in place and report them.
- `update --prune`: back up redundant existing files, then remove them after the ledger is complete.
- `--create-new`: back up and remove every editable, unselected in-scope `AGENTS.md`, rewrite selected locations, and leave whole-file-managed locations unchanged.
- A location containing a protected tool-managed block remains selected unless the owning tool explicitly supports relocation.

Put a rule in the highest ancestor where it is valid and useful. A child stores only local differences, deeper operational detail, or risk that would distract at the parent.

If no child passes the gate, produce a concise root-only hierarchy. Root-only is a valid result, not incomplete exploration.

## Protected Content

Inventory protected bytes before editing:

- tool-managed marker-fenced sections, including CodeGraph installer blocks;
- user-marked protected sections;
- generated-file or whole-file ownership markers.

Preserve marker-fenced sections byte-for-byte, including markers, whitespace, and line endings. Capture their original byte slices or checksums and compare them during audit. Write new guidance around these sections rather than paraphrasing, moving, or recreating them.

When a marker declares the whole file tool-managed or generated, leave the file unchanged and report the ownership constraint. Do not relocate a managed block unless the owning tool's instructions explicitly allow it.

Immediately before any removal, copy the current file byte-for-byte to a temporary backup outside the repository and report its path. VCS is additional recovery, not a substitute, because it may not contain uncommitted bytes. A protected location cannot be pruned merely because its handwritten guidance is redundant.

## Content Shape

Size is a budget, not a quota. Prefer root files under 120 lines and child files under 60 lines. There is no minimum. Exceed a budget only for unique, live instructions and explain the exception.

### Root Contract

Include only useful repository-wide material:

1. purpose and conceptual architecture in a few stable lines;
2. major semantic or package boundaries;
3. high-level task routing where the destination is non-obvious;
4. verified repository-wide commands, working directories, and required order;
5. repository-specific conventions and domain vocabulary;
6. security, compatibility, generated-code, migration, and operational guardrails;
7. links to authoritative policy documents;
8. evidence/authority precedence;
9. CodeGraph activation rule when applicable;
10. pointers to selected child instruction files when they improve routing.

### Child Contract

Include only locally applicable material:

1. responsibility and domain distinction;
2. local commands and required verification;
3. conventions or procedures that differ from ancestors;
4. public-contract, security, generated-code, migration, or destructive-operation guardrails;
5. non-obvious stable routing or entry points when they change where an agent works;
6. local traps and links to authoritative policy.

### Leave to Live Discovery

Do not include:

- exhaustive directory or file trees;
- symbol, export, caller, callee, or centrality inventories;
- current blast-radius or affected-test lists;
- exact implementation call paths or control-flow walkthroughs;
- fine-grained task-to-file maps that ordinary discovery can answer;
- framework advice that applies outside this repository.

## Writing Rules

- Write imperative, repository-specific guidance with exact paths and commands.
- Put each instruction in one authoritative location.
- Explain why a non-obvious boundary exists; inspect live code for how it is implemented.
- Preserve repository vocabulary and meaningful domain distinctions.
- Keep commands copyable, including required flags and working directory.
- Link to long policy documents instead of copying them.
- Update an editable existing target in place; create only a missing target.
- Remove stale descriptive claims rather than adding compatibility prose around them.
- Retain a line only when it changes behavior or materially improves stable routing.

## Audit

Check every generated or updated file against every item:

- every path and policy pointer resolves;
- every command and required order is verified without destructive execution;
- every instruction has durable evidence in working notes;
- current structure claims agree with code and config;
- explicit policy remains distinguishable from descriptive observations;
- no live structural inventory duplicates CodeGraph or routine search;
- every child passes the instruction-value gate and adds meaning beyond ancestors;
- redundant existing children are reported or removed according to mode;
- protected byte slices or checksums are unchanged;
- whole-file ownership markers were honored;
- the root contains the activation rule when CodeGraph is applicable, unless whole-file ownership prevents the edit and the report records the missing rule;
- every touched boundary has a recorded activation read;
- no path inside `.codegraph/` is selected and its contents are never treated as repository guidance;
- line budgets are met or exceptions are justified;
- every uncertainty and fallback is reported;
- on-disk `AGENTS.md` search within scope matches the reported hierarchy.

## Final Report

```text
=== init-deep complete ===
Mode: {update | update --prune | create-new}
Maximum depth: {N}
CodeGraph: {current | stale/pending handling | unavailable fallback}
Directories analyzed: {N}

Created:
- {path} ({lines} lines)
Updated:
- {path} ({lines} lines)
Removed:
- {path}
Redundant but retained:
- {path} -> {reason}
Protected:
- {path or marker} -> {preservation result}
Backups:
- {original} -> {backup path}

Hierarchy:
{tree}

Fallbacks and uncertainty:
- {tool/coverage issue -> handling}
Exceptions:
- {budget, placement, or ownership exception -> reason}
```

Use `None` for empty sections so omission cannot hide unfinished work.
