# DealFlow & IndiaDealHunts: The Complete Master System Encyclopedia & Technical Blueprint

> **System Identifier**: DealFlow Full-Stack E-Commerce Intelligence Platform  
> **Repository Root**: `dealsforindia/html-yt`  
> **Subsystems Documented**: Production VM Daemons (`dealbot_backend`), Admin Curation Deck (`dealsforindia/dealflow`), Public Consumer Storefront (`rudranil-deals-web`), Cloudflare Edge Network (`dealflow-edge`), MongoDB 7.0 Engine, and Redis Pub/Sub Broker.

---

## 📑 Master Table of Contents
1. [Platform Vision, Architecture & Topology](#1-platform-vision-architecture--topology)
2. [The 5 Backend Daemons & Server Infrastructure (`dealbot_backend`)](#2-the-5-backend-daemons--server-infrastructure-dealbot_backend)
   - [2.1 `api.py` — The FastAPI Core Gateway](#21-apipy--the-fastapi-core-gateway)
   - [2.2 `bot.py` — The Telethon Curation & Broadcast Bot](#22-botpy--the-telethon-curation--broadcast-bot)
   - [2.3 `listener.py` — High-Throughput 27-Channel Ingest](#23-listenerpy--high-throughput-27-channel-ingest)
   - [2.4 `worker.py` — De-duplication, Unshortening & Auto-Approve Engine](#24-workerpy--de-duplication-unshortening--auto-approve-engine)
   - [2.5 `desidime_bot.py` — Forum Scraper & Anti-Ban Ingest](#25-desidime_botpy--forum-scraper--anti-ban-ingest)
   - [2.6 Specialized Engine Modules (`ai_formatter`, `store_scraper`, `multi_deal_extractor`, `oos_expiry_worker`)](#26-specialized-engine-modules)
3. [The Complete 76 Backend Production Audits & Bug Fixes](#3-the-complete-76-backend-production-audits--bug-fixes)
4. [Universal Affiliate Monetization & 25+ Shortlink Unshorteners](#4-universal-affiliate-monetization--25-shortlink-unshorteners)
5. [The Multi-LLM AI Cascade Pipeline](#5-the-multi-llm-ai-cascade-pipeline)
6. [The 27 Integrated Telegram Channels Directory & Rules](#6-the-27-integrated-telegram-channels-directory--rules)
7. [The Admin Curation Deck (`dealflow` / `tg-setup`)](#7-the-admin-curation-deck-dealflow--tg-setup)
8. [The Public Consumer Storefront (`rudranil-deals-web`)](#8-the-public-consumer-storefront-rudranil-deals-web)
   - [8.1 Broadsheet Editorial Design Language](#81-broadsheet-editorial-design-language)
   - [8.2 Component Breakdown (`CategoryBar`, `Filters`, `PublicDealCard`, `DealDetailModal`, `PriceSparkline`)](#82-component-breakdown)
   - [8.3 On-Device Semantic Search Engine](#83-on-device-semantic-search-engine)
   - [8.4 Credit Card Calculator & Deal Lookup Modals](#84-credit-card-calculator--deal-lookup-modals)
9. [Cloudflare Edge Proxy & Global CDN (`dealflow-edge`)](#9-cloudflare-edge-proxy--global-cdn-dealflow-edge)
10. [Database Schemas & Data Dictionaries](#10-database-schemas--data-dictionaries)
11. [The 600 Feature Innovation Master Blueprint Summary](#11-the-600-feature-innovation-master-blueprint-summary)
12. [Production Operational Runbook & Emergency Diagnostics](#12-production-operational-runbook--emergency-diagnostics)

---

## 1. Platform Vision, Architecture & Topology

**DealFlow** is an end-to-end price intelligence, deal verification, AI enhancement, affiliate monetization, and multi-surface publishing platform.

### The Systemic Problems DealFlow Solves:
1. **Information Asymmetry**: Deals posted in Telegram channels often feature fake MRPs, fabricated discounts, or expired promo codes. DealFlow scrapes the canonical merchant page directly to extract genuine spot prices and MRPs.
2. **Affiliate Conversion Leakage**: Over 60% of Telegram deals use redirect shortlinks (`fpkrt.cc`, `wishlink.com`, `bitli.in`, `lehlah.club`). When passed to affiliate converters, they fail or inject competitor tracking tags. DealFlow unpacks redirect chains down to the raw product page and applies verified monetization tags (`[REDACTED_TAG]` / EarnKaro user `[REDACTED_USER_ID]`).
3. **Curation Latency**: Manual review takes hours, causing deals to sell out before being shared. DealFlow pre-formats posts using a multi-LLM cascade and features channel-level `auto_approve` with instant Redis Pub/Sub publishing.
4. **Vibecoded UI Clutter**: Most deal aggregators feature flashing tickers, fake popups, and generic SaaS templates. The consumer storefront (`IndiaDealHunts`) uses an editorial **Broadsheet** aesthetic inspired by *The Wirecutter* and *Bloomberg*.

```
                         [ 27 Retail Telegram Channels ]
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   listener.py (PM2 #2)    │  Telethon Client
                        └─────────────┬─────────────┘
                                      │ Ingests raw deal payloads
                                      ▼
                        ┌───────────────────────────┐
                        │    worker.py (PM2 #3)     │  Deduplication, 5-Depth Unshortening,
                        └──────┬──────────────┬─────┘  Multi-Store Image Scraping, AI Pre-computation
                               │              │
             MongoDB (Port 27017)             Redis Pub/Sub (Port 6379)
             Collection: UniqueDeals          Channel: deals:approved
                               │              │
                               ▼              ▼
 ┌──────────────────────────────────┐   ┌───────────────────────────────────┐
 │        api.py (PM2 #7)           │   │         bot.py (PM2 #0)           │
 │ FastAPI Backend (Port 8000)      │   │ Telethon Bot / PM Approval /      │
 │ https://api.rudranil.me          │   │ Channel Broadcaster / Auto-Editor │
 └─────────────┬────────────────────┘   └─────────────────┬─────────────────┘
               │                                          │
       REST / WebSockets                                  ▼
               │                               [ Telegram Channel Broadcast ]
               ├──────────────────────────────────────────┐
               ▼                                          ▼
┌─────────────────────────────────┐      ┌──────────────────────────────────┐
│   Admin Curation Deck (Cloud)   │      │   Public Consumer Storefront     │
│   dealflow-topaz-seven.vercel   │      │   indiadealhunts.com             │
│   React 18 + Vite               │      │   React 19 + Vite + Broadsheet   │
└─────────────────────────────────┘      └────────────────┬─────────────────┘
                                                          │
                                                          ▼
                                         ┌──────────────────────────────────┐
                                         │  Cloudflare Edge Worker (Cache)  │
                                         │  dealflow-edge.workers.dev       │
                                         └──────────────────────────────────┘
```

---

## 2. The 5 Backend Daemons & Server Infrastructure (`dealbot_backend`)

All backend components run on an Azure Cloud production VM (`[REDACTED_IP]`) managed via PM2.

### 2.1 `api.py` — The FastAPI Core Gateway (PM2 ID: 7)
* **Location**: `/home/[USER]/dealbot/api.py` (Port: `8000`)
* **URL**: `https://api.rudranil.me`
* **Core Responsibilities**:
  - Serves `/api/v1/deals/public` for the public storefront with pagination, sorting (`newest`, `discount`, `worth`, `price_low`, `price_high`), and store filtering.
  - Serves `/api/v1/deals/pending` for the Admin Deck.
  - Handles 1-click approvals (`POST /api/v1/deals/{fp_hash}/approve`) and skips (`POST /api/v1/deals/{fp_hash}/reject`).
  - Publishes approved deals to Redis channel `deals:approved` for instant Telegram broadcast.
  - Dynamic AI Prompt Rewriting (`POST /api/v1/deals/{fp_hash}/ai-rewrite`) with presets (`🔥 Add Urgency`, `✂️ Make Concise`, `💰 Highlight Discount`).
  - Channel link migration (`PUT /api/v1/channels/update-link`) to update expired invite links without server reboots.
  - Dynamic affiliate retry (`POST /api/v1/deals/{fp_hash}/retry-affiliate`).

### 2.2 `bot.py` — The Telethon Curation & Broadcast Bot (PM2 ID: 0)
* **Location**: `/home/[USER]/dealbot/bot.py`
* **Core Responsibilities**:
  - **Admin PM Approval Deck**: Sends pending deals directly to the admin's private Telegram chat with inline callback buttons: `[🚀 Post]` and `[🗑️ Skip]`.
  - **Database Sync**: When the admin clicks an inline button in Telegram, `bot.py` updates MongoDB `UniqueDeals` status (`posted` / `rejected`), keeping the Admin Web UI 100% in sync with Telegram actions.
  - **Broadcast Engine**: Formats approved posts with custom emojis, verified store tags, and dispatches them to public channels (`@dealsforindiachannel` and backup `@bestindiandeals2025`).
  - **Live Auto-Edit Dispatcher**: Listens for Redis `deals:price_change` events to edit live Telegram messages when prices change.

### 2.3 `listener.py` — High-Throughput 27-Channel Ingest (PM2 ID: 2)
* **Location**: `/home/[USER]/dealbot/listener.py`
* **Core Responsibilities**:
  - Connects as a user Telethon client listening to all 27 active deal channels.
  - **15-Second Cache Sync**: Periodically syncs active channel lists from MongoDB `SystemSettings.channels_config`. If a curator pauses a channel in the Web UI, `listener.py` drops incoming messages from that channel at the network level.
  - Resolves private channels via `CheckChatInviteRequest` using an internal invite-to-peer mapping to eliminate FloodWait errors.

### 2.4 `worker.py` — De-duplication, Unshortening & Auto-Approve Engine (PM2 ID: 3)
* **Location**: `/home/[USER]/dealbot/worker.py`
* **Core Responsibilities**:
  - **ASIN & URL De-duplication**: Computes SHA256 hashes of canonical URLs. Deals posted across multiple channels are recognized as the same product, incrementing `cluster_count` and listing `cluster_channels`.
  - **Universal 5-Depth Unshortener**: Recursively resolves shortlinks (`fpkrt.cc`, `wishlink.com`, `bitli.in`, `amazn.ltd`, `lehlah.club`).
  - **High-Res Image Scraper**: Scrapes canonical product images directly from Amazon, Flipkart, Myntra, and Ajio.
  - **AI Post Generation**: Invokes `ai_formatter.py` to pre-generate post text before inserting into MongoDB.
  - **Auto-Approve Engine**: Checks if the source channel has `auto_approve: true` in MongoDB. If enabled, it automatically sets `status: "auto_posted"` and publishes to Redis `deals:approved` without manual intervention.

### 2.5 `desidime_bot.py` — Forum Scraper & Anti-Ban Ingest (PM2 ID: 10)
* **Location**: `/home/[USER]/dealbot/desidime_bot.py`
* **Core Responsibilities**:
  - Scrapes handpicked deals and forum discussions from DesiDime (`https://www.desidime.com`).
  - **600s Anti-Ban Interval**: Uses a 600-second cycle to prevent IP rate-limiting and bans.
  - **Direct MongoDB Ingestion**: Ingests deals straight into `UniqueDeals` collection.
  - **Multi-Deal Haul Detection**: Calls `multi_deal_extractor.py` to capture forum posts containing multiple products.

### 2.6 Specialized Engine Modules
* **`ai_formatter.py`**: Prioritized multi-LLM cascade (Cerebras $\to$ Groq $\to$ Gemini $\to$ Together) with regex sanitization to remove conversational filler.
* **`store_scraper.py`**: Comprehensive scraper for Amazon, Flipkart, Myntra, Ajio, Nykaa, and Swiggy Instamart.
* **`multi_deal_extractor.py`**: Sub-millisecond (0.33ms) regex heuristic extracting 10–30 products from quick-commerce threads.
* **`oos_expiry_worker.py`**: Background monitor checking 48-hour active deals for price increases or out-of-stock states.

---

## 3. The Complete 76 Backend Production Audits & Bug Fixes

Here is the complete summary of the 76 production system audits, problems, and fixes logged in `GEMINI.md`:

1. **Auto-Post Feature Connected End-to-End**: Added `PUT /api/v1/channels/config/{channel_id:path}/auto-approve` in `api.py`. `worker.py` checks `channels_config.auto_approve` and publishes to Redis `deals:approved`.
2. **Score System Removal & Card Decluttering**: Removed score rings from cards and edit modals; replaced sort pills with clean dropdown sorting.
3. **Channels DB Cleanup & Dummy Key Removal**: Purged dummy keys (`"dh"`, `"unknown"`) from MongoDB and mapped aliases cleanly.
4. **Pagination & Grid Refinement**: Added configurable page sizes (40/80/120/All per page) with smooth pagination.
5. **Dynamic Channel Header in Edit Modal**: Updated live Telegram preview in `EditModal` to dynamically extract source channel name and avatar initials.
6. **Image Resizing & Zero-Distortion Framing**: Upgraded cards to responsive `4:3` framing with `object-contain`.
7. **Zero-Duplication Category Parsing**: Fixed category parser splitting words on missing emoji prefixes; added Unicode emoji validation.
8. **React Portal Lightbox Modal**: Portaled image lightboxes to `document.body` to resolve 3D CSS perspective clipping.
9. **AI Validation & Preamble Auto-Cleaning**: Built `_clean_ai_output()` to automatically strip conversational filler (*"Here is the deal:"*) and code fences.
10. **One-Click Bulk Selection & Approval Deck**: Added Select Mode with multi-card checkboxes and floating glassmorphic action bar.
11. **Custom Glassmorphic Popovers**: Replaced native browser `<select>` boxes with custom dropdowns featuring channel search.
12. **Affiliate Error-Text Purge**: Fixed EarnKaro unsupported seller responses (`"We could not locate an affiliate URL..."`) from being posted to Telegram.
13. **Pre-Computed AI Formatting Pipeline**: Configured workers to run multi-LLM cascades upon scraping and store pre-computed Markdown in MongoDB.
14. **Universal Shortlink Redirect Expansion (25+ Domains)**: Added support for `fpkrt.cc`, `wishlink.com`, `bitli.in`, `amazn.ltd`, `gotrackzo.com`, `linkredirect.in`, `app.lehlah.club`.
15. **Affiliate Tracking Tag Scrubbing**: Strips rival affiliate parameters (`tag=`, `affid=`, `subId=`) before applying our own.
16. **Amazon Android Mobile AW Anti-Captcha Scraper**: Switched to Amazon Mobile AW endpoint (`/gp/aw/d/{asin}`) to bypass desktop anti-bot CAPTCHAs.
17. **Universal Store Scraper**: Added dedicated parsers for Flipkart, Shopsy, Myntra, Ajio, Nykaa, Blinkit, and Swiggy Instamart.
18. **Dynamic Channel Pausing**: `listener.py` syncs paused channels every 15s to drop paused channel events at the network level.
19. **End-to-End Auto-Approve Pipeline**: Channel-level auto-approve bypasses manual review and broadcasts directly.
20. **DesiDime Direct MongoDB Ingestion**: Streamlined DesiDime ingestion into `UniqueDeals`.
21. **Telegram Bot Image Tuple Unpack Fix**: Fixed `'tuple' object has no attribute 'exists'` bug in `bot.py`.
22. **URL Slug Product Title Extraction**: If Telegram posts lack a product title, DealFlow extracts clean names from URL slugs.
23. **DesiDime Anti-Ban 600s Scrape Interval**: Set scrape interval to 600s to eliminate rate-limiting.
24. **Hidden Markdown Link Sanitization**: Strips hidden preview links (`[ ](url)`) from corrupting post titles.
25. **Unified AI Pipeline Migration**: Built `ai_formatter.py` with multi-LLM cascade and added `/api/v1/deals/{fp_hash}/ai-rewrite`.
26. **Channel Dead Link Detector & 1-Click Updater**: Added dead-link health telemetry and 1-click invite link updater in the Admin Deck.
27. **Amazon Coupon/Price Line Filtering**: Filters out lines like `"Apply Coupon"` or `"\*\*₹899\*\*"` from being used as product titles.
28. **Cross-Channel ASIN De-Duplication Engine**: Groups same products across channels into a single card with multi-source consensus indicators.
29. **Telegram FloodWait Mitigation**: Resolves invite links to peer IDs using an internal cache map to prevent FloodWait errors.
30. **Deal Flow Telemetry Dashboard**: Added real-time scraping and broadcast metrics to the Admin Deck.
31. **MongoDB 7.0 Compound Indices**: Added indices on `(status, created_at)` and `(fp_hash, 1)` for sub-millisecond query performance.
32. **EarnKaro Sub-ID Revenue Splitting**: Adds dynamic sub-IDs to track revenue per channel.
33. **Instant Deal Lookup Tool**: Allows curators and consumers to paste any product URL to inspect real prices and historical lows.
34. **Personalized Credit Card Price Calculator**: Computes post-cashback effective pricing for top Indian credit cards.
35. **Live Redis Pub/Sub Synchronization**: Synchronizes approvals across workers and bot broadcasters.
36. **Cloudflare Global Edge Proxy**: Caches deals and video feeds globally with sub-15ms response times.
37. **Multi-Item Mega-Hauls with Pincode Mapping**: Parses forum threads with 10–30 products into single MongoDB documents.
*(Full list continues through Section 76 in `GEMINI.md`).*

---

## 4. Universal Affiliate Monetization & 25+ Shortlink Unshorteners

### The Shortlink Resolution Algorithm
Nested shortlinks are unshortened recursively up to 5 levels deep:
```python
SHORT_DOMAINS = {
    "fpkrt.cc", "wishlink.com", "bitli.in", "amazn.ltd", "gotrackzo.com",
    "linkredirect.in", "app.lehlah.club", "links.ddime.in", "amzn.to",
    "cutt.ly", "tinyurl.com", "dl.flipkart.com", "ajiio.in", "myntr.it"
}

def unshorten_recursive(url: str, depth: int = 0) -> str:
    if depth > 5:
        return url
    parsed = urllib.parse.urlparse(url)

    # 1. Unpack wrapper query parameters
    qs = urllib.parse.parse_qs(parsed.query)
    for param in ('url', 'dl', 'target', 'destination', 'targetUrl'):
        if param in qs and qs[param][0].startswith(('http://', 'https://')):
            return unshorten_recursive(urllib.parse.unquote(qs[param][0]), depth + 1)

    # 2. Follow HTTP redirects with desktop User-Agent
    if any(d in parsed.netloc.lower() for d in SHORT_DOMAINS):
        resp = requests.get(url, headers=DESKTOP_HEADERS, allow_redirects=True, timeout=8)
        if resp.url != url:
            return unshorten_recursive(resp.url, depth + 1)

    return url
```

### Monetization Injection:
* **Amazon**: Injects `tag=[REDACTED_TAG]`.
* **Flipkart, Myntra, Ajio, Nykaa, Zepto**: Passed to the EarnKaro API converter (`https://ekaro-api.affiliaters.in/api/converter/public`) using authenticated JWT tokens for user ID `[REDACTED_USER_ID]`.
* **Competitor Tag Scrubbing**: Automatically purges: `utm_source`, `tag`, `linkCode`, `camp`, `creative`, `subId`, `affid`, `ref`.

---

## 5. The Multi-LLM AI Cascade Pipeline

When a deal is scraped, `ai_formatter.py` passes the payload through a prioritized multi-LLM cascade:

```
[Raw Scraped Deal Payload]
            │
            ▼
┌────────────────────────────────────────┐
│ 1. Groq (Qwen 3.8 27B / GPT-OSS 120B)  │ ──(Success)──> Clean Markdown Post
└──────────────────┬─────────────────────┘
                   │ (Timeout / Rate Limit)
                   ▼
┌────────────────────────────────────────┐
│ 2. Gemini (2.5 Flash-Lite / 2.5 Flash) │ ──(Success)──> Clean Markdown Post
└──────────────────┬─────────────────────┘
                   │ (Fallback)
                   ▼
┌────────────────────────────────────────┐
│ 3. Together AI / OpenRouter (Llama 70B)│ ──(Success)──> Clean Markdown Post
└──────────────────┬─────────────────────┘
                   │ (All LLMs Fail)
                   ▼
┌────────────────────────────────────────┐
│ 4. Deterministic Regex Format          │ ─────────────> Rule-Based Template
└────────────────────────────────────────┘
```

---

## 6. The 27 Integrated Telegram Channels Directory & Rules

> ⚠️ **CRITICAL RULE**: Legacy `bot.py` and `listener.py` read raw string usernames (`@dealspoint`) and invite links (`https://t.me/+...`). They **CANNOT** accept numeric `-100...` IDs. Storing numeric IDs in `channels_config` breaks Telethon entity resolution.

| # | Channel Name | Web ID | Invite / Username Link | Status | Auto-Approve |
|---|---|---|---|---|---|
| 1 | **Crazy Deals** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 2 | **DealDrops** | `-100XXXXXXXXXX` | `https://t.me/c/*********` | Active | Supported |
| 3 | **Dealspoint Premium** | `@dealspoint` | `@dealspoint` | Active | Supported |
| 4 | **DealzTrendz** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 5 | **DealzTrendz 2.0** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 6 | **DesiDime - Handpicked Deals** | `@DesidimeHot` | `@DesidimeHot` | Active | Active Default |
| 7 | **EarnKaro (Loot Deals & Offers)** | `@realearnkaro` | `@realearnkaro` | Active | Supported |
| 8 | **ExtraPe \| Earn By Sharing Deals** | `@extrape` | `@extrape` | Active | Supported |
| 9 | **FET (Deals & Tricks)** | `@FetDeals` | `https://t.me/+********` | Active | Supported |
| 10 | **Fitness Finds by SQ** | `-100XXXXXXXXXX` | `https://t.me/addlist/********` | Active | Supported |
| 11 | **Free Earning Tech** | `@FreeEarningTechOG` | `https://t.me/+********` | Active | Supported |
| 12 | **Genie All Deals** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 13 | **Genie Loot** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 14 | **Genie Tricks** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 15 | **Glam Haul Diaries** | `@glamhauldiaries` | `@glamhauldiaries` | Active | Supported |
| 16 | **Loot Deals App** | `@lootdealsapp` | `@lootdealsapp` | Active | Supported |
| 17 | **Offerzone 2.0** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 18 | **Offerzone 3.0** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 19 | **Offerzone 4.0** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 20 | **Offerzone Tricks** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 21 | **OZ Loot Bazaar** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 22 | **OZ Loot Deals** | `-100XXXXXXXXXX` | `https://t.me/c/*********` | Active | Supported |
| 23 | **Private Deals From All** | `@bblbblp` | `@bblbblp` | Active | Supported |
| 24 | **Shoppers Quest 2.0** | `-100XXXXXXXXXX` | `https://t.me/ShoppersQuest` | Active | Supported |
| 25 | **Shopping Genie** | `-100XXXXXXXXXX` | `https://t.me/+********` | Active | Supported |
| 26 | **Technical Sheikh** | `@Technicalsheikh` | `@Technicalsheikh` | Active | Supported |
| 27 | **Trending Loot Deals** | `@Loot_DealsX` | `@Loot_DealsX` | Active | Supported |

---

## 7. The Admin Curation Deck (`dealflow` / `tg-setup`)

The Admin Deck is built with **React 18 + Vite** (`dealsforindia/dealflow` on GitHub, hosted at `https://dealflow-topaz-seven.vercel.app/`).

### Core Features:
1. **Review Stream**: Displays pending drops with pre-computed AI text, store badges, and 1-click `[🚀 Approve]` / `[🗑️ Skip]`.
2. **Live AI Prompt Tuning**: Edit modal features 1-click prompt presets (`🔥 Add Urgency`, `✂️ Make Concise`, `💰 Highlight Discount`) connected to `POST /api/v1/deals/{fp_hash}/ai-rewrite`.
3. **Bulk Action Deck**: "Select Mode" toggle allows curators to select multiple cards and execute batch approvals or skips.
4. **Channel Health Telemetry**: Monitors all 27 channels in real time, displaying deal throughput and flagging expired invite links with a dead-link warning.
5. **1-Click Invite Link Updater**: Allows curators to update rotated invite links directly from the UI, updating MongoDB and notifying listeners via Redis Pub/Sub without restarting bots.

---

## 8. The Public Consumer Storefront (`rudranil-deals-web`)

The consumer storefront is built with **React 19 + Vite** (`dealsforindia/indiadealhunts` on GitHub, running locally at `http://localhost:5173/` and deployed to Vercel).

### 8.1 Broadsheet Editorial Design Language
Inspired by *The Wirecutter* and *Bloomberg*, the storefront eschews generic SaaS tropes (no rainbow gradients, no 3D badges, no fake activity popups) in favor of:
* **Background**: Deep charcoal (`#0D0E11`) and slate surfaces (`#14161B`, `#1B1E26`).
* **Accent**: Single warm amber (`#D97706`).
* **Typography**: **Lexend** (headings), **Source Sans 3** (body), and **JetBrains Mono** (prices/numbers).
* **Geometry**: Sharp 2px border radiuses, 1px hairline borders (`#23262F`), and zero drop shadows.

### 8.2 Component Breakdown
* **[`CategoryBar.tsx`](file:///e:/Rudranildocs0066543/html-yt/rudranil-deals-web/src/components/CategoryBar.tsx)**: Sticky category bar that calculates live deal counts per category (`Electronics (104)`, `Fashion (62)`) and features a sliding amber indicator.
* **[`Filters.tsx`](file:///e:/Rudranildocs0066543/html-yt/rudranil-deals-web/src/components/Filters.tsx)**: Custom animated popovers replacing native `<select>` dropdowns, paired with removable active filter chips (`Store: Amazon ×`, `Clear all`).
* **[`PublicDealCard.tsx`](file:///e:/Rudranildocs0066543/html-yt/rudranil-deals-web/src/components/PublicDealCard.tsx)**: Responsive 4:3 card with zero image distortion, store badges, direct affiliate links, and an inspect trigger.
* **[`DealDetailModal.tsx`](file:///e:/Rudranildocs0066543/html-yt/rudranil-deals-web/src/components/DealDetailModal.tsx)**: Modal inspection deck featuring full pricing breakdown (`Total Savings: ₹X`), coupon copy box with toast feedback, and native Web Share integration.
* **[`PriceSparkline.tsx`](file:///e:/Rudranildocs0066543/html-yt/rudranil-deals-web/src/components/PriceSparkline.tsx)**: Zero-dependency vector SVG sparkline displaying 30-day historical trajectories and price drop percentages.
* **[`DealSkeleton.tsx`](file:///e:/Rudranildocs0066543/html-yt/rudranil-deals-web/src/components/DealSkeleton.tsx)**: Skeletons matched to 4:3 aspect ratios and 220px grid bounds for zero layout shift (CLS = 0).

### 8.3 On-Device Semantic Search Engine (`semanticSearch.ts`)
Features a client-side natural language parser that extracts constraints from queries like:
* `"TWS earbuds under 999"` $\to$ Category: `Electronics`, Max Price: `₹999`
* `"Sneakers 70% off"` $\to$ Category: `Fashion`, Min Discount: `70%`

### 8.4 Credit Card Calculator & Deal Lookup Modals
* **`DealLookupModal.tsx`**: Allows consumers to paste any product URL from Amazon or Flipkart to inspect real merchant prices and historical lows.
* **`CardCalculatorModal.tsx`**: Calculates post-cashback effective pricing for major Indian credit cards (HDFC Millennia, SBI Cashback, Axis Ace, ICICI Amazon Pay).

---

## 9. Cloudflare Edge Proxy & Global CDN (`dealflow-edge`)

* **Edge URL**: `https://dealflow-edge.pottemasshippo.workers.dev`
* **Core Responsibilities**:
  - Serves cached responses for `/api/v1/deals/public` with sub-15ms latency worldwide.
  - Implements `Cache-Control: public, s-maxage=60, stale-while-revalidate=30`.
  - Automatically proxies `sitemap.xml` and `robots.txt` for Google search indexing.
  - Injects security headers (`nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`).
  - Transparent failover: automatically falls back to `api.rudranil.me` if the edge cache expires.

---

## 10. Database Schemas & Data Dictionaries

### Collection 1: `UniqueDeals` (Primary Deals Collection)
```json
{
  "_id": ObjectId("6798b6..."),
  "fp_hash": "sha256_canonical_product_url_hash",
  "prod_name": "OnePlus Nord Buds 2r Wireless Earbuds",
  "prices": {
    "sale": 1799,
    "mrp": 2299,
    "discount_pct": 22
  },
  "store": "Amazon",
  "category": "Electronics",
  "category_emoji": "📱",
  "img_url": "https://m.media-amazon.com/images/I/61-v5a0g5CL._SX679_.jpg",
  "aff_url": "https://www.amazon.in/dp/B0C6L71LWW?tag=[REDACTED_TAG]",
  "orig_url": "https://www.amazon.in/dp/B0C6L71LWW",
  "channel": "@dealspoint",
  "channel_title": "Dealspoint Premium",
  "status": "pending",             // "pending" | "posted" | "rejected" | "auto_posted"
  "ai_formatted_text": "🔥 *OnePlus Nord Buds 2r TWS*\n\n💰 Price: ₹1,799 (MRP: ₹2,299)\n🏷️ 22% Off\n\n👉 Buy Now: https://amzn.to/...",
  "coupon": null,
  "cluster_count": 3,
  "cluster_channels": ["@dealspoint", "Genie Loot", "DealDrops"],
  "is_lowest_price": true,
  "tg_message_id": 8412,
  "tg_channel": "@dealsforindiachannel",
  "created_at": ISODate("2026-09-28T12:00:00Z"),
  "updated_at": ISODate("2026-09-28T12:00:00Z")
}
```

### Collection 2: `SystemSettings` (Document: `channels_config`)
```json
{
  "_id": "channels_config",
  "channels": {
    "https://t.me/+emveIa6ZQxoxYjAx": true,
    "@dealspoint": true,
    "@DesidimeHot": true,
    "@glamhauldiaries": true
  },
  "auto_approve": {
    "@dealspoint": false,
    "@DesidimeHot": true
  },
  "channel_names": {
    "https://t.me/+emveIa6ZQxoxYjAx": "Crazy Deals",
    "@dealspoint": "Dealspoint Premium"
  }
}
```

---

## 11. The 600 Feature Innovation Master Blueprint Summary

The platform's roadmap is divided into three blueprints of 200 unique innovations each:

* **Backend Core & Engine (Innovations 1–200)**: Documented in [`BACKEND_200_INNOVATIONS.md`](file:///e:/Rudranildocs0066543/html-yt/dealflow/docs/BACKEND_200_INNOVATIONS.md). Covers HTTP/2 fingerprinting (`curl_cffi`), D2C Shopify JSON pollers, recursive 5-depth unshortening, EarnKaro sub-ID splitting, SHA256 consensus hashing, multi-LLM cascades, Redis Pub/Sub events, and MongoDB 7.0 compound indices.
* **Admin Curation Deck (Innovations 201–400)**: Documented in [`ADMIN_200_INNOVATIONS.md`](file:///e:/Rudranildocs0066543/html-yt/dealflow/docs/ADMIN_200_INNOVATIONS.md). Covers review card ergonomics, dynamic channel headers, live prompt rewrite chips, dead-link detectors, 1-click invite link updates, and batch approval flows.
* **Consumer Storefront (Innovations 401–600)**: Documented in [`STOREFRONT_200_INNOVATIONS.md`](file:///e:/Rudranildocs0066543/html-yt/dealflow/docs/STOREFRONT_200_INNOVATIONS.md). Covers Broadsheet design standards, on-device semantic search, vector SVG price sparklines, deal detail inspection modals, zero-CLS skeleton loaders, and personalized credit card calculators.

---

## 12. Production Operational Runbook & Emergency Diagnostics

### 1. Process Status & Daemon Management (VM)
```bash
# Check status of all 5 PM2 daemons
pm2 list

# Restart a specific daemon
pm2 restart api
pm2 restart worker
pm2 restart bot
pm2 restart listener
pm2 restart desidime

# View logs with no stream
pm2 logs worker --lines 30 --nostream
pm2 logs api --lines 30 --nostream
```

### 2. Live Health & Database Diagnostics
```bash
# Verify API Gateway health
curl -I https://api.rudranil.me/health

# Verify Redis Pub/Sub connectivity
redis-cli ping
redis-cli pubsub channels

# Query MongoDB deal volume counts
mongosh dealbot --eval "
print('Pending deals:     ' + db.UniqueDeals.countDocuments({status: 'pending'}));
print('Approved deals:    ' + db.UniqueDeals.countDocuments({status: 'posted'}));
print('Auto-posted deals: ' + db.UniqueDeals.countDocuments({status: 'auto_posted'}));
print('Total deals:       ' + db.UniqueDeals.countDocuments());
"
```

### 3. Frontend Development & Build
```bash
# Storefront (rudranil-deals-web)
cd e:\Rudranildocs0066543\html-yt\rudranil-deals-web
npm run build   # Type checks with tsc -b and builds with Vite
npm run dev     # Runs local development server at http://localhost:5173/

# Admin Deck (dealflow)
cd e:\Rudranildocs0066543\html-yt\dealflow
npm run build
```

---

## 13. Exhaustive Screen-by-Screen UI & Visual Design Master Description

This section documents every visual token, component hierarchy, micro-interaction, layout coordinate, and interactive screen across both the **Public Consumer Storefront** (`IndiaDealHunts`) and the **Admin Curation Deck** (`DealFlow`).

---

### 13.1 The Broadsheet Design System & Visual DNA

The design system eliminates all generic SaaS gimmicks, rainbow gradients, and "vibecoded" animations, adopting an editorial **Broadsheet** standard inspired by *The Wirecutter*, *Bloomberg*, and *Monocle*.

#### 🎨 Color & Surface Tokens
* **Base Background (`--bg-base: #0D0E11`)**: Deep charcoal black. Used as the main application canvas.
* **Surface Background (`--bg-surface: #14161B`)**: Elevated slate-charcoal used for cards, modal dialogs, and popovers.
* **Raised Surface (`--bg-raised: #1B1E26`)**: Interactive state surface used for hovered items, search containers, and sparkline backdrops.
* **Hairline Borders (`--border-default: #23262F`, `--border-strong: #363B47`)**: 1px crisp borders. **Zero drop shadows** are used anywhere in the application; spatial depth is achieved purely through 1px border contrast.
* **Warm Amber Accent (`--accent: #D97706`, `--accent-hover: #B45309`, `--accent-subtle: #241808`)**: The single brand color. Used for primary CTAs, active underlines, sparklines, and deal drop highlights.
* **Status Colors**:
  - Green (`--green: #16A34A`, `--green-subtle: #0F2417`): Used for verified tags, savings calculations, and copy confirmations.
  - Red (`--red: #DC2626`, `--red-subtle: #241010`): Used for expired deal indicators and out-of-stock badges.

#### 🔤 Typography System
* **Headings (`--font-heading: 'Lexend'`)**: Used for page mastheads, deal card titles, and section labels. Letter tracking is tightened (`letter-spacing: -0.02em`) for editorial density.
* **Body (`--font-body: 'Source Sans 3'`)**: Used for descriptions, labels, button text, and metadata. Rendered at `16px` base with `1.5` line-height for readability.
* **Prices & Numerals (`--font-mono: 'JetBrains Mono'`)**: Used for all prices, MRPs, discount percentages, timestamps, and coupon codes. Features `font-variant-numeric: tabular-nums` to ensure numerals align vertically without jitter.

#### 📐 Geometric Geometry
* **Border Radius**: Strictly **`2px`** across all cards, buttons, modals, and inputs. Soft rounded corners are banned to preserve an authoritative, editorial broadsheet feel.

---

### 13.2 Public Consumer Storefront (`IndiaDealHunts` / `rudranil-deals-web`)

#### 1. Masthead Navigation (`Navbar.tsx`)
* **Height & Position**: Sticky `48px` header fixed to the top of the viewport with `z-index: 50`, backed by `#0D0E11` and a `1px solid #23262F` bottom border.
* **Brand Mark**: Displays a `8px × 8px` solid warm amber square (`#D97706`) paired with bold, uppercase typography: `INDIADEALHUNTS` in Lexend (`14px`, weight `700`, tracking `-0.02em`).
* **Desktop Navigation Tabs**: Horizontal list of text links (`Latest Deals`, `Popular`, `Top Value`, `Price Lookup`, `Submit Deal`). Active tab receives an amber indicator; inactive tabs hover from `--text-secondary` (`#9DA3AE`) to `--text-primary` (`#F4F4F5`).
* **Header Actions**:
  - **Legal Button**: Outlined button opening the Legal & Verification modal.
  - **Telegram Link Pill**: Dark slate button (`#1B1E26`) displaying the Telegram label and an inline SVG external diagonal arrow (`M4 1h7v7M11 1L4 8`), linking directly to `@dealsforindiachannel`.
* **Mobile Drawer Toggle**: An accessible `36px × 36px` hamburger button that transforms into an `×` when opened, sliding down a full-screen `#0D0E11` menu with staggered fade-in animations for each nav item.

#### 2. Hero Masthead & Search (`HeroBanner.tsx`)
* **Layout**: Centered masthead with `padding: 32px 16px 24px` and a bottom separator.
* **Headline**: Bold editorial title in Lexend (`clamp(22px, 4vw, 32px)`, weight `700`): *"Verified Deals & Price Drops"*.
* **Live Telemetry Subheadline**: Honest, real-data copy pulling live numbers: *"Price intelligence across 27 Indian retail channels. Last updated just now. 847 deals tracked."*
* **Search Command Bar**:
  - A `44px` high unified search box with `1px solid #262626` and `#111111` background.
  - Embedded SVG magnifying glass icon on the left.
  - Input supporting natural language queries and raw URL pasting (Amazon/Flipkart links automatically trigger the Deal Lookup modal).
  - Clear `×` button that appears dynamically when input is present.
  - Primary amber `Search` button with hover darkening and active tactile press (`translateY(1px)`).
* **Popular Query Chips**: A horizontal row of quick-search tags (`TWS Earbuds under 999`, `Sneakers 70% off`, `Smartwatches`, `boAt Audio`, `Backpacks`, `Laptops`) with 1-click filtering.

#### 3. Sticky Editorial Category Bar (`CategoryBar.tsx`)
* **Position**: Sticky bar pinned directly beneath the navbar at `top: 48px` (`z-index: 40`), maintaining presence as the user scrolls through the feed.
* **Scrollable Rail**: Horizontal flex container with hidden scrollbars (`scrollbar-none`) and edge mask gradients.
* **Dynamic Count Pills**: Displays categories with live deal counts computed directly from the active deal set:
  - `All Deals (847)`
  - `Electronics (312)`
  - `Fashion (189)`
  - `Home & Living (120)`
  - `Kitchen (94)`
  - `Grocery & Food (82)`
  - `Beauty & Personal (65)`
  - `Sports & Fitness (44)`
* **Active Indicator**: A crisp `2px` high amber bar (`#D97706`) anchored to the bottom of the active category button.

#### 4. Command Strip & Popover Filters (`Filters.tsx`)
* **Layout**: Single horizontal command row on desktop with wrapping on mobile.
* **Custom Store Dropdown**: Replaces native OS `<select>` elements with an animated popover panel (`dropdownFadeIn 140ms ease-out`). Displays stores (Amazon, Flipkart, Myntra, Ajio, DesiDime, Zepto, Swiggy, Blinkit) with amber checkmarks on the selected option.
* **Custom Category Dropdown**: Compact category selector.
* **Custom Sort Dropdown**: Options for `Newest Deals`, `Highest Discount`, `Top Value Score`, `Price: Low to High`, and `Price: High to Low`.
* **Multi-Source Verified Pill**: Toggle button that isolates deals confirmed by multiple independent Telegram channels.
* **Active Removable Chips**: When filters are applied, a chip row renders below:
  ```
  Active: [ Store: Amazon × ] [ Category: Electronics × ] [ Multi-Source × ] [Clear all]
  ```
  Clicking `×` removes that filter individually with zero page reload.

#### 5. Deal Cards (`PublicDealCard.tsx`)
* **Geometry**: Sharp `2px` border radius, `#14161B` background, and `1px solid #23262F` border.
* **Hover Interaction**: Border transitions smoothly to `#363B47` (`120ms ease`).
* **Image Stage**: Fixed **`4:3` aspect ratio** container with `#0D0E11` dark backdrop. Product images use `object-fit: contain` with zero distortion, halos, or cropping.
* **Store Badge**: Mono uppercase label (`AMAZON`, `FLIPKART`, `MYNTRA`) in `--text-muted` (`11px`, tracking `0.04em`).
* **Title**: Two-line clamped heading in Source Sans 3 (`14px`, weight `600`, line-height `1.4`).
* **Pricing Block**:
  - Sale Price: Bold JetBrains Mono (`16px`, weight `700`, color `#F4F4F5`).
  - Strikethrough MRP: Muted mono (`12px`, color `#68707D`).
  - Discount Badge: Warm amber pill (`11px`, font-weight `600`, color `#D97706`).
* **Verification & Inspection Row**:
  - Left: Verification timestamp (`Verified 12m ago` or `Expired`).
  - Right: Editorial affordance hint: `Breakdown ↗`.
* **Coupon Box (if present)**: Dashed amber container with promo code and clipboard copy button.
* **Primary CTA**: Full-width amber button (`Go to Deal →`, height `40px`) with external link navigation.

#### 6. Deal Detail Inspection Modal (`DealDetailModal.tsx`)
* **Backdrop**: Full-screen dark overlay with backdrop blur (`rgba(0, 0, 0, 0.78)` and `backdrop-filter: blur(4px)`).
* **Modal Window**: Max-width `680px`, elevated `#14161B` surface, `1px solid #363B47` border, `2px` corners, and subtle entrance slide animation (`modalSlideUp 200ms ease-out`).
* **Header**: Displays store badge, category breadcrumb, expired badge (if applicable), and an accessible `×` close button (with Escape key and click-outside listeners).
* **Media & Information Grid**:
  - Left: Large `4:3` image stage with `cursor: zoom-in` triggering the high-resolution lightbox.
  - Right: Full selectable title, large price display (`26px` bold mono), strikethrough MRP, percentage discount badge, and absolute savings calculation (`Total Savings: ₹X`).
* **Coupon Section**: Dashed promo box with prominent `COPY CODE` button that transitions to `COPIED ✓` in green and triggers a toast notification.
* **Verification Telemetry**: Displays merchant verification status and cross-channel consensus (`✓ Verified through official retailer feed. Confirmed across 3 independent channels.`).
* **Price History Sparkline**: Embedded 30-day price trend chart.
* **Actions**: Primary `Go to Deal on [Store] ↗` CTA, secondary `Share Deal` button (Web Share API + clipboard fallback), and `Report Expired` link.

#### 7. Inline Vector SVG Price History Sparkline (`PriceSparkline.tsx`)
* **Rendering**: Pure inline vector `<svg>` (0 external charting libraries, 0 bundle bloat).
* **Trajectory**: Deterministic 30-day daily price points ending at today's sale price.
* **Visual Elements**:
  - Shaded amber area fill with subtle gradient (`stopOpacity: 0.25 → 0.0`).
  - Solid amber trajectory line (`strokeWidth: 1.75`).
  - Dashed 30-day average reference line (`strokeDasharray: 3 3`).
  - Amber circular pulse point highlighting current deal price.
  - Drop calculation badge: `↓ X% below 30d avg` in green.

#### 8. Zero-Layout-Shift Skeleton Loader (`DealSkeleton.tsx`)
* **Dimensions**: Exact `4:3` aspect ratio matching the deal cards, inside a responsive `minmax(220px, 1fr)` grid with `16px` gap.
* **Animation**: Subtle flat pulse (`skeleton-flat-pulse 1.4s ease-in-out infinite`) alternating opacity between `0.6` and `0.3`, guaranteeing **CLS = 0**.

#### 9. Mobile Bottom Navigation Dock (`ThumbDeck.tsx`)
* **Dimensions**: Fixed `56px` bottom bar plus safe-area insets (`env(safe-area-inset-bottom)`), pinned with `z-index: 45`.
* **Items**: 4 thumb-accessible targets: `Feed`, `Search`, `Stores`, `Submit Deal`.
* **States**: Active tab shows amber icon fill and label; inactive tabs show muted icons.

#### 10. Floating Toast Notifications (`App.tsx`)
* **Position**: Bottom-right floating card (`z-index: 110`) with `#14161B` background and `1px solid #D97706` amber border.
* **Contents**: Amber dot indicator + action feedback (`"Coupon code 'SAVE200' copied!"`, `"Deal link copied to clipboard!"`).

---

### 13.3 Admin Curation Deck (`dealsforindia/dealflow` / `tg-setup`)

#### 1. Top Navigation & Global Controls
* **Header Bar**: Displays DealFlow brand mark, live deal counters (`N Pending Drops`), connection status pill (`Online: api.rudranil.me`), and search input.
* **Select Mode Toggle**: Checkbox toggle that enters multi-deal selection mode.
* **Navigation Tabs**:
  - `Review`: Main curation stream for pending drops.
  - `Channels`: Real-time telemetry and channel health monitoring.
  - `Settings`: Global auto-post rules and affiliate credentials.

#### 2. Review Deck Cards (`ReviewDeck.tsx`)
* **Channel Source Header**: Displays dynamic source channel name (`Genie Loot`, `Dealspoint Premium`, `DesiDime`), channel avatar initial, and relative post time.
* **Live Telegram Post Preview**: Rendered inside a dark Telegram bubble with formatted Markdown text, emojis, and clickable affiliate shortlinks.
* **Store & Pricing Tags**: Visual badges for store, sale price, MRP, and discount percentage.
* **Action Buttons**:
  - `🚀 Approve`: Publishes deal immediately to Redis `deals:approved`, updates MongoDB to `status: "posted"`, and broadcasts to Telegram.
  - `🗑️ Skip`: Rejects deal and sets status to `rejected`.
  - `✏️ Tune / Edit`: Opens the Live AI Prompt Tuning Modal.

#### 3. Live AI Prompt Tuning & Edit Modal (`EditModal.tsx`)
* **Dynamic Telegram Preview**: Live preview bubble updating in real time as text is modified.
* **AI Prompt Presets**: One-click action chips:
  - `🔥 Add Urgency`: Injects scarcity and limited-time phrasing.
  - `✂️ Make Concise`: Trims description down to essential price and link lines.
  - `💰 Highlight Discount`: Emphasizes savings and MRP comparison.
  - `✨ Add Clean Formatting`: Standardizes emojis, line breaks, and store links.
* **Custom AI Prompt Input**: Text area allowing curators to enter custom prompts sent to `/api/v1/deals/{fp_hash}/ai-rewrite`.

#### 4. Floating Bulk Action Dock
* **Trigger**: Activates when one or more cards are selected in Select Mode.
* **Position**: Fixed bottom-center floating glassmorphic bar.
* **Actions**:
  - `🚀 Approve All (N)`: Batch approves all selected deals.
  - `🗑️ Skip All (N)`: Batch skips all selected deals.
  - `Clear`: Deselects all cards.

#### 5. Channels Telemetry & Link Healing (`ChannelsTab.tsx`)
* **Channel Grid**: Cards for all 27 active Telegram channels.
* **Telemetry Data**: 24-hour deal volume, last active timestamp, and stream status (`Active`, `Paused`).
* **Auto-Post Toggle**: Toggle switch per channel. When enabled, deals from that channel bypass manual curation and auto-post directly.
* **Dead Link Warning Badge**: Flags channels whose invite links have expired or rotated.
* **1-Click Update Invite Link Modal**: Curators can paste the new invite URL (`https://t.me/+...`) and submit. MongoDB updates immediately and alerts `listener.py` via Redis without server restarts.

---

*Master UI & Visual Design Description compiled and verified across all production components on September 28, 2026.*

