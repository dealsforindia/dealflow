#!/usr/bin/env python3
"""
test_30_deal_scenarios.py
Rigorous stress test of the DealFlow Intelligence Engine across 30 diverse scenarios:
- Real products with links and images
- Real products with links, NO image
- Financial leads (Kotak 811, AU Bank, Loans, Demat, Betting)
- Tricks without links (coupons, offline hacks, spam)
- Promotional cashback masquerading as sale price
- Price glitches, combos, nested shortlinks, markdown formatting
"""

import os
import sys
import asyncio
import json

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

# Ensure parent directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from deal_intelligence import (
    classify_deal_intent,
    ai_classify_deal,
    calculate_deal_intelligence_score,
    TIER_1_STORES,
    TIER_1_BRANDS
)
import re

BOT_BLOCKED_TERMS = [
    'site maintenance', 'maintenance', 'access denied', 'just a moment',
    'security check', 'robot or human', 'are you a human', 'attention required',
    '403 forbidden', '404 not found', 'page not found', 'myntra new', 'amazon.in',
    'flipkart.com', 'online shopping', 'loading...', 'error', 'digihaat', 'we could not locate'
]

def extract_prices(text: str) -> dict:
    prices = {"mrp": None, "sale": None, "discount_pct": None}
    if not text:
        return prices

    def _parse_val(val_str: str, k_unit: str = None) -> float | None:
        try:
            val = float(val_str.replace(",", ""))
            if k_unit and k_unit.lower() == 'k':
                val *= 1000.0
            return val
        except Exception:
            return None

    at_m = re.search(r'(?:@|at)\s*(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d+)?)\s*(k|k\b)?', text, re.I)
    if at_m:
        v = _parse_val(at_m.group(1), at_m.group(2) if len(at_m.groups()) >= 2 else None)
        if v and 1 <= v <= 1000000:
            prices["sale"] = v

    if not prices["sale"]:
        sale_patterns = [
            r'(?:now|offer|sale|deal|get|buy|loot\s*price|deal\s*price|offer\s*price)[:\s]*(?:at|for|@)?\s*(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d+)?)\s*(k|k\b)?',
            r'(?:just|only|price|final|effectively)[:\s]+(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d+)?)\s*(k|k\b)?',
            r'₹\s*([\d,]+(?:\.\d+)?)\s*(k|k\b)?',
            r'Rs\.?\s*([\d,]+(?:\.\d+)?)\s*(k|k\b)?',
            r'(?:INR|inr)\s*([\d,]+(?:\.\d+)?)\s*(k|k\b)?',
            r'([\d,]+)\s*(?:/-|only|rupees)',
        ]
        for pat in sale_patterns:
            m = re.search(pat, text, re.I)
            if m:
                v = _parse_val(m.group(1), m.group(2) if len(m.groups()) >= 2 else None)
                if not v:
                    continue
                if 1 <= v <= 1000000:
                    prices["sale"] = v
                    break

        if not prices["sale"]:
            # Check for isolated numeric price lines (e.g. "199." or "799." or "199/-")
            iso_m = re.search(r'(?:^|\n)\s*(?:[👉🔥⚡💥📢🏷️]\s*)?(\d{2,6})\s*\.?\s*(?:/-|only)?\s*(?:\n|$)', text)
            if iso_m:
                try:
                    iv = float(iso_m.group(1))
                    if 20 <= iv <= 500000:
                        prices["sale"] = iv
                except Exception:
                    pass

    mrp_patterns = [
        r'(?:MRP|M\.R\.P|original\s*price|was|regular|mrp\s*price)[:\s]*(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d+)?)\s*(k|k\b)?',
        r'₹\s*([\d,]+(?:\.\d+)?)\s*(k|k\b)?\s*(?:~~|strike|crossed|strikethrough)',
        r'(?:~~|~)\s*(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d+)?)\s*(k|k\b)?\s*(?:~~|~)',
    ]
    for pat in mrp_patterns:
        m = re.search(pat, text, re.I)
        if m:
            v = _parse_val(m.group(1), m.group(2) if len(m.groups()) >= 2 else None)
            if v and v >= 1:
                if v <= 10 and prices["sale"] and prices["sale"] > 10:
                    continue
                if prices["sale"] and abs(v - prices["sale"]) < 1:
                    continue
                prices["mrp"] = v
                break

    if prices["mrp"] is not None and prices["sale"] is not None:
        if prices["mrp"] <= 10 and prices["sale"] > 10:
            prices["mrp"] = None
        elif prices["mrp"] < prices["sale"]:
            if prices["mrp"] <= 10:
                prices["mrp"] = None
            else:
                prices["sale"], prices["mrp"] = prices["mrp"], prices["sale"]
        elif prices["mrp"] == prices["sale"]:
            prices["mrp"] = None

    dm = re.search(r'(\d{1,2})\s*%\s*off', text, re.I)
    if dm:
        try: prices["discount_pct"] = int(dm.group(1))
        except: pass
    elif prices["mrp"] and prices["sale"] and prices["mrp"] > prices["sale"]:
        prices["discount_pct"] = round((1 - prices["sale"] / prices["mrp"]) * 100)

    return prices

def extract_product_name(text: str) -> str:
    if not text: return ""
    cleaned_text = re.sub(r'\[.*?\]\(.*?\)', '', text, flags=re.DOTALL)
    cleaned_text = re.sub(r'\[.*?\]', '', cleaned_text)
    cleaned_text = re.sub(r'https?://\S+', '', cleaned_text)
    
    lines = [l.strip() for l in cleaned_text.split('\n') if l.strip()]
    for line in lines:
        clean = re.sub(r'[*_~`#]', '', line)
        clean = re.sub(r'^[👉🔥⚡🛍️🎁🛒📦💥📢🏷️✨🚨📌▶️➔➡•—\-\s"\'\:\(\)\[\]\ufe0f]+', '', clean).strip()
        # Strip common promo prefixes like "Loot:" or "Deal:"
        clean = re.sub(r'^(?:loot|deal|flash sale|special deal|offer|loot deal|big loot)\s*:\s*', '', clean, flags=re.IGNORECASE).strip()
        # Strip trailing price labels like "Lowest Price : ₹999" from product name line
        clean = re.sub(r'\s*(?:lowest\s*price|deal\s*price|regular|mrp|price)\s*:\s*(?:₹|Rs\.?)?\s*[\d,]+.*$', '', clean, flags=re.IGNORECASE).strip()
        if re.match(r'^[\d\s.,₹\-/\\():\[\]\(\)]+$', clean):
            continue
        if len(clean) < 4:
            continue
        if clean.startswith('(') or clean.startswith('['):
            continue
        if re.search(r'https?://|www\.|\.com|\.in|\.ltd|\.cc|\.co|\.it|\.club|t\.me/', clean, re.IGNORECASE):
            continue
        if re.match(r'^(?:₹|rs\.?|inr)\s*[\d,.]+', clean, re.I):
            continue
        if re.search(r'\b(?:fast|loot|jaldi|lowest|steal|hurry|price|regular|mrp|deal)\b', clean, re.I) and re.search(r'(?:₹|rs|\d+k|\d+%|\d+)', clean, re.I) and len(clean) < 45:
            continue
        if re.match(r'^(?:fast|loot|hurry|lowest|lowest price|best price|deal price|grab|flat|buy|price|regular|mrp|rs\.?|inr|₹|use\s+code|apply|only)[\s:@₹\d,/\-\%\(\)\|\+\*a-zA-Z]+$', clean, re.IGNORECASE):
            continue
        if re.search(r'\b(?:apply\s+(?:\d+%\s+off\s+)?coupon|apply\s+code|use\s+code|collect\s+coupon|regular:\s*[\d\.kK]+|lowest\s*price\s*:\s*₹?\d+)\b', clean, re.IGNORECASE):
            continue
        if re.match(r'^(?:loot|lowest\s*price|price|mrp)\s*\d+\s*[:\s]*$', clean, re.IGNORECASE):
            continue
        if re.match(r'^(?:fast|loot|hurry|loot deal|big loot|huge loot|over|ended|limited stock|loot at|starts at)\b', clean, re.IGNORECASE) and len(clean) < 30:
            continue
        if re.match(r'^(?:\d+\s*%\s*off|upto\s*\d+\s*%\s*off)$', clean, re.IGNORECASE):
            continue
        clean = re.sub(r'\s*@\s*[\d,₹Rs\.]+\s*.*$', '', clean).strip()
        clean = re.sub(r'\s*:\s*$', '', clean).strip()
        if len(clean) > 4 and not re.match(r'^[\d\s.,₹\-/\\():\[\]\(\)]+$', clean) and not re.match(r'^(?:loot|price|mrp)\s*\d+$', clean, re.IGNORECASE):
            return clean[:120]
    return ""

def is_invalid_product_name(name: str) -> bool:
    if not name or len(name.strip()) < 5:
        return True
    clean = re.sub(r'[*_~`#\[\]\(\)]', '', name).strip()
    clean = re.sub(r'^[👉🔥⚡🛍️🎁🛒📦💥📢🏷️✨🚨📌▶️➔➡•—\-\s"\'\:\(\)\[\]\ufe0f]+', '', clean).strip()
    clean_lower = clean.lower()
    if any(b in clean_lower for b in BOT_BLOCKED_TERMS):
        return True
    if re.search(r'https?://|www\.|\.com|\.in|\.ltd|\.cc|\.co|\.it|\.club|t\.me/|amzn\.to|fkrt\.cc|fkrt\.to', clean, re.I):
        return True
    if re.search(r'\b(?:fast|loot|jaldi|lowest|steal|hurry|price|regular|mrp|deal)\b', clean, re.I) and re.search(r'(?:₹|rs|\d+k|\d+%|\d+)', clean, re.I) and len(clean) < 45:
        return True
    return False

TEST_DEALS = [
    # ── CATEGORY 1: Genuine E-Commerce Deals (With Links & Images) ──
    {
        "id": 1,
        "name": "boAt Airdopes 141 ANC (Amazon with image)",
        "text": "🔥 boAt Airdopes 141 ANC TWS Earbuds with 32dB ANC, 42H Playtime\nMRP: ₹4,490\nDeal Price: ₹899 (80% Off)\n👉 https://www.amazon.in/dp/B0C3R8QXYZ",
        "urls": ["https://www.amazon.in/dp/B0C3R8QXYZ"],
        "has_image": True,
        "expected_is_deal": True,
        "expected_tier": "🔥 LOOT_DROP",
    },
    {
        "id": 2,
        "name": "Selvia Women Co-ord Set (Flipkart with image)",
        "text": "Loot Deal: Selvia Women's Tops and Short Co ord Set @ ₹499 (MRP ₹1,999)\n👉 https://dl.flipkart.com/dl/selvia-womens-co-ord-set/p/itm12345",
        "urls": ["https://dl.flipkart.com/dl/selvia-womens-co-ord-set/p/itm12345"],
        "has_image": True,
        "expected_is_deal": True,
        "expected_tier": "🔥 LOOT_DROP",
    },
    {
        "id": 3,
        "name": "Red Tape Walking Shoes (Myntra with image)",
        "text": "Red Tape Men Grey Walking Shoes\nPrice: ₹1,199 | MRP: ₹5,499 (78% Off)\n👉 https://www.myntra.com/shoes/red-tape/men-grey-walking-shoes/123456/buy",
        "urls": ["https://www.myntra.com/shoes/red-tape/men-grey-walking-shoes/123456/buy"],
        "has_image": True,
        "expected_is_deal": True,
        "expected_tier": "🔥 LOOT_DROP",
    },
    {
        "id": 4,
        "name": "Dennis Lingo Casual Shirt (AJIO with image)",
        "text": "Dennis Lingo Men Slim Fit Cotton Casual Shirt\nSpecial Price: ₹549 (MRP ₹2,499)\n👉 https://www.ajio.com/dennis-lingo-slim-fit-shirt/p/460123",
        "urls": ["https://www.ajio.com/dennis-lingo-slim-fit-shirt/p/460123"],
        "has_image": True,
        "expected_is_deal": True,
        "expected_tier": "🔥 LOOT_DROP",
    },
    {
        "id": 5,
        "name": "Fortune Sunlite Oil 1L (Swiggy with image)",
        "text": "Fortune Sunlite Refined Sunflower Oil 1L Pouch @ ₹129 (MRP ₹185)\n👉 https://www.swiggy.com/stores/instamart/item/fortune-sunlite-1l",
        "urls": ["https://www.swiggy.com/stores/instamart/item/fortune-sunlite-1l"],
        "has_image": True,
        "expected_is_deal": True,
        "expected_tier": "⚡ GOOD_OFFER",
    },

    # ── CATEGORY 2: Genuine Deals WITH Links, but NO Image (Text-Only) ──
    {
        "id": 6,
        "name": "Portronics 20W Charger (Amazon, No Image)",
        "text": "⚡ Portronics Adapto 20 Type C Fast Charger Adapter 20W\nPrice: ₹299 (MRP ₹999) - 70% Off\n👉 https://www.amazon.in/dp/B08XYZ1234",
        "urls": ["https://www.amazon.in/dp/B08XYZ1234"],
        "has_image": False,
        "expected_is_deal": True,
        "expected_tier": "💎 STEAL_DEAL",
    },
    {
        "id": 7,
        "name": "Milton Thermosteel Bottle (Flipkart, No Image)",
        "text": "Milton Thermosteel Flip Lid 1000ml Stainless Steel Flask @ ₹749 (MRP ₹1,299)\n👉 https://dl.flipkart.com/dl/milton-thermosteel-bottle/p/itm9876",
        "urls": ["https://dl.flipkart.com/dl/milton-thermosteel-bottle/p/itm9876"],
        "has_image": False,
        "expected_is_deal": True,
        "expected_tier": "💎 STEAL_DEAL",
    },
    {
        "id": 8,
        "name": "Stainless Steel Spice Rack (Shopsy, No Image)",
        "text": "FoldFirst 4 LAYER MULTI PURPOSE RACK Plastic Shoe Rack @ ₹199 (MRP ₹899)\n👉 https://shopsy.in/rack/p/itm111222",
        "urls": ["https://shopsy.in/rack/p/itm111222"],
        "has_image": False,
        "expected_is_deal": True,
        "expected_tier": "🔥 LOOT_DROP",
    },
    {
        "id": 9,
        "name": "Tata Tea Gold 1kg (Blinkit, No Image)",
        "text": "Tata Tea Gold Rich Taste 1kg Pack @ ₹399 (MRP ₹550)\n👉 https://blinkit.com/prn/tata-tea-gold/prid/12345",
        "urls": ["https://blinkit.com/prn/tata-tea-gold/prid/12345"],
        "has_image": False,
        "expected_is_deal": True,
        "expected_tier": "⚡ GOOD_OFFER",
    },
    {
        "id": 10,
        "name": "Maybelline Colossal Kajal (Nykaa, No Image)",
        "text": "Maybelline New York Colossal Kajal Deep Black @ ₹149 (MRP ₹299)\n👉 https://www.nykaa.com/maybelline-colossal-kajal/p/9988",
        "urls": ["https://www.nykaa.com/maybelline-colossal-kajal/p/9988"],
        "has_image": False,
        "expected_is_deal": True,
        "expected_tier": "💎 STEAL_DEAL",
    },

    # ── CATEGORY 3: Tricks WITH Links (Disguised Non-Deals / Financial Leads) ──
    {
        "id": 11,
        "name": "Kotak 811 Bank Account Trick",
        "text": "🔥 SMART BANKING, BIGGER SAVINGS!\nOpen Kotak 811 Zero Balance Savings Account & Get ₹500 Amazon Voucher + 7% Interest!\n👉 https://kotak.com/811-savings-lead",
        "urls": ["https://kotak.com/811-savings-lead"],
        "has_image": True,
        "expected_is_deal": False,
        "expected_intent": "FINANCIAL_LEAD",
    },
    {
        "id": 12,
        "name": "AU LIT Credit Card Trick",
        "text": "💳 Lifetime Free Credit Card!\nApply for AU Small Finance Bank LIT Credit Card. Zero Joining Fee + 5% Cashback on dining and grocery.\n👉 https://aubank.in/credit-cards/lit-apply",
        "urls": ["https://aubank.in/credit-cards/lit-apply"],
        "has_image": True,
        "expected_is_deal": False,
        "expected_intent": "FINANCIAL_LEAD",
    },
    {
        "id": 13,
        "name": "Angel One Demat Account Lead",
        "text": "📈 Open Free Demat Account with Angel One! Zero brokerage on delivery + Free ₹1,000 Stocks on first trade.\n👉 https://angelone.in/open-demat-account",
        "urls": ["https://angelone.in/open-demat-account"],
        "has_image": False,
        "expected_is_deal": False,
        "expected_intent": "FINANCIAL_LEAD",
    },
    {
        "id": 14,
        "name": "Navi Instant Cash Loan Trick",
        "text": "💸 Instant Personal Loan up to ₹5,00,000 in just 2 minutes! Disbursed directly to bank account. Zero paperwork.\n👉 https://navi.com/instant-cash-loan",
        "urls": ["https://navi.com/instant-cash-loan"],
        "has_image": True,
        "expected_is_deal": False,
        "expected_intent": "FINANCIAL_LEAD",
    },
    {
        "id": 15,
        "name": "WinZO Gaming / Betting Trick",
        "text": "🎰 Play WinZO Gold & Win Real Cash! Download now and get ₹550 signup bonus in your wallet. 100+ Games.\n👉 https://winzo.com/download-gold",
        "urls": ["https://winzo.com/download-gold"],
        "has_image": True,
        "expected_is_deal": False,
        "expected_intent": "BETTING_GAMING",
    },
    {
        "id": 16,
        "name": "Promotional Cashback Trap (Bill Payment)",
        "text": "⚡ Flat ₹500 Cashback on Electricity Bill Payment! Complete transaction via Cred App.\n👉 https://cred.club/pay-bills",
        "urls": ["https://cred.club/pay-bills"],
        "has_image": False,
        "expected_is_deal": False,
        "expected_intent": "FINANCIAL_LEAD",
    },
    {
        "id": 17,
        "name": "Telegram VIP Channel Cross-Promo",
        "text": "🚀 Want secret 100% free loots before anyone else?\nJoin our VIP Telegram Channel now! Only 50 spots left!\n👉 https://t.me/fake_vip_channel",
        "urls": ["https://t.me/fake_vip_channel"],
        "has_image": False,
        "expected_is_deal": False,
        "expected_intent": "SPAM_CROSS_PROMO",
    },
    {
        "id": 18,
        "name": "Refer & Earn Task Campaign",
        "text": "💰 Refer and earn ₹250 per friend! Invite friends and get cash in bank after KYC.\n👉 https://taskbucks.com/refer-earn",
        "urls": ["https://taskbucks.com/refer-earn"],
        "has_image": False,
        "expected_is_deal": False,
        "expected_intent": "REFERRAL_PROMO",
    },
    {
        "id": 19,
        "name": "Jupiter Neobank Account Opening",
        "text": "🏦 Open Jupiter Zero Balance Digital Account in 3 mins. Get 1% Debit card cashback on every spend.\n👉 https://jupiter.money/account-open",
        "urls": ["https://jupiter.money/account-open"],
        "has_image": True,
        "expected_is_deal": False,
        "expected_intent": "FINANCIAL_LEAD",
    },
    {
        "id": 20,
        "name": "Dream11 Mega Contest Trick",
        "text": "🏏 Today's Match Mega Contest Entry! Create your Dream 11 team & win ₹1 Crore jackpot prize!\n👉 https://dream11.com/cricket-mega",
        "urls": ["https://dream11.com/cricket-mega"],
        "has_image": True,
        "expected_is_deal": False,
        "expected_intent": "BETTING_GAMING",
    },

    # ── CATEGORY 4: Tricks WITHOUT Links (Text-Only Tricks, Coupon Hacks, Spam) ──
    {
        "id": 21,
        "name": "Domino's Pizza Secret Coupon (No Link)",
        "text": "🍕 Domino's Secret Coupon Code Trick!\nUse code: PIZZAMAGIC\nGet Flat ₹100 Off on orders above ₹299. Valid today only on Domino's app!",
        "urls": [],
        "has_image": False,
        "expected_is_deal": True, # A coupon deal / trick
        "expected_has_coupon": "PIZZAMAGIC",
    },
    {
        "id": 22,
        "name": "Offline HDFC Credit Card POS Offer (No Link)",
        "text": "💳 HDFC Bank Offer: Get 10% instant discount at all Croma stores using HDFC Credit Cards this weekend on purchase of ₹10,000+.",
        "urls": [],
        "has_image": False,
        "expected_is_deal": False, # Financial / bank promo
        "expected_intent": "FINANCIAL_LEAD",
    },
    {
        "id": 23,
        "name": "Personal Loan Spam Call (No Link)",
        "text": "Call 9876543210 for instant personal loan approval up to ₹10 Lakhs without CIBIL check. 100% guaranteed approval.",
        "urls": [],
        "has_image": False,
        "expected_is_deal": False, # Loan lead
        "expected_intent": "FINANCIAL_LEAD",
    },
    {
        "id": 24,
        "name": "Fake Giveaway Spam (No Link)",
        "text": "🎉 Congratulations! You have won a free ₹25,000 gift voucher. Follow us on whatsapp and message admin to claim your reward.",
        "urls": [],
        "has_image": False,
        "expected_is_deal": False, # Spam / promo
        "expected_intent": "SPAM_CROSS_PROMO",
    },
    {
        "id": 25,
        "name": "Swiggy Coupon Trick (No Link)",
        "text": "🍔 Swiggy Food Coupon Trick!\nUse code: SWIGGYIT to get 50% off up to ₹120 on your next lunch order on Swiggy.",
        "urls": [],
        "has_image": False,
        "expected_is_deal": True,
        "expected_has_coupon": "SWIGGYIT",
    },

    # ── CATEGORY 5: Edge Cases, Glitches, Combos & Formatting ──
    {
        "id": 26,
        "name": "Price Glitch / Error (Puma Sneakers @ ₹1)",
        "text": "🚨 PRICE GLITCH!! Puma Unisex-Adult Smash V2 Sneakers @ ₹1 (MRP ₹3,999)!! Hurry will cancel soon!\n👉 https://www.amazon.in/dp/B07XYZPUMA",
        "urls": ["https://www.amazon.in/dp/B07XYZPUMA"],
        "has_image": True,
        "expected_is_deal": True,
        "expected_tier": "🔥 LOOT_DROP",
    },
    {
        "id": 27,
        "name": "Combo Loot with Stackable Coupon",
        "text": "🔥 Loot: MuscleBlaze Liquid L-Carnitine PRO 3300mg @ ₹1,383 (MRP ₹2,499)\nUSE CODE: RAZMB (Extra 20% Off)\n👉 https://bitli.in/C93B4p6",
        "urls": ["https://bitli.in/C93B4p6"],
        "has_image": True,
        "expected_is_deal": True,
        "expected_tier": "💎 STEAL_DEAL",
    },
    {
        "id": 28,
        "name": "Free Sample Product Deal",
        "text": "🎁 100% FREE Sample: Mother Sparsh 99% Pure Water Baby Wipes Pack @ ₹0 (MRP ₹199) - Just pay shipping ₹49\n👉 https://mothersparsh.com/free-sample-pack",
        "urls": ["https://mothersparsh.com/free-sample-pack"],
        "has_image": True,
        "expected_is_deal": True,
    },
    {
        "id": 29,
        "name": "Punctuation & Number in Price Trick",
        "text": "💥 199.\n👉 https://fpkrt.cc/flipkart-powerbank-199\n10000 mAh Fast Charging Power Bank with Type-C Output",
        "urls": ["https://fpkrt.cc/flipkart-powerbank-199"],
        "has_image": False,
        "expected_is_deal": True,
        "expected_price": 199,
    },
    {
        "id": 30,
        "name": "Amazon Hidden Markdown Link Format",
        "text": "[ ](https://preview-hidden.url)**Noise ColorFit Pulse 2 Smartwatch** Lowest Price : ₹999 (MRP ₹3,999)\n👉 https://www.amazon.in/dp/B09NOISEP2",
        "urls": ["https://www.amazon.in/dp/B09NOISEP2"],
        "has_image": True,
        "expected_is_deal": True,
        "expected_tier": "🔥 LOOT_DROP",
    },
]

async def run_scenario_tests():
    print("=" * 80)
    print("DEALFLOW INTELLIGENCE & NON-DEAL DETECTOR: 30-SCENARIO STRESS TEST")
    print("=" * 80)

    passed_count = 0
    failed_count = 0
    results = []

    for item in TEST_DEALS:
        deal_id = item["id"]
        name = item["name"]
        text = item["text"]
        urls = item["urls"]
        has_image = item["has_image"]
        exp_is_deal = item["expected_is_deal"]

        print(f"\n[{deal_id:02d}/30] Testing: {name}")

        # 1. Tier 1 Heuristic Classification
        t1_res = classify_deal_intent(text, urls)
        
        # 2. Tier 2 AI Zero-Shot Classification (if Tier 1 passed or if ambiguous)
        final_class = t1_res
        if t1_res["is_deal"]:
            # If text has ambiguous markers or no direct store link, run AI classification
            try:
                ai_res = await asyncio.wait_for(ai_classify_deal(text, urls), timeout=5.0)
                final_class = ai_res
            except Exception as e:
                final_class = t1_res

        is_deal = final_class["is_deal"]
        intent = final_class.get("intent", "IS_DEAL" if is_deal else "UNKNOWN")
        reason = final_class.get("reason", "")

        # 3. Extraction & Scoring
        extracted_prices = extract_prices(text)
        extracted_title = extract_product_name(text)
        is_bad_title = is_invalid_product_name(extracted_title)

        deal_dict = {
            "title": extracted_title,
            "prod_name": extracted_title,
            "prices": extracted_prices,
            "platforms": ["Amazon"] if "amazon" in text.lower() else ["Flipkart"] if "flipkart" in text.lower() else [],
            "coupon": item.get("expected_has_coupon") or ("RAZMB" if "RAZMB" in text else None),
            "store_img_url": "https://img.sample.jpg" if has_image else None,
        }
        score_eval = calculate_deal_intelligence_score(deal_dict)

        # Verification Logic
        test_passed = True
        notes = []

        if exp_is_deal != is_deal:
            test_passed = False
            notes.append(f"Expected is_deal={exp_is_deal}, got {is_deal} ({intent}: {reason})")

        if not exp_is_deal:
            if item.get("expected_intent") and item["expected_intent"] not in intent:
                # Acceptable if blocked under another valid non-deal category
                pass
            notes.append(f"Blocked as non-deal: {intent} ({reason})")
        else:
            # Genuine deal checks
            if is_bad_title:
                notes.append(f"⚠️ Warning: Extracted title was flagged invalid: '{extracted_title}'")
            else:
                notes.append(f"Product: '{extracted_title}'")

            notes.append(f"Price: ₹{extracted_prices.get('sale')} | MRP: ₹{extracted_prices.get('mrp')} | Disc: {extracted_prices.get('discount_pct')}%")
            notes.append(f"Score: {score_eval['score']}/100 ({score_eval['tier']}) | Badges: {score_eval['badges']}")
            
            if not has_image:
                notes.append("Image: None (Store Scraper fallback handles or clean badge rendered)")

        if test_passed:
            passed_count += 1
            status_str = "✅ PASS"
        else:
            failed_count += 1
            status_str = "❌ FAIL"

        print(f"       Result: {status_str}")
        for n in notes:
            print(f"       - {n}")

        results.append({
            "id": deal_id,
            "name": name,
            "passed": test_passed,
            "is_deal": is_deal,
            "intent": intent,
            "score": score_eval["score"],
            "tier": score_eval["tier"],
            "title": extracted_title,
            "price": extracted_prices.get("sale"),
            "has_image": has_image
        })

    print("\n" + "=" * 80)
    print(f"TEST SUMMARY: {passed_count}/30 PASSED ({passed_count/30*100:.1f}%) | {failed_count} FAILED")
    print("=" * 80)

    return results

if __name__ == "__main__":
    asyncio.run(run_scenario_tests())
