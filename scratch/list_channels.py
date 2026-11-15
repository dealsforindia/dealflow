import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('dealbot_backend/dealbot/channel_aliases.py', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
channels = []
for group in re.findall(r'\[(.*?)\]', text, re.DOTALL):
    for item in re.findall(r'"(.*?)"', group):
        if not item.startswith('-') and not item.startswith('http') and not item.isdigit():
            channels.append(item.lower())

print("Found channels:", sorted(list(set(channels))))

