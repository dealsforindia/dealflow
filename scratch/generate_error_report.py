import os
import re

src_dir = r'e:\Rudranildocs0066543\html-yt\rudranil-deals-web\src'
out_path = r'C:\Users\Neel\.gemini\antigravity-ide\brain\e2c344eb-349a-406f-8909-6a0d3e93abde\error_audit_report.md'

findings = []

error_render_patterns = [
    re.compile(r'\{[a-zA-Z0-9_]*error[a-zA-Z0-9_]*\s*&&', re.IGNORECASE),
    re.compile(r'\{[a-zA-Z0-9_]*err[a-zA-Z0-9_]*\s*&&', re.IGNORECASE),
    re.compile(r'role=["\']alert["\']', re.IGNORECASE),
    re.compile(r'is-error', re.IGNORECASE),
    re.compile(r'text-rose-|text-red-|bg-rose-|bg-red-|border-rose-|border-red-', re.IGNORECASE),
    re.compile(r'⚠️|🚨|❌|⛔', re.IGNORECASE),
]

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            rel_path = os.path.relpath(path, src_dir)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            for idx, line in enumerate(lines, 1):
                for p in error_render_patterns:
                    if p.search(line):
                        findings.append((rel_path, idx, line.strip()))
                        break

files_map = {}
for rel_path, idx, line in findings:
    files_map.setdefault(rel_path, []).append((idx, line))

with open(out_path, 'w', encoding='utf-8') as out:
    out.write(f"# Error Audit Report across rudranil-deals-web/src\n\nTotal items: {len(findings)}\n\n")
    for rel_path, items in sorted(files_map.items()):
        out.write(f"## `{rel_path}` ({len(items)} items)\n\n")
        for idx, line in items:
            out.write(f"- **L{idx}**: `{line}`\n")
        out.write("\n")

print(f"Report written to {out_path} with {len(findings)} items.")
