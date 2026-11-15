import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

# Distinct stores or canonical_id prefixes
sample_ids = list(db.PriceHistory.find({}, {"canonical_id": 1, "store": 1, "sale_price": 1, "price": 1}).limit(500))
prefixes = set()
stores = set()
has_price = 0
has_sale_price = 0

for doc in sample_ids:
    cid = doc.get("canonical_id", "")
    if ":" in cid:
        prefixes.add(cid.split(":")[0])
    else:
        prefixes.add("none")
    if doc.get("store"):
        stores.add(doc.get("store"))
    if doc.get("price") is not None:
        has_price += 1
    if doc.get("sale_price") is not None:
        has_sale_price += 1

print("Canonical ID prefixes found in sample:", prefixes)
print("Stores found in sample:", stores)
print(f"Has price field: {has_price}/500, Has sale_price field: {has_sale_price}/500")

# Check what price_history_tracker.py or genie_history.py does
for fname in ["price_history_tracker.py", "genie_history.py"]:
    fpath = f"/home/rudranil777/dealbot/{fname}"
    if os.path.exists(fpath):
        print(f"\n--- {fname} (first 40 lines) ---")
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            lines = [f.readline() for _ in range(40)]
            print("".join(lines))
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True
)
print("STDOUT:")
print(res.stdout)
print("STDERR:")
print(res.stderr)
