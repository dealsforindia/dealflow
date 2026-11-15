import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import pymongo, os, time
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
client = pymongo.MongoClient(os.getenv("MONGODB_URI") or os.getenv("MONGO_URI"))
db = client[os.getenv("MONGODB_DB") or "dealbot"]

for fp in ["8a2b67f0536b", "233503c74601", "376a50b65fb5", "5bf8b95cd5cd"]:
    d = db.UniqueDeals.find_one({"fp_hash": fp})
    if d:
        print(f"FP: {fp} | ts: {d.get('ts')} ({time.time() - (d.get('ts') or 0):.0f}s ago)")
        print(f"  title: {d.get('prod_name')}")
        print(f"  price: {d.get('price')}")
        print(f"  mrp: {d.get('mrp')}")
        print(f"  img_url: {d.get('img_url')}")
"""
print(run_vm_py(code))
