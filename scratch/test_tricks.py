import os
from pymongo import MongoClient
from dotenv import load_dotenv

env_path = '/home/rudranil777/dealbot/.env' if os.path.exists('/home/rudranil777/dealbot/.env') else 'dealbot_backend/dealbot/.env'
load_dotenv(env_path)
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['dealbot']

# Look for deals from trick channels: Genie Tricks, Offerzone Tricks, FET
trick_channel_query = {
    "$or": [
        {"channel": {"$regex": r"trick", "$options": "i"}},
        {"channel_name": {"$regex": r"trick", "$options": "i"}},
        {"text": {"$regex": r"(?:apply\s*(?:code|coupon)|card\s*discount|using\s*\w+\s*card)", "$options": "i"}},
        {"raw_text": {"$regex": r"(?:apply\s*(?:code|coupon)|card\s*discount|using\s*\w+\s*card)", "$options": "i"}}
    ]
}

print(f"Total matching query: {db['UniqueDeals'].count_documents(trick_channel_query)}")

samples = list(db['UniqueDeals'].find(trick_channel_query).sort("created_at", -1).limit(6))
for i, d in enumerate(samples, 1):
    print(f"\n==================== [{i}] ====================")
    print(f"Title: {d.get('title') or d.get('prod_name')}")
    print(f"Channel: {d.get('channel')} | Type: {d.get('deal_type')} | Status: {d.get('status')}")
    print(f"Prices: sale={d.get('sale_price')}, mrp={d.get('mrp')}, effective={d.get('effective_price')}")
    print(f"Coupon: {d.get('coupon')}")
    raw = d.get('raw_text') or d.get('text') or ''
    print(f"Raw Text:\n{raw[:350]}")
    ai = d.get('ai_formatted_text') or ''
    print(f"AI Formatted:\n{ai[:350]}")
