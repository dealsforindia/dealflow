"""Read-only source inventory. Does not import or execute reviewed modules."""
import ast
import hashlib
import json
import os
from pathlib import Path
import tokenize

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'.git', 'node_modules', '.venv', 'venv', '__pycache__', 'site-packages', '.python-deps'}
rows = []
paths = []
for folder, dirs, files in os.walk(ROOT):
    dirs[:] = [name for name in dirs if name not in SKIP]
    paths.extend(Path(folder) / name for name in files if name.endswith('.py'))
for path in sorted(paths):
    relative = path.relative_to(ROOT)
    if any(part in SKIP for part in relative.parts):
        continue
    if path == Path(__file__).resolve():
        continue
    row = {'path': relative.as_posix()}
    try:
        raw = path.read_bytes()
        with tokenize.open(path) as stream:
            source = stream.read()
        row.update(bytes=len(raw), lines=len(source.splitlines()), sha256=hashlib.sha256(raw).hexdigest())
        tree = ast.parse(source, filename=str(relative))
        row['imports'] = sorted({node.module or '' for node in ast.walk(tree) if isinstance(node, ast.ImportFrom)} | {a.name for node in ast.walk(tree) if isinstance(node, ast.Import) for a in node.names})
        row['definitions'] = [{'name': node.name, 'line': node.lineno, 'end': node.end_lineno} for node in tree.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef))]
        names = {}
        for item in row['definitions']:
            names.setdefault(item['name'], []).append(item['line'])
        row['duplicate_definitions'] = {name: lines for name, lines in names.items() if len(lines) > 1}
        row['signals'] = {}
        patterns = ('random.uniform', 'random.randint', 'verify=False', 'ready_to_dispatch', 'deals:price_update', 'delete_many(', 'drop_collection(', 'except Exception', 'time.sleep(', 'requests.get(', 'requests.post(')
        for pattern in patterns:
            matches = [i for i, line in enumerate(source.splitlines(), 1) if pattern in line]
            if matches:
                row['signals'][pattern] = matches
        row['status'] = 'read_and_parsed'
    except Exception as error:
        row['status'] = type(error).__name__
        row['error'] = str(error)
    rows.append(row)
output = ROOT / 'scratch' / 'python-source-inventory.json'
output.write_text(json.dumps(rows, indent=2), encoding='utf-8')
print(json.dumps({'files': len(rows), 'bytes': sum(r.get('bytes', 0) for r in rows), 'lines': sum(r.get('lines', 0) for r in rows), 'unreadable_or_invalid': [r for r in rows if r['status'] != 'read_and_parsed'], 'duplicates': {r['path']: r['duplicate_definitions'] for r in rows if r.get('duplicate_definitions')}, 'inventory': str(output)}, indent=2))
