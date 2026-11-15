# Runtime check — 11 October 2026

Read-only checks of the live IndiaDealHunts storefront and the VM backend. No deals, alerts, services, source files or deployments were changed. New JSON evidence and this report were saved under scratch.

## Confirmed working in the tested sample

- VM `/health` returned status ok, Redis true, MongoDB true and four WebSocket clients. All six PM2 services were online.
- Storefront All Deals/Electronics selection and the desktop sort menu responded without a white screen. Price: Low to High was selected, and the all-deals list appeared in ascending price order. This does not prove mobile animation behavior.
- CPU search opened a dedicated search view. External candidates eventually appeared: 12 Amazon candidates in the browser sample, with no recorded history. A later direct external-search response returned Flipkart results, proving that provider availability differs between requests.
- Same-origin public feed endpoints returned HTTP success: first page 628 ms, second page 250 ms, Electronics 273 ms, and external CPU search 1,873 ms. These are single observations, not performance benchmarks.
- Two five-item feed pages had no ID overlap and reported the same total of 106.
- Product b2450f678e37 history returned two observations of INR 3,798, approximately 12 minutes apart. Real observations exist for this sample; it does not establish a 90-day history.

## Confirmed problems or coverage gaps

1. API PM2 restart count increased from 1,147 to 1,150 during inspection; PID and uptime changed. PM2 logged retries to terminate a process followed by SIGKILL and restart. The configured memory restart limit is 150 MiB, but the restart cause was not established by the available log excerpt.
2. Electronics returned only one offer. In the first five public offers, categories were Amazon/Amazon/Amazon/Flipkart/Flipkart, including clothing and luggage. Merchant names in the category field prevent dependable category filtering. See runtime-_api_v1_deals_public_limit_5_skip_0.json and runtime-_api_v1_deals_public_limit_5_category_electronics.json.
3. Visible storefront offer `87% Off - Mohprit Outdoor Cooking Pulka Jali At Rs.66` displayed INR 136 and 73% below MRP. The title, price and percentage disagree. Merchant checkout price was not independently verified.
4. Visible VIRAKTI Analog Watch card used `Virakti Analog Watch` as its store label and `View at Virakti Analog Watch` action. Product and merchant identity are mixed.
5. CPU results appeared in both the shopping workspace and another product/comparison section. Initially the page showed no offers before asynchronous candidates arrived. The Radar modal displayed broad claims including `Live server-side price comparison` and `Merchant Checkout Verified`, although the visible candidates had unknown stock/history. Checkout verification was not established.
6. Reviews are partial. Browser cards showed actual ratings for some products and blocked/unsupported messages for others. Requesting b2450f678e37 reviews by deal_id alone returned HTTP 400. Supplying the canonical Amazon URL returned unavailable: the merchant returned a different product, so reviews were correctly withheld. See runtime-reviews-product.json. Do not display invented stars to cover this gap.
7. All five first-page feed records returned is_lowest_price=true. Prior source review explains a fallback that uses MRP rather than real history. This flag cannot be treated as a proven historical low for all products. See the separate Python review for exact source references.

## Outstanding source issues

The earlier Python review documents synthetic-history fallbacks, scanner price events missing from WebSocket forwarding, alert delivery issues and worker event-loop starvation. This check did not patch or establish resolution of those defects. See python-backend-review-2026-10-11.md.

## Limits

Browser automation stopped responding after the Radar modal was opened. Mobile viewport checks, modal closure, load-more transitions and remaining pages could not be completed. No natural new-deal arrival was captured to prove end-to-end live insertion, and no production publication or alert delivery was triggered. SSH intermittently failed during banner exchange; one local health URL lookup failed DNS while subsequent same-origin API calls succeeded. These limitations are separate from verified application defects.

The system is partially functional; it has not passed a complete end-to-end check.
