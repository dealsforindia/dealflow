import subprocess

remote_script = r'''
import os, json, pymongo
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
client = pymongo.MongoClient(uri)
db = client[db_name]

# Search for any deals matching static-assets or .css
query = {
    "$or": [
        {"url": {"$regex": "static-assets-web|\.css", "$options": "i"}},
        {"canonical_url": {"$regex": "static-assets-web|\.css", "$options": "i"}},
        {"store": {"$regex": "static assets|static-assets", "$options": "i"}},
        {"platforms": {"$regex": "static-assets|static assets", "$options": "i"}},
        {"expanded_urls": {"$regex": "static-assets-web|\.css", "$options": "i"}}
    ]
}

matches = list(db["UniqueDeals"].find(query))
print(f"Total corrupted deals found: {len(matches)}")
for d in matches:
    fp = d.get("fp_hash")
    title = d.get("prod_name") or d.get("title")
    print(f"- FP: {fp} | Title: {title}")
    print(f"  URL: {d.get('url')}")
    print(f"  Canon: {d.get('canonical_url')}")
    print(f"  Platforms: {d.get('platforms')}")
    print(f"  Store: {d.get('store')}")
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_script,
    capture_output=True,
    text=True
)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
