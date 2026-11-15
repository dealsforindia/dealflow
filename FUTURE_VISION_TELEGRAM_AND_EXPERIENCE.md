# DealFlow: Telegram Autonomous Publishing & Next-Gen Experience Blueprint

**Focus**: Future roadmap, error prevention in Telegram posting, and a singular, unmatched user experience for [indiadealhunts.me](https://indiadealhunts.me).

---

## 1. Telegram Posting Error Resolution & Autonomous Reliability

While many deals post cleanly, edge cases in upstream Telegram posts and scraper responses cause sporadic errors. Below is the blueprint to eliminate them:

### A. Image Scraping & Preview Rendering Failures
* **Root Issue**: Upstream Telegram posts often contain masked or shortened links (`amzn.to`, `fkrt.it`, `bit.ly`) or temporary CDN thumbnails that 403 or expire.
* **Target Solution**:
  1. **Unfurled Resolver**: Follow HTTP 301/302 redirects server-side to the canonical product landing page before scraping the hero image.
  2. **Multi-Tier Media Fallback**:
     - *Tier 1*: High-res `og:image` or JSON-LD schema product image from merchant page.
     - *Tier 2*: High-res cached image from MongoDB canonical catalogue.
     - *Tier 3*: Dynamically generated branded deal card banner (using DealFlow's local card renderer) so no deal ever posts without a clean visual.
  3. **Telegram `sendPhoto` Resiliency**: If Telegram rejects the photo URL (due to file size, timeout, or Telegram image caching bugs), seamlessly fallback to `sendMessage` with rich markdown formatting and an inline link preview rather than dropping the post.

### B. Title Noise & Price Extraction Glitches
* **Root Issue**: Upstream channels inject promotional slang ("*LOOT FAST ⚡*", "*Apply coupon code*", "*Hurry few left*") or post deals with multiple bundle prices that confuse numeric parsers.
* **Target Solution**:
  1. **Strict Deal Semantic Normalizer**: Strip promo preambles and keep only: `[Brand / Model Name] - [Key Spec]`.
  2. **Price Sanity Bounds**: Reject or flag any deal where `sale_price > mrp` or `sale_price <= 0`.
  3. **Auto-Format Telegram Output Template**:
     ```text
     🔥 {deal_title}
     💰 ₹{clean_price} (MRP: ₹{clean_mrp} • {discount_pct}% OFF)
     🏷️ Store: {store_name} | Verified Drop

     ⚡ Grab Deal: {clean_affiliate_link}
     ```

### C. Self-Healing Auto-Publish Pipeline
* **Error Log Stream**: Any failed Telegram post attempt logs error payload to a lightweight retry queue.
* **Dead-Letter Handling**: If a deal fails twice, it is held in `pending_review` without crashing the ingestion worker or halting subsequent deals.

---

## 2. A Singular, Unmatched Experience for indiadealhunts.me

Generic deal sites operate as cluttered affiliate link farms filled with banners, intrusive popups, and visual noise. DealFlow should feel like a precision tool—an intelligent, ambient shopping radar.

### A. The "Live Radar" Interface (No Generic Cards)
* **Real-Time Heartbeat**: Instead of static product boxes, display an active, live stream with a subtle glowing pulse indicator showing deals detected in the last 60 seconds.
* **Velocity Ticker**: A live ticker showcasing price drops that are moving fastest right now based on user clicks and Telegram view counts.
* **True All-Time Low Highlighting**: Give deals a golden verified badge only when their price is at the lowest observed point in the database history.

### B. High-Utility Micro-Interactions
* **Instant Coupon Copier**: If a deal requires a coupon, clicking the card automatically copies the code to the clipboard, displays a micro-toast confirmation, and opens the direct merchant product page in a background tab.
* **Smart Deal Comparison Dock**: Allow users to pin up to 3 similar drops to a floating comparison dock at the bottom of the screen to compare real prices, specs, and historical lows side by side.
* **Zero-Layout Shift Sticky Layout**: A 3-tier view where the title, pricing, and "Buy on [Store]" CTA are always anchored and instantly accessible, even when scrolling long descriptions.

### C. Curated Visual Polish (Fintech / Precision Instrument Aesthetic)
* **High-Contrast Dark Canvas**: Deep obsidian background (`#080C14`) paired with crisp typography and subtle brand accent borders (Amazon Amber, Flipkart Blue, Myntra Magenta).
* **Smooth Spline Graph Preview**: A tactile price curve directly accessible via hover/tap on any deal, showing whether the item is genuinely discounted or an inflated fake markdown.

---

## 3. Immediate Action Plan

| Area | Milestone | Impact |
|---|---|---|
| **Telegram Ingestion** | Implement photo fallback & auto-unfurl redirect resolver | 100% of Telegram posts include verified high-res imagery |
| **Price Parser** | Enforce semantic clean title & price sanity bounds | Eliminates garbled deal copy and zero-price posts |
| **Storefront Radar** | Replace static layout with Live Radar feed & instant coupon actions | Delivers a unique, fluid, high-conversion user experience |
