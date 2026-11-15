import sys, time, subprocess, base64

code = """
import pymongo
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['dealbot']

deals = list(db.UniqueDeals.find({'channel': {'$regex': 'freekart|1394855402', '$options': 'i'}}).sort('_id', -1).limit(5))
print(f"FOUND {len(deals)} FREEKART DEALS:")
for d in deals:
    print('---')
    print('ID:', str(d.get('_id')))
    print('PROD_NAME:', d.get('prod_name'))
    print('URL:', d.get('url'))
    print('STATUS:', d.get('status'))
    print('ORIG_TEXT:', repr(d.get('original_text', ''))[:160])
"""

b64_code = base64.b64encode(code.strip().encode()).decode()
cmd = [
    'ssh',
    '-i', 'C:/Users/Neel/.ssh/id_ed25519',
    '-o', 'IdentitiesOnly=yes',
    '-o', 'BatchMode=yes',
    '-o', 'ConnectTimeout=10',
    'rudranil777@74.225.250.0',
    f"echo {b64_code} | base64 -d | python3"
]

for attempt in range(1, 5):
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if res.returncode == 0:
            print(res.stdout)
            sys.exit(0)
        else:
            print(f"Attempt {attempt} err: {res.stderr.strip()}")
            time.sleep(2.5 * attempt)
    except Exception as e:
        print(f"Attempt {attempt} exc: {e}")
        time.sleep(2.5 * attempt)

print("Failed after retries")
