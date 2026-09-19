from worker import extract_prices

t1 = "AJIO Loot : Flat 70% Off On John Players Clothing.\n\nhttps://ajiio.in/uj0HIuH"
p1 = extract_prices(t1)
print("ExtraPe AJIO prices:", p1)

t2 = "boAt 10000 mAh 22.5 W Slim Pocket Size Power Bank Price in India - Buy boAt 1000\nhttps://fkrt.cc/hIS88BK"
p2 = extract_prices(t2)
print("boAt prices:", p2)
