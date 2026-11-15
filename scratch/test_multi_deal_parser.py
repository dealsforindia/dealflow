import re

def extract_multi_deal_items(text: str, expanded_urls: dict = None) -> list:
    """
    Extracts labeled sub-links from a deal post text.
    Handles formats like:
      👉 ⚡ Tops: https://myntr.it/...
      ⚡ Dresses : https://...
      Women: https://...
      Item Name @ 199: https://...
    Returns a list of dicts: [{"label": "Tops", "url": "https://..."}]
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
        # Skip generic store links at bottom like "Available on: Myntra" or bot links
        if any(w in line_clean.lower() for w in ["join", "telegram", "t.me/dealsforindia", "channel"]):
            continue

        # Extract label before the URL
        prefix = line_clean[:line_clean.find(url)].strip()
        # Clean prefix emojis and bullet characters
        label = re.sub(r'^[👉⚡🔹🔸🔥🛍️🏷️📦\*\-\d\.\:\s]+', '', prefix).strip()
        label = re.sub(r'[:\-–—\s]+$', '', label).strip()
        
        # If label is empty, try to derive a label or check if line has price
        if not label:
            # Check if there's text after url
            post_url = line_clean[line_clean.find(url) + len(url):].strip()
            if post_url:
                label = re.sub(r'^[👉⚡🔹🔸\*\-\:\s]+', '', post_url).strip()
        
        if not label:
            label = f"Option {len(items) + 1}"

        # Clean markdown asterisks
        label = re.sub(r'[*_~`]', '', label).strip()

        items.append({
            "label": label,
            "url": url,
        })

    # Only return if 2 or more distinct sub-items exist
    if len(items) >= 2:
        return items
    return []

sample_text = """
👕 Myntra : 85% Off On Pluss Women Clothing. (Flat 85% OFF)

👉 ⚡Tops: https://myntr.it/6OoLFmx
👉 ⚡Dresses: https://myntr.it/18la34k
👉 ⚡Sweatshirt: https://myntr.it/xLbr76q
👉 ⚡Shirt: https://myntr.it/BFOBvQ9
👉 ⚡Jackets: https://myntr.it/AdqCpPI
👉 ⚡Trousers: https://myntr.it/GNytLjZ
👉 ⚡Co-Ords: https://myntr.it/faDmQBl
👉 ⚡Jeans: https://myntr.it/4CwuY5G

Available on: Myntra
"""

print(extract_multi_deal_items(sample_text))
