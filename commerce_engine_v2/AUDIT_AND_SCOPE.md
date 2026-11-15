# Engineering changes and remaining scope

The implementation was written against `Pasted text(1).txt` (2,189 lines) and
`Pasted markdown(1).md` (1,017 lines). The uploaded originals are preserved.

| Original behavior/problem | V2 behavior |
| --- | --- |
| DNS failure could permit common-TLD hosts | Actual connector DNS fails closed and checks every returned IP |
| Automatic redirect following in fallback fetch | Manual redirect loop; destination validated before each connection |
| Merchant detection via substring / ASIN-like text anywhere | Host-bound merchant profiles and merchant-specific URL identity |
| Stock initialized to true | Explicit in-stock/out-of-stock/unknown model |
| Success based on title + sale price | Separate supported price, verified live price, and publication decision |
| First page-wide rupee amount could win | Product-specific evidence only; no global price regex |
| ₹2,000 could be divided by 100 by magnitude | Minor units must be declared by schema, key, or configured adapter |
| First warehouse/variant selected | Exact selection required; otherwise diagnostic rejection |
| Listing prices enriched as if current observations | Mandatory merchant verification before history or affiliate processing |
| Google/Bing badges could create guessed merchant searches | Real product destination anchors only |
| Float currency arithmetic | Decimal arithmetic and exact string serialization |
| Repeated store normalization | Shared extraction, normalization, category handlers, and declarative adapters |
| Coupons mixed into regular price | Conditional coupon record, preserved terms, separate conditional estimate |
| Unstructured failures | Named issue codes, counters, structured result fields |
| Single flat product identity | Canonical merchant offer plus variant, critical attributes, region, seller, currency |
| Claims of guaranteed checkout truth | Merchant observations with timestamps and explicit scope |

## Implemented beyond the original code

Nested JSON-LD graph references; named embedded JSON assignments without JavaScript
evaluation; bounded traversal and parsing; product/offer ambiguity rejection;
CAPTCHA/non-product detection; hidden/recommendation subtree filtering; price/title/
stock/currency conflict checks; expired/conditional offer rejection; conservative
query constraints; ISBN/GTIN checksums; unit pricing; connection pooling; bounded
HTTP retries; circuit breakers; decompression limits; discovery-only cache; exact
local history; anomaly quarantine; optional affiliates; async legacy wrappers;
CLI; setup instructions; regression tests; deterministic sample fixtures.

## Deliberate limits

The previous discussion described a larger long-term platform. This package does
not claim to implement every operational component from that roadmap. Production
browser rendering, merchant APIs/affiliate feeds, location selection, credentials,
Redis/distributed caches, scheduled synthetic checks, health dashboards, calibrated
confidence, semantic search/ML matching, automatic cross-store family merging,
seller reputation, historical MRP inflation detection, exchange/EMI eligibility,
and checkout-total validation need real integrations or collected data.

Selector seeds are versioned, but no live merchant acceptance campaign was run.
Fixture tests exercise behavior and failure modes, not live scrape-success rates.

## Package map

- `models.py`: typed results, context, evidence, issues, conditional coupons.
- `urls.py`: URL policy, wrapper extraction, canonical identity.
- `network.py`: guarded resolver, connection reuse, redirects, retries, limits.
- `merchants.py`: versioned merchant selector profiles.
- `structured.py`: DOM helpers, bounded structured-data parsing and selection.
- `parser.py`: extraction candidates, conflict resolution, verification policy.
- `normalization.py`: Decimal money, currency, text, identifiers, discounts.
- `categories.py`: category attributes, unit pricing, conservative variant checks.
- `query.py`: explicit product and budget constraints.
- `discovery.py`: Google/Bing/direct-store providers plus a static provider.
- `cache.py`: bounded TTL discovery cache.
- `history.py`: verified SQLite observations and anomaly checks.
- `engine.py`: discovery → verification → matching → history → affiliate → ranking.
- `store_scraper.py`, `google_shopping.py`: migration entry points.
- `cli.py`: live lookup, search, offline parse.
- `tests/`: fixture, regression, simulated network, and pipeline checks.
