# DealFlow & IndiaDealHunts: Ecosystem Architecture & Site-Wide Bug Audit

## 🌐 1. The Three Systems Defined & Decoupled

To build and scale reliably, the DealFlow ecosystem is divided into three distinct and synchronized layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. TELEGRAM SYSTEM                              │
│  • 27 Telegram Channel Listeners (listener.py)                         │
│  • DesiDime Scraper (desidime_bot.py)                                  │
│  • Broadcast Engine: @dealsforindiachannel (bot.py)                    │
│  • Legacy Admin PM Inline Keyboards (post_ / skip_)                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Raw drops / aff_text
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     2. DEALFLOW (ADMIN DECK)                           │
│  • Web: https://dealflow-topaz-seven.vercel.app/ (tg-setup/)            │
│  • GitHub: dealsforindia/dealflow                                      │
│  • Role: Curator Control Center                                        │
│    - Review pending drops with dynamic previews                        │
│    - One-click multi-LLM AI Prompt Tuning (Add Urgency, Concise)       │
│    - Channel telemetry & Auto-Approve toggle switches                  │
│    - Multi-Deal Inspector: Preview all sub-links before broadcast      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Approved / Auto-posted deals
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   3. INDIADEALHUNTS (STOREFRONT)                       │
│  • Web: https://www.indiadealhunts.me (rudranil-deals-web/)            │
│  • GitHub: dealsforindia/indiadealhunts                                │
│  • Role: Public Consumer Shopping Destination                          │
│    - #1 Verified Loot Spotlight & Live Loot Radar                      │
│    - Worth Score (0-100) & Price Drop Velocity Engine                  │
│    - Category Stories, Marquee Ticker, & Deal Lookup                   │
│    - 📦 Multiple Deals Inside Badge & "More Buy Now Options" Sheet     │
│    - Zero Telegram leaks, 100% affiliate commission monetization       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 2. Universal Category-Agnostic Multi-Deal Engine

A drop can contain **ANY** category or combination of items — **NOT just fashion**:

| Category | Example Drop Copy | Extracted Multi-Items |
|---|---|---|
| **Electronics** | `Anker Mega Drop: ⚡ 20W Fast Charger @ ₹599: amzn.to/c1 ⚡ 65W GaN @ ₹1,499: amzn.to/c2 ⚡ 20000mAh Powerbank: amzn.to/c3` | `20W Fast Charger @ ₹599`, `65W GaN @ ₹1,499`, `20000mAh Powerbank` |
| **Grocery / FMCG** | `Swiggy Instamart Loot: 👉 Fortune Oil 1L: swiggy/oil 👉 Atta 5kg: swiggy/atta 👉 Tata Tea 500g: swiggy/tea` | `Fortune Oil 1L`, `Atta 5kg`, `Tata Tea 500g` |
| **Audio & Tech** | `Sony Fest: 1. WH-1000XM5: amzn/xm5 2. WF-C500: amzn/wfc500 3. XB100 Speaker: amzn/xb100` | `WH-1000XM5`, `WF-C500 Earbuds`, `XB100 Bluetooth Speaker` |
| **Kitchen / Home** | `Pigeon Fest: • 3L Cooker @ ₹549: fkrt/c1 • Fry Pan @ ₹399: fkrt/c2 • Kadai @ ₹699: fkrt/c3` | `Pigeon 3L Cooker @ ₹549`, `Fry Pan @ ₹399`, `Kadai @ ₹699` |
| **Fashion / Apparel**| `Pluss Women Clothing: ⚡ Tops: myntr/1 ⚡ Dresses: myntr/2 ⚡ Sweatshirts: myntr/3 ⚡ Jeans: myntr/4` | `Tops`, `Dresses`, `Sweatshirts`, `Jackets`, `Jeans` |

### Core Behavioral Rules:
1. **Rule of Multi-Deals**: If and only if a deal contains $\ge 2$ distinct purchase links:
   - It receives the **`📦 Multiple Deals ({N} Items Inside)`** badge.
   - Its primary button switches to **`⚡ More Buy Now Options ({N}) ▾`**.
   - Clicking it opens the **`MultiDealSheet`** listing every individual product button with direct affiliate redirection:
     `🛍️ Buy {label} ↗`.
2. **Rule of Single Deals**: If a deal has only 1 product/link:
   - No multi-deal badge is shown.
   - The primary button remains standard: **`View at {store} ↗`**.
   - Single product flow is **100% untouched**.

---

## 🐛 3. Site-Wide Bug Audit & Resolution Matrix

| # | Bug Identified | Affected Layer | Root Cause | Permanent Resolution |
|---|---|---|---|---|
| 1 | **Multi-link Collapse in `get_pending`** | Backend (`api.py`) | Defensive synthesis replaced multi-link copy with `urls[0]` if title didn't match first 12 characters. | Added `len(urls) <= 1` guard so multi-deal drops retain all links and pre-computed sub-items. |
| 2 | **Price ₹0 on Category-Wide Drops** | Backend & Storefront | Multi-item drops without a single product price displayed as `Price: Rs.0`. | Added automatic fallback to derive display pricing from sub-items or prompt user to pick an option. |
| 3 | **Missing Multiple Deals Badge** | Consumer Storefront (`PublicDealCard`) | Card only displayed percentage discount and urgency, obscuring bundled offers. | Added luminous indigo/violet badge: `📦 Multiple Deals ({count} Items Inside)`. |
| 4 | **Single-Destination Redirect on Multi-Item Drops** | Consumer Storefront (`PublicDealCard`) | Clicking "View at Store" navigated blindly to the first item link, leaving 7+ other items inaccessible. | Replaced standard button with `⚡ More Buy Now Options ({count}) ▾` opening an itemized selection modal. |
| 5 | **Commission Leakage on Sub-links** | Backend (`api.py`) | Extracted URLs in multi-drops that were raw Amazon links lacked affiliate tags. | Embedded automated affiliate tag verification into `parse_universal_multi_deal_items`. |
| 6 | **Mobile Dock Overlap** | Consumer Storefront & Admin Deck | Fixed bottom navigation dock obscured bottom sheet action buttons on mobile screens. | Ensured `pb-28` clearance and portaled sheet surfaces to `document.body`. |
| 7 | **Admin Blindness to Multi-Deals** | Admin Deck (`tg-setup`) | Curator cards lacked visual indication that a drop was a multi-item bundle before clicking Edit. | Added `📦 {count} Multi-Deals Inside` badge pill to `DealCard` and extraction table to `EditModal`. |

---

## 🛠️ 4. Technical Contract

### Payload Contract (`GET /api/v1/deals/public` & `GET /api/v1/deals/pending`)
```json
{
  "id": "fc4b3992e444b7f5",
  "title": "Myntra : 85% Off On Pluss Women Clothing",
  "price": 0,
  "store": "Myntra",
  "is_multi_deal": true,
  "multi_deal_count": 8,
  "multi_items": [
    { "label": "Tops", "url": "https://myntr.it/6OoLFmx", "price": null, "discount": 85 },
    { "label": "Dresses", "url": "https://myntr.it/18la34k", "price": null, "discount": 85 },
    { "label": "Sweatshirt", "url": "https://myntr.it/xLbr76q", "price": null, "discount": 85 },
    { "label": "Shirt", "url": "https://myntr.it/BFOBvQ9", "price": null, "discount": 85 },
    { "label": "Jackets", "url": "https://myntr.it/AdqCpPI", "price": null, "discount": 85 },
    { "label": "Trousers", "url": "https://myntr.it/GNytLjZ", "price": null, "discount": 85 },
    { "label": "Co-Ords", "url": "https://myntr.it/faDmQBl", "price": null, "discount": 85 },
    { "label": "Jeans", "url": "https://myntr.it/4CwuY5G", "price": null, "discount": 85 }
  ]
}
```
