# DealFlow — Full-Stack Deal Intelligence & Monetization Platform

## What This Is

DealFlow is an AI-powered deal ingestion, arbitrage analysis, affiliate monetization, and multi-channel distribution engine. It scrapes real-time offers from 27+ Telegram deal channels and DesiDime, extracts structured product metadata, unshortens and validates affiliate redirects (Amazon, EarnKaro), runs multi-LLM deal formatting cascades, and serves both an internal Admin Curation Deck and a high-performance consumer storefront (`IndiaDealHunts`).

## Core Value

Zero-latency, high-converting deal ingestion and 100% accurate affiliate link transformation that broadcasts verified loot deals to consumers without interrupting the production Telegram pipeline.

## Business Context

- **Consumers**: Shoppers across India looking for verified loot drops, price anomalies, and lightning discounts on Amazon, Flipkart, Myntra, Swiggy, and AJIO.
- **Curators**: Internal deal managers approving and tweaking AI-generated deal copy with 1-click actions.
- **Revenue Model**: Affiliate commissions generated via EarnKaro API, Amazon Associates tags, and partner store affiliate links.
- **Success Metrics**: 
  - 100% affiliate link conversion rate (zero broken redirects or raw error texts).
  - < 200ms API response time on `/api/v1/deals/public`.
  - Continuous 24/7 uptime of scraping listeners and PM2 services on the remote VM (`74.225.250.0`).

## Architecture Topology

| Layer / Service | Tech Stack | Location | Port / Endpoint |
|---|---|---|---|
| **Public Storefront** | React 19 + Vite + Tailwind CSS v4 | Local / Vercel (`rudranil-deals-web/`) | `http://localhost:5173` |
| **Admin Curation Deck** | React 18 + Vite | Cloud (`tg-setup/`) | `https://dealflow-topaz-seven.vercel.app` |
| **API Server** | FastAPI + Uvicorn (PM2 #7) | Remote VM (`74.225.250.0`) | `https://api.rudranil.me:8000` |
| **Telegram Scraper Listener** | Telethon Client (PM2 #2) | Remote VM (`74.225.250.0`) | Scrapes 27 active channels |
| **DesiDime Scraper** | Python + Requests (PM2 #10) | Remote VM (`74.225.250.0`) | Scrapes DesiDime hot deals (600s cycle) |
| **Worker Engine** | Asyncio Worker (PM2 #3) | Remote VM (`74.225.250.0`) | De-duplication, image scraping, auto-post |
| **Telegram PM Approval Bot** | Telethon + Multi-LLM (PM2 #0) | Remote VM (`74.225.250.0`) | Legacy Admin PM inline button curation deck |
| **Datastores** | MongoDB 7.0 + Redis 7.0 | Remote VM (`74.225.250.0`) | MongoDB `dealbot` + Redis `deals:approved` Pub/Sub |

## Requirements

### Validated & Production Active
- [x] Multi-depth recursive URL unshortener supporting 25+ shortlink domains (`fpkrt.cc`, `wishlink.com`, `bitli.in`, etc.).
- [x] Multi-LLM AI formatting cascade (Cerebras LLaMA 3.1 -> Groq LLaMA 3.3 -> Gemini Flash).
- [x] Live sync between Telegram PM inline button actions and MongoDB `UniqueDeals` status (`posted`, `rejected`).
- [x] Channel auto-approve toggles with immediate Redis Pub/Sub publishing.
- [x] Real-time channel telemetry monitoring 27 active Telegram sources.
- [x] **STOREFRONT-01**: Ultra-clean, mobile-first Apple/Stripe light consumer interface for `rudranil-deals-web`.
- [x] **STOREFRONT-02**: Fluid mobile navigation with quick category pills, zero horizontal clipping, and snappy sheet drawers.
- [x] **STOREFRONT-03**: Real-time deals feed stream connecting directly to `https://api.rudranil.me/api/v1/deals/public`.
- [x] **STOREFRONT-04**: Robust deal filtering by store (Amazon, Flipkart, Myntra, Swiggy Instamart) and discount depth.
- [x] **STOREFRONT-05**: Persistent Saved Loot Bookmarks (LocalStorage + Navbar badge + Mobile bottom dock).
- [x] **STOREFRONT-06**: 1-Click WhatsApp & Telegram Social Sharing with copy-to-clipboard toast.
- [x] **STOREFRONT-07**: Real-Time Multi-Store Arbitrage Comparison (Amazon vs Flipkart vs Myntra) with percentage savings delta.
- [x] **STOREFRONT-08**: 24/7 Price Drop Watch tracker with target price threshold and alert subscription.
- [x] **PIPELINE-01**: 100% affiliate link conversion fallback with zero EarnKaro raw API error messages.
- [x] **ADMIN-01**: 1-click batch selection, bulk approval, and live AI rewrite presets in Web Deck.

### Explicitly Out of Scope
- Disabling or interrupting legacy `bot.py` PM approval while Web UI is being refined (Mandatory system rule).
- Using numeric `-100...` IDs in MongoDB `channels_config` (Must always use raw strings / invite links / @usernames).
- Heavy visual gimmicks in storefront (No harsh gradients, no emojis, no liquid glass, no bento grids, no drop shadows).

## System Constraints & Guardrails

1. **Legacy Flow Preservation**: Do NOT break legacy `bot.py` or listener scraping.
2. **Channel Config Invariant**: Legacy scripts parse `SystemSettings.channels_config` as string keys (`https://t.me/+...` or `@channel`). Never migrate this schema to numeric peer IDs.
3. **Affiliate Integrity**: Every outgoing deal URL must be verified. If affiliate generation fails, fallback gracefully to the canonical product link; never post raw error strings.
4. **VM Deployment Protocol**: Always test code changes locally in `dealbot_backend/dealbot/`, transfer via SCP to `rudranil777@74.225.250.0:/home/rudranil777/dealbot/`, restart PM2 process, and inspect `pm2 logs`.

## Key Architectural Decisions

- **ADR-001**: Centralized multi-LLM cascade in `ai_formatter.py` so web approval and worker auto-post share identical post quality.
- **ADR-002**: Pure client-side UI optimization with zero reliance on heavy icon packs or bloated UI component frameworks.
- **ADR-003**: Redis Pub/Sub as single source of truth for approved deal broadcasting to Telegram channel (`@dealsforindiachannel`) and consumer web feed.
