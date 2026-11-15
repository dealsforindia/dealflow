# IndiaDealHunts implementation ledger

Updated 4 October 2026. Preserve all files, existing storefront features and the private DealFlow workflow. Local implementation is not production deployment.

## Current delivery

- Shopping intelligence workspace: discovery, source labels, saved snapshots on this device, recent searches, budgets, history filters and three-product comparison.
- Product inspector: genuine history points, period controls, low/median/high, evidence status, checkout fields, timeline and deterministic evidence-based answers. Copyable offer summary, target-price modal and existing lookup remain accessible.
- Search: dedicated results page, cancelled stale feed requests, bounded external search and direct store fallback. CPU accessories are explicitly distinguished from processors.
- Authenticity: reference-price bars replace an invented historical curve. Alerts require confirmed registration. Unknown stock stays unknown. Affiliate links do not imply extra savings.
- Local public backend: catalog discovery links retain no invented prices; conservative deduplication and history identity preserve variants; Google and URL analysis retain supplied evidence fields. Lookup no longer invents a regular-price benchmark or assumes stock.
- Existing verified feed, categories, cards, stories, saved loot, tools, comparison and navigation remain available.
- Future builds preserve previous generated output files (`--emptyOutDir false`). Earlier validation builds used Vite's default regeneration of `dist`; no source files were deleted.

## Scope and delivery sequence

Status means implemented locally, partial, existing (not fully audited), or planned. No planned feature is advertised as working. Private admin improvements are suggestions only unless the owner authorizes them separately.

| # | Capability | Status / next work |
|---|---|---|
| 1 | Natural-language shopping missions | Partial: budget parsing. Broader intent and specification filters planned. |
| 2 | Universal multi-store search | Partial: existing endpoint + UI/fallback. Production provider reliability unverified. |
| 3 | Verified vs external distinction | Implemented locally. |
| 4 | Product and variant identity | Partial: merchant IDs are store-scoped; checksum-valid supplied GTINs allow cross-store grouping. Backend barcode/model coverage remains required. |
| 5 | Merchant offer matrix | Existing + exact identity groups. Cross-store coverage depends on matching data. |
| 6 | Similar alternatives | Partial: CPU related-accessory labels. Spec-aware alternatives planned. |
| 7 | Suggestions / query memory | Partial: device-local recent searches. Completion suggestions planned. |
| 8 | Image / barcode / screenshot search | Planned: extraction and product catalog required. |
| 9 | Truth timeline | Implemented from supplied timestamps and prices. |
| 10 | Buy / wait guidance | Implemented deterministic observed-price rules; no prediction claim. |
| 11 | Historical discount evidence | Implemented from actual observations, separately from MRP. |
| 12 | Inflated-MRP checks | Partial: distinction explained; longitudinal MRP observations required for detection. |
| 13 | Price history explorer | Implemented chart and period selection; provider coverage varies. |
| 14 | Future-price predictions | Planned: sufficient historical data + backtested model required. |
| 15 | Freshness and availability | Partial: show supplied evidence; missing stock/timestamp remain unknown. |
| 16 | Coupon stacking | Partial: source coupon fields displayed. Eligibility engine planned. |
| 17 | Checkout mathematics | Implemented local shopper scenarios: delivery, eligible instant discounts and delayed cashback, with unknown delivery and eligibility gates. Automatic merchant eligibility remains planned. |
| 18 | Pincode-aware offers | Planned: explicit user location + merchant coverage required. |
| 19 | Evidence inspector | Implemented locally. |
| 20 | Multi-source consensus | Partial: supplied cluster count with caveat; independent-source validation planned. |
| 21 | Deal replay | Planned: immutable historical offer snapshots required. |
| 22 | Seller / fulfillment risk | Planned: supported seller and return-policy evidence required. |
| 23 | My Mine | Implemented device-local offer snapshots. |
| 24 | Watchlists | Partial: manual saved offers. Account sync and monitored refresh planned. |
| 25 | Target-price alerts | Existing endpoint connected; confirmation tightened. Delivery worker not verified. |
| 26 | Personalization | Planned: explicit preferences, controllable history and ranking. |
| 27 | Shopping-list optimization | Partial: snapshot total. Cross-store eligible bundle optimizer planned. |
| 28 | Savings ledger | Planned: purchases + defensible comparison baseline; never count MRP as realized savings. |
| 29 | Grounded shopping assistant | Partial: deterministic questions backed by offer evidence. Broader assistant planned. |
| 30 | Daily / weekly briefings | Partial: session recorded-low highlights. Scheduled delivery planned. |
| 31 | Shopper product requests | Planned: persist query requests and match future offers. |
| 32 | Telegram inline shopping | Planned suggestion; private bot workflow remains untouched. |
| 33 | Share cards | Partial: clipboard offer summary. Exportable image card planned. |
| 34 | Searchable product pages | Planned: stable product routes, metadata and evidence attribution. |
| 35 | Community submissions | Existing form retained; moderation integration requires review. |
| 36 | Contributor reputation | Planned: attributable validated submissions; no fabricated social proof. |
| 37 | Private triage improvements | Suggestion only; no DealFlow workflow changes. |
| 38 | Private unified inspector | Suggestion only; no DealFlow workflow changes. |
| 39 | Private broadcast simulator | Suggestion only; no DealFlow workflow changes. |
| 40 | Pipeline observability | Planned read-only diagnostics; access and production inspection needed. |

## Next milestones

1. Validate production search and history contracts, canonical identity and affiliate transformation. Replace unsupported claims with evidence; do not invent products, price history, stock or savings.
2. Finish exact cross-store product matching and eligibility-aware checkout comparison before broader recommendation features.
3. Add persistent product snapshots and verify alert worker delivery before automated watchlists, replay and scheduled briefings.
4. Refine homepage and results hierarchy against the owner's preferred deployed visual baseline; verify desktop/mobile and all preserved navigation/tool flows.
5. Build image search, seller evidence, account personalization and predictions only when required data/service contracts exist. Keep private admin proposals separate.

## Verification and limitations

- Frontend intelligence / checkout tests: seventeen passing.
- Backend identity/history tests: five passing; changed Python modules parse successfully.
- Production frontend build passes; large-bundle warning remains.
- Browser checks: saved shortlist, missing-history inspector, grounded answer, comparison, dedicated CPU search; mobile viewport has no page-wide horizontal overflow.
- External search returned an unavailable-service state during the browser test; merchant fallback works. A populated Google Shopping response is not verified end-to-end.
- SSH was blocked before authentication in the last connection attempts. No VM deployment or restart performed.
- Backend files live under an ignored local directory; include new identity helper alongside api.py in any future reviewed deployment.


## 3 October storefront refinement

- Navbar/footer now use a lightweight Tiranga Chakra medallion, with subtle hover depth and reduced-motion support. The generated 3D concept and editable vector are both preserved alongside previous assets.
- Removed the public-feed status badge and private-admin wording. Navigation switches to a compact menu below 1280 pixels; Saved Loot is accessible there. Main controls have larger touch targets.
- Removed placeholder social destinations, static audience/throughput numbers, backend implementation branding and unsupported universal price-history guarantees from the revised public pages. Verification guidance now explains the evidence and its limits.
- Spotlight image failures select another eligible supplied offer instead of displaying a broken image. MRP differences are labelled as such. Price evidence preserves paise rather than silently rounding.
- Collection/search URLs now receive a specific lookup explanation before a request is made; Amazon /gp/product links are accepted.
- Added an expandable checkout planner in the product inspector and three-product comparison. Starts from listed price, discounts require shopper confirmation, delivery is unknown until supplied, cashback stays separate from payment today, invalid inputs cannot create a total. This is manual scenario planning, not an automatic live coupon engine.
- Product matching never equates identical merchant IDs or titles across different stores. A checksum-valid source GTIN can establish a barcode group; condition, pack contents and seller still need confirmation.
- Figma account discovery failed twice at the connector transport. No Figma document was created; vector assets are ready for import.

- Lookup watch form previously saved only local storage while promising instant notifications. It now accurately labels device-only price goals and reports storage failure. Existing registered notification flow in the intelligence inspector remains available. Alternative-store search links are not represented as actual competing price quotes.


### Final checks for this refinement

- 17 frontend arithmetic, evidence and identity checks pass. TypeScript check passes and the production build passes; the existing large-bundle warning remains.
- Browser verified: confirmed discounts excluded until checked; delivery blank produces a partial total; ₹146.56 + ₹25 delivery − ₹20 discount gives ₹151.56 due now, with ₹10 later cashback separately shown.
- Browser verified: Myntra collection URL gives an explanatory error; lookup correctly labels saved device-only goals; Top Discounts opens its dedicated page; Saved Loot opens its mobile page.
- Navbar width equals its client width at 320 pixels (314 pixels after scrollbar), with no clipped header. Tablet compact menu verified at 768 pixels. Temporary viewport overrides were reset.
- Screenshots: `tests/artifacts/chakra-storefront-desktop.jpg`, `chakra-storefront-mobile.jpg`, `checkout-planner-desktop.jpg`.
- No files deleted in this refinement. Private DealFlow and backend files were not modified in this pass. No production deployment performed.

### Mobile refinement and tap crash — 2026-10-03

- Reproduced an empty root by clicking a card's Breakdown action. DealDetailModal called useMemo only after its closed-state return, causing React's "Rendered more hooks than during the previous render" error. Replaced that conditional hook with a pure calculation. Moved state hooks before the closed-state guards in the EMI and exchange dialogs too.
- Added root recovery and a scoped deal-dialog recovery boundary. Added keyboard focus containment/restoration, a sticky phone dialog header, and a single-column phone sheet. Saving updates the dialog icon and accessible pressed state immediately.
- Added a dedicated phone card presentation: larger product images, readable prices, explicit MRP references, 44px save/details/store actions, and an overflow menu retaining comparison, WhatsApp, Telegram and copy-link actions. Desktop cards retain their existing presentation.
- Redesigned five-item bottom navigation. Search opens from every page and includes an explicit Search all stores action; close is accessible and keyboard Enter on other controls no longer selects an unrelated result.
- Shortened the phone hero, made suggestions swipeable, compacted story/category rails, and placed Filters and Shopping desk side by side. The desk expands on phones; desktop keeps it visible. Search puts products ahead of summary statistics and retains source/error/related-accessory explanations. Alternative store links expand on phones.
- Corrected unsupported live/official-feed claims in deal details and historical-validation claims in the discounts page. Savings display their actual amount immediately instead of briefly showing zero during animation.
- Browser checked three consecutive product opens, close/reopen, save/un-save, comparison menu, discount navigation and search from the discount page. No new browser errors in the isolated verification tab. Phone/tablet/desktop widths 320, 375, 390, 430, 768 and 1280 had no horizontal page overflow. External store search returned an error during QA; its failure remains explicitly visible with direct store-search fallbacks.
- 17 existing intelligence/checkout tests and 4 hook regression checks passed. Production build passed with the existing large-JavaScript-bundle warning. Final screen captures are in tests/artifacts/mobile-*upgraded.png and desktop-mobile-pass.png.
- No originals or files deleted. Private DealFlow and backend files were not modified in this mobile pass. No production deployment performed; local preview runs on port 5174.

- Final phone scroll check confirmed the navbar sticks at the top. The application container now uses overflow-x: clip instead of hidden, which avoids creating an unintended scroll container that prevented sticky navigation.

### Premium visual pass — 2026-10-03

- Introduced a consistent editorial retail design: soft white surfaces, navy typography, blue actions, restrained borders and shadows, and the existing Tiranga Chakra identity.
- Rebuilt the hero presentation around a clearer search form and an actual featured directory offer. Existing text search, pasted-link lookup, popular queries, high-discount action, affiliate links and image-failure fallback remain connected.
- Replaced category emoji with consistent vector icons; refreshed active navigation, product cards, the shopping desk, trust panels and footer. Phone cards retain save, details, comparison, sharing and merchant links, with readable titles/prices and 44px primary controls.
- Browser verified: text search opens the dedicated results page; a CPU accessory remains explicitly distinguished from a processor; a Myntra catalog URL opens lookup with the product-link explanation; product details open and close; category selection updates its pressed state.
- Home and search layouts have no horizontal page overflow at 320, 375, 390, 430, 768 and 1280 pixels. Temporary viewport overrides reset. No browser errors were recorded in the verification tab.
- Production build and all 21 existing intelligence, checkout and modal-hook checks passed. The existing JavaScript bundle-size warning remains.
- Screenshots: tests/artifacts/premium-desktop.png, premium-mobile.png and premium-mobile-cards.png.
- No files deleted. Private DealFlow and backend files were not modified in this visual pass. Local preview remains on port 5174; no production deployment performed.

### Primary fixes and restrained premium polish — 2026-10-04

- Fixed the mobile filter/sort freeze: the portal now contains the animation rather than being discarded by it while the body remains locked. Filter drafts apply together. Shared dialog handling restores scrolling and focus, contains keyboard navigation, and closes only the uppermost dialog.
- Extended that handling to lookup, alerts, comparison, EMI, exchange, tools, photo zoom, legal, command search, stories, community submissions and cart revisit. Community submissions scroll within phone height; cart revisit does not interrupt another dialog or an active input.
- Separated offer comparison from specification comparison so both screens no longer open together. Preserved the return path and all comparison features. Photo zoom and Submit navigation are connected again.
- Preserved the premium visual design, Tiranga Chakra identity, proper Telegram icon, dark mode and all existing storefront features. Added liquid category selection, subtle press feedback, consistent sheet scrolling, safe-area spacing, readable phone controls and 16px input text to prevent unwanted mobile browser zoom.
- Planning tools now distinguish entered assumptions from live merchant or bank offers. EMI, exchange and tax scenarios start without invented discounts, credits or trade-in quotes; tax credits require explicit eligibility confirmation. Missing product specifications remain unknown.
- Public product lookup now reads scoped merchant product-page evidence. Conflicting structured or buy-box prices are rejected. History, MRP, stock and current price are separate fields. The frontend accepts a current-price verdict only with confirmed merchant evidence dated within 15 minutes; missing or stale evidence stays unconfirmed.
- Public external search runs independent providers concurrently and moves blocking store fetches out of the API event loop. Provider and conversion budgets return available merchant links instead of waiting indefinitely. Short caches include the requested limit; retrieval time is not a price-check timestamp.
- Google Shopping parses scoped product cards, preserves Flipkart variant query parameters, and does not replace listing prices with history-provider prices. Web-search snippets supply discovery links without invented prices. Public database search excludes pending/unapproved deals. Fixed value scores and cross-product historical-low verdicts are removed.
- Future/invalid historical points are excluded. Historical savings comparisons require recent merchant price evidence. Privacy and pricing explanations describe the actual optional submissions and source limitations.
- Shopping calculators load on first use and retain their state afterward. Production build passes: initial JavaScript is 713.64 kB (200.86 kB gzip); the tools chunk is separate. A large initial-chunk warning remains.
- Stopped further browser tours and test suites at the owner's request to prioritize implementation. Performed only the final production build and Python source compilation for the latest changes. Earlier browser and regression checks apply to the state at the time they ran, not every latest edit.
- Local development preview runs at http://127.0.0.1:5180/. Backend changes are local and not deployed: the VM rejected the supplied SSH access. Accurate live lookup still requires deploying the public backend changes with working access. Do not interpret local implementation as a successful production rollout.
- No files deleted by this work. Private DealFlow ingestion, admin workflows, tg-setup and private history/scraper modules remain untouched. Roadmap features requiring additional merchant/provider data or a verified notification worker remain pending; no fabricated substitutes were added.

### Recent redesign reverted — 2026-10-04

- Restored the pre-redesign hero, storefront styles, cards, footer, product details, discovery behavior and proxy configuration at the owner's request.
- Preserved the earlier device-native Share action and copy fallback in the card menu.
- Reversed only the latest local public history timeout and history_source metadata changes; earlier backend work remains intact.
- Saved the replaced sources in a local rollback snapshot. Generated artwork and new source files remain on disk, inactive; no files deleted.
- This rollback is local. No Vercel or VM deployment performed.

### Storefront bug and UI repair — 4 October 2026

- Preserved the restored visual direction. Kept existing hero artwork inactive and all original files on disk.
- Stopped clearing cards during filter refresh; discovery collections and featured offers use an unfiltered feed snapshot. Superseded request errors cannot overwrite newer requests. Loading and retained-feed failures now have explicit feedback.
- Cancelled interrupted category indicator motion; removed ineffective card presence wrapping. Added bounded card entrance and Load More feedback with reduced-motion support.
- Enabled real horizontal list cards on Discover, Discounts, Worth and Saved pages. Corrected search pagination from 40 to 80 per fetched search page, immediate local price sorting and broader category matching.
- Filtered unfinished template titles from feed/search/stories/ticker without fabricating replacements. Quick-delivery stories now derive from quick-commerce merchants, not arbitrary beauty offers.
- Persisted saved product snapshots alongside existing bookmark IDs; earlier IDs are retained. Saved search no longer hides its controls and falsely reports an empty vault.
- Removed guessing/copying coupon codes from capitalized product text. Coupon activation instructions are separate from code-shaped fields; coupon_discount no longer implies a percentage.
- Connected recorded product history to the existing detail dialog and added shopper-only Vercel search/history rewrites. Missing evidence and timeouts remain explicit; source prices are not relabelled as live checkout quotes.
- Improved mobile/light/dark card metadata contrast, price wrapping, sheet header wrapping, touch controls and history chart styling. Fixed an undefined lookup variable that blocked compilation while preserving other ongoing edits.
- Mobile filter drawer opened, applied Electronics + price sorting, dismissed and restored scrolling; discovery collection labels remained present. Saved mobile preview: tests/artifacts/ui-fixes-mobile.png.
- TypeScript check passed; production build passed in a separate output folder after the usual output folder reported a Windows file lock. No automated test suites run. Local preview is port 5180; no production deployment or private DealFlow changes performed by this repair.
