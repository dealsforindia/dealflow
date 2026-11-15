from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'dealbot_backend' / 'dealbot'
path = root / 'api.py'
text = path.read_text(encoding='utf-8')
start = text.index('    # Synthesize beautiful price history curve')
end = text.index('    price, mrp = live.get("price"), live.get("mrp")', start + len('    # Synthesize beautiful price history curve'))
# Find the second assignment, after the entire synthesis block.
end = text.index('    price, mrp = live.get("price"), live.get("mrp")', end + 1)
text = text[:start] + text[end:]
start = text.index('    # 7. Authentic pre-drop MRP / Regular price reference point')
end = text.index('    # 8. Sort chronologically', start)
text = text[:start] + '    # MRP is a reference price, never a historical observation.\n\n' + text[end:]
text = text.replace('    history = historical.get("history") or []', '    history = historical.get("history") or []\n    history_source = "ShoppinGenie" if history else "Directory price observations"', 1)
text = text.replace('"history": points, "has_historical_chart"', '"history": points, "history_source": history_source, "has_historical_chart"', 1)
text = text.replace('"canonical_key": canonical_key,\n        "price_intelligence":', '"canonical_key": canonical_key,\n        "history_source": "Directory price observations",\n        "price_intelligence":', 1)
text = text.replace('deal.get("processed_ts") or deal.get("ts") or time.time()\n    cur_ts_ms', 'deal.get("processed_ts") or deal.get("ts")\n    cur_ts_ms', 1)
text = text.replace('int(cur_ts * 1000) if cur_ts < 1e11 else int(cur_ts)', '(int(cur_ts * 1000) if cur_ts < 1e11 else int(cur_ts)) if cur_ts else None', 1)
text = text.replace('if cur_sale and float(cur_sale) > 0 and cur_ts_ms not in seen_times:', 'if cur_sale and float(cur_sale) > 0 and cur_ts_ms and cur_ts_ms not in seen_times:', 1)
path.write_text(text, encoding='utf-8')

path = root / 'store_scraper.py'
text = path.read_text(encoding='utf-8')
start = text.index('    # 6. High-res Product Image')
end = text.index('    # Brand', start)
text = text[:start] + '    # Primary gallery only, with matching ASIN and an authentic Amazon CDN URL.\n    from amazon_images import extract_amazon_image\n    res["image_url"] = extract_amazon_image(html, url)\n\n' + text[end:]
path.write_text(text, encoding='utf-8')

path = root / 'public_price_evidence.py'
text = path.read_text(encoding='utf-8')
old = '            image = soup.select_one(\'#landingImage\')\n            quote["image"] = (image.get(\'data-old-hires\') or image.get(\'src\')) if image else None'
assert old in text
text = text.replace(old, '            from amazon_images import extract_amazon_image\n            quote["image"] = extract_amazon_image(html, url)')
# Image extraction need not fail just because the current price is unavailable.
text = text.replace('    if quote["price"]:\n', '    if expected.startswith("amazon:"):\n        from amazon_images import extract_amazon_image\n        quote["image"] = extract_amazon_image(html, url)\n    if quote["price"]:\n', 1)
path.write_text(text, encoding='utf-8')

path = root / 'desidime_bot.py'
text = path.read_text(encoding='utf-8')
text = text.replace('        img_url = None\n        # BeautifulSoup meta tag lookup', '        from amazon_images import amazon_asin, extract_amazon_image\n        amazon_product = bool(amazon_asin(r.url))\n        img_url = extract_amazon_image(r.text, r.url) if amazon_product else None\n        if amazon_product and not img_url:\n            return None\n        # BeautifulSoup meta tag lookup', 1)
text = text.replace('        for prop in ["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"]:', '        for prop in ([] if amazon_product else ["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"]):', 1)
text = text.replace('                if store_details.get("image_url") and not img_path:', '                from amazon_images import amazon_asin, amazon_cdn_image\n                direct_amazon_image = amazon_cdn_image(store_details.get("image_url")) if amazon_asin(target_scrape_url) else None\n                if store_details.get("image_url") and (not img_path or direct_amazon_image):', 1)
text = text.replace('        img_url_web = f"https://api.rudranil.me/images/', '        img_url_web = f"https://api.rudranil.me/images/', 1)
# Keep Telegram attachments locally, but expose the merchant CDN URL to the storefront.
line = next(line for line in text.splitlines() if line.startswith('        img_url_web = '))
text = text.replace(line, line + '\n        if target_scrape_url and "store_details" in locals():\n            from amazon_images import amazon_asin, amazon_cdn_image\n            if amazon_asin(target_scrape_url) and amazon_cdn_image(store_details.get("image_url")):\n                img_url_web = store_details["image_url"]', 1)
# Reset per iteration so a failed lookup cannot reuse the previous product's image.
text = text.replace('        # Direct Store Ground Truth Scraping: Fetch authentic merchant details', '        store_details = {}\n        # Direct Store Ground Truth Scraping: Fetch authentic merchant details', 1)
path.write_text(text, encoding='utf-8')
