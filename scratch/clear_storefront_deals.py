import os
from pymongo import MongoClient
from dotenv import load_dotenv
import redis

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")

mc = MongoClient(mongo_uri)
db = mc[db_name]

# Check count of deals that show on public site
query = {
    "$or": [
        {"status": {"$in": ["posted", "auto_posted", "approved"]}},
        {"live_on_web": True}
    ]
}

matching = db.UniqueDeals.count_documents(query)
print(f"Deals currently eligible for public storefront: {matching}")

# Update all of them to 'archived', live_on_web=False, is_over=True
res = db.UniqueDeals.update_many(
    query,
    {
        "$set": {
            "status": "archived",
            "live_on_web": False,
            "is_over": True,
            "archived_for_autopost_test": True
        }
    }
)
print(f"Archived {res.modified_count} deals from public storefront.")

# Clear Redis public cache
try:
    r = redis.from_url(os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0"))
    keys = r.keys("*deal*") + r.keys("*public*") + r.keys("*storefront*")
    if keys:
        r.delete(*keys)
        print(f"Cleared {len(keys)} Redis cache keys.")
    else:
        print("No Redis deal cache keys found.")
except Exception as e:
    print(f"Redis cache clear note: {e}")

print("DONE: Storefront deals completely cleared.")
