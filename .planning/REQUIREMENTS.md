# Requirements: DealFlow Platform

**Defined:** 2026-09-29  
**Core Value:** Zero-latency, high-converting deal ingestion and 100% accurate affiliate link transformation that broadcasts verified loot deals to consumers without interrupting the production Telegram pipeline.

## v1.0 Requirements (Current Scope)

### 1. Consumer Storefront Experience (`rudranil-deals-web`)

- [x] **STORE-01**: Clean modern Apple/Stripe light design system with slate-50 canvas, pure white cards, and high-contrast typography.
- [x] **STORE-02**: Fast, thumb-friendly mobile layout featuring sticky quick-filter pills, responsive drawer modals, and zero bottom navigation clipping.
- [x] **STORE-03**: Live public deal feed reading from `/api/v1/deals/public` with automatic polling fallback and instant card updates.
- [x] **STORE-04**: Store filtering supporting Amazon, Flipkart, Myntra, AJIO, and Swiggy Instamart with store-specific badge treatments.
- [x] **STORE-05**: Direct outward link redirection carrying verified affiliate tags and canonical product links.
- [x] **STORE-06**: Search & lookup modal with instant title matching and category filtering.
- [x] **STORE-07**: Persistent Saved Loot Bookmarks with local storage sync, Navbar badge count, and Mobile bottom dock integration.
- [x] **STORE-08**: 1-Click WhatsApp & Telegram Social Sharing with high-converting formatted copy and copy-to-clipboard toast.
- [x] **STORE-09**: Real-Time Multi-Store Arbitrage Matrix comparing Amazon, Flipkart, and Myntra with percentage savings and winner badges.
- [x] **STORE-10**: 24/7 Price Drop Watch Tracker with custom target price triggers and active watches dashboard.
- [x] **STORE-11**: High-Discount Flash Loot Radar Banner highlighting active 70%+ drops with instant filtering.

### 2. Backend & Scraping Pipeline (`dealbot_backend`)

- [x] **PIPE-01**: Multi-depth shortlink unshortening resolving nested redirect chains within 1.5s timeout.
- [x] **PIPE-02**: 100% affiliate conversion rate for supported stores; clean fallback to canonical URL without EarnKaro error strings.
- [x] **PIPE-03**: Anti-ban 600s scrape cycle on DesiDime and resilient scraping on 27 active Telegram channels.
- [x] **PIPE-04**: Fast image and metadata scraping for Flipkart (`h1.VU-ZEz`), Myntra, Swiggy, and Amazon (mobile Android User-Agent).

### 3. Admin Curation Deck (`tg-setup`)

- [x] **ADMIN-01**: Live review deck showing pending deals with dynamic channel origins and image thumbnails.
- [x] **ADMIN-02**: 1-click deal approval broadcasting to Redis `deals:approved` and Telegram channel.
- [x] **ADMIN-03**: One-click AI prompt presets (`🔥 Add Urgency`, `✂️ Make Concise`, `💰 Highlight Discount`).
- [x] **ADMIN-04**: Channel management interface with auto-post toggles and invite link update tool.

## Traceability Matrix

| Requirement | Phase | Status |
|---|---|---|
| STORE-01 | Phase 1: Storefront Core Redesign | Verified |
| STORE-02 | Phase 1: Storefront Core Redesign | Verified |
| STORE-03 | Phase 2: Live Feed & Filtering | Verified |
| STORE-04 | Phase 2: Live Feed & Filtering | Verified |
| STORE-05 | Phase 2: Live Feed & Filtering | Verified |
| STORE-06 | Phase 2: Live Feed & Filtering | Verified |
| STORE-07 | Phase 2: Storefront Super-Features | Verified |
| STORE-08 | Phase 2: Storefront Super-Features | Verified |
| STORE-09 | Phase 2: Arbitrage & Price Tracking | Verified |
| STORE-10 | Phase 2: Arbitrage & Price Tracking | Verified |
| STORE-11 | Phase 2: Storefront Super-Features | Verified |
| PIPE-01  | Phase 3: Scraping & Affiliate Hardening | Verified |
| PIPE-02  | Phase 3: Scraping & Affiliate Hardening | Verified |
| PIPE-03  | Phase 3: Scraping & Affiliate Hardening | Verified |
| PIPE-04  | Phase 3: Scraping & Affiliate Hardening | Verified |
| ADMIN-01 | Phase 4: Admin Deck & Auto-Post Sync | Verified |
| ADMIN-02 | Phase 4: Admin Deck & Auto-Post Sync | Verified |
| ADMIN-03 | Phase 4: Admin Deck & Auto-Post Sync | Verified |
| ADMIN-04 | Phase 4: Admin Deck & Auto-Post Sync | Verified |
