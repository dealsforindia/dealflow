import subprocess

script = """
import asyncio, json, time
import motor.motor_asyncio as motor

client = motor.AsyncIOMotorClient("mongodb://localhost:27017")
db = client.dealbot

async def main():
    # 1. Search for Pluss or recent posted deals
    cursor = db.UniqueDeals.find({"status": {"$in": ["posted", "approved", "auto_posted"]}}).sort("processed_ts", -1).limit(10)
    deals = await cursor.to_list(10)
    print(f"Total posted/approved deals found: {len(deals)}")
    for d in deals:
        print("=" * 50)
        print("fp_hash:", d.get("fp_hash"))
        print("prod_name:", d.get("prod_name") or d.get("title"))
        print("status:", d.get("status"))
        print("is_over:", d.get("is_over"))
        print("prices:", d.get("prices"))
        print("processed_ts:", d.get("processed_ts"), f"({(time.time() - (d.get('processed_ts') or 0))/60:.1f}m ago)")
        print("url:", d.get("url") or d.get("product_url") or d.get("canonical_url"))
        print("destinations:", d.get("destinations") or d.get("broadcast_destinations"))
        print("img_url:", d.get("img_url"))

asyncio.run(main())
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3"], input=script.encode(), capture_output=True)
print("STDOUT:")
print(p.stdout.decode())
print("STDERR:")
print(p.stderr.decode())
