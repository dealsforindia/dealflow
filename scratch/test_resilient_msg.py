import sys
from pathlib import Path
sys.path.insert(0, str(Path(r"e:\Rudranildocs0066543\html-yt\dealbot_backend\dealbot")))

from resilient_extractor import extract_product_name_resilient

msg = """Svaara Women's Clothing @ ₹128 (Steal Deal)

https://ajiio.in/ebbK5d6 and above&curated=true&curatedid=min70percentoff-220997&gridColumns=2&segmentIds=&sort=discount-desc&visualFiltersState=Sarees:F|Kurta Suit Set:F&includeUnratedProducts=false"""

res = extract_product_name_resilient(msg)
print("resilient output:", repr(res))
