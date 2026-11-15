import re

msg = """Svaara Women's Clothing @ ₹128 (Steal Deal)

https://ajiio.in/ebbK5d6 and above&curated=true&curatedid=min70percentoff-220997&gridColumns=2&segmentIds=&sort=discount-desc&visualFiltersState=Sarees:F|Kurta Suit Set:F&includeUnratedProducts=false"""

def extract_product_name(text: str) -> str:
    cleaned_text = re.sub(r'\[.*?\]\(.*?\)', '', text, flags=re.DOTALL)
    cleaned_text = re.sub(r'\[.*?\]', '', cleaned_text)
    cleaned_text = re.sub(r'https?://\S+', '', cleaned_text)
    
    lines = [l.strip() for l in cleaned_text.split('\n') if l.strip()]
    for idx, line in enumerate(lines):
        clean = re.sub(r'[*_~`#]', '', line)
        clean = re.sub(r'^[👉🔥⚡🛍️🎁🛒📦💥📢🏷️✨🚨📌▶️➔➡•—\-\s"\'\:\(\)\[\]\ufe0f]+', '', clean).strip()
        clean = re.sub(r'^(?:loot|deal|flash sale|special deal|offer|loot deal|big loot)\s*:\s*', '', clean, flags=re.IGNORECASE).strip()
        clean = re.sub(r'\s*(?:lowest\s*price|deal\s*price|regular|mrp|price)\s*:\s*(?:₹|Rs\.?)?\s*[\d,]+.*$', '', clean, flags=re.IGNORECASE).strip()
        if re.match(r'^[\d\s.,₹\-/\\():\[\]\(\)]+$', clean):
            continue
        if len(clean) < 4:
            continue
        if clean.startswith('(') or clean.startswith('[') or clean.startswith('{'):
            continue
        if '{title}' in clean.lower() or '{prod' in clean.lower() or '{{' in clean:
            continue
        if re.search(r'https?://|www\.|\.com|\.in|\.ltd|\.cc|\.co|\.it|\.club|t\.me/', clean, re.IGNORECASE):
            continue
        if re.match(r'^(?:₹|rs\.?|inr)\s*[\d,.]+', clean, re.I):
            continue
        if re.search(r'\b(?:fast|loot|jaldi|lowest|steal|hurry|price|regular|mrp|deal)\b', clean, re.I) and re.search(r'(?:₹|rs|\d+k|\d+%|\d+)', clean, re.I) and len(clean) < 45:
            # print("Line dropped by 292")
            continue
        clean = re.sub(r'\s*@\s*[\d,₹Rs\.]+\s*.*$', '', clean).strip()
        clean = re.sub(r'\s*:\s*$', '', clean).strip()
        if len(clean) > 4 and not re.match(r'^[\d\s.,₹\-/\\():\[\]\(\)]+$', clean):
            return clean[:120]
    return ""

res = extract_product_name(msg)
print("EXTRACTED RESULT:")
print(res.encode('ascii', errors='replace').decode('ascii'))
