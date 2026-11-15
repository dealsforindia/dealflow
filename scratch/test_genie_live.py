from genie_history import lookup_price_history
import json

test_urls = [
    "https://www.amazon.in/dp/B0CX21C8S1",
    "https://www.flipkart.com/ambrane-20000-mah-power-bank/p/itmd5611764",
]

for u in test_urls:
    print(f"\n--- Testing Genie for {u} ---")
    res = lookup_price_history(u)
    print("Success:", res.get("success"))
    if res.get("success"):
        print("Title:", res.get("title"))
        print("Price:", res.get("price"), "MRP:", res.get("mrp"), "Lowest:", res.get("lowest_price"))
        print("History Points count:", len(res.get("history_points", [])))
        if res.get("history_points"):
            print("First 3 points:", res.get("history_points")[:3])
            print("Last 3 points:", res.get("history_points")[-3:])
    else:
        print("Error:", res.get("error"))
