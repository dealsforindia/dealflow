import re

raw_text = """Svaara Women's Clothing @ ₹128 (Steal Deal)

https://ajiio.in/ebbK5d6 and above&curated=true&curatedid=min70percentoff-220997&gridColumns=2&segmentIds=&sort=discount-desc&visualFiltersState=Sarees:F|Kurta Suit Set:F&includeUnratedProducts=false these type comes in tg"""

urls = re.findall(r'https?://[^\s\)\]>"\']+', raw_text)
print("Extracted URLs:", urls)
