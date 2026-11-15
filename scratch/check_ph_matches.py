import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient
import re

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

# Let's inspect 10 recent public deals
deals = list(db.UniqueDeals.find({"status": {"$in": ["posted", "auto_posted"]}}).sort("processed_ts", -1).limit(10))

for d in deals:
    fp = d.get("fp_hash")
    pname = (d.get("prod_name") or d.get("title") or "")[:40]
    aff = d.get("aff_text") or ""
    
    # Try finding ASIN
    m_asin = re.search(r'/(?:dp|gp/product|d)/([A-Z0-9]{10})', aff, re.I)
    asin = m_asin.group(1).upper() if m_asin else None
    
    # Try finding Flipkart ID
    m_fk = re.search(r'(?:flipkart\.com|fkrt\.cc|shopsy\.in)/.*?/p/(itm[a-zA-Z0-9]+)', aff, re.I)
    fk = m_fk.group(1).lower() if m_fk else None
    
    # Find matching records in PriceHistory
    query_cids = []
    if asin:
        query_cids.extend([f"amz:{asin}", f"amazon:{asin}", asin])
    if fk:
        query_cids.extend([f"fk:{fk}", f"flipkart:{fk}", fk])
    
    ph_docs = []
    if query_cids:
        ph_docs = list(db.PriceHistory.find({"canonical_id": {"$in": query_cids}}))
    
    # Also check slug match
    clean = re.sub(r'[^a-zA-Z0-9]+', '-', pname).strip('-').lower()[:50]
    slug_ph = list(db.PriceHistory.find({"canonical_id": f"slug:{clean}"}))
    
    doc_ph = d.get("price_history")
    
    print(f"Deal {fp} | {pname} | ASIN: {asin} | FK: {fk} | PriceHistory docs: {len(ph_docs)} | Slug docs: {len(slug_ph)} | In-doc price_history: {len(doc_ph) if doc_ph else 0}")
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("STDOUT:")
print(res.stdout.encode('ascii', errors='replace').decode('ascii'))
