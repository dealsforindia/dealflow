import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import pymongo, os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
client = pymongo.MongoClient(os.getenv("MONGODB_URI") or os.getenv("MONGO_URI"))
db = client[os.getenv("MONGODB_DB") or "dealbot"]

for fp in ["5ac0c05e7c3f", "7d982990549c", "2db290392b1c", "b6b127cd45e6"]:
    d = db.UniqueDeals.find_one({"fp_hash": {"$regex": f"^{fp}"}})
    if d:
        print(f"FP: {d.get('fp_hash')}")
        print(f"  Title: {d.get('prod_name')}")
        print(f"  img_url: {d.get('img_url')}")
        print(f"  store_img_url: {d.get('store_img_url')}")
        print(f"  img_path: {d.get('img_path')}")
        print(f"  url: {d.get('url')}")
"""
print(run_vm_py(code))
