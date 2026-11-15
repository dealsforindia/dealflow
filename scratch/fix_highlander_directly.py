import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import pymongo, os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
client = pymongo.MongoClient(os.getenv("MONGODB_URI") or os.getenv("MONGO_URI"))
db = client[os.getenv("MONGODB_DB") or "dealbot"]

real_img = "https://m.media-amazon.com/images/I/81rdXvasdmL._AC_UY1100_FMwebp_.jpg"
res = db.UniqueDeals.update_one(
    {"fp_hash": "bbdc54bb91e1"},
    {"$set": {
        "img_url": real_img,
        "store_img_url": real_img,
        "image_source": "amazon_cdn_direct",
        "asin": "B0F2TNKXPC"
    }}
)
print(f"Updated bbdc54bb91e1: matched={res.matched_count}, modified={res.modified_count}")
"""
print(run_vm_py(code))
