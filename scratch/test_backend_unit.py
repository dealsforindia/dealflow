import sys
from pathlib import Path

sys.path.insert(0, "/home/rudranil777/dealbot")

from universal_store_engine import resolve_store_from_url
from worker import extract_product_name, extract_prices, detect_category

msg = """Svaara Women's Clothing @ ₹128 (Steal Deal)

https://ajiio.in/ebbK5d6 and above&curated=true&curatedid=min70percentoff-220997&gridColumns=2&segmentIds=&sort=discount-desc&visualFiltersState=Sarees:F|Kurta Suit Set:F&includeUnratedProducts=false"""

print("Testing worker extract_product_name:")
worker_title = extract_product_name(msg)
print("  Worker Title:", repr(worker_title))
assert worker_title == "Svaara Women's Clothing", f"Unexpected worker title: {worker_title}"
print("  [OK] worker extracted Svaara Women's Clothing")

print("Testing prices:")
prices = extract_prices(msg)
print("  Prices:", prices)
assert prices.get("sale") == 128.0, f"Expected 128.0, got {prices.get('sale')}"
print("  [OK] prices extracted sale: 128.0")

print("Testing platform:")
plat = resolve_store_from_url("https://ajiio.in/ebbK5d6")
print("  Platform:", plat)
assert plat in ("AJIO", "Ajio"), f"Expected AJIO, got {plat}"
print("  [OK] platform detected AJIO")

print("Testing category:")
cat = detect_category(worker_title + " " + msg)
print("  Category:", cat)
assert cat == "👗 Fashion", f"Expected Fashion, got {cat}"
print("  [OK] category detected Fashion")

print("\nALL SVAARA & AJIO PARSER TESTS PASSED 100%!")
