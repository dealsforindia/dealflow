# IndiaDealHunts initial product review — 27 October 2026

## Verdict

Substantial working prototype with a coherent visual direction. Not ready to describe as complete or reliable shopping advice. Human satisfaction has not been measured. Review covers the current local source served by Vite, not a separately verified production deployment.

## Evidence collected

- Started the existing Vite app at http://127.0.0.1:5173.
- Reviewed desktop dark-mode homepage and product dialog, plus mobile at 393 × 852.
- Directory loaded 40 offers. Product details opened and closed.
- Desktop Saved navigation displayed an empty-state page.
- Mobile save control changed to Unsave and count increased to 1. Clicking mobile Saved did not transition away from the home feed in repeated observations; unresolved functional issue.
- Mobile Filter & Sort dialog opened and closed with labelled store, category, and sort selects. Applying filters was not verified.
- Searching earbuds returned four directory results and entered a separate shopping workspace. External search completion was not established.
- Mobile DOM measurement: innerWidth 393, document scrollWidth 387; no whole-page horizontal overflow in the sampled home state.
- TypeScript check completed without diagnostic errors.
- Existing Node tests: 40 total, 34 passed, 6 failed.
- Browser warning/error log sample was empty. This is not an exhaustive error or performance audit.

## Highest-priority findings

### 1. Unsupported verification fallback

src/components/CardReviewEvidence.tsx uses Verified Deal when no rating or review excerpts exist and a request is not queued/loading. Missing or failed evidence can therefore produce a positive verification label. Observed on mobile cards. Replace with evidence-specific neutral states; reserve verification claims for established evidence.

### 2. Price/title contradiction

Observed Myntra offer titled Women Night Suits ... Under ₹399 displaying ₹14,016. The original merchant price was not checked; the contradiction itself is visible. Treat collection/starting prices separately from specific product prices and quarantine contradictory records for review.

### 3. Checkout calculations assume unknown facts

src/utils/checkout.ts treats null delivery as zero and does not use eligibilityConfirmed. Existing tests reproduce both behaviours. Example: ₹1,000 price with ₹100 discount, ₹200 cashback, ₹50 delivery, eligibility false still reports ₹950 payable instead of excluding the unconfirmed discounts. src/components/CheckoutPlanner.tsx always passes eligibilityConfirmed: true and labels calculated values Pay at checkout. Fix computation and presentation together.

### 4. Price freshness contract is violated

src/utils/priceEvidence.ts normalizeLookup returns price, MRP, and discount even when evidence is unconfirmed. Missing timestamps can be replaced with current time when price_verified is true. Two existing tests fail around unconfirmed/stale price normalization. Preserve source-reported observations separately from dated confirmed prices.

### 5. Mobile Saved navigation

Save state itself updated, but mobile Saved navigation left the discovery feed visible in repeated checks. Desktop empty-state navigation worked. Investigate event/state/render interactions and recheck with a saved item. Do not mark the complete saved workflow as passed.

### 6. Urgency and price-drop language needs evidence review

Sample product dialog showed Verified Amazon India, 71% price drop, a 38-minute estimated half-life, and stock expectancy under five minutes. The displayed 71% is based on MRP, which does not establish a historical drop. Survival figures came from a backend endpoint; model validity and calibration were not examined. Review whether these claims are supportable and understandable before presenting them as shopping guidance.

## Visual assessment (reviewer judgement)

Strengths: coherent dark palette, clear search entry, consistent cards, prominent prices, responsive two-column mobile grid, familiar bottom navigation.

Improvements: mobile hero artwork overlaps the supporting text; small supporting text and truncated titles make product identification harder; inconsistent Saved / Loot Vault / My Mine naming increases cognitive load; product dialog has competing cart, merchant, scan, and copy actions. Prefer a clear primary next step and consistent terminology. Contrast, keyboard operation, touch-target dimensions, light mode, and screen-reader behaviour require dedicated checks before accessibility claims.

## Test failures requiring classification

- checkout.test.mjs: two substantive calculation failures described above.
- price-evidence.test.mjs: two substantive normalization failures described above.
- modal-hooks.test.mjs: missing CardEmiSimulatorModal.tsx; stale test reference, not proof of a runtime hook defect.
- public-storefront.test.mjs: expected vercel.app origin differs from current indiadealhunts.me origin; confirm intended canonical domain before classifying as a broken redirect.

## Recommended sequence

1. Correct evidence labels, contradictory prices, freshness handling, and checkout assumptions.
2. Resolve mobile Saved and reconcile outdated tests.
3. Improve mobile text/artwork separation and simplify terminology.
4. Ask 3–5 intended users to find a product within a budget, inspect its evidence, save it, retrieve it, and locate the merchant link without coaching. Record completion, confusion, and trust feedback. A small study finds issues; it does not establish broad market satisfaction.

No application code was changed during this assessment. No purchases, account creation, or production deployment were performed. One bookmark was created in the temporary local browser session while checking save behaviour.
