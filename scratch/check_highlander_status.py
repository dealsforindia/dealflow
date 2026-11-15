import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import pymongo, os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
client = pymongo.MongoClient(os.getenv("MONGODB_URI") or os.getenv("MONGO_URI"))
db = client[os.getenv("MONGODB_DB") or "dealbot"]

d = db.UniqueDeals.find_one({"fp_hash": "bbdc54bb91e1"})
if d:
    print("Highlander status:")
    print("  img_url:", d.get("img_url"))
    print("  store_img_url:", d.get("store_img_url"))
"""
print(run_vm_py(code))
