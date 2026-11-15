import sys, time, subprocess, base64

code = """
import pymongo
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['dealbot']
cfg = db.SystemSettings.find_one({'_id': 'channels_config'}) or {}
channels = cfg.get('channels', {})
aliases = cfg.get('aliases', {})
print("TOTAL_CHANNELS:", len(channels))
for ch in channels:
    if 'freekart' in ch.lower() or '1394855402' in ch:
        print("FOUND_CHANNEL:", ch, "STATUS:", channels[ch])
for k, v in aliases.items():
    if 'freekart' in k.lower() or '1394855402' in k or 'freekart' in str(v).lower():
        print("FOUND_ALIAS:", k, "->", v)
"""

b64_code = base64.b64encode(code.strip().encode()).decode()
cmd = ['ssh', '-o', 'BatchMode=yes', 'rudranil777@74.225.250.0', f"echo {b64_code} | base64 -d | python3"]

for attempt in range(1, 5):
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if res.returncode == 0:
            print(res.stdout)
            sys.exit(0)
        else:
            print(f"Attempt {attempt} err: {res.stderr.strip()}")
            time.sleep(2 * attempt)
    except Exception as e:
        print(f"Attempt {attempt} exc: {e}")
        time.sleep(2 * attempt)

print("Failed after retries")
