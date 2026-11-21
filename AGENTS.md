# AGENTS.md

## Skill catalog

- Edit the publishable source under `skills/{core,wip}/<name>/`, not the installed copies in `.agents/skills/`. The root `skills-lock.json` is local install state; both are Git-ignored.
- Keep `core` and `wip` as the two installer groups. WIP skills are experimental but intentionally visible. The README's topical headings are for browsing, not installer groups.
- Vercel's `skills` CLI groups by plugin entries in `.claude-plugin/marketplace.json`, not by folder name. When adding, moving, renaming, or removing a skill, update both the manifest and README. Each skill belongs in exactly one plugin's `skills` array as an explicit `./skills/<group>/<name>` directory path, not a `SKILL.md` path. Unlisted skills lose their group.
- Keep published skill paths stable: installers record `skillPath` in their lockfiles. Keep references and helper scripts inside the skill directory so they travel with a standalone install.

## Verification

- From the repo root, run `DISABLE_TELEMETRY=1 npx -y skills add . --list` to check the working tree without installing. Confirm changed skills appear under the intended `Core` or `Wip` heading and none fall into `General`/`Other`. This checks discovery and grouping, not helper script behavior.
