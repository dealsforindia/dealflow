import re, sys
sys.stdout.reconfigure(encoding='utf-8')

def parse_universal_multi_deal_items(text: str) -> list:
    """
    Universally extracts ANY multi-deal items regardless of category:
    Electronics, Groceries, Beauty, Fashion, Tools, Subscriptions, Variants, etc.
    """
    if not text:
        return []

    items = []
    lines = text.strip().split("\n")
    url_pattern = re.compile(r'(https?://[^\s<>"]+)')

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        
        urls = url_pattern.findall(line_clean)
        if not urls:
            continue
        
        url = urls[0]
        # Ignore global channel CTA links
        if any(skip in line_clean.lower() for skip in [
            "t.me/dealsforindia", "join telegram", "telegram channel", "whatsapp",
            "follow on", "join here"
        ]):
            continue

        # Everything before the URL is the label candidate
        prefix = line_clean[:line_clean.find(url)].strip()
        
        # Clean leading emojis, bullets, pointer arrows
        label = re.sub(r'^[👉⚡🔹🔸🔥🛍️🏷️📦✨💥🛒•\*\-\s]+', '', prefix).strip()
        # Clean leading numbered lists like "1. ", "2) ", "3 - "
        label = re.sub(r'^\d+[\.\)\:\-]\s*', '', label).strip()
        # Clean trailing separators like ':', '-', '—'
        label = re.sub(r'[:\-–—\s]+$', '', label).strip()
        
        # If prefix was empty, check if there's text after URL (e.g. "https://... Tops @ 199")
        if not label:
            suffix = line_clean[line_clean.find(url) + len(url):].strip()
            if suffix:
                label = re.sub(r'^[👉⚡🔹🔸\*\-\:\s]+', '', suffix).strip()

        # Clean markdown formatting (*, _, ~, `)
        label = re.sub(r'[*_~`]', '', label).strip()

        # If still no label, fallback to "Option 1", "Option 2"
        if not label:
            label = f"Option {len(items) + 1}"

        # Clean up any leftover punctuation
        label = label.strip(" :-–—|")

        items.append({
            "label": label,
            "url": url,
        })

    # Only return if 2 or more distinct links exist
    if len(items) >= 2:
        return items
    return []

# Test across various non-fashion examples:
samples = [
    # Electronics drop
    """
    🔥 Anker Mega Charging Sale!

    ⚡ 20W Fast Charger @ ₹599: https://amzn.to/charger20w
    ⚡ 65W GaN Multi-Port @ ₹1,499: https://amzn.to/charger65w
    ⚡ 20000mAh Powerbank @ ₹1,899: https://amzn.to/powerbank20k
    ⚡ Braided 100W Cable @ ₹299: https://amzn.to/cable100w

    Available on: Amazon
    """,
    # Grocery / Supermarket drop
    """
    🛒 Swiggy Instamart Grocery Loot:
    
    👉 Fortune Oil 1L: https://swiggy.com/oil
    👉 Aashirvaad Atta 5kg: https://swiggy.com/atta
    👉 Tata Tea Gold 500g: https://swiggy.com/tea
    """,
    # Audio / Gadgets
    """
    Sony Audio Festival:
    1. WH-1000XM5: https://amzn.to/xm5
    2. WF-C500 Earbuds: https://amzn.to/wfc500
    3. XB100 Bluetooth Speaker: https://amzn.to/xb100
    """,
    # Fashion drop
    """
    👕 Myntra : 85% Off On Pluss Women Clothing.
    👉 ⚡Tops: https://myntr.it/6OoLFmx
    👉 ⚡Dresses: https://myntr.it/18la34k
    👉 ⚡Jeans: https://myntr.it/4CwuY5G
    """
]

for i, s in enumerate(samples):
    print(f"=== SAMPLE {i+1} ===")
    res = parse_universal_multi_deal_items(s)
    for it in res:
        print(f"  • {it['label']} -> {it['url']}")
