# IndiaDealHunts: premium shopping advantages

These are proposed capabilities, not live features or promised provider coverage. Preserve the storefront's current tools and keep the private DealFlow workflow unchanged.

## Product direction

Make search the main entry point. Results should show products immediately, with quiet filters, clear variants, evidence coverage and a strong path to the store. The homepage should lead with useful discoveries; advanced controls belong in product inspection and the shortlist. Premium should mean useful decisions and dependable data, rather than more badges or animations.

## Next delivery sequence

1. Validate the production search and lookup contracts without changing the private workflow. Carry canonical product URL, store-specific identifier, supplied GTIN, price, currency, condition, variant attributes, stock and check timestamp. Require positive matching evidence for cross-store comparisons. The frontend now supports supplied valid GTINs; missing barcodes are not inferred.
2. Persist dated product/variant offer snapshots. Separate advertised price, instant discounts, conditional bank offers, later cashback and delivery. The delivered manual checkout planner provides transparent scenario mathematics while automatic eligibility is still absent.
3. Verify price-target registration and worker delivery, then build dependable monitored watchlists and requested-product discovery. Show last check, delivery status and meaningful failures.
4. Add the features below in evidence-supported stages. Validate each capability with real provider responses before promoting it in the UI.

## Additional premium ideas

| Feature | Shopper advantage | Data needed / practical first version |
|---|---|---|
| Unit-price lens | Compare ₹ per kg, litre, capsule or item across packs | Extract pack quantities with confidence; allow correction; never compare incompatible units |
| PC compatibility bench | Build a CPU, motherboard, RAM and PSU shortlist that actually fits | Structured sockets, chipsets, memory generation, dimensions and power estimates; distinguish unknown compatibility |
| Offer eligibility wallet | See which bank offers apply and which monthly caps remain | Explicit card preferences, current offer terms and user-entered spending; no card number required |
| Delivery deadline shopping | Find the cheapest suitable item that can arrive before a date | User-provided pincode and supported merchant delivery estimates with timestamps |
| Return-window price watch | Discover a lower price while a purchased item is still returnable | User-entered paid price and return deadline; store policy evidence; never assume refund eligibility |
| Ownership-cost comparison | Compare the cost of printers, appliances and other consumable-heavy products | Verified refill, electricity and maintenance assumptions shown as editable scenarios |
| Evidence strength indicator | Judge whether a spectacular discount has enough history behind it | Observation coverage, age, actual variant identity and source freshness; show components rather than an unexplained score |
| Variant price map | Discover if another size, colour or capacity is a better fit | Exact parent/variant catalog relationships; explicit differences beside price |
| Cart split optimizer | Compare one-store checkout with buying a list across several stores | Exact product matching, quantities, delivery thresholds and confirmed coupon stacking; preserve unknown costs |
| Request a find | Save an unsuccessful search and discover matching offers later | Persistent request records, variant constraints and a tested monitoring worker |
| Deal change journal | Understand what changed since saving an offer | Dated immutable snapshots of price, seller, coupon, availability and expiry; compare actual observations |
| Quiet personal briefing | Return for a small set of relevant discoveries rather than noisy alerts | Explicit preferences, opt-in delivery, deduplicated meaningful changes and verified alert infrastructure |

## Visual contract

Retain the strong blue accents, generous spacing, rounded search and product cards. Tiranga belongs in the compact brand mark; avoid colouring every surface orange and green. Preserve every working shopper tool, group secondary actions into the compact menu, and remove public admin status or technical jargon. Keep price/variant details legible on mobile; don't bury results below a second marketing hero. Use motion sparingly and respect reduced-motion preferences.

## Current limits

This pass is local and does not deploy to Vercel or the VM. Exact cross-store matching depends on the backend supplying reliable identifiers; valid GTIN handling alone does not build a complete product catalog. Existing large application bundle still needs a separate, measured loading-performance pass.
