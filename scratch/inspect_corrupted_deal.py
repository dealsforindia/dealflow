import subprocess

remote_cmd = """python3 -c '
import os, json, pymongo
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
client = pymongo.MongoClient(uri)
db = client[db_name]
deal = db["UniqueDeals"].find_one({"fp_hash": "8321d62b98579fa2"})
if deal:
    deal["_id"] = str(deal["_id"])
    print(json.dumps(deal, indent=2, default=str))
else:
    print("Deal not found")
'"""

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', remote_cmd],
    capture_output=True,
    text=True
)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
