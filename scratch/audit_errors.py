import os
import re

src_dir = r'e:\Rudranildocs0066543\html-yt\rudranil-deals-web\src'

findings = []

error_render_patterns = [
    re.compile(r'\{[a-zA-Z0-9_]*error[a-zA-Z0-9_]*\s*&&', re.IGNORECASE),
    re.compile(r'\{[a-zA-Z0-9_]*err[a-zA-Z0-9_]*\s*&&', re.IGNORECASE),
    re.compile(r'role=["\']alert["\']', re.IGNORECASE),
    re.compile(r'class(?:Name)?=["\'][^"\']*(?:error|warning|failed|invalid|alert)[^"\']*["\']', re.IGNORECASE),
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
                # check if this line renders or contains error indicators in JSX
                for p in error_render_patterns:
                    if p.search(line):
                        findings.append((rel_path, idx, line.strip()))
                        break

print(f"Total error-like lines found: {len(findings)}")
# Group by file
files_map = {}
for rel_path, idx, line in findings:
    files_map.setdefault(rel_path, []).append((idx, line))

for rel_path, items in sorted(files_map.items()):
    print(f"\n=== {rel_path} ({len(items)} items) ===")
    for idx, line in items[:15]:
        print(f"  L{idx}: {line[:120]}")
