import pathlib, re

txt = pathlib.Path('nilotpal-saha-portfolio/index.html').read_text(encoding='utf-8', errors='ignore')
lines = txt.splitlines()
print(f"Total lines: {len(lines)}")
for idx, line in enumerate(lines):
    if '<section' in line or '<header' in line or '<footer' in line:
        print(f"Line {idx+1}: {line.strip()[:100]}")

