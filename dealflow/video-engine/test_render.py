#!/usr/bin/env python3
"""
Test runner for DealFlow Viral Short Video Generator.
Renders a full 1080x1920 15s MP4 video with authentic deal metadata.
"""

import sys
import asyncio
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

sys.path.insert(0, str(Path(__file__).parent))
from generator import generate_viral_short

SAMPLE_DEAL = {
    "fp_hash": "test_biotique_ubtan",
    "prod_name": "Biotique Ubtan & Collagen Skin Brightening Face Pack Mask (100g)",
    "brand": "Biotique",
    "sale_price": 149,
    "mrp": 599,
    "discount_pct": 75,
    "store": "Amazon",
    "coupon": "Extra 10% Coupon",
    "category": "💄 Beauty",
    "img_url": "https://m.media-amazon.com/images/I/71IkDIETLlL._AC_UF1000,1000_QL80_.jpg",
    "affiliate_url": "https://indiadealhunts.com/deals/biotique-ubtan"
}

async def main():
    out_file = "dealflow/video-engine/sample_loot_short.mp4"
    print(f"🎬 Starting test render -> {out_file}...")
    res = await generate_viral_short(SAMPLE_DEAL, out_file)
    print("Render Result:")
    import json
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
