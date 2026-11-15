import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

docs = list(db.PriceHistory.find({"canonical_id": "amz:B0B4GYZ4FR"}).sort("ts", 1))
print("Found docs for amz:B0B4GYZ4FR:", len(docs))
for doc in docs:
    print("  ts:", doc.get("ts"), "price:", doc.get("price"), "sale_price:", doc.get("sale_price"), "store:", doc.get("store"))
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
