import subprocess

script = """
import os
from pymongo import MongoClient

db = MongoClient('mongodb://localhost:27017/')['dealbot']
archived_test = db.UniqueDeals.count_documents({'archived_for_autopost_test': True})
print(f'Archived for autopost test: {archived_test}')

# If there are 0 posted deals, let us restore the most recent 60 deals from archived_for_autopost_test so the public storefront has active loot drops!
posted_count = db.UniqueDeals.count_documents({'status': {'$in': ['posted', 'auto_posted']}})
print(f'Currently posted: {posted_count}')

if posted_count == 0 and archived_test > 0:
    recent_ids = [d['_id'] for d in db.UniqueDeals.find({'archived_for_autopost_test': True}).sort('processed_ts', -1).limit(60)]
    res = db.UniqueDeals.update_many(
        {'_id': {'$in': recent_ids}},
        {'$set': {'status': 'posted', 'live_on_web': True, 'is_over': False}}
    )
    print(f'Restored {res.modified_count} fresh deals to public storefront!')
"""

cmd = ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', f"python3 -c \"{'; '.join([line.strip() for line in script.strip().splitlines() if line.strip() and not line.strip().startswith('#')])}\""]
res = subprocess.run(cmd, capture_output=True, text=True)
print(res.stdout.strip())
