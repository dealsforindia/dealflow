import sys
sys.path.insert(0, 'dealbot_backend/dealbot')

from deal_clusterer import cluster_deals, extract_cluster_key

deal1 = {
    "fp_hash": "fp1",
    "prod_name": "Havells Craft Kitchen Harmony Combo for Premium and Modern Kitchens | Mixer Grinder + Toas",
    "prices": {"sale": 10037.33, "mrp": 25085.0},
    "coupon": "Apply 20% coupon",
    "coupon_discount": 2007.47,
    "effective_price": 8829.86,
    "source_channel": "-1001268661047",
    "channel": "Genie Loot",
    "store": "Amazon",
    "img_url": "https://m.media-amazon.com/images/I/havells_combo.jpg",
    "ts": 1792400000,
}

deal2 = {
    "fp_hash": "fp2",
    "prod_name": "Havells Craft Kitchen Harmony Combo for Premium and Modern Kitchens | Mixer Grinder + Toaster + Hand",
    "prices": {"sale": 10037.33, "mrp": 25085.0},
    "coupon": "Apply 20% coupon",
    "coupon_discount": 2007.47,
    "effective_price": 8829.86,
    "source_channel": "https://t.me/+LQ3FigpMfmAyZGJl",
    "channel": "Offerzone 2.0",
    "store": "Amazon",
    "img_url": "https://m.media-amazon.com/images/I/havells_combo.jpg",
    "ts": 1792400010,
}

print("Deal 1 Cluster Key:", extract_cluster_key(deal1))
print("Deal 2 Cluster Key:", extract_cluster_key(deal2))

clustered, stats = cluster_deals([deal1, deal2])
print("\nStats:", stats)
print("Clustered Count:", len(clustered))

best = clustered[0]
print("\n--- BEST CLUSTERED DEAL ---")
print("Title:", best.get("title") or best.get("prod_name"))
print("Cluster Count:", best.get("cluster_count"))
print("Spotted Badges:", ascii(best.get("deal_badges")))
print("Cluster Channels:", [c["name"] for c in best.get("cluster_channels", [])])
print("Duplicate Hashes:", best.get("duplicate_hashes"))

assert len(clustered) == 1, "Should have clustered 2 deals into 1"
assert best.get("cluster_count") == 2, "Cluster count should be 2"
assert "Mixer Grinder + Toaster + Hand" in (best.get("title") or ""), "Should select the longer complete title"
assert len(best.get("cluster_channels", [])) == 2, "Should have 2 channels in cluster_channels"
print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")
