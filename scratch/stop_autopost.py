import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load from .env if present
load_dotenv("/home/rudranil777/dealbot/.env")
load_dotenv("dealbot_backend/.env")

mongo_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
print("Connecting to MongoDB:", mongo_uri[:35], "...")

mc = MongoClient(mongo_uri)
db = mc[db_name]
cfg = db['SystemSettings'].find_one({'_id': 'channels_config'}) or {}

print('Current channels count:', len(cfg.get('channels', {})))
print('Current auto_approve keys:', len(cfg.get('auto_approve', {})))

auto_map = {k: False for k in cfg.get('auto_approve', {})}
auto_tg = {k: False for k in cfg.get('auto_approve_tg', {})}
auto_web = {k: False for k in cfg.get('auto_approve_web', {})}

# Also set every active channel's auto-post to False
for ch in cfg.get('channels', {}):
    auto_map[ch] = False
    auto_tg[ch] = False
    auto_web[ch] = False

res = db['SystemSettings'].update_one(
    {'_id': 'channels_config'},
    {'$set': {
        'auto_approve': auto_map,
        'auto_approve_tg': auto_tg,
        'auto_approve_web': auto_web,
        'global_auto_post': False,
        'auto_post_enabled': False
    }},
    upsert=True
)

print('SUCCESS: All auto-post settings disabled in MongoDB SystemSettings (matched:', res.matched_count, 'modified:', res.modified_count, ')')
