# AGENTS.md

## Skill catalog

- Edit the publishable source under `skills/<folder>/<name>/` (folder meanings: README's Repository Structure), not the installed copies in `.agents/skills/`. The root `skills-lock.json` is local install state; both are Git-ignored.
- Match the installer groups and README sections to the skill folders `core`, `core-diy`, and `wip`.
- When adding, moving, renaming, or removing a skill, update `.claude-plugin/marketplace.json` and the README. List each skill once in the matching plugin's `skills` array using its explicit directory path `./skills/<group>/<name>`.
- Keep published skill paths stable: installers record `skillPath` in their lockfiles. Keep references and helper scripts inside the skill directory so they travel with a standalone install.

## Verification

- Run `scripts/check-catalog.sh` (offline; the pre-commit hook runs it after `git config core.hooksPath .githooks`). It checks skill folders, manifest entries, and README links. It does not check prose, so reread the README and this file after a move.
- Run `DISABLE_TELEMETRY=1 npx -y skills add . --list` to check installer grouping. Confirm the three groups match the skill folders and every listed skill appears in its group.
