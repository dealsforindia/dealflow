import os, pymongo, json, re
from dotenv import load_dotenv

load_dotenv('/home/rudranil777/dealbot/.env')
uri = os.getenv('MONGODB_URI') or os.getenv('MONGO_URI') or 'mongodb://localhost:27017/'
client = pymongo.MongoClient(uri)
db = client['dealbot']

d = db.UniqueDeals.find_one({'fp_hash': 'a452e0554a89c239'})
d_rare = db.UniqueDeals.find_one({'fp_hash': '47343c40370ffece'})

for deal in [d, d_rare]:
    if not deal: continue
    print("--- Checking:", deal.get("fp_hash"), deal.get("prod_name"))
    print("store:", deal.get("store"))
    print("platforms:", deal.get("platforms"))
    print("canonical_url:", deal.get("canonical_url"))
    print("expanded_urls:", deal.get("expanded_urls"))
    print("aff_text:", deal.get("aff_text"))
    print("original_text:", deal.get("original_text"))

    # Now simulate api.py logic:
    buy_url = deal.get("canonical_url") or ""
    exp_map = deal.get("expanded_urls") or {}
    if not buy_url and isinstance(exp_map, dict):
        for orig_u, exp_u in exp_map.items():
            if exp_u and any(dom in exp_u.lower() for dom in ["amazon.in", "flipkart.com", "myntra.com", "ajio.com", "swiggy.com", "instamart", "hamaramall.com", "guardian.in"]):
                buy_url = exp_u
                break
    print("simulated buy_url step 1:", buy_url)

    _SHORTLINK_DOMS = [
        'fkrt.cc', 'fkrt.it', 'myntr.it', 'myntr.in',
        'bit.ly', 'bitli.in', 'clnk.in', 'ekaro.in', 'earnkaro.com',
        'gotrackzo.com', 'linkredirect.in', 'app.lehlah.club',
        'links.ddime.in', 'fpkrt.cc', 'wishlink.com', 'amazn.ltd',
        'amzn.to', 'amzn.in',
    ]
    _buy_lower = buy_url.lower()
    if any(sd in _buy_lower for sd in _SHORTLINK_DOMS):
        _fp = deal.get("fp_hash")
        if _fp:
            buy_url = f"https://api.rudranil.me/r/{_fp}"
    print("simulated buy_url step 2:", buy_url)

    url_lower = buy_url.lower()
    plats = deal.get("platforms") or []
    plats_lower = " ".join(plats).lower()
    explicit_store = (deal.get("store") or "").strip()
    print("url_lower:", url_lower)
    print("plats_lower:", plats_lower)
    print("explicit_store:", explicit_store)

    if explicit_store and explicit_store.lower() not in ["other", "retail deal", "unknown", "deals"]:
        store_name = explicit_store
    elif any(x in url_lower for x in ["amazon.in", "amzn.to", "amzn.in", "a.co", "link.amazon"]) or "amazon" in plats_lower:
        store_name = "Amazon"
    elif any(x in url_lower for x in ["flipkart.com", "fkrt.cc", "fkrt.it", "shopsy.in"]) or any(x in plats_lower for x in ["flipkart", "shopsy"]):
        store_name = "Flipkart"
    elif any(x in url_lower for x in ["myntra.com", "myntr.it", "myntr.in"]) or "myntra" in plats_lower:
        store_name = "Myntra"
    else:
        store_name = "Retail Deal"
    print("simulated store_name:", store_name)
