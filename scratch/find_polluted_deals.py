import pymongo

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['dealbot']

# Check for deals with query parameter pollution in prod_name or title
bad_deals = list(db.UniqueDeals.find({
    '$or': [
        {'prod_name': {'$regex': 'curated=|gridColumns|visualFiltersState|&[a-z0-9]+=|^and above', '$options': 'i'}},
        {'title': {'$regex': 'curated=|gridColumns|visualFiltersState|&[a-z0-9]+=|^and above', '$options': 'i'}}
    ]
}).limit(10))

print(f"Found {len(bad_deals)} polluted deals in UniqueDeals:")
for d in bad_deals:
    print("---")
    print("ID:", str(d.get("_id")))
    print("PROD_NAME:", repr(d.get("prod_name")))
    print("TITLE:", repr(d.get("title")))
    print("URL:", repr(d.get("url")))
    print("ORIG_TEXT:", repr(d.get("original_text", ""))[:120])
