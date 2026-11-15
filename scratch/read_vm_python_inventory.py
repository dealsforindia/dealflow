"""Inventory remote Python sources over SSH; never execute reviewed modules."""
import json
from pathlib import Path
import subprocess

program = r'''
import ast, hashlib, json, os, tokenize
from pathlib import Path
root = Path('/home/rudranil777/dealbot')
rows = []
for folder, dirs, names in os.walk(root):
    dirs[:] = [d for d in dirs if d not in {'.git', 'node_modules', 'venv', '.venv', '__pycache__', 'site-packages'}]
    for name in sorted(names):
        if not name.endswith('.py'): continue
        p = Path(folder)/name
        row = {'path':str(p.relative_to(root))}
        try:
            raw = p.read_bytes()
            with tokenize.open(p) as f: source = f.read()
            row.update(bytes=len(raw), lines=len(source.splitlines()), sha256=hashlib.sha256(raw).hexdigest())
            tree = ast.parse(source)
            row['definitions'] = [{'name':n.name,'line':n.lineno,'end':n.end_lineno} for n in tree.body if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef))]
            row['imports'] = sorted({n.module or '' for n in ast.walk(tree) if isinstance(n,ast.ImportFrom)} | {a.name for n in ast.walk(tree) if isinstance(n,ast.Import) for a in n.names})
            row['status'] = 'read_and_parsed'
        except Exception as e: row.update(status=type(e).__name__,error=str(e))
        rows.append(row)
print(json.dumps(rows))
'''
proc = subprocess.run(['ssh','-o','BatchMode=yes','-o','ConnectTimeout=5','-o','StrictHostKeyChecking=yes','rudranil777@74.225.250.0','python3','-'], input=program, text=True, capture_output=True, timeout=90)
if proc.returncode:
    raise SystemExit(proc.stderr)
rows = json.loads(proc.stdout)
root = Path(__file__).resolve().parents[1]
(root/'scratch/vm-python-source-inventory.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
local = json.loads((root/'scratch/python-source-inventory.json').read_text(encoding='utf-8'))
by_name = {r['path'].removeprefix('dealbot_backend/dealbot/'):r for r in local if r['path'].startswith('dealbot_backend/dealbot/')}
print(json.dumps({'vm_files':len(rows),'vm_lines':sum(r.get('lines',0) for r in rows),'unreadable_or_invalid':[r for r in rows if r['status'] != 'read_and_parsed'],'different_local_modules':[r['path'] for r in rows if r['path'] in by_name and r.get('sha256') != by_name[r['path']].get('sha256')],'vm_only_modules':[r['path'] for r in rows if '/' not in r['path'] and r['path'] not in by_name]},indent=2))
