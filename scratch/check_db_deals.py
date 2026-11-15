import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
m = MongoClient(mongo_uri)[db_name]['UniqueDeals']

c_title = m.count_documents({
    '$or': [
        {'title': {'$regex': r'\{title\}', '$options': 'i'}},
        {'prod_name': {'$regex': r'\{title\}', '$options': 'i'}},
        {'aff_text': {'$regex': r'\{title\}', '$options': 'i'}},
        {'ai_formatted_text': {'$regex': r'\{title\}', '$options': 'i'}}
    ]
})
print("Deals with {title}:", c_title)

c_dd = m.count_documents({'platforms': 'DesiDime'})
print("Deals with DesiDime store:", c_dd)

c_dd_text = m.count_documents({
    '$or': [
        {'aff_text': {'$regex': 'Available on: DesiDime', '$options': 'i'}},
        {'ai_formatted_text': {'$regex': 'Available on: DesiDime', '$options': 'i'}}
    ]
})
print("Deals with DesiDime in text:", c_dd_text)

# Find sample deals with {title}
sample_titles = list(m.find({
    '$or': [
        {'title': {'$regex': r'\{title\}', '$options': 'i'}},
        {'prod_name': {'$regex': r'\{title\}', '$options': 'i'}},
        {'aff_text': {'$regex': r'\{title\}', '$options': 'i'}}
    ]
}, {'fp_hash': 1, 'title': 1, 'prod_name': 1, 'aff_text': 1, 'channel': 1, 'status': 1}).limit(5))

for d in sample_titles:
    print("\nSAMPLE TITLE DEAL:")
    print("  hash:", d.get("fp_hash"))
    print("  title:", d.get("title"))
    print("  prod_name:", d.get("prod_name"))
    print("  channel:", d.get("channel"))
    print("  status:", d.get("status"))
    print("  aff_text:\n", (d.get("aff_text") or "")[:200])

# Find sample deals with Available on: DesiDime
sample_dd = list(m.find({
    '$or': [
        {'aff_text': {'$regex': 'Available on: DesiDime', '$options': 'i'}},
        {'ai_formatted_text': {'$regex': 'Available on: DesiDime', '$options': 'i'}}
    ]
}, {'fp_hash': 1, 'title': 1, 'store': 1, 'platforms': 1, 'aff_text': 1, 'status': 1}).limit(5))

for d in sample_dd:
    print("\nSAMPLE DESIDIME TEXT DEAL:")
    print("  hash:", d.get("fp_hash"))
    print("  title:", d.get("title"))
    print("  store:", d.get("store"))
    print("  platforms:", d.get("platforms"))
    print("  status:", d.get("status"))
    print("  aff_text:\n", (d.get("aff_text") or "")[:200])
