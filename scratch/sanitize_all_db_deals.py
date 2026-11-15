import os
import re
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
col = MongoClient(mongo_uri)[db_name]['UniqueDeals']

print("=== Starting MongoDB Atlas Sanitization ===")

def infer_store(deal):
    all_text = f"{deal.get('aff_link', '')} {deal.get('url', '')} {deal.get('original_msg_link', '')} {deal.get('aff_text', '')} {deal.get('prod_name', '')}".lower()
    if any(k in all_text for k in ['flipkart', 'fkrt', 'flixcart']): return 'Flipkart'
    if any(k in all_text for k in ['amazon', 'amzn']): return 'Amazon'
    if any(k in all_text for k in ['myntra', 'myntr']): return 'Myntra'
    if any(k in all_text for k in ['ajio', 'ajiio']): return 'Ajio'
    if any(k in all_text for k in ['swiggy', 'instamart']): return 'Swiggy'
    if any(k in all_text for k in ['blinkit']): return 'Blinkit'
    if any(k in all_text for k in ['zepto']): return 'Zepto'
    return None

def clean_text(text, real_store=None):
    if not text:
        return text
    t = text
    # Strip {TITLE} and placeholders
    t = re.sub(r'^\s*\{TITLE\}\s*[-:|–—]?\s*', '', t, flags=re.I | re.MULTILINE)
    t = re.sub(r'\{TITLE\}', '', t, flags=re.I)
    t = re.sub(r'\{product\}', '', t, flags=re.I)
    t = re.sub(r'\{name\}', '', t, flags=re.I)
    # Redundant markdown links: [https://url](https://url) -> https://url
    t = re.sub(r'\[(https?://[^\s\]]+)\]\(\1\)', r'\1', t)
    # Available on: DesiDime / Telegram
    if re.search(r'Available on:\s*(?:DesiDime|Telegram|ddime)', t, re.IGNORECASE):
        if real_store:
            t = re.sub(r'Available on:\s*(?:DesiDime|Telegram|ddime)[^\n]*', f'Available on: {real_store}', t, flags=re.IGNORECASE)
        else:
            t = re.sub(r'\n*Available on:\s*(?:DesiDime|Telegram|ddime)[^\n]*', '', t, flags=re.IGNORECASE)
    return t.strip()

# 1. Sanitize deals with DesiDime in platforms or store
dd_deals = list(col.find({
    '$or': [
        {'platforms': 'DesiDime'},
        {'platforms': 'Desidime'},
        {'store': 'DesiDime'},
        {'store': 'Desidime'}
    ]
}))
print(f"Found {len(dd_deals)} deals with DesiDime as platform/store.")
fixed_dd = 0
for d in dd_deals:
    real = infer_store(d) or "Online Store"
    upd = {
        'store': real,
        'platforms': [real]
    }
    if d.get('category') in ['DesiDime', 'Desidime']:
        upd['category'] = real
    col.update_one({'_id': d['_id']}, {'$set': upd})
    fixed_dd += 1
print(f"✓ Fixed {fixed_dd} deals with DesiDime store -> authentic store.")

# 2. Sanitize deals with {title} or DesiDime in text fields
text_deals = list(col.find({
    '$or': [
        {'prod_name': {'$regex': r'\{title\}', '$options': 'i'}},
        {'title': {'$regex': r'\{title\}', '$options': 'i'}},
        {'aff_text': {'$regex': r'\{title\}', '$options': 'i'}},
        {'ai_formatted_text': {'$regex': r'\{title\}', '$options': 'i'}},
        {'aff_text': {'$regex': 'Available on: DesiDime', '$options': 'i'}},
        {'ai_formatted_text': {'$regex': 'Available on: DesiDime', '$options': 'i'}}
    ]
}))
print(f"Found {len(text_deals)} deals with placeholder or DesiDime text.")
fixed_text = 0
for d in text_deals:
    real = infer_store(d)
    upd = {}
    if d.get('prod_name'):
        clean_pn = re.sub(r'^\s*\{TITLE\}\s*[-:|–—]?\s*', '', d['prod_name'], flags=re.I).strip()
        clean_pn = re.sub(r'\{TITLE\}', '', clean_pn, flags=re.I).strip()
        if not clean_pn or clean_pn.lower() in ["deal", "product", "special offer"]:
            clean_pn = "Special Loot Offer"
        upd['prod_name'] = clean_pn
    if d.get('title'):
        clean_t = re.sub(r'^\s*\{TITLE\}\s*[-:|–—]?\s*', '', d['title'], flags=re.I).strip()
        clean_t = re.sub(r'\{TITLE\}', '', clean_t, flags=re.I).strip()
        if clean_t:
            upd['title'] = clean_t
    if d.get('aff_text'):
        upd['aff_text'] = clean_text(d['aff_text'], real)
    if d.get('ai_formatted_text'):
        upd['ai_formatted_text'] = clean_text(d['ai_formatted_text'], real)
    if d.get('message'):
        upd['message'] = clean_text(d['message'], real)
    if upd:
        col.update_one({'_id': d['_id']}, {'$set': upd})
        fixed_text += 1
print(f"✓ Sanitized {fixed_text} deals with placeholder or aggregator text.")
print("=== MongoDB Atlas Sanitization Completed Successfully! ===")
