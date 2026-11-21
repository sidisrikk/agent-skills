#!/usr/bin/env bash
# Offline catalog check: skill dirs <-> marketplace manifest <-> README links.
cd "$(dirname "$0")/.." && python3 - <<'PY'
import json, re, glob, os, sys
err = []
paths = [p for pl in json.load(open('.claude-plugin/marketplace.json'))['plugins'] for p in pl['skills']]
paths = [p[2:] for p in paths]
for p in set(p for p in paths if paths.count(p) > 1):
    err.append(f'manifest lists twice: {p}')
for p in paths:
    if not os.path.isfile(f'{p}/SKILL.md'):
        err.append(f'manifest path has no SKILL.md: {p}')
for f in glob.glob('skills/*/*/SKILL.md'):
    d = os.path.dirname(f)
    if d not in paths:
        err.append(f'skill not in manifest: {d}')
for t in re.findall(r'\]\((skills/[^)#]+)\)', open('README.md').read()):
    if not os.path.exists(t):
        err.append(f'README link is broken: {t}')
print('\n'.join(err) or 'catalog ok')
sys.exit(1 if err else 0)
PY
