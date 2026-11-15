import sys

path = r'GEMINI.md'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

marker = '## 🚨 UPDATED CRITICAL RULES FOR ALL FUTURE AGENTS'

entry = '''### 52. Offer Model Ingestion Hardening & Storefront Reliability (error.md E14, E16, E26, E35, E38, E44, E45, E46, E47, E48, E53)
- **Problem & Root Cause**:
  1. **Button Concatenation Bug (E14)**: `DealDetailModal.tsx` split the first word of multi-item labels to form `Buy ${firstWord}`, producing bizarre labels like `"Buy Add"`, `"Buy Step"`, and `"Buy Buy"`.
  2. **Irrelevant Shopping Tool Menu Actions (E53)**: `PublicDealCard.tsx` offered the phone "Exchange calculator" on shirts, luggage, and groceries whenever the callback was present.
  3. **Unbounded Story Budget Navigation (E48)**: In `CategoryStories.tsx`, Under ₹499 passed `category_filter: 'all'`, resetting filters in `App.tsx` and dumping the entire feed without price bounds.
  4. **Story Navigation Accessibility & Missing Controls (E47)**: Story tap zones were non-semantic `<div>` elements without visible play/pause controls or motion preference respect.
  5. **Divergent Brand Terminology (E16)**: Mixed naming across mobile and desktop ("Saved Deals" vs. "Loot Vault" vs. "My Mine").
  6. **Inaccessible Search Results (E26)**: Command palette result rows were plain `<div>`s with `onClick` but lacking `role="option"` and keyboard semantics.
  7. **Unverified Auth Session & Silent Alert Deletion (E35, E38)**: `ProfilePage.tsx` promoted guest alert email to an authenticated session without an active token; failed alert deletions silently vanished from the UI.
  8. **Amazon Scraper Page Debris (E46)**: `store_scraper.py` extracted feature bullets from all `span.a-list-item` across the entire page, picking up dimension tables, warranty protection plans, and template debris.
  9. **Collection vs. Product Classification (E44, E45)**: Scrapers treated search/catalog links (`/s?k=`, `/search?q=`) as exact single products, and promotional steps as independent purchasable variants.
- **Architectural Overhaul & Fixes**:
  1. **Contextual Multi-Item Labels & Step Badges (E14, E45)**:
     - Replaced `Buy ${firstWord}` in `DealDetailModal.tsx` with contextual labels (`item.price ? 'Shop · ₹' + price : 'View Offer ↗'`).
     - Added `STEP N` indicator badges for promo steps (`/^(step|add|buy|get|free|coupon|click|claim|apply|order)/i`).
  2. **Context-Aware Tool Menu Eligibility (E53)**:
     - Gated `Exchange calculator` in `PublicDealCard.tsx` behind `isTechOrPhone` (electronics, smartphones, laptops, tablets only).
  3. **Strict Budget Story Constraint Carrying (E48)**:
     - Fixed `CategoryStories.tsx` to set `category_filter: 'budget499'`.
     - Updated `App.tsx` to apply `collectionFilter: 'budget499'` and reset category to `'All'`, guaranteeing only genuine deals < ₹499 display.
  4. **Accessible Story Autoplay & Controls (E47)**:
     - Converted tap zones in `StoryModal.tsx` to accessible `<button>` controls.
     - Added header Play/Pause toggle button and auto-paused autoplay when `prefers-reduced-motion: reduce` is detected.
  5. **Unified Vocabulary (E16)**:
     - Standardized all bookmarks and watchlist copy across `SavedLootPage.tsx`, `IntelligenceWorkspace.tsx`, and `TrustStrip.tsx` to **"Saved Deals" / "Saved"**.
  6. **Accessible Command Palette Results (E26)**:
     - Converted tool and deal rows to `<button type="button" role="option" aria-selected={...}>` within `role="listbox" aria-label="Search results"`.
  7. **Auth Security & Error Transparency (E35, E38)**:
     - Required `idh_auth_token` before initializing an authenticated session in `ProfilePage.tsx`; guest alert submissions save to `idh_last_alert_email`.
     - Updated `handleDeleteAlert` to check `res.ok` and surface honest server error notifications on deletion failures.
  8. **Scoped Feature Bullets & Offer Model Ingestion (E46, E44)**:
     - Scoped Amazon highlights extraction in `store_scraper.py` strictly to `#feature-bullets`, `#featurebullets_feature_div`, or `#detailBullets_feature_div`.
     - Filtered out protection plans, dimension options, and template debris.
     - Added `is_collection_url()` in `store_scraper.py` to identify search/catalog pages, tagging them with `offer_kind: "collection"` and `price_kind: "from"`.
- **Verification & Deployment**:
  - Ran all 41 test suites in `rudranil-deals-web` (`node --test tests/*.test.mjs`): **41 pass, 0 fail**.
  - Built production bundle with 0 errors (`built in 9.72s`).
  - Committed and pushed to GitHub `dealsforindia/indiadealhunts` (commit `2ddd53f`).
  - Uploaded `store_scraper.py` to remote VM (`74.225.250.0`) and restarted PM2 `api` and `worker` (all 7 services online at 0% idle CPU).

'''

if marker in text:
    text = text.replace(marker, entry + '\n' + marker)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("GEMINI.md updated with item #52 successfully")
else:
    print("Marker not found in GEMINI.md")

