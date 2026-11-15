import os
import sys
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

remote_code = r'''
import os, json, pymongo
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")

uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
client = pymongo.MongoClient(uri)
db = client[db_name]

q = {
    "$or": [
        {"prod_name": {"$regex": "ASUS Pad|T3201M5A", "$options": "i"}},
        {"ai_formatted_text": {"$regex": "ASUS Pad|T3201M5A", "$options": "i"}},
        {"original_text": {"$regex": "zw6oXuw|T3201M5A", "$options": "i"}},
        {"aff_text": {"$regex": "zw6oXuw|T3201M5A", "$options": "i"}}
    ]
}

matches = list(db["UniqueDeals"].find(q))
print(f"MATCHES FOUND: {len(matches)}")
for d in matches:
    print("=" * 60)
    print("ID:", str(d.get("_id")))
    print("fp_hash:", d.get("fp_hash"))
    print("prod_name:", d.get("prod_name"))
    print("store:", d.get("store"))
    print("platforms:", d.get("platforms"))
    print("source_channel:", d.get("source_channel"))
    print("status:", d.get("status"))
    print("url:", d.get("url"))
    print("canonical_url:", d.get("canonical_url"))
    print("ai_formatted_text:\n", d.get("ai_formatted_text"))
    print("original_text:\n", d.get("original_text"))
'''

cmd = [
    "ssh",
    "-i", "C:/Users/Neel/.ssh/id_ed25519",
    "-o", "IdentitiesOnly=yes",
    "-o", "BatchMode=yes",
    "rudranil777@74.225.250.0",
    f"python3 -c '{remote_code}'"
]

res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
print("STDOUT:")
print(res.stdout)
print("STDERR:")
print(res.stderr)
