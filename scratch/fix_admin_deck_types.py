import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'e:\Rudranildocs0066543\html-yt\tg-setup\src\app\App.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\r\n', b'\r\n')
text = raw.decode('utf-8')

changes = []

# 1. Add pendingRedirection to Deal interface (after is_multi_deal field)
old1 = '  is_multi_deal?: boolean;\r\n  multi_deal_count?: number;\r\n  multi_items?: Array<{ label: string; url: string; price?: number | null; discount?: number | null }>;\r\n}'
new1 = '  is_multi_deal?: boolean;\r\n  multi_deal_count?: number;\r\n  multi_items?: Array<{ label: string; url: string; price?: number | null; discount?: number | null }>;\r\n  pendingRedirection?: boolean;\r\n}'
if old1 in text:
    text = text.replace(old1, new1, 1)
    changes.append('Deal interface: added pendingRedirection field')
else:
    changes.append('Deal interface: PATTERN NOT FOUND')

# 2. Add pending_redirection to RawDeal interface (after is_breakout_surge)
old2 = '  is_breakout_surge?: boolean;\r\n}'
new2 = '  is_breakout_surge?: boolean;\r\n  pending_redirection?: boolean;\r\n}'
count2 = text.count(old2)
if count2 == 1:
    text = text.replace(old2, new2, 1)
    changes.append('RawDeal interface: added pending_redirection field')
else:
    changes.append(f'RawDeal interface: found {count2} occurrences (expected 1)')

# 3. Map pendingRedirection in mapRawToDeal (after multi_items line)
old3 = '    multi_items: d.multi_items || (d as any).multi_items || [],\r\n  };\r\n}'
new3 = '    multi_items: d.multi_items || (d as any).multi_items || [],\r\n    pendingRedirection: Boolean((d as any).pending_redirection),\r\n  };\r\n}'
if old3 in text:
    text = text.replace(old3, new3, 1)
    changes.append('mapRawToDeal: mapped pendingRedirection')
else:
    changes.append('mapRawToDeal: PATTERN NOT FOUND')

with open(path, 'wb') as f:
    f.write(text.encode('utf-8'))

for c in changes:
    print(c)

