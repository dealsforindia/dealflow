# Critical Content Being Vigorously Purged by DealFlow Ingestion

This audit documents the highest-value content categories currently being discarded by the ingestion and scraper pipeline, why they are being dropped, and the exact value lost.

---

## 1. The 5 High-Value Categories Currently Being Discarded

### A. Price Glitches & ₹0 / ₹1 Loot Anomalies (Viral Impact: 🔴 Highest)
* **What Channels Post**: Price mistakes, pricing bugs on Amazon/Flipkart/Ajio where a ₹2,000 item drops to ₹0, ₹1, or 99% off for 5–10 minutes.
* **Why the Scraper Deletes It**:
  - The price validation logic enforces `price > 0` or rejects discounts that look "unrealistic" ($>90\%$), flagging them as corrupted data.
* **Impact Lost**: These are the exact deals that drive massive organic word-of-mouth traffic and Telegram subscriber spikes. Dropping them kills viral user acquisition.

---

### B. Complex Coupon & Bank Discount Stacks (Savings Impact: 🔴 High)
* **What Channels Post**: Posts detailing an effective price using stacked offers (e.g., *"₹1,499 - ₹300 coupon on page - ₹200 ICICI card = Effective ₹999"*).
* **Why the Scraper Deletes It**:
  - The linear price parser looks for a single clean price tag (`₹...`). When it encounters multiple numbers in arithmetic steps, regex parsing fails and the post is dropped or misclassified with the wrong price.
* **Impact Lost**: The highest real-world discounts in India require card/coupon stacking. Users see higher prices on our site than what Telegram channels actually uncovered.

---

### C. Multi-Deal "Mega Drop" Broadcasts (Volume Impact: 🟠 High)
* **What Channels Post**: Curated channel digests containing 3–10 lightning deals in a single Telegram message (e.g., *"Fashion Loot: T-Shirts at ₹199 [Link 1], Shoes at ₹499 [Link 2], Jeans at ₹699 [Link 3]"*).
* **Why the Scraper Deletes It**:
  - The worker historically assumes a $1:1$ mapping between a Telegram message and a MongoDB deal record. It either ingests only the first link and deletes the remaining 9, or crashes on multi-link payloads and drops the entire post.
* **Impact Lost**: Hundreds of the best curated drops posted during flash sales are silently ignored every single day.

---

### D. Digital Freebies, Vouchers & Redeem Codes (Utility Impact: 🟡 Medium-High)
* **What Channels Post**: Free OTT subscriptions, food delivery promo codes (Swiggy/Zomato), Google Play credit codes, gaming keys, and brand gift vouchers.
* **Why the Scraper Deletes It**:
  - The system requires a physical e-commerce store URL (Amazon, Flipkart, Myntra, Ajio). Any deal with a non-retail link or no link at all is discarded as non-deal clutter.
* **Impact Lost**: Missing out on the everyday utility that keeps users returning to the app even when they aren't shopping for physical goods.

---

### E. Direct-to-Consumer (D2C) & Brand Store Flash Sales (Coverage Impact: 🟠 Medium)
* **What Channels Post**: Exclusive drops on official brand stores (boAt, Noise, Puma, Nike, Samsung Shop, Tata Neu).
* **Why the Scraper Deletes It**:
  - Outbound redirect filters and canonical key resolvers are tightly bound to a handful of marketplace giants. Unrecognized merchant domains fail canonical ID extraction and are blocked.
* **Impact Lost**: D2C brand stores frequently offer higher discounts than marketplaces; ignoring them leaves major gaps in our catalog.

---

## 2. Summary Matrix

| Discarded Category | Current Filter Trigger | User Perception | What Should Happen Instead |
|---|---|---|---|
| **₹0 / Glitch Drops** | Price sanity bound (`price <= 0` or extreme `%`) | Misses the biggest viral moments | Tag as `⚡ Glitch / Loot Drop` with high-urgency visual alert |
| **Card / Coupon Stacks** | Multi-numeric text parse failure | Shows higher prices than competitors | Extract `Effective Price` + `Coupon Code` + `Bank Offer` breakdown |
| **Multi-Deal Posts** | 1:1 message-to-deal limit | Channel has 10 deals, site has 1 | Spawn multiple deal cards from a single parent message |
| **Freebies & Codes** | Domain whitelist & missing product schema | Site feels like an affiliate link farm | Dedicated `🎁 Freebies & Codes` stream with 1-tap copy |
| **D2C Brand Stores** | Missing ASIN/FSN canonical key | Limited to only 4 stores | Universal slug/URL resolver for verified brand domains |
