import re

msg = """Svaara Women's Clothing @ ₹128 (Steal Deal)

https://ajiio.in/ebbK5d6 and above&curated=true&curatedid=min70percentoff-220997&gridColumns=2&segmentIds=&sort=discount-desc&visualFiltersState=Sarees:F|Kurta Suit Set:F&includeUnratedProducts=false"""

def extract_product_name_improved(text: str) -> str:
    cleaned_text = re.sub(r'\[.*?\]\(.*?\)', '', text, flags=re.DOTALL)
    cleaned_text = re.sub(r'\[.*?\]', '', cleaned_text)
    cleaned_text = re.sub(r'https?://\S+', '', cleaned_text)
    
    lines = [l.strip() for l in cleaned_text.split('\n') if l.strip()]
    for line in lines:
        clean = re.sub(r'[*_~`#]', '', line)
        clean = re.sub(r'^[👉🔥⚡🛍️🎁🛒📦💥📢🏷️✨🚨📌▶️➔➡•—\-\s"\'\:\(\)\[\]\ufe0f]+', '', clean).strip()
        # Strip trailing promo badges like (Steal Deal), (Loot Deal), [Loot], (Limited Offer)
        clean = re.sub(r'\s*[\(\[]\s*(?:steal|loot|hot|great|insane|killer|grab|best|flash|mega|super)?\s*(?:deal|loot|offer|price)\s*[\)\]]', '', clean, flags=re.I).strip()
        # Strip common promo prefixes like "Loot:" or "Deal:"
        clean = re.sub(r'^(?:loot|deal|flash sale|special deal|offer|loot deal|big loot)\s*:\s*', '', clean, flags=re.IGNORECASE).strip()
        # Strip trailing price labels like "Lowest Price : ₹999" or "@ ₹128" from product name line
        clean = re.sub(r'\s*(?:lowest\s*price|deal\s*price|regular|mrp|price)\s*:\s*(?:₹|Rs\.?)?\s*[\d,]+.*$', '', clean, flags=re.IGNORECASE).strip()
        clean = re.sub(r'\s*@\s*(?:₹|Rs\.?)?\s*[\d,]+(?:\.\d+)?\s*(?:k|/-|only)?.*$', '', clean, flags=re.I).strip()
        
        # Reject URL query parameter spillovers or fragments (e.g. "and above&curated=true&gridColumns=2")
        if re.search(r'&[a-zA-Z0-9_-]+=', clean) or re.search(r'\b(?:curated|curatedid|gridColumns|segmentIds|visualFiltersState|includeUnratedProducts)\b', clean, re.I):
            continue
        if re.search(r'https?://|www\.|\.com|\.in|\.ltd|\.cc|\.co|\.it|\.club|t\.me/', clean, re.IGNORECASE):
            continue
        if re.match(r'^[\d\s.,₹\-/\\():\[\]\(\)]+$', clean):
            continue
        if len(clean) < 4:
            continue
        if clean.startswith('(') or clean.startswith('[') or clean.startswith('{'):
            continue
        if '{title}' in clean.lower() or '{prod' in clean.lower() or '{{' in clean:
            continue
        # Strict price / currency / badge rejection for whole lines
        if re.match(r'^(?:₹|rs\.?|inr)\s*[\d,.]+', clean, re.I):
            continue
        if re.match(r'^(?:fast|loot|hurry|lowest|lowest price|best price|deal price|grab|flat|buy|price|regular|mrp|rs\.?|inr|₹|use\s+code|apply|only)[\s:@₹\d,/\-\%\(\)\|\+\*a-zA-Z]+$', clean, re.IGNORECASE):
            continue
        clean = re.sub(r'\s*:\s*$', '', clean).strip()
        if len(clean) > 4:
            return clean[:120]
    return ""

print("IMPROVED EXTRACTION:")
print(repr(extract_product_name_improved(msg)))
