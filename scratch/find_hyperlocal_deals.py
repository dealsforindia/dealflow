import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import pymongo, os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
client = pymongo.MongoClient(os.getenv("MONGODB_URI") or os.getenv("MONGO_URI"))
db = client[os.getenv("MONGODB_DB") or "dealbot"]

deals = list(db.UniqueDeals.find({
    "$or": [
        {"prod_name": {"$regex": "^Flipkart Hyperlocal", "$options": "i"}},
        {"title": {"$regex": "^Flipkart Hyperlocal", "$options": "i"}}
    ]
}).sort("ts", -1).limit(5))

print(f"Found {len(deals)} Flipkart Hyperlocal deals:")
for d in deals:
    print("=" * 60)
    print("FP:", d.get("fp_hash"))
    print("prod_name:", repr(d.get("prod_name")))
    print("title:", repr(d.get("title")))
    print("url:", d.get("url"))
    print("aff_link:", d.get("aff_link"))
    print("aff_text:", repr(d.get("aff_text") or "")[:200])
    print("original_text:", repr(d.get("original_text") or "")[:200])
    print("message:", repr(d.get("message") or "")[:200])
    print("store:", d.get("store"))
    print("source:", d.get("source"))
"""
print(run_vm_py(code))
