# Roadmap: DealFlow Platform

## Overview
DealFlow is evolving from a Telegram-first bot into a high-performance, full-stack deal discovery engine. The immediate milestone focuses on perfecting the consumer storefront (`rudranil-deals-web`) with a sleek, distraction-free mobile UX, hardening the live data stream, and ensuring 100% affiliate monetization reliability.

---

## Phases Summary

- [x] **Phase 1: Consumer Storefront Clean Redesign & Mobile UX** — Rebuild the frontend layout to eliminate all 30 visual gimmicks, establishing high-legibility typography, fluid touch targets, and a native app feel on mobile.
- [ ] **Phase 2: Real-Time Feed Streaming & Store Filtering** — Connect `rudranil-deals-web` directly to `/api/v1/deals/public` with resilient caching, store filtering, and rapid search lookup.
- [ ] **Phase 3: Scraping Engine & Affiliate Reliability Hardening** — Ensure 100% affiliate link conversion, zero raw API error text leakage, and continuous channel scraping across 27 sources.
- [ ] **Phase 4: Admin Curation Deck & Dynamic Telemetry** — Fine-tune 1-click approvals, channel toggles, and live AI rewrite presets in the Admin Deck.
- [ ] **Phase 5: Sunsetting Legacy Telegram PMs** — Seamless transition of curation duties to the Web Deck once reliability is proven 100%.

---

## Phase Details

### Phase 1: Consumer Storefront Clean Redesign & Mobile UX
**Goal**: Deliver a lightning-fast, distraction-free consumer browsing experience on `rudranil-deals-web` adhering strictly to the user's design anti-pattern rules.
**Depends on**: Nothing (Frontend focus)
**Requirements**: STORE-01, STORE-02
**Success Criteria**:
1. Zero prohibited gimmicks: no harsh gradients, no lucide icons, no emojis, no liquid glass, no bento grids, no drop shadows, no skeleton loaders, no neon or pastel blobs.
2. Fluid, instant mobile interaction with clean typography, responsive category pills, and full bottom navigation clearance.
3. Fast First Contentful Paint (< 500ms) with zero layout shifts.

**Plans**:
- [ ] 01-01: Audit and purge styling gimmicks in `rudranil-deals-web/src/index.css` and root components.
- [ ] 01-02: Build clean, high-performance deal card component with store badges and explicit pricing hierarchy.
- [ ] 01-03: Implement mobile-first category bar and bottom clearance for seamless phone scrolling.

---

### Phase 2: Real-Time Feed Streaming & Store Filtering
**Goal**: Wire the clean storefront to the FastAPI backend (`https://api.rudranil.me`) for real-time deals streaming, instant search, and store filtering.
**Depends on**: Phase 1
**Requirements**: STORE-03, STORE-04, STORE-05, STORE-06
**Success Criteria**:
1. Storefront fetches live deals from `GET /api/v1/deals/public` with seamless pagination (40/80/All).
2. Store filter tabs (All, Amazon, Flipkart, Myntra, Swiggy, AJIO) update instantaneously without full re-render.
3. Outward deal links carry valid affiliate tags and redirect directly to the store page.

**Plans**:
- [ ] 02-01: Update API client in `rudranil-deals-web` to consume `/api/v1/deals/public` with error boundary & stale-while-revalidate caching.
- [ ] 02-02: Implement fast store and discount filter chips.
- [ ] 02-03: Integrate search & deal lookup modal with client-side indexing.

---

### Phase 3: Scraping Engine & Affiliate Reliability Hardening
**Goal**: Eliminate all affiliate failure edges and unshortening timeouts across 25+ shortlink providers.
**Depends on**: Nothing (Runs in parallel on VM backend)
**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04
**Success Criteria**:
1. All scraped shortlinks (`fpkrt.cc`, `wishlink.com`, `bitli.in`, etc.) unshorten to canonical product URLs before EarnKaro conversion.
2. When EarnKaro fails or returns an error message, post text falls back gracefully to the clean product URL with zero error text leakage.
3. Background workers (`bot.py`, `desidime_bot.py`, `listener.py`, `worker.py`) maintain 0% CPU idle on PM2.

**Plans**:
- [ ] 03-01: Verify recursive unshortening loop in `worker.py` and `bot.py`.
- [ ] 03-02: Test EarnKaro error handling and fallback sanitization.

---

### Phase 4: Admin Curation Deck & Dynamic Telemetry
**Goal**: Ensure curators can review, rewrite with AI, and publish pending drops in 1 click.
**Depends on**: Phase 3
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04
**Success Criteria**:
1. Admin Deck displays pending queue with accurate channel tags and product photos.
2. 1-click AI rewrite presets generate concise, high-urgency deal copy.
3. Approving a deal immediately broadcasts to Redis `deals:approved` and Telegram.
