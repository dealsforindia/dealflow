import sys
sys.stdout.reconfigure(encoding='utf-8')

# Fix worker.py: remove " (Resolving Link)" suffix from title
path = r'e:\Rudranildocs0066543\html-yt\dealbot_backend\dealbot\worker.py'
with open(path, 'rb') as f:
    raw = f.read()

# Normalize any double-CRLF
raw = raw.replace(b'\r\r\n', b'\r\n')

old = b'"title": (title or "Special Offer") + " (Resolving Link)",'
new = b'"title": title or "Special Offer",\n                        "prod_name": title or "Special Offer",'

if old in raw:
    raw = raw.replace(old, new, 1)
    with open(path, 'wb') as f:
        f.write(raw)
    print("worker.py: fixed - removed (Resolving Link) suffix, added prod_name field")
else:
    print("worker.py: ERROR - pattern not found, check file manually")
    # Show what's around line 2048
    lines = raw.decode('utf-8', errors='replace').splitlines()
    for i, line in enumerate(lines[2044:2055], start=2045):
        print(f"  {i}: {line}")

