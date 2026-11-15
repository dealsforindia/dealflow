import subprocess

remote_script = r'''
import os, re, json, pymongo
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
import sys
sys.path.insert(0, "/home/rudranil777/dealbot")
from stealth_fetcher import stealth_unshorten_deep, is_asset_or_cdn_url

uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
client = pymongo.MongoClient(uri)
db = client[db_name]

query = {
    "$or": [
        {"url": {"$regex": "static-assets-web|\.css", "$options": "i"}},
        {"canonical_url": {"$regex": "static-assets-web|\.css", "$options": "i"}},
        {"store": {"$regex": "static assets|static-assets", "$options": "i"}},
        {"platforms": {"$regex": "static-assets|static assets", "$options": "i"}},
        {"expanded_urls": {"$regex": "static-assets-web|\.css", "$options": "i"}}
    ]
}

matches = list(db["UniqueDeals"].find(query))
print(f"Found {len(matches)} deals to heal.")

for d in matches:
    fp = d.get("fp_hash")
    title = d.get("prod_name") or d.get("title") or "Flipkart Deal"
    orig_text = d.get("original_text") or ""
    aff_text = d.get("aff_text") or ""
    msg = d.get("message") or ""
    ai_text = d.get("ai_formatted_text") or ""
    exp_urls = d.get("expanded_urls") or {}

    # Extract original raw link from original_text or aff_text
    cand_links = re.findall(r'https?://[^\s<>"]+', f"{orig_text} {aff_text} {msg}")
    real_link = None
    for cl in cand_links:
        if not is_asset_or_cdn_url(cl):
            real_link = cl
            break

    # Unshorten using our newly patched stealth_unshorten_deep
    resolved_link = None
    if real_link:
        resolved_link = stealth_unshorten_deep(real_link)
        if is_asset_or_cdn_url(resolved_link):
            resolved_link = None

    if not resolved_link:
        if real_link and not is_asset_or_cdn_url(real_link):
            resolved_link = real_link
        else:
            resolved_link = f"https://www.flipkart.com/search?q={title}"

    print(f"Healed FP {fp}: {resolved_link[:70]}")

    # Fix expanded_urls
    new_exp_urls = {}
    if isinstance(exp_urls, dict):
        for k, v in exp_urls.items():
            if is_asset_or_cdn_url(v):
                new_exp_urls[k] = resolved_link
            else:
                new_exp_urls[k] = v
    else:
        new_exp_urls = {resolved_link: resolved_link}

    # Fix platforms
    new_platforms = ["Flipkart"]

    # Fix aff_text, message, ai_formatted_text
    def sanitize_text(t):
        if not t: return t
        t = re.sub(r'https://static-assets-web\.flixcart\.com/[^\s<>"]+', resolved_link, t)
        t = re.sub(r'Available on:\s*Static-assets-web', 'Available on: Flipkart', t, flags=re.I)
        t = re.sub(r'Available on:\s*Static Assets Web', 'Available on: Flipkart', t, flags=re.I)
        return t

    update_fields = {
        "platforms": new_platforms,
        "store": "Flipkart",
        "expanded_urls": new_exp_urls,
        "aff_text": sanitize_text(aff_text),
        "message": sanitize_text(msg),
        "ai_formatted_text": sanitize_text(ai_text),
    }

    if d.get("url") and is_asset_or_cdn_url(d.get("url")):
        update_fields["url"] = resolved_link
    if d.get("canonical_url") and is_asset_or_cdn_url(d.get("canonical_url")):
        update_fields["canonical_url"] = resolved_link

    db["UniqueDeals"].update_one({"_id": d["_id"]}, {"$set": update_fields})

print("Successfully healed all corrupted deals in MongoDB!")
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_script,
    capture_output=True,
    text=True
)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
