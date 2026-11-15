import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import pymongo, os, re
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
client = pymongo.MongoClient(os.getenv("MONGODB_URI") or os.getenv("MONGO_URI"))
db = client[os.getenv("MONGODB_DB") or "dealbot"]

deal = db.UniqueDeals.find_one({"prod_name": {"$regex": "Highlander Men's Cargo Jogger", "$options": "i"}})
if deal:
    print("Found deal:")
    print("  FP:", deal.get("fp_hash"))
    print("  Title:", deal.get("prod_name"))
    print("  URL:", deal.get("url"))
    print("  img_url:", deal.get("img_url"))
    print("  store_img_url:", deal.get("store_img_url"))
    print("  img_path:", deal.get("img_path"))
    print("  status:", deal.get("status"))
else:
    print("Not found by prod_name, searching title...")
    deal2 = db.UniqueDeals.find_one({"title": {"$regex": "Highlander", "$options": "i"}})
    if deal2:
        print("Found deal2:", deal2.get("fp_hash"), deal2.get("title"), deal2.get("url"), deal2.get("img_url"))
"""
print(run_vm_py(code))
