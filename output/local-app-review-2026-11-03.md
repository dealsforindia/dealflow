# Local app review — 2026-11-03

Running URLs: IndiaDealHunts http://127.0.0.1:5173/; DealFlow http://127.0.0.1:5174/.

Scope: rendered home/review screens, one storefront detail panel, storefront light/dark appearances, DealFlow 393px layout, and targeted source inspection. Both frontends use existing remote services; no local backend was launched. Initial EACCES proxy failures were session restrictions and resolved after restarting with network access. Real offers and queue items loaded. No application code or remote deals changed.

## Findings

1. **P1 — Admin credential embedded in browser source.** `telegram-system/tg-setup/src/app/utils/adminAuth.ts:5` contains a hardcoded admin-token fallback, also returned at line 12, persisted to localStorage and sent in authentication headers. Anyone receiving the client source/bundle can extract it. Token validity and unauthorized access were not tested. Remove privileged shared credentials from the browser; use authenticated server-side sessions. Rotate the embedded credential if accepted by any deployed backend. Credential value intentionally omitted.

2. **P1 — Unknown price becomes “Free”.** Observed HRX Clothing as “Freebie Loot” on desktop and “Free” at 393px. `tg-setup/src/app/App.tsx:258` formats zero as Free; the desktop branch at line 1811 also accepts positive MRP as sufficient to call a nonpositive price a freebie. Missing price is not proof of a zero-price offer. Preserve unknown price separately and show “Price at store” unless zero is explicitly verified.

3. **P1 — Product-specific evidence attached to a generic listing.** Open the storefront card “Featured Online Deal”: the detail panel displays ₹129, MRP ₹1,299, rating 3.1, 90% discount and a chart with 34 recorded checks, while its source link is an Amazon category/search URL (`/s?...`) rather than an individual product. The card has no product image or useful identity. These observations cannot establish a consistent SKU history. Check canonical product identity before showing product-specific ratings/history; present collection offers separately. The underlying records were not independently validated.

4. **P1 — Stock urgency is presented with unjustified precision.** The same generic offer shows “FLASH LOOT (Act Now!)”, a 4.6-minute half-life and “Under 5 minutes” stock expectancy. `rudranil-deals-web/src/components/DealDetailModal.tsx:570` renders these metrics. The local `dealbot_backend/dealbot/deal_survival_model.py:47` uses fixed baseline parameters and hand-set weights from discount, price, category, channel count and title keywords; those inputs do not establish merchant inventory. Remove customer-facing stock-time claims unless supported by validated inventory evidence. Local model inspection does not prove the deployed backend revision.

5. **P2 — Pending offers say LIVE.** Fresh cards in DealFlow's selected Pending queue show LIVE next to their timestamps, alongside an Approve action. `tg-setup/src/app/App.tsx:1627` selects LIVE when `isFresh` is true even if neither web nor Telegram publication is true. This conflates recent ingestion with publication. Label that state “New” or “Received”.

6. **P2 — Background effects interfere with reading.** Repeated square/pixel clusters cross the storefront Fresh finds strip, result heading/description and layout-control area in dark mode; dark clusters are particularly distracting in light mode. This was visibly reproduced in both themes. Keep the decorative layer out of text/control regions or substantially reduce its visual weight. Root rendering cause not isolated.

7. **P2 — DealFlow card metadata collides at desktop size.** At the observed 1280px layout, source/affiliate/live badges overlap, coupon and effective-price text collide, and some Approve labels are clipped at the right edge of narrow four-column cards. Mobile switches to more usable full-width cards, but product images were blank in the observed phone screenshot; image loading versus rendering cause remains unconfirmed. Give card metadata room to wrap and reduce columns before controls clip.

8. **P2 — Verification label is unconditional.** `rudranil-deals-web/src/components/DealDetailModal.tsx:415` renders “Verified {storeName}”; the incomplete Amazon category listing receives it too. A store identity is not evidence that this offer was checked. Gate the badge on a defined verification result and disclose scope/time.

## What worked and limits

- Both dev servers started successfully and loaded live backend data after network restrictions were resolved; DealFlow reported connected services.
- Storefront theme switching worked. Product detail opened and closed. DealFlow rendered a single-column phone review deck with bottom navigation; measured page width was 393px without document overflow.
- Storefront 393px DOM layout also had no document overflow, but browser capture scaling was inconsistent, so its phone appearance is not accepted as fully verified. No physical phone/touch test was performed.
- The detector scanned the two main component files: 9 primary style warnings, 125 advisory notes. Its palette/gradient preferences are not treated as functional bugs or grounds to replace the approved design.
- No comprehensive accessibility, contrast, performance, full-route, checkout, security exploitation or production verification was performed. Those dimensions remain unscored; a numeric health score would imply unsupported coverage.

Recommended order: address credential handling and misleading data claims; then pending/live terminology and responsive card layout; then decorative interference and final visual polish. Relevant UI workflows: `$impeccable harden`, `$impeccable clarify`, `$impeccable adapt`, then `$impeccable polish`.
