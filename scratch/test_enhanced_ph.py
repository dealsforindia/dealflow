import subprocess

remote_code = r'''
import os, sys, re, time
sys.path.insert(0, "/home/rudranil777/dealbot")
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

from price_history_tracker import extract_canonical_id

deals = list(db.UniqueDeals.find({"status": {"$in": ["posted", "auto_posted"]}}).sort("processed_ts", -1).limit(10))

for deal in deals:
    fp = deal.get("fp_hash")
    pname = (deal.get("prod_name") or deal.get("title") or "")[:40]
    
    # Resolve canonical_key
    canonical_key = deal.get("canonical_key") or extract_canonical_id(deal)
    
    # Candidate keys
    candidate_keys = set()
    if canonical_key:
        candidate_keys.add(canonical_key)
        if ":" in canonical_key:
            prefix, code = canonical_key.split(":", 1)
            candidate_keys.add(code)
            if prefix == "amz":
                candidate_keys.add(f"amazon:{code}")
            elif prefix == "fk":
                candidate_keys.add(f"flipkart:{code}")
    
    # Extract ASIN / FK from text/urls if not yet in candidate keys
    all_text = f"{deal.get('aff_text', '')} {deal.get('original_text', '')} {str(deal.get('expanded_urls', ''))}"
    m_asin = re.search(r'/(?:dp|gp/product|d|ASIN)/([A-Z0-9]{10})', all_text, re.I)
    if m_asin:
        asin = m_asin.group(1).upper()
        candidate_keys.update([f"amz:{asin}", f"amazon:{asin}", asin])
    
    m_fk = re.search(r'(?:flipkart\.com|fkrt\.cc|shopsy\.in)/.*?/p/(itm[a-zA-Z0-9]+)', all_text, re.I)
    if m_fk:
        fk_id = m_fk.group(1).lower()
        candidate_keys.update([f"fk:{fk_id}", f"flipkart:{fk_id}", fk_id])

    history_points = []
    seen_times = set()

    # 1. PriceHistory collection
    if candidate_keys:
        ph_docs = list(db.PriceHistory.find({"canonical_id": {"$in": list(candidate_keys)}}).sort("ts", 1))
        for doc in ph_docs:
            ts = doc.get("ts")
            p = doc.get("sale_price") if doc.get("sale_price") is not None else doc.get("price")
            if ts and p is not None and p > 0:
                ts_ms = int(ts * 1000) if ts < 1e11 else int(ts)
                if ts_ms not in seen_times:
                    history_points.append([ts_ms, float(p)])
                    seen_times.add(ts_ms)

    # 2. In-doc price_history from oos scanner
    doc_ph = deal.get("price_history") or []
    for item in doc_ph:
        if isinstance(item, (list, tuple)) and len(item) >= 2:
            try:
                t_val, p_val = item[0], item[1]
                t_ms = int(t_val) if t_val > 1e11 else int(float(t_val) * 1000)
                if t_ms not in seen_times and float(p_val) > 0:
                    history_points.append([t_ms, float(p_val)])
                    seen_times.add(t_ms)
            except Exception:
                pass

    # 3. Current deal price
    cur_sale = (deal.get("prices") or {}).get("sale") or deal.get("sale_price") or deal.get("price")
    cur_ts = deal.get("price_updated_at") or deal.get("processed_ts") or deal.get("ts") or time.time()
    cur_ts_ms = int(cur_ts * 1000) if cur_ts < 1e11 else int(cur_ts)
    if cur_sale and cur_sale > 0 and cur_ts_ms not in seen_times:
        history_points.append([cur_ts_ms, float(cur_sale)])
        seen_times.add(cur_ts_ms)

    # 4. Pre-drop baseline if single observation and regular/MRP exists
    mrp = (deal.get("prices") or {}).get("mrp") or deal.get("mrp") or deal.get("regular_price")
    if len(history_points) == 1 and mrp and float(mrp) > float(cur_sale):
        baseline_ts_ms = cur_ts_ms - (86400 * 7 * 1000)
        history_points.insert(0, [baseline_ts_ms, float(mrp)])
        seen_times.add(baseline_ts_ms)

    history_points.sort(key=lambda x: x[0])
    print(f"Deal {fp} | {pname} | Key: {canonical_key} | Points: {len(history_points)} | Low: {min(p[1] for p in history_points) if history_points else 0} | High: {max(p[1] for p in history_points) if history_points else 0}")
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
print("STDERR:")
print(res.stderr.encode('ascii', errors='replace').decode('ascii'))
