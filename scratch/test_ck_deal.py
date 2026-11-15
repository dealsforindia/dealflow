import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient
import urllib.request, json

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

deals = list(db.UniqueDeals.find({"canonical_key": {"$regex": "^amz:"}}).limit(3))
for d in deals:
    fp = d.get("fp_hash")
    ck = d.get("canonical_key")
    pname = (d.get("prod_name") or "")[:35]
    print(f"\nTesting deal with canonical_key={ck}, fp_hash={fp}, title={pname}")
    try:
        req = urllib.request.Request(f"http://127.0.0.1:8000/api/v1/deals/{fp}/price-history")
        with urllib.request.urlopen(req, timeout=5) as r:
            data = json.loads(r.read().decode())
            print("Response:", data)
    except Exception as ex:
        print("Error:", ex)
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("STDOUT:")
print(res.stdout.encode('ascii', errors='replace').decode('ascii'))
