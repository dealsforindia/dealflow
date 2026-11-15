# DesiDime / Buyhatke price-history investigation

## Result

A usable public Buyhatke history path was verified for an Amazon product. A strict local reader is implemented and tested, but is not wired into or deployed with the production API. DesiDime is currently verified as a community offer source, not as a continuous product-price-history service. No paid API access, account tokens, forecasts or demonstration prices were used as price observations.

## REA

Read the requested repository and its browser-analysis guide: https://github.com/morluto/rea and https://rea.tools/guides/browser/ . REA is an inspection toolkit; it does not supply shopping history. Its browser workflow observes scripts/network through a debugging connection. Its setup also registers an MCP server and requires an agent restart.

Attempted CLI discovery through the npm registry. Installation failed with ECONNRESET. A read-only repository clone also failed with a DNS/thread error. Therefore this report does not claim a completed REA CLI analysis. Existing browser access to Buyhatke aborted and DesiDime navigation timed out. Public HTML and script evidence was subsequently read through bounded, read-only requests from the VM, without executing downloaded JavaScript or changing agent/browser permissions.

## Buyhatke: observed consumer path

1. The official homepage documents prefixing a merchant URL with buyhatke.com.
2. Requesting `https://www.buyhatke.com/https://www.amazon.in/dp/B0DSQ2RF12` returned HTTP 200 and redirected to a product slug ending in `63-77204421`.
3. The page contains SvelteKit hydration data. Observed node IDs are `[0,3,31]`; the product module was `/_app/immutable/nodes/31.DVi_5a24.js`. Bundle hashes are observations from this capture, not permanent identifiers for an integration.
4. Primary `productData` identifies Amazon, ASIN B0DSQ2RF12, internal product ID 77204421, and a merchant link to the same ASIN. Separate comparison and lookalike arrays also exist. Finding an ASIN anywhere in the page is insufficient: it could belong to a comparison candidate.
5. `predictedData.history` contains literal records `{from, to, price}`. Despite the containing object's name, the sampled records are past price intervals; its other scores/predictions must not be treated as recorded prices.
6. The live sample yielded 216 intervals from 2025-07-16 through 2026-10-12. Reported range was INR151.69–275; the latest interval reported INR180. These are provider-reported historical values, not a new verification of Amazon checkout price.
7. Source datetimes have no explicit UTC offset. The reader retains raw datetimes and calendar dates and labels timezone unspecified. It does not silently stamp the request time onto old prices or manufacture daily observations inside intervals.
8. The comparison payload has its own `last_updated` fields. The sampled Amazon comparison row reported INR175 with a February 2026 timestamp, while the primary history ended at INR180 in October. A fetched page is not proof every embedded listing is current.

Evidence: `provider_history_deep_probe.evidence.jsonl`, `buyhatke_graph_trace.evidence.jsonl`, and `buyhatke_history_sample.evidence.jsonl` under this directory. Product source:
https://www.buyhatke.com/amazon-dettol-dishwash-liquid-and-kitchen-gel-cuts-tough-grease-remove-germs-lemon-fragrance-1500ml-refill-pack-price-in-india-63-77204421

## Buyhatke: advertised business API is a different path

The public pricing-intelligence bundle advertises historical queries using SKU, date range, interval and a Bearer API key. Its example payload has `history: [{date,price,discount}]`, unlike the consumer page's interval records. The displayed route label uses `/api/v1/history`, while its code example uses `/v1/history`.

One read-only request to the exact example URL `https://api.buyhatke.com/v1/history/SAMSUNG-S24-256` returned HTTP 404. No credentials were supplied and no endpoint variants were guessed. This does not prove the authenticated API is unavailable; it means the marketing example was not verified as a usable anonymous API. ASIN/Flipkart PID to business SKU mapping also remains unverified.

Source: https://pricing-intelligence.buyhatke.com/ and its observed public `assets/index-DK3E6ZeN.js` bundle.

## DesiDime: observed scope and risks

The `/new` listing and its application/all_deals bundles returned HTTP 200 on the VM. Listing cards expose community offers, store labels, sale/reference prices, relative posting times, discussion links and `visit.desidime.com` outbound links. A deal's temperature is community activity, not a merchant rating or proof of price history. No history-series payload or history-fetch route was found in the bounded listing/bundle sample; this is not a claim about every DesiDime page.

An individual product-post inspection was attempted but two SSH banner failures prevented that probe from completing. The report therefore cannot assert that all detail-page schemas were examined.

Your current `desidime_bot.py:157` defaults `ts` and `processed_ts` to ingestion time. `api.py` history matching around lines 6460–6467 consumes `processed_ts`/`ts` from matching deals. This supplies a directory sighting timestamp, not automatically the original DesiDime publication time or a direct merchant scrape time. Preserve those meanings separately.

For reliable DesiDime-derived evidence:

- Store DesiDime deal ID, source URL, source publication time, ingestion time and merchant-check time separately.
- Resolve outbound links to exact ASIN or Flipkart PID. Split haul posts into individual products; never give a generic multi-product post one combined history.
- Keep list price, coupon-adjusted price, card eligibility, quantity and variant separate. A conditional community offer must not replace a plain merchant price.
- Treat imported post prices as `community_offer_report`; use `merchant_product_page` only after matching and checking the merchant page.
- Keep expired posts as past sightings rather than claiming that their prices remain buyable.

Source: https://www.desidime.com/new and the inspected local ingestion/history code.

## Implemented reader and validation

`dealbot_backend/dealbot/buyhatke_history.py` reads public product pages, parses only literal data, checks the primary product's ASIN and merchant link, rejects ambiguous data/provider domains, ignores future/invalid intervals, and returns source/identity/timezone metadata. It does not execute third-party JavaScript or use arbitrary numbers found elsewhere on the page.

Three regression tests pass: literal parsing and executable-value rejection; matching identity/date coverage; future-data and untrusted-domain rejection. A live VM execution also returned the 216 matching intervals. Only Amazon matching is verified and implemented; Flipkart and Myntra support must be tested before it is advertised.

## Integration design

Use separate provider series for Buyhatke, Genie, direct merchant observations and DesiDime sightings. Do not flatten them into a single unlabelled "verified" curve. The chart should show provider, actual coverage, timestamp precision, and listing versus conditional effective price. Calendar-date intervals need a date-aware rendering path; guessing UTC instants would undo the reader's accuracy safeguards.

Before activating the reader globally, test more exact products/variants, handle schema changes and unavailable responses, add bounded cache/rate limits, and confirm how source calendar dates should be rendered. The implemented reader is a working research component, not a claim that the production storefront now consumes Buyhatke.
