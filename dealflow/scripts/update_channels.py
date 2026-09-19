import pymongo

client = pymongo.MongoClient("mongodb+srv://dealbot:Rudra2025x@dealbot-cluster.m9o3kr8.mongodb.net/dealbot?appName=dealbot-cluster")
db = client["dealbot"]
collection = db["SystemSettings"]

channels = [
    "https://t.me/+emveIa6ZQxoxYjAx", # Crazy Deals
    "https://t.me/c/2260825044", # DealDrops
    "@dealspoint", # Dealspoint Premium
    "https://t.me/+OylJYrIZZHBzZjRi", # DealzTrendz
    "https://t.me/+fJX-MfWphoNiZDU6", # DealzTrendz 2.0
    "@DesidimeHot", # DesiDime - Handpicked Deals
    "@realearnkaro", # EarnKaro (Loot Deals & Offers)
    "@extrape", # ExtraPe | Earn By Sharing Deals
    "https://t.me/+tcoZTg6IJWl4ZDRI", # FET (Deals & Tricks)
    "https://t.me/addlist/RBY7rxcO-T03MjE1", # Fitness Finds by SQ & Shoppers Quest 2.0
    "https://t.me/+VNdMZqz_NhKNNXvsG", # Free Earning Tech
    "https://t.me/+JpTJUwE9J9A1NDE1", # Genie All Deals
    "https://t.me/c/1268661047", # Genie Loot
    "https://t.me/+Io8OVRMkSVs5YzI1", # Genie Tricks
    "@glamhauldiaries", # Glam Haul Diaries
    "@lootdealsapp", # Loot Deals App
    "https://t.me/+LQ3FigpMfmAyZGJl", # Offerzone 2.0
    "https://t.me/+kTvbwlaPbH1mM2E1", # Offerzone 3.0
    "https://t.me/+FpXKV70NYNY0NzQ1", # Offerzone 4.0
    "https://t.me/+uV5wcTkUWJEwM2Y1", # Offerzone Tricks
    "https://t.me/+4DwYqc6QfXhiMTI1", # OZ Loot Bazaar
    "https://t.me/c/3516611384", # OZ Loot Deals
    "@bblbblp", # Private Deals From All
    "https://t.me/+958_Lu4ZoUxM2E9", # Shopping Genie
    "@Technicalsheikh", # Technical Sheikh
    "@Loot_DealsX", # Trending Loot Deals
]

channel_dict = {ch: True for ch in channels}

result = collection.update_one(
    {"_id": "channels_config"},
    {"$set": {"channels": channel_dict}},
    upsert=True
)

print(f"Matched {result.matched_count}, Modified {result.modified_count}")
print("Channels updated successfully to correct links!")
