# Storefront finish review — 2026-11-03

Read-only review requested by the owner. Preserve expressive pixels, mascot, rich surfaces, color variety and badges. This review concerns how completely those choices are carried through the product. No styling, product records, messages or submissions were changed.

## Where the finish drops

### 1. Two shopping systems appear inside one storefront
Opening More → Compare deals desk reveals “Your shopping desk” with four cards above the regular directory. The same products then recur in the main feed with a different card design, save controls and evidence presentation. A fresh visitor has to learn two versions of the same task. The desk reports Saved 0 while the main Saved page and navigation report 1. Source confirms separate persistence via `IntelligenceWorkspace.tsx:22` (`readWatchlist`) and `utils/savedDeals.ts`.

Enhancement: give the existing shopping journey one consistent saved state and product identity, and make comparison feel like a continuation of the chosen cards. Do not remove/rebuild the desk without an explicit scope decision. Current guardrails record the user's earlier rejection of added workspaces.

### 2. Profile combines a finished introduction with an unfinished control panel
The green Guest Shopper surface has depth and hierarchy. Below it, the tracker and preferences switch to simpler navy blocks and long technical labels: “Arm Price Drop Scraper & Email Radar”, “Tracked Scrapers”. A signed-out guest also sees “Email Live” alongside zero monitored products, which makes the state feel poorly resolved.

Enhancement: retain the rich introduction and bring its edge lighting, control depth and typography into the actual forms. Use task-based labels such as “Set price alert”, clearly distinguish guest/inactive/active states, and make the account preferences feel equally crafted. No claim about backend monitoring reliability was tested here.

Evidence: `profile-dark.png`, `profile-mobile-light.png`; `ProfilePage.tsx:638,804,820`.

### 3. Saved looks like a utility screen beside the curated Discounts page
The Saved heading, amber badge, muted pink Clear All control and plain toolbar have less deliberate composition than Top Discounts. One saved product leaves a large unused area; that is a composition opportunity, not a reason to add fake products or new panels. The page also describes compare/monitor tasks without giving those actions the same prominence as browsing.

Concrete state defect: filtering the one saved item with a nonmatching query changes the summary to “0 deals saved”, while Clear All and the mobile badge still show 1. The zero represents search matches, not the saved total (`SavedLootPage.tsx:108`).

Enhancement: distinguish “0 matches · 1 saved”, give destructive and primary controls intentional materials, and compose sparse saved collections gracefully. Preserve the existing empty-state Clear search action, which works.

### 4. Tools hub is a collection of individual panels rather than a fully composed tool surface
The desktop header truncates its explanatory subtitle. At 393px it wraps the title and badge while cutting off the subtitle. Two horizontal navigation rows compete for space. Selecting EMI can leave its selected tool offscreen in the strip. In the EMI calculator, the six tenure choices cram monthly amounts into narrow cells; their labels collide at phone width.

The footer uses “Active Engine”, technical category tags and “100% Client-Side”; those details do not help most shoppers complete their calculation. Tool titles, headers and result areas have inconsistent density. This is an opportunity to improve hierarchy and navigation while keeping rich controls and meaningful color.

Enhancement: ensure the selected tool is visible, make the subtitle readable, let dense tenure options wrap, use shopper-facing labels, and give input/result sections distinct but related materials.

Evidence: `tools-dark.png`, `tools-mobile-dark.png`; `tools/ToolsHubModal.tsx:246,377,386`. Financial/tax formulas and rates were not audited.

### 5. Product detail has a large underused image column
Desktop details keep the image and three small trust rows at the top of a tall left column while the right column contains most content. The result is a large dead vertical region as chart/reviews extend downward. The image disappears from the reading context rather than helping connect the evidence to the exact product. Header, comparison and urgency controls also differ in material treatment.

Enhancement: tune the existing two-column proportions and sticky image behavior; make the product image feel intentionally displayed, and coordinate action surfaces with the existing rich controls. Keep actual history/reviews and their missing-data states. Previous card transition work does not resolve this composition.

### 6. About and verification pages have weaker visual storytelling
About repeats four statistic-like tiles, including awkwardly wrapping “When available” and “Multi-store”; they describe capabilities rather than quantities. Verification is five similar long blocks. Both are readable but feel assembled compared with the curated homepage/Discounts treatment.

Enhancement: use a more deliberate reading composition, expressive product-specific icons and a connected verification sequence. Keep the factual explanations and existing effects; no invented metrics or claims are needed.

### 7. Contact and Submit forms have basic form treatment
Both pages use similar large navy containers, uppercase field labels and broad flat green submit buttons. They work as recognizable forms, but inputs, help, optional fields and the primary action receive less craft than the navbar. The submission email field mentions “reward credit” without explaining it nearby.

Enhancement: carry existing rim lighting and press feedback into these controls, improve field grouping/helper text and make the review/confirmation states intentional. Backend success states were not exercised because no live messages or deals were submitted.

### 8. Lookup starts as a sparse floating input
Analyzer opens a short input row centered in a mostly empty overlay. Watches has a more complete empty state with explanation and an Add New Link action. This difference makes Analyzer feel like a shell awaiting its content.

Enhancement: add a concise explanation of what to paste and what result to expect, with a purposeful empty composition. Use existing branding/art direction and avoid fabricated product examples.

### 9. Navigation and naming drift adds to the unfinished impression
Saved/Saved Loot/Bookmarked Deals/Saved products, Price lookup/Analyzer/Radar and Tools/Utilities/Loot Lab/Engines refer to related tasks with shifting names. Some store options expose “Fktr” separately from “Flipkart”. Small category chips and secondary actions use different flat/material treatments across surfaces.

Enhancement: use consistent task names and normalized merchant labels while preserving expressive display headings and semantic colors. This needs a component-level finish pass, not blanket recoloring.

### 10. Comparison feedback is remote from the action
Selecting two desk cards adds a comparison section after the entire card grid. On the inspected three-column layout the fourth card occupies another row, putting the comparison below a substantial scroll. The buttons change state but the comparison result is not immediately apparent.

Enhancement: bring confirmation and access to the selected comparison close to the action, with motion connecting selection to that destination. Preserve the separate-product/variant explanation.

## What should stay

- Expressive pixel effects, mascot identity, rich materials, color and badges are owner preferences, not defects to erase.
- Top Discounts has a stronger authored composition and is a useful internal finish reference.
- Main product cards have clear product/price/action hierarchy.
- Footer appearance popover opened upward and stayed within the inspected 393px viewport.
- Privacy modal was readable at phone size; it does not need decorative complexity at the expense of reading.
- Saved no-match state supplies a working Clear search recovery.

## Suggested order

1. Align existing saved/comparison state and finish Profile + Saved.
2. Finish tools navigation, phone tenure controls, and result hierarchy.
3. Improve detail/lookup composition and feedback.
4. Carry that craft into About, verification, Contact and Submit; finish shared naming and controls.

## Coverage and limits

Observed: homepage/feed and detail from the earlier interaction pass; Top Discounts; populated Saved and filtered no-match; signed-out Profile; About; verification; Contact; Submit; tools hub with GST/EMI defaults; comparison with two temporary selections; lookup Analyzer and empty Watches; footer appearance; Privacy. Desktop dark was the main pass; selected secondary surfaces were also inspected in 393px light/dark. Previous detail work covered both themes and desktop/phone.

Not an exhaustive acceptance test: all 12 tools, all search/network failure states, signed-in profile, Terms, available watch records, actual submissions, every viewport/theme combination, physical touch and measured motion/performance remain unverified. Temporary comparison selections and saved search filter were cleared. Existing saved product was preserved. Viewport and original system theme restored. No application code changed in this review.
