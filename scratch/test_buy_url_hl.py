import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import sys
sys.path.insert(0, '/home/rudranil777/dealbot')
import desidime_bot

d_id = "8a2b67f0536b"
# Look up deal in DB to find deal_id and permalink
import pymongo
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
client = pymongo.MongoClient(os.getenv("MONGODB_URI") or os.getenv("MONGO_URI"))
db = client[os.getenv("MONGODB_DB") or "dealbot"]
doc = db.UniqueDeals.find_one({"fp_hash": d_id})
print("Doc deal_id:", doc.get("deal_id"))
print("Doc permalink:", doc.get("permalink"))
print("Doc url:", doc.get("url"))
print("Doc aff_link:", doc.get("aff_link"))

prod_url, dd_link = desidime_bot.get_buy_url(doc.get("deal_id"), doc.get("permalink"))
print("get_buy_url -> prod_url:", prod_url)
print("get_buy_url -> dd_link:", dd_link)
"""
print(run_vm_py(code))
