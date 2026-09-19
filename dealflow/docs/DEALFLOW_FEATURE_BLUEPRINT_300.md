# DealFlow Production Roadmap

**Last audited**: 16 September 2026
**Replaces**: The archived 300-feature padded blueprint (`_archive/DEALFLOW_FEATURE_BLUEPRINT_300_ARCHIVED.md`)

---

## What's Already Built & Running

Before listing what's next, here's what's live in production right now. These are **done** — no agent should rebuild or duplicate them:

| # | Feature | Status | Where |
|---|---|---|---|
| 1 | 27-channel Telegram MTProto listener (0s latency) | ✅ Live | `listener.py` (PM2 #2) |
| 2 | DesiDime 600s safe scraper with Chrome 120 impersonation | ✅ Live | `desidime_bot.py` (PM2 #10) |
| 3 | Universal shortlink unroller (25+ domains, recursive) | ✅ Live | `bot.py`, `worker.py`, `api.py` |
| 4 | EarnKaro affiliate conversion with error-text fallback | ✅ Live | All workers |
| 5 | Multi-LLM AI post formatting (Groq → Gemini → Cerebras) | ✅ Live | `ai_formatter.py` |
| 6 | Amazon on-page checkbox coupon extraction + effective pricing | ✅ Live | `store_scraper.py`, `coupon_extractor.py` |
| 7 | Multi-store ground-truth scraper (Amazon, Flipkart, Myntra, Ajio) | ✅ Live | `store_scraper.py` |
| 8 | Deal Intelligence scoring (Worth Score, tiers, badges) | ✅ Live | `deal_intelligence.py` |
| 9 | Channel pause/resume toggle (live MongoDB sync) | ✅ Live | `worker.py`, `listener.py`, `bot.py` |
| 10 | Auto-post pipeline (channel-level toggle) | ✅ Live | `worker.py`, `bot.py` |
| 11 | Bulk selection & approval deck | ✅ Live | `tg-setup` |
| 12 | 3D badge cards, glassmorphic dropdowns, lightbox modals | ✅ Live | `tg-setup` |
| 13 | Redis Pub/Sub broadcast decoupling (`deals:approved`) | ✅ Live | `api.py`, `bot.py` |
| 14 | Dead link detection & channel health telemetry | ✅ Live | `api.py` |
| 15 | Consumer storefront with Worth Score, categories, marquee | ✅ Live | `rudranil-deals-web` |
| 16 | False coupon code buster (rejects model numbers like `1BDF`) | ✅ Live | `coupon_extractor.py` |
| 17 | Android Mobile UA rotation for anti-CAPTCHA | ✅ Live | `api.py`, `worker.py` |
| 18 | AI preamble/code-fence auto-stripper | ✅ Live | `_clean_ai_output()` everywhere |
| 19 | Multi-Channel Consensus Engine & Card UI | ✅ Live | `worker.py`, `tg-setup` (DealCard.tsx) |
| 20 | DesiDime Comment Link Harvester | ✅ Live | `desidime_bot.py` |
| 21 | Quick-Commerce Single-Link Resolver (Zepto/Blinkit/Swiggy) | ✅ Live | `store_scraper.py`, `worker.py` |

---

## What's Permanently Banned

These ideas are **never to be implemented** regardless of how appealing they sound:

| Banned Idea | Why It Kills You |
|---|---|
| Rotating multiple Amazon Associate IDs | Section 4 violation → permanent ban + payout confiscation |
| Out-of-stock link cloaking / redirect | Amazon treats this as link cloaking → instant termination |
| Flipkart/Amazon private mobile API reverse-engineering | Akamai WAF flags within minutes → permanent VM IP ban |
| On-VM image upscaling / pHash duplicate detection | Pins CPU to 100% → MongoDB crash, all 5 PM2 services die |
| Headless WhatsApp scraper | Meta bans within 48 hours → phone number blacklisted |
| Automated X/Twitter scraping sessions | Account suspension + legal risk |
| Multi-pincode brute-force catalog crawling | 20,000 products to find 4 deals. Wasteful, ban-heavy, pointless |
| DesiDime interval below 600s | Cloudflare IP ban on static VM `74.225.250.0` |
| Regional language translation (8 languages) | 99% of Indian deal subscribers read English/Hinglish. Zero ROI |
| AI voice note generation | Maintenance nightmare, zero engagement lift |
| Telegram mini-games / giveaway bots | Attracts freeloaders, not buyers |
| Residential proxy pool | Operational cost + complexity for marginal scraping gain |

---

## The Real Roadmap: 18 Features That Move the Needle

Organized by **direct impact on revenue and curator speed**. Each feature is unique, unbuilt, unbanned, and has a concrete implementation path.

---

### 🔴 Tier 1 — Revenue & Speed Multipliers (Build First)

#### 1. Multi-Channel Consensus Engine (✅ Completed)

**The problem**: When Boat Airdopes 141 drops to ₹699, channels like Crazy Deals, Offerzone, DealzTrendz, and Genie Loot all post it within 2 minutes. Right now, the curator sees 4 separate review cards for the exact same product. 40–60% of review time is wasted approving or skipping duplicates.

**The fix**: Real-time product fingerprinting in `worker.py`. When a new deal arrives, hash its canonical destination URL (after unshortening). If 2+ deals share the same destination within a 10-minute window, merge them into a single "Consensus Card" on the curation deck showing:
- The best product image (highest resolution)
- The lowest price across all sources
- A badge: `🔥 Spotted by 4 channels` with source list
- 1-click approval broadcasts the winning version

**Technical**: Add `canonical_url_hash` field to `UniqueDeals`. `worker.py` computes it after unshortening. `GET /api/v1/deals/pending` groups by hash. Frontend renders grouped cards.

**Impact**: Cuts curator review time by **40–60%**. Consensus deals are inherently higher confidence, enabling safer auto-posting.

---

#### 2. Smart Auto-Approve v2 (Rule Engine)

**The problem**: Current auto-approve is a simple per-channel toggle. It's either all-on or all-off for an entire channel. No intelligence.

**The fix**: A lightweight rule engine in `worker.py` that evaluates incoming deals against configurable conditions:

```
IF   discount_pct >= 60
AND  store IN (Amazon, Flipkart, Myntra)
AND  affiliate_applied == true
AND  deal_intelligence.is_deal == true
AND  consensus_count >= 2
THEN auto_approve + broadcast immediately
```

Rules are stored in MongoDB `SystemSettings.auto_rules` and editable from the curation deck. The curator defines their own thresholds — no hardcoded magic numbers.

**Impact**: Transforms DealFlow into a **24/7 autonomous machine** that catches and broadcasts verified loots even at 3 AM while the curator sleeps.

---

#### 3. Out-of-Stock Auto-Expiry & Telegram Edit

**The problem**: A deal is approved and broadcast at 2 PM. By 2:30 PM, the product is sold out. But the Telegram post stays live, subscribers click a dead link, lose trust, and mute the channel.

**The fix**: A lightweight background cron in `worker.py` that checks the top 50 most recent posted deals every 15 minutes:
1. `HEAD` request to the affiliate URL. If 404 or redirect to "out of stock" page → mark as expired.
2. For Amazon: check if page contains `Currently unavailable` or `Add to Wishlist` instead of `Add to Cart`.
3. Use Telethon to **edit the live Telegram message**, prepending `[❌ SOLD OUT]` and striking through the price.
4. Update MongoDB status to `expired`.

**Impact**: Keeps channel feed trustworthy. Subscribers learn that when a deal is live, it's actually buyable.

---

#### 4. Quick-Commerce Single-Link Resolver (✅ Completed)

**The problem**: When a Telegram channel drops a Zepto, Blinkit, or Swiggy Instamart link, `worker.py` currently marks it as `store: "Other"` with no product image, no price, and no affiliate tag. An entire revenue stream is being ignored.

**The fix**: NOT catalog crawling. A targeted **single-URL resolver** in `store_scraper.py`:
- When a `zeptonow.com`, `blinkit.com`, or `swiggy.com/instamart` URL enters the pipeline via Telegram channels, fetch that **one specific page** using `curl_cffi` (Chrome 120).
- Parse `__NEXT_DATA__` JSON or `schema.org/Product` JSON-LD for title, sale price, MRP, and CDN image.
- Convert via EarnKaro (Swiggy/Blinkit campaigns are supported).
- Auto-append disclaimer: `📍 Price varies by local dark store pincode`.

**Key insight**: We never crawl 20,000 products. The 500,000 Indian shoppers on Telegram are our sensor network. They find the 4–5 rare deals. We just validate and monetize the single link they share.

**Impact**: Opens an entirely new affiliate revenue vertical (grocery/quick-commerce) with zero additional scraping infrastructure.

---

#### 5. Night Buffer & Morning Blast Queue

**The problem**: Deals scraped between 1 AM – 7 AM pile up unseen. By morning, the best ones are stale or OOS. Meanwhile, the channel is silent for 6 hours — subscribers forget it exists.

**The fix**: A scheduling layer in `worker.py`:
- Deals arriving between 1:00 AM – 7:00 AM IST with `auto_approve == false` are saved with status `queued_morning`.
- At 8:00 AM IST, a cron job releases the top 5–8 highest-scored queued deals as a rapid-fire "Morning Loot Blast" (1 post every 20 seconds).
- Deals with `consensus_count >= 3` or `discount_pct >= 75` bypass the queue and post immediately even at night (true flash loots don't wait).

**Impact**: Consistent morning engagement. No dead hours. Best overnight deals are served fresh.

---

### 🟡 Tier 2 — Curator Quality of Life (✅ Completed)

#### 6. DesiDime Community Temperature Signal (✅ Completed)

**The problem**: DesiDime has a crowd-sourced "temperature" score on every deal (upvotes minus downvotes). A deal with 500°+ temperature is community-certified fire. Right now, `desidime_bot.py` ignores this signal entirely — a 10° spam deal and a 500° steal get the same priority.

**The fix**: During the existing 600s scrape cycle, parse the temperature value from each deal card's HTML (`span.temp` or equivalent). Store it as `desidime_temperature` in MongoDB. The curation deck sorts DesiDime deals by temperature descending. Deals with 200°+ get auto-tagged `🔥 Community Verified`.
- **Shipped**: Scraped in `desidime_bot.py`, exposed through `api.py`, rendered with vibrant temperature pills in mobile and desktop DealCards, Split View streams, and a 1-tap `🔥 Community Heat` filter preset + sort dropdown.

**Impact**: Zero additional requests. Just smarter parsing of data we're already fetching.

---

#### 7. Curator Undo Buffer (5-Second Toast) (✅ Completed)

**The problem**: Accidentally approving or rejecting a deal is irreversible. One mis-tap on mobile broadcasts a junk deal to 50,000 subscribers.

**The fix**: When the curator clicks Approve, show a 5-second floating toast: `✅ Approved — Undo?`. The actual Redis publish and Telegram broadcast are delayed by 5 seconds. If the curator clicks Undo, the action is cancelled cleanly. After 5 seconds with no undo, the broadcast fires.
- **Shipped**: 5-second undo timer buffer with toast prompt and instant rollback before broadcasting.

**Impact**: Peace of mind. Especially critical during fast bulk review sessions.

---

#### 8. Raw vs AI Post Diff Viewer (✅ Completed)

**The problem**: The AI sometimes drops a coupon code or changes a price during formatting. The curator currently can't tell what the AI changed vs what the original channel posted.

**The fix**: Side-by-side diff view in `EditModal.tsx`. Left pane: raw `original_text`. Right pane: `ai_formatted_text`. Changed lines are highlighted in green/red. Curator can spot dropped links, mangled prices, or hallucinated details instantly.
- **Shipped**: `[📱 TG Preview]` and `[🔍 Raw vs AI Diff]` tabs in `EditModal` with link preservation verification, price checking, and 1-click `↩️ Revert to Raw`.

**Impact**: Catches AI errors before they reach subscribers. Builds curator confidence in the AI pipeline.

---

#### 9. Financial Spam Auto-Quarantine (✅ Completed)

**The problem**: Credit card offers (AU Small Finance, Kotak 811), personal loans, demat accounts, and crypto/betting spam leak through from noisy channels. `deal_intelligence.py` catches some, but persistent spam patterns still reach the review queue.

**The fix**: Expand `classify_deal_intent()` with a hard-reject keyword blocklist stored in MongoDB `SystemSettings.spam_rules` (editable from deck). Patterns like `credit card apply`, `demat account`, `₹0 joining fee`, `casino`, `betting`, `loan approved` trigger instant `status: "auto_rejected"` without touching the curator queue.
- **Shipped**: Dynamic spam rules loaded from `SystemSettings.spam_rules` with REST endpoints (`/api/v1/settings/spam-rules`), and hard-quarantine pattern detection across `worker.py` and `bot.py`.

**Impact**: Cleaner review queue. Less mental fatigue for the curator.

---

### 🟢 Tier 3 — Growth & New Revenue (Build When Core Is Solid)

#### 10. Shopify D2C Brand Clearance Radar

**The mechanism that actually works**: 80%+ of top Indian D2C brands (Mamaearth, Boat, Noise, Snitch, Bewakoof, Minimalist, Plum Goodness, WOW Skin Science) run on Shopify. Every Shopify store exposes a **public, unauthenticated JSON API**:

```
GET https://www.boatlifestyle.com/products.json?limit=50
GET https://www.mamaearth.in/collections/clearance/products.json
```

This returns clean JSON with title, price, compare_at_price (MRP), images, and inventory status. No HTML parsing. No CAPTCHAs. No Cloudflare challenges.

**The fix**: A lightweight worker that checks 10–15 D2C brand Shopify endpoints every 30 minutes. Filters for `compare_at_price > price * 1.5` (50%+ off). Ingests matching products into `UniqueDeals` with `source: "d2c_radar"`.

**Impact**: Catches BOGO and clearance drops **before** anyone shares them on Telegram. First-mover advantage.

---

#### 11. Reddit r/IndiaDeals Harvester

**The mechanism**: Reddit exposes a public JSON API that requires zero authentication:

```
GET https://www.reddit.com/r/IndiaDeals/new.json?limit=25
```

Returns the 25 most recent posts with title, body, URLs, score, and timestamp. All public. No scraping. No ban risk.

**The fix**: Poll every 15 minutes. Extract product URLs from post bodies. Run them through the existing unshortener → store scraper → EarnKaro pipeline. Strip the original poster's affiliate tags and apply yours.

**Impact**: Catches crowd-sourced price errors, bank offer hacks, and gift card stacks that Telegram channels sometimes miss. A unique source no other deal bot taps.

---

#### 12. Telegram Inline Bot Search

**The feature**: Users type `@IndiaDealHuntsBot earbuds` in any Telegram chat (private, group, anywhere). The bot returns a horizontal scrollable list of the top 5 matching active deals with images, prices, and direct affiliate buy links.

**Technical**: Telegram Bot API `answerInlineQuery` with `InlineQueryResultArticle`. Query hits `GET /api/v1/deals/public?search={query}&limit=5`. Each result card shows the product image, title, discounted price, and the affiliate link.

**Impact**: Turns every Telegram conversation into a potential deal discovery point. Viral distribution without the user even visiting the channel.

---

#### 13. Community Deal Submission Portal

**The feature**: A "Submit a Deal" form on `indiadealhunts.vercel.app` where anyone can paste a product URL.

**The backend flow**:
1. User pastes `https://amzn.to/3xYz...`
2. Backend unshortens → scrapes store details → checks duplicates → generates AI post
3. Deal enters the curation queue with `source: "community"` and `submitted_by: "anonymous"`
4. Curator reviews and approves like any other deal

**Impact**: Crowdsources deal hunting beyond the 27 channels. Users who submit deals feel ownership and become loyal subscribers.

---

#### 14. Personalized Credit Card Price Calculator

**The feature**: On the storefront, users tap "My Cards" and select their credit cards from a list (Amazon Pay ICICI 5%, HDFC Millennia 1%, SBI Cashback 5%, Flipkart Axis 5%). Selection is saved to `localStorage`.

Every deal card then shows a personalized "Your Price" below the sale price:
```
Sale Price: ₹4,999
Your Price (HDFC Millennia): ₹4,949 (₹50 cashback)
```

**Impact**: Genuinely useful differentiator that no competitor Indian deal site offers. Drives repeat visits.

---

#### 15. Deal Request Wishlist & Price Alerts

**The feature**: Users send `/alert Sony WH-1000XM5 under 18000` to `@IndiaDealHuntsBot`. The bot stores the query in MongoDB.

When a matching deal enters the pipeline (fuzzy title match + price ≤ threshold), the bot sends a direct PM to the user: `🔔 Price Alert! Sony WH-1000XM5 dropped to ₹17,499 — your target was ₹18,000`.

**Impact**: Extremely sticky retention mechanic. Users keep the bot because it's watching prices for them personally.

---

#### 16. Telegram Post Auto-Edit on Price Change

**The feature**: After a deal is broadcast, if a re-scrape (during OOS check from Feature #3) detects a price increase, the bot edits the live Telegram message:
```
⚠️ Price increased to ₹1,299 (was ₹699 when posted)
```

**Impact**: Transparency. Subscribers trust a channel that tells them when a deal is no longer valid rather than leaving stale posts.

---

#### 17. Dynamic OpenGraph Cards for WhatsApp Sharing

**The feature**: When a user shares an `indiadealhunts.vercel.app/deal/{fp_hash}` link on WhatsApp, the preview card shows:
- Product image
- Title
- Discount badge: `71% OFF`
- Price: `₹699 (MRP ₹2,499)`

**Technical**: Server-side rendered `<meta og:image>`, `og:title`, `og:description` tags on individual deal pages.

**Impact**: Every WhatsApp share becomes a mini-advertisement. Organic traffic growth.

---

#### 18. Live Broadcast Destination Selector

**The feature**: On the review card, checkboxes for broadcast targets:
- ☑ `@dealsforindiachannel` (primary)
- ☐ `@bestindiandeals2025` (secondary)
- ☐ Web Storefront only (no Telegram)

Different channels can have different affiliate tags appended automatically.

**Impact**: Enables multi-channel strategy without duplicating the entire curation workflow.

---

## Implementation Priority Matrix

| Priority | Feature | Effort | Revenue Impact |
|---|---|---|---|
| 🔴 P0 | 1. Consensus Engine | 2–3 days | ⬆⬆⬆ (40% faster curation) |
| 🔴 P0 | 2. Smart Auto-Approve v2 | 1–2 days | ⬆⬆⬆ (24/7 autonomous) |
| 🔴 P0 | 3. OOS Auto-Expiry | 1 day | ⬆⬆ (channel trust) |
| 🔴 P0 | 5. Night Buffer + Morning Blast | 1 day | ⬆⬆ (no dead hours) |
| 🟡 P1 | 4. Quick-Commerce Resolver | 2 days | ⬆⬆ (new revenue vertical) |
| 🟡 P1 | 6. DesiDime Temperature | 0.5 day | ⬆ (smarter sorting) |
| 🟡 P1 | 7. Curator Undo Buffer | 0.5 day | ⬆ (prevents accidents) |
| 🟡 P1 | 9. Spam Auto-Quarantine | 0.5 day | ⬆ (cleaner queue) |
| 🟢 P2 | 10. Shopify D2C Radar | 2 days | ⬆⬆ (first-mover deals) |
| 🟢 P2 | 11. Reddit Harvester | 1 day | ⬆ (unique source) |
| 🟢 P2 | 12. Inline Bot Search | 1–2 days | ⬆⬆ (viral distribution) |
| 🟢 P2 | 13. Community Submissions | 1–2 days | ⬆ (crowdsourced hunting) |
| 🟢 P2 | 15. Price Alert Wishlist | 2 days | ⬆⬆ (sticky retention) |
| 🔵 P3 | 8. Raw vs AI Diff Viewer | 0.5 day | ⬆ (quality control) |
| 🔵 P3 | 14. Card Price Calculator | 1 day | ⬆ (differentiator) |
| 🔵 P3 | 16. Price Change Auto-Edit | 1 day | ⬆ (transparency) |
| 🔵 P3 | 17. OG Cards for WhatsApp | 1 day | ⬆ (organic growth) |
| 🔵 P3 | 18. Multi-Channel Selector | 0.5 day | ⬆ (expansion) |

**Total estimated build time for all 18**: ~3 weeks of focused work.

---

## Invariants (Rules for All Future Agents)

1. **DesiDime interval is permanently 600 seconds.** Never lower it.
2. **Single Amazon Associate tag only.** Never rotate multiple IDs.
3. **Never crawl product catalogs.** Telegram channels are the sensor network. We only validate single URLs they share.
4. **Never add on-VM image processing** (upscaling, pHash, background removal). The VM runs 5 services at 0% CPU. Keep it that way.
5. **Never implement WhatsApp or X/Twitter scraping.** Instant account bans.
6. **Keep the 3D badges and visual card aesthetic.** The curator explicitly prefers rich visual styling over flat table views.
7. **No keyboard shortcuts** (`J`/`K`/`A`/`X`/`V`) unless the curator explicitly requests them.
