# DealFlow System: Complete Architecture & Point-by-Point Initialization Guide

> **Document Version**: 3.0.0  
> **Target Audience**: Systems Engineers, AI Operators, DevOps, and Platform Administrators  
> **Scope**: Full-Stack Architecture, Production VM Topology, 5-Daemon Microservices Engine, Database Schemas, Telethon Scrapers, Multi-LLM Cascades, Affiliate Monetization, Admin Curation Deck, and Public Consumer Storefront.

---

## 1. Executive Summary & System Overview

**DealFlow** is an autonomous, high-throughput deal discovery, verification, AI-formatting, monetization, and multi-channel publishing ecosystem. It ingests thousands of retail deal drops daily from Telegram channels, web forums (DesiDime), and direct-to-consumer retailers, transforms them into high-conversion editorial posts, attaches verified affiliate tags, and syndicates them across:
1. **Public Consumer Storefront** (`https://indiadealhunts.com` / `rudranil-deals-web`)
2. **Telegram Deal Broadcast Channel** (`@dealsforindiachannel` / `@bestindiandeals2025`)
3. **X / Twitter Deal Feeds**
4. **Cloudflare Global Edge Network** (`https://dealflow-edge.pottemasshippo.workers.dev`)

Curators manage the entire stream in real time via the **DealFlow Admin Curation Deck** (`dealsforindia/dealflow` hosted on Vercel), with automated channel-level auto-posting, live AI prompt rewrites, and instant Telethon health telemetry.

---

## 2. Master System Architecture & Engine Topology

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

### Process & Service Directory
| Service / Process | PM2 ID | Host / Location | Port | Role & Responsibility |
|---|---|---|---|---|
| **`api`** | `7` | Production VM (`[REDACTED_IP]`) | `8000` | FastAPI REST API, WebSocket streams, AI rewrite endpoints, public feeds |
| **`bot`** | `0` | Production VM (`/home/[USER]/dealbot`) | — | Legacy Telegram PM Approval Deck, Telegram channel broadcast, live auto-edits |
| **`desidime`** | `10` | Production VM (`/home/[USER]/dealbot`) | — | DesiDime hot deals scraper, multi-item haul parser, 600s anti-ban loop |
| **`listener`** | `2` | Production VM (`/home/[USER]/dealbot`) | — | High-speed Telethon client listening across all 27 active Telegram channels |
| **`worker`** | `3` | Production VM (`/home/[USER]/dealbot`) | — | ASIN deduplication, shortlink unshortener, mobile Amazon scraper, auto-post |
| **MongoDB** | System | `localhost:27017` | `27017` | Primary database (`dealbot`): `UniqueDeals`, `SystemSettings`, `DuplicateLogs` |
| **Redis** | System | `localhost:6379` | `6379` | Message broker: `deals:approved`, `deals:price_change`, link sync events |
| **Admin Deck** | Cloud | Vercel (`dealsforindia/dealflow`) | `443` | Curation UI: deal approval, bulk actions, AI prompt presets, channel telemetry |
| **Storefront** | Local/Cloud | Vercel / Local (`rudranil-deals-web`) | `5173`/`443` | Consumer UI: Broadsheet editorial publication, price sparklines, detail modals |
| **Edge Worker** | Cloudflare | Global Edge Network | `443` | Edge proxy, sub-15ms cache, SEO sitemap/robots, video feeds |

---

## 3. Hardware, Host & System Dependencies

### Production VM Specifications
* **Operating System**: Ubuntu 22.04 LTS x86_64
* **Compute**: 2 vCPU, 4GB RAM minimum (Current Host: Azure Cloud `[REDACTED_IP]`)
* **Storage**: 30GB+ SSD (allocated for MongoDB indices, logs, and temp images)
* **Required Host Packages**:
  ```bash
  sudo apt-get update && sudo apt-get install -y \
      python3.11 python3.11-venv python3-pip \
      nodejs npm git curl wget redis-server mongodb-org
  sudo npm install -g pm2
  ```

---

## 4. Environment Variables & Secret Configuration

Create a unified `.env` in `/home/[USER]/dealbot/.env` on the VM:

```ini
# ==============================================================================
# DEALFLOW ENGINE MASTER CONFIGURATION
# ==============================================================================

# Database & Broker Connectivity
MONGODB_URI=mongodb://127.0.0.1:27017/dealbot
MONGODB_DB=dealbot
MONGO_DB=dealbot
REDIS_URL=redis://127.0.0.1:6379/0

# Telegram Telethon API Credentials
# Obtain from https://my.telegram.org/apps
TELEGRAM_API_ID=[REDACTED_API_ID]
TELEGRAM_API_HASH=[REDACTED_API_HASH]
TELEGRAM_BOT_TOKEN=[REDACTED_BOT_TOKEN]
ADMIN_TELEGRAM_ID=[REDACTED_ADMIN_ID]
BROADCAST_CHANNEL=@dealsforindiachannel
BACKUP_CHANNEL=@bestindiandeals2025

# Multi-LLM Cascade API Keys (High Priority -> Fallback)
CEREBRAS_API_KEY=[REDACTED_CEREBRAS_KEY]
GROQ_API_KEY=[REDACTED_GROQ_KEY]
GEMINI_API_KEY=[REDACTED_GEMINI_KEY]
TOGETHER_API_KEY=[REDACTED_TOGETHER_KEY]

# Affiliate Monetization Credentials
AMAZON_AFFILIATE_TAG=[REDACTED_AFFILIATE_TAG]
AMAZON_FALLBACK_TAG=[REDACTED_FALLBACK_TAG]
EARNKARO_TOKEN=[REDACTED_EARNKARO_JWT]
EARNKARO_USER_ID=[REDACTED_USER_ID]

# Operational Parameters
DESIDIME_INTERVAL_SEC=600
FASTAPI_PORT=8000
FASTAPI_HOST=0.0.0.0
CORS_ORIGINS=https://dealflow-topaz-seven.vercel.app,https://indiadealhunts.com,http://localhost:5173
```

---

## 5. Database Schema & Data Models

### Collection 1: `UniqueDeals` (Primary Deals Collection)
Every deal scraped across channels is normalized into this MongoDB collection:
```json
{
  "_id": ObjectId("..."),
  "fp_hash": "sha256_fingerprint_of_product_canonical_url",
  "prod_name": "OnePlus Nord Buds 2r True Wireless Earbuds",
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
  "status": "pending",           // "pending" | "posted" | "rejected" | "auto_posted"
  "ai_formatted_text": "🔥 *OnePlus Nord Buds 2r TWS*\n\n💰 Price: ₹1,799 (MRP: ₹2,299)\n🏷️ 22% Off\n\n👉 Buy Now: https://amzn.to/...",
  "coupon": null,
  "cluster_count": 3,           // Seen in 3 different Telegram channels
  "cluster_channels": ["@dealspoint", "Genie Loot", "DealDrops"],
  "is_lowest_price": true,
  "tg_message_id": 8412,        // Recorded upon broadcast for live Telegram auto-edits
  "tg_channel": "@dealsforindiachannel",
  "created_at": ISODate("2026-09-28T12:00:00Z"),
  "updated_at": ISODate("2026-09-28T12:00:00Z")
}
```

### Collection 2: `SystemSettings` (Configuration Document: `channels_config`)
> ⚠️ **CRITICAL RULE**: Legacy `bot.py` and `listener.py` read raw string usernames and invite links. They **CANNOT** accept numeric `-100...` peer IDs.

```json
{
  "_id": "channels_config",
  "channels": {
    "https://t.me/+********": true,
    "@dealspoint": true,
    "@DesidimeHot": true,
    "@glamhauldiaries": true
  },
  "auto_approve": {
    "@dealspoint": false,
    "@DesidimeHot": true
  },
  "channel_names": {
    "https://t.me/+********": "Crazy Deals",
    "@dealspoint": "Dealspoint Premium"
  }
}
```

---

## 6. The 27 Integrated Telegram Channels Directory

| # | Channel Name | Invite Link / Username | Auto-Approve Support |
|---|---|---|---|
| 1 | **Crazy Deals** | `https://t.me/+********` | Supported |
| 2 | **DealDrops** | `https://t.me/c/*********` | Supported |
| 3 | **Dealspoint Premium** | `@dealspoint` | Supported |
| 4 | **DealzTrendz** | `https://t.me/+********` | Supported |
| 5 | **DealzTrendz 2.0** | `https://t.me/+********` | Supported |
| 6 | **DesiDime - Handpicked Deals** | `@DesidimeHot` | Supported |
| 7 | **EarnKaro (Loot Deals & Offers)** | `@realearnkaro` | Supported |
| 8 | **ExtraPe \| Earn By Sharing Deals** | `@extrape` | Supported |
| 9 | **FET (Deals & Tricks)** | `https://t.me/+********` | Supported |
| 10 | **Fitness Finds by SQ** | `https://t.me/addlist/********` | Supported |
| 11 | **Free Earning Tech** | `https://t.me/+********` | Supported |
| 12 | **Genie All Deals** | `https://t.me/+********` | Supported |
| 13 | **Genie Loot** | `https://t.me/+********` | Supported |
| 14 | **Genie Tricks** | `https://t.me/+********` | Supported |
| 15 | **Glam Haul Diaries** | `@glamhauldiaries` | Supported |
| 16 | **Loot Deals App** | `@lootdealsapp` | Supported |
| 17 | **Offerzone 2.0** | `https://t.me/+********` | Supported |
| 18 | **Offerzone 3.0** | `https://t.me/+********` | Supported |
| 19 | **Offerzone 4.0** | `https://t.me/+********` | Supported |
| 20 | **Offerzone Tricks** | `https://t.me/+********` | Supported |
| 21 | **OZ Loot Bazaar** | `https://t.me/+********` | Supported |
| 22 | **OZ Loot Deals** | `https://t.me/c/*********` | Supported |
| 23 | **Private Deals From All** | `@bblbblp` | Supported |
| 24 | **Shoppers Quest 2.0** | `https://t.me/ShoppersQuest` | Supported |
| 25 | **Shopping Genie** | `https://t.me/+********` | Supported |
| 26 | **Technical Sheikh** | `@Technicalsheikh` | Supported |
| 27 | **Trending Loot Deals** | `@Loot_DealsX` | Supported |

---

## 7. Multi-LLM AI Formatting Cascade Setup

When a deal arrives, `ai_formatter.py` passes the raw product name, store, price, and affiliate URL through a prioritized multi-LLM cascade:

```
[Incoming Deal Payload]
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

### Auto-Cleaning Sanitizer (`_clean_ai_output`)
All LLM responses are automatically scrubbed:
1. Strips introductory chat filler (`Here is the formatted post:`, `Sure, check this:`).
2. Strips markdown fences (` ```markdown `, ` ``` `).
3. Verifies that the affiliate URL is preserved intact without hallucination.

---

## 8. Universal Affiliate Engine & Shortlink Resolution

### 25+ Shortlink Resolver Domains
The engine automatically unpacks: `fpkrt.cc`, `wishlink.com`, `bitli.in`, `amazn.ltd`, `gotrackzo.com`, `linkredirect.in`, `app.lehlah.club`, `links.ddime.in`, `amzn.to`, `cutt.ly`, `tinyurl.com`, `dl.flipkart.com`, `ajiio.in`, `myntr.it`.

### Step-by-Step Monetization Pipeline:
1. **Unshorten**: Performs recursive `GET` requests with desktop User-Agent headers to find final canonical URL.
2. **De-Target Parameters**: Extracts real destination from query wrappers (`url=`, `dl=`, `target=`).
3. **Scrub Competitor Tags**: Strips `tag=`, `affid=`, `ref=`, `subId=`.
4. **Apply Affiliate Tag**:
   - **Amazon URLs**: Injects `tag=[REDACTED_TAG]`.
   - **Flipkart, Myntra, Ajio, Nykaa, Zepto**: Injects into EarnKaro JWT Converter API (`https://ekaro-api.affiliaters.in/api/converter/public`), converting to an active tracking link.

---

## 9. Point-by-Point System Initialization Guide

Follow these exact steps to initialize the DealFlow platform from a clean state:

### Step 1: VM Provisioning & Base Software
```bash
# 1. Connect to production VM
ssh [USER]@[REDACTED_IP]

# 2. Clone/pull the repository
cd /home/[USER]
git clone https://github.com/dealsforindia/dealflow.git dealbot
cd dealbot

# 3. Setup Python Virtual Environment
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Verify MongoDB & Redis Daemons
sudo systemctl enable --now mongod
sudo systemctl enable --now redis-server
mongosh --eval "db.adminCommand('ping')"
redis-cli ping
```

### Step 2: Telethon Telegram Authentication
```bash
# Run one-time interactive login to create 'session_name.session'
python3 -c "
from telethon.sync import TelegramClient
import os
from dotenv import load_dotenv
load_dotenv()
api_id = int(os.getenv('TELEGRAM_API_ID'))
api_hash = os.getenv('TELEGRAM_API_HASH')
client = TelegramClient('session_name', api_id, api_hash)
client.start()
print('Telegram Telethon Session successfully generated!')
"
```
*(Enter phone number and Telegram verification code when prompted).*

### Step 3: Seed MongoDB System Settings
Run initialization script to seed all 27 active channels:
```bash
python3 -c "
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/dealbot'))
db = client.get_default_database()

channels_config = {
    '_id': 'channels_config',
    'channels': {
        'https://t.me/+********': True,
        '@dealspoint': True,
        '@DesidimeHot': True,
        '@glamhauldiaries': True,
        '@realearnkaro': True,
        '@extrape': True,
        'https://t.me/+********': True
    },
    'auto_approve': {
        '@DesidimeHot': True
    }
}
db.SystemSettings.replace_one({'_id': 'channels_config'}, channels_config, upsert=True)
print('SystemSettings channels_config successfully seeded!')
"
```

### Step 4: Launch Backend Daemons with PM2
```bash
# Start all 5 production processes in order
pm2 start venv/bin/python --name "listener" -- listener.py
pm2 start venv/bin/python --name "worker" -- worker.py
pm2 start venv/bin/python --name "desidime" -- desidime_bot.py
pm2 start venv/bin/python --name "bot" -- bot.py
pm2 start "venv/bin/uvicorn api:app --host 0.0.0.0 --port 8000" --name "api"

# Save PM2 state for automatic reboot persistence
pm2 save
pm2 startup
```

Verify all processes are online:
```bash
pm2 list
# All 5 processes (api, bot, desidime, listener, worker) must show status 'online'
```

### Step 5: Initialize the Admin Curation Deck (`tg-setup/` / `dealflow`)
1. **GitHub Repository**: `dealsforindia/dealflow`
2. **Cloud Host**: Vercel (`https://dealflow-topaz-seven.vercel.app/`)
3. **Environment Variable on Vercel**:
   ```ini
   VITE_API_BASE=https://api.rudranil.me
   ```
4. **Deploy Command**:
   ```bash
   git push origin main  # Automatically builds and deploys via Vercel GitHub integration
   ```

### Step 6: Initialize Public Consumer Storefront (`rudranil-deals-web`)
1. **GitHub Repository**: `dealsforindia/indiadealhunts`
2. **Local Development**:
   ```bash
   cd e:\Rudranildocs0066543\html-yt\rudranil-deals-web
   npm install
   npm run dev  # Runs locally at http://localhost:5173/
   ```
3. **Production Build & Verification**:
   ```bash
   npm run build  # Builds zero-error production bundle in dist/
   ```
4. **Environment Variables**:
   ```ini
   VITE_API_URL=https://api.rudranil.me
   VITE_EDGE_API_URL=https://dealflow-edge.pottemasshippo.workers.dev
   ```

### Step 7: Deploy Cloudflare Edge Network Proxy (`dealflow-edge`)
```bash
cd dealflow-edge
npx wrangler deploy
# Deploys to https://dealflow-edge.pottemasshippo.workers.dev
```

---

## 10. Lifecycle of a Deal Drop (End-to-End Trace)

1. **Scraping**: A drop occurs on `@dealspoint` (e.g. *OnePlus Bullets Z2 @ ₹1,299*).
2. **Telemetry Ingest (`listener.py`)**: Intercepts the message, extracts URLs, and validates against active channel list in MongoDB.
3. **Deep Pipeline (`worker.py`)**:
   - Computes SHA256 canonical hash of the product URL to prevent duplicates.
   - Unshortens affiliate links through 5 redirect levels.
   - Invokes Mobile AW Amazon parser to pull the genuine high-resolution image (`aspect-ratio 4:3`) and MRP (`₹2,299`).
   - Runs multi-LLM cascade to generate formatted Markdown.
   - Inserts document into MongoDB `UniqueDeals` with `status: "pending"`.
4. **Curation Options**:
   - **Path A (Auto-Post ON)**: If `@dealspoint` has `auto_approve: true`, worker marks deal `status: "auto_posted"`, publishes to Redis `deals:approved`, and broadcasts to `@dealsforindiachannel` with 0 human intervention.
   - **Path B (Manual Curation)**: Deal appears in Admin Deck (`dealflow-topaz-seven.vercel.app`). Curator can tune text with AI prompts, edit price, or click **🚀 Approve**.
   - **Path C (Telegram PM)**: Deal also appears in Admin's private Telegram PM with `[Post]` / `[Skip]` inline buttons. Clicking `Post` updates MongoDB and synchronizes the Web UI.
5. **Consumer Distribution**:
   - Published immediately to Telegram channel (`@dealsforindiachannel`).
   - Appears at the top of the **IndiaDealHunts** storefront (`indiadealhunts.com`), with price history sparkline, savings calculations, and copyable coupon codes.
6. **Out-of-Stock Auto-Edit**:
   - If the price increases or the item sells out within 48 hours, `worker.py` detects the change and automatically edits the Telegram post to strike through the old price and prepend `⚠️ [PRICE INCREASED]`.

---

## 11. Maintenance, Self-Healing & Operational Runbook

### Health Check Commands
```bash
# 1. Check PM2 status
pm2 list

# 2. Inspect real-time worker logs
pm2 logs worker --lines 30 --nostream

# 3. Check API health
curl -I https://api.rudranil.me/health

# 4. Check Redis Pub/Sub activity
redis-cli pubsub channels

# 5. Database deal counts
mongosh dealbot --eval "
print('Pending deals: ' + db.UniqueDeals.countDocuments({status: 'pending'}));
print('Posted deals:  ' + db.UniqueDeals.countDocuments({status: 'posted'}));
print('Auto-posted:   ' + db.UniqueDeals.countDocuments({status: 'auto_posted'}));
"
```

### Rotating / Updating Expired Channel Invite Links
If a private channel rotates its invite link:
1. Open Admin Deck $\to$ **Channels** tab.
2. Locate the channel with `Dead Link Warning`.
3. Click **Update Invite Link**, paste the new `https://t.me/+...` URL, and submit.
4. MongoDB updates instantly and alerts `listener.py` via Redis to resume scraping without downtime.

---

*Report compiled and verified against production VM `[REDACTED_IP]`, MongoDB 7.0 engine, and the IndiaDealHunts storefront.*
