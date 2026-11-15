import sys
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

remote_code = r'''
import os, json, re, pymongo
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")

uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
client = pymongo.MongoClient(uri)
db = client[db_name]

# Find the ASUS deal
q = {"fp_hash": "b666733c85153ba1"}
deal = db["UniqueDeals"].find_one(q)
if not deal:
    print("Deal not found by fp_hash, searching by text...")
    deal = db["UniqueDeals"].find_one({"original_text": {"$regex": "zw6oXuw"}})

if deal:
    print("Found deal:", deal.get("fp_hash"), deal.get("prod_name"))
    ai_text = deal.get("ai_formatted_text", "")
    ai_text = re.sub(r"Available on:\s*(?:DesiDime|ddime)", "Available on: Flipkart", ai_text, flags=re.I)
    
    update = {
        "$set": {
            "store": "Flipkart",
            "platforms": ["Flipkart"],
            "prod_name": "ASUS Pad (12.2\" 2.8K 144Hz OLED, MediaTek D8300)",
            "ai_formatted_text": ai_text
        }
    }
    db["UniqueDeals"].update_one({"_id": deal["_id"]}, update)
    print("SUCCESS: Updated ASUS Pad deal to Flipkart!")
else:
    print("Deal not found!")

# Also fix any other deals in UniqueDeals that have Available on: DesiDime or store: DesiDime
res = db["UniqueDeals"].update_many(
    {"store": "DesiDime", "original_text": {"$regex": "Flipkart|fkrt"}},
    {"$set": {"store": "Flipkart", "platforms": ["Flipkart"]}}
)
print("Updated other Flipkart deals stored as DesiDime:", res.modified_count)

res_amz = db["UniqueDeals"].update_many(
    {"store": "DesiDime", "original_text": {"$regex": "Amazon|amzn"}},
    {"$set": {"store": "Amazon", "platforms": ["Amazon"]}}
)
print("Updated other Amazon deals stored as DesiDime:", res_amz.modified_count)
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
