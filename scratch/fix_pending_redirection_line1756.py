import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'e:\Rudranildocs0066543\html-yt\dealbot_backend\dealbot\worker.py'
with open(path, 'rb') as f:
    raw = f.read()

raw = raw.replace(b'\r\r\n', b'\r\n')

old = b'"title": (title or "Retail Offer") + " (Pending Redirection)",'
new = b'"title": title or "Retail Offer",\n                        "prod_name": title or "Retail Offer",'

if old in raw:
    raw = raw.replace(old, new, 1)
    with open(path, 'wb') as f:
        f.write(raw)
    print("worker.py: successfully cleaned line 1756 (Pending Redirection)")
else:
    print("worker.py: pattern not found on line 1756")

