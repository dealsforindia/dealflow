import sys
from pathlib import Path

sys.path.insert(0, str(Path(r"e:\Rudranildocs0066543\html-yt\dealbot_backend\dealbot")))

from bot import extract_product_name, parse_prices, detect_platform, detect_category

msg = """Svaara Women's Clothing @ ₹128 (Steal Deal)

https://ajiio.in/ebbK5d6 and above&curated=true&curatedid=min70percentoff-220997&gridColumns=2&segmentIds=&sort=discount-desc&visualFiltersState=Sarees:F|Kurta Suit Set:F&includeUnratedProducts=false"""

print("Platform:", detect_platform("https://ajiio.in/ebbK5d6"))
print("Product Name:", extract_product_name(msg))
print("Prices:", parse_prices(msg))
print("Category:", detect_category(msg))
