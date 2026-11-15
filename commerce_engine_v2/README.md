# Commerce Engine V2

A runnable Python replacement for the supplied merchant scraper and shopping
discovery modules. It separates discovery, merchant evidence, category attributes,
publication policy, price observations, and affiliate conversion.

The code is a tested implementation baseline. The included tests use synthetic
HTML and simulated network responses. Current live merchant markup, production
traffic, Google/Bing availability, and postcode selection have **not** been tested.

## Quick start

Requires Python 3.11 or newer. Extract this archive, then open a terminal in
`commerce_engine_v2`.

```bash
python -m pip install -e .
python -m unittest discover -s tests -v
python -m commerce_engine parse tests/fixtures/amazon_normal.html --url https://www.amazon.in/dp/B012345678
```

The last command works without contacting a merchant. It extracts the fixture's
fields and intentionally reports `is_live=false`, `price_verified=false`, and
`success=false`.

To inspect a real product, replace the URL with your product URL:

```bash
python -m commerce_engine lookup "https://www.amazon.in/dp/YOUR_ASIN"
python -m commerce_engine --history-db ./data/prices.sqlite search "iphone 16 128GB black under INR 60000" --limit 8
```

Arguments such as `--history-db`, `--postal-code`, and `--country` go **before**
the subcommand. `--limit` belongs after `search`.

```bash
python -m commerce_engine --postal-code 700001 --warehouse-id STORE_ID lookup "YOUR_QUICK_COMMERCE_PRODUCT_URL"
```

A postcode argument records your requested context. It does not remotely select
a delivery location. Quick-commerce verification requires the returned merchant
HTML to confirm the same postcode and, when specified, warehouse.

## Reuse the engine in your application

Keep one engine per application event loop and close it during shutdown. This
reuses HTTP connections, discovery cache, rate limits, and circuit state.

```python
import asyncio
from commerce_engine import CommerceEngine, RegionContext
from commerce_engine.history import HistoryStore

async def main():
    async with CommerceEngine(history=HistoryStore("./data/prices.sqlite")) as engine:
        result = await engine.search("iphone 16 128GB black", limit=8)
        for product in result["results"]:
            if product["success"]:
                print(product["title"], product["sale_price"], product["currency"])
        print(engine.health())

asyncio.run(main())
```

Direct URLs use `await engine.lookup(url)`, which returns a `ProductSnapshot`.
Use `snapshot.to_dict()` or `snapshot.legacy_dict()` to obtain JSON-ready data.
`examples/bulk_lookup.py` demonstrates bounded lookups using one reusable engine.

The legacy async imports remain available:

```python
from store_scraper import scrape_product_live, resolve_canonical_url
from google_shopping import search_google_shopping

product = await scrape_product_live(url, engine=engine)
search = await search_google_shopping("running shoes UK 8", engine=engine)
```

## Verification semantics

| Field | Meaning |
| --- | --- |
| `discovered_price` | Unconfirmed listing price; kept separately from merchant price |
| `sale_price` | Extracted product price; inspect verification flags before using it |
| `price_supported` | Merchant extraction passes source, identity, conflict, and context checks |
| `is_live` | HTML arrived through the engine's current fetch operation |
| `price_verified` | Live observation with supported merchant price evidence |
| `in_stock` | `true`, `false`, or `null`; absence of OOS text never implies stock |
| `publishable` / `success` | Verified live price, explicit stock, threshold satisfied, and no publication rejection |
| `checked_at` | Time this merchant HTML was observed |
| `effective_price` | Regular sale price; an unconfirmed coupon is never deducted |
| `coupons[].conditional_price` | Estimate if the coupon is applied, subject to its stated terms |
| `history` | Only this application's verified local observations, when enabled |
| `issues` | Structured rejection/enrichment reasons |

An out-of-stock page can have `price_verified=true` and `success=false`.
A query mismatch or history anomaly can also be unpublishable while retaining
the merchant's independently verified price. Filter on `success` for a deals feed.

Confidence values are **policy weights**, not calibrated probabilities or measured
merchant success rates. The threshold is 0.85. JSON-LD and selected embedded state
are weighted above merchant DOM; OpenGraph and generic semantic fallbacks remain
below the publication threshold. High-confidence price, currency, title, or stock
conflicts prevent publication. Aggregate prices and unresolved offers/variants
are rejected.

This verifies observed merchant product-page evidence. It does not guarantee the
final checkout total, which can change with delivery fees, taxes, seller selection,
login, location, membership, payment method, coupons, or time.

## Many product types

Category detection uses word boundaries and explicit structured hints. It supports
electronics, fashion, footwear, grocery, beauty, food, appliances, furniture,
books, sports, pets, healthcare, home, toys, automotive, and a general fallback.

Specialized handlers normalize storage/RAM, size systems, pack quantity, unit
pricing, SPF, book format/ISBN, medicine strength/form, animal, appliance capacity,
and energy rating. Other merchant-provided `additionalProperty` values are kept
as explicit attributes. Unknown dimensions, medical substitutes, restaurant fees,
and product claims are not invented.

Attributes carry `attribute_sources`: merchant structured data or title inference.
Inferred attributes are useful for conservative mismatch rejection, not proof of
cross-store product equivalence. One litre and 1,000 ml compare as equivalent;
different pack counts still represent different variants.

Canonical URLs, product IDs, selection parameters, variant IDs, sellers, location,
currency, and critical attributes keep observations separate. Family IDs are used
only when merchant data supplies `isVariantOf`; GTIN and ISBN values require valid
checksums. The implementation does not automatically merge unrelated merchant
products using fuzzy titles.

Query understanding checks supported attributes, iPhone/Galaxy/Pixel generations
and qualifiers, and explicit `under`/`above` price constraints. It does not perform
general natural-language reasoning or currency conversion. Search can return
unpublishable entries with diagnostics; verified matches rank first.

## Merchant adapters and discovery

`merchants.py` contains versioned selector profiles for Amazon India, Flipkart,
Shopsy, Myntra, AJIO, SHEIN India, Swiggy, Blinkit, Zepto, Croma, Nykaa, Tata CLiQ,
JioMart, BigBasket, and Reliance Digital. These are selector seeds drawn from the
uploaded code, supplemented by shared JSON-LD, microdata, and embedded-state
extraction. The synthetic per-merchant test validates shared extraction, not that
every current live merchant selector works.

Google Shopping, Bing Shopping, and direct Amazon/Flipkart search are discovery
providers. They return actual merchant product anchors; a merchant badge never
becomes a guessed product URL. Providers run as fallbacks until enough candidates
are collected. `StaticProvider` supports feed/API results and deterministic tests.
Google/Bing HTML frequently changes and may be blocked. The engine returns provider
failure codes and does not bypass CAPTCHA or run browser JavaScript.

To add a merchant:

```python
from commerce_engine.merchants import MerchantProfile, register_profile, cls

register_profile(MerchantProfile(
    name="Example Store",
    domains=("shop.example.com",),
    titles=(".//h1[@id='product-name']",),
    prices=(cls("pdp-sale-price"),),
    stock=(".//*[@id='product-stock']",),
    default_currency="INR",
    state_money_unit="major",
))
```

The built-in public discovery allowlist is intentionally fixed. Adding a parser
profile enables direct lookups; add its domain to the discovery configuration/code
when you also want search-provider acceptance. Merchant URL identity patterns live
in `urls.py`. Category handlers are registered in `categories.py`.

## Network policy

The reusable aiohttp client validates URL syntax and literal IPs, fails closed on
DNS errors, rejects mixed public/private DNS results, and gives the checked address
list directly to the connector. Every HTTP redirect is validated before connecting.
TLS validation stays enabled. Proxy environment variables and shared cookies are
disabled. Only public HTTP(S) endpoints on ports 80/443 are supported.

HTTP 429 and transient 5xx responses have bounded retries. Host concurrency, request
spacing, connection/read/total deadlines, redirect budgets, content-type checks,
circuit breakers, and byte limits are enforced. Gzip/deflate decoding is bounded
before it can expand into the HTTP client's buffer. Unsupported encodings are
refused. Search cancellation awaits network tasks; parsing and SQLite operations
use short bounded-input worker operations.

The implementation uses the documented aiohttp session/connector/resolver APIs:
[aiohttp client reference](https://docs.aiohttp.org/en/stable/client_reference.html).
It was tested here with aiohttp 3.13.5 and lxml 6.1.1.

## History, cache, and affiliates

`HistoryStore` uses SQLite WAL, exact decimal strings, idempotent observation keys,
and a transaction around anomaly assessment and insertion. It refuses offline,
unverified, unknown-stock, and stale observations. Keys include offer, variant,
critical attributes, seller, observed region, and currency. With at least three
prior observations, prices below 35% or above 300% of the recent observation median
are quarantined. These are configurable-in-code heuristics, not statistical proof
that a deal is false.

Summary fields include 30/90-day observed lows, all-time **observed** low, median,
average, and history points. History starts when this application begins collecting
valid observations. It does not import or fabricate a prior 90-day history.

The default cache is a bounded, 30-second, process-local discovery cache. A cache
hit still fetches and verifies merchant pages. Redis, distributed jobs, durable
HTML snapshots, stale-while-revalidate, and external history-provider integration
are not bundled. Inject a cache with the same `get`/`put` contract when needed.

Affiliate conversion is an optional async function configured on the engine. Its
result is kept in `affiliate_url` and never changes canonical identity or evidence.
No affiliate provider credentials or external integrations are assumed.

## Migration from the uploads

- Prices in JSON are **decimal strings** (`"1499.00"`), not floats. Convert using
  `Decimal(value)` for arithmetic. Update callers that expect numeric JSON values.
- `in_stock` can now be `null` and `success` is stricter than title + price.
- `raw_text` remains accepted but cannot overwrite merchant title, price, or offers.
- Optional `stealth_fetcher`, `genie_history`, `public_search_identity`, and Redis
  imports are replaced with self-contained modules and explicit extension points.
- `scrape_google_shopping()` remains a sync **discovery-only** compatibility method;
  use the async `search_google_shopping()` for mandatory merchant verification.
- `resolve_canonical_url()` raises a structured fetch/security error on failure
  instead of returning a potentially unsafe partial destination.
- The pasted markdown attachment contains escaped Markdown characters and nonbreaking
  spaces. It is not copied verbatim as executable Python.

## Before deployment

Capture authorized real merchant HTML for your target products, regions, languages,
stock states, coupons, and variants. Run the fixtures against your selected adapters
and tune policy using observed failures. JavaScript-only pages, authenticated prices,
warehouse selection, and location cookies require merchant-specific integrations.

If you inject a custom fetcher, it must preserve the public-address, redirect, byte,
timeout, and cancellation guarantees; the default network safety does not protect a
replacement transport automatically. Location-specific integrations must also expose
the actual response location through `regionContext`, `location`, `deliveryAddress`,
or the documented delivery-postal-code metadata.

This package includes executable tests and sample fixtures; it does not include a
deployed API, cloud scheduler, parser-health dashboard, or production accuracy claim.
