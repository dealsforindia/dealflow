import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

sample = list(db.UniqueDeals.find({"status": {"$in": ["posted", "auto_posted"]}}).limit(20))
has_sale = 0
has_mrp = 0
has_reg = 0
has_ph = 0

for d in sample:
    sale = (d.get("prices") or {}).get("sale") or d.get("sale_price") or d.get("price")
    mrp = (d.get("prices") or {}).get("mrp") or d.get("mrp")
    reg = d.get("regular_price") or d.get("displayRegularPrice")
    ph = d.get("price_history")
    if sale: has_sale += 1
    if mrp: has_mrp += 1
    if reg: has_reg += 1
    if ph: has_ph += 1

print(f"Sample 20: has_sale: {has_sale}, has_mrp: {has_mrp}, has_regular_price: {has_reg}, has_price_history: {has_ph}")
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
