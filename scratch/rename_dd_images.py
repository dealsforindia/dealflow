import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
import os, glob
import motor.motor_asyncio
import asyncio
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')

async def main():
    img_dir = '/home/rudranil777/dealbot/images'
    renamed = {}
    for f in glob.glob(os.path.join(img_dir, '*desidime*')):
        base = os.path.basename(f)
        new_base = base.replace('www_desidime_com', 'curated_drop').replace('desidime', 'curated_drop')
        new_path = os.path.join(img_dir, new_base)
        os.rename(f, new_path)
        renamed[base] = new_base
        print(f"Renamed on disk: {base} -> {new_base}")
        
    if renamed:
        uri = os.getenv('MONGODB_URI')
        client = motor.motor_asyncio.AsyncIOMotorClient(uri)
        col = client['dealbot']['UniqueDeals']
        for old_b, new_b in renamed.items():
            # Update img_path and img_url
            r1 = await col.update_many({'img_path': {'$regex': old_b}}, [{'$set': {'img_path': {'$replaceOne': {'input': '$img_path', 'find': old_b, 'replacement': new_b}}}}])
            r2 = await col.update_many({'img_url': {'$regex': old_b}}, [{'$set': {'img_url': {'$replaceOne': {'input': '$img_url', 'find': old_b, 'replacement': new_b}}}}])
            print(f"Updated DB for {old_b} -> {new_b} (img_path: {r1.modified_count}, img_url: {r2.modified_count})")

asyncio.run(main())
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
