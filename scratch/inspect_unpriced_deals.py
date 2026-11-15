import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

for fp in ["f12e26e16c2221f696c3a67de9fd2d15", "30063eac838c89546d1b4697567aa4b8", "4605154a262373ee09c46a355ad96fd9"]:
    d = db.UniqueDeals.find_one({"fp_hash": fp})
    if d:
        print(f"\n--- Deal {fp} ---")
        print("prod_name:", d.get("prod_name"))
        print("prices:", d.get("prices"))
        print("price:", d.get("price"))
        print("sale_price:", d.get("sale_price"))
        print("mrp:", d.get("mrp"))
        print("status:", d.get("status"))
        print("aff_text:", (d.get("aff_text") or "")[:150])
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
