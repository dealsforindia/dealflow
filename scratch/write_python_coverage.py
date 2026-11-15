"""Render the saved source inventories into a human-readable coverage ledger."""
from collections import Counter
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
local = json.loads((root / 'scratch/python-source-inventory.json').read_text(encoding='utf-8'))
remote = json.loads((root / 'scratch/vm-python-source-inventory.json').read_text(encoding='utf-8'))
lines = ['# Python source coverage', '', 'Generated from read-only source inventories. Read/parse status is static coverage, not a complete semantic or runtime verification guarantee.', '', 'Excluded dependency directories: .git, node_modules, venv, .venv, __pycache__, site-packages, .python-deps.', '', '## Local workspace', '', '| Source file | Lines | Status | Top-level definitions |', '|---|---:|---|---:|']
for row in local:
    target = (root / row['path']).as_posix()
    lines.append(f"| [{row['path']}](<{target}>) | {row.get('lines', 0)} | {row['status']} | {len(row.get('definitions', []))} |")
lines += ['', '## VM: /home/rudranil777/dealbot', '', '| Source file | Lines | Status | Top-level definitions |', '|---|---:|---|---:|']
for row in sorted(remote, key=lambda item: item['path']):
    lines.append(f"| `{row['path']}` | {row.get('lines', 0)} | {row['status']} | {len(row.get('definitions', []))} |")
(root / 'scratch/python-source-coverage.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(json.dumps({'local_files': len(local), 'vm_files': len(remote), 'local_categories': dict(Counter(row['path'].split('/')[0] if '/' in row['path'] else 'root_scripts' for row in local))}, indent=2))
report = root / 'scratch/python-backend-review-2026-10-11.md'
text = report.read_text(encoding='utf-8')
text = text.replace('worker.py:2722', 'worker.py:2721').replace('api.py:1802', 'api.py:1795').replace('api.py:1840–1841', 'api.py:1841–1842').replace('heat_score.py:104', 'heat_score.py:107').replace('oos_expiry_worker.py:290', 'oos_expiry_worker.py:286')
report.write_text(text, encoding='utf-8')
