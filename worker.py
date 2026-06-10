#!/usr/bin/env python3
"""
worker.py — ARQ background worker
Pops deals from Redis queue:deals → runs full pipeline → saves to MongoDB → publishes to Pub/Sub.

This is the heavy engine extracted from bot.py's process_message().
Run as a single worker on the 1GB Azure VM:
  python3 worker.py

The worker runs alongside bot.py during transition. Once stable, bot.py's
scrape loop can be disabled and listener.py takes over ingestion.
"""

import asyncio, os, json, logging, time, sys, hashlib, re
from logging.handlers import RotatingFileHandler
from pathlib import Path
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

# ───────────────────────────────────────────────────────────────────
#  LOGGING
# ───────────────────────────────────────────────────────────────────
_rot = RotatingFileHandler(
    "worker.log", maxBytes=5*1024*1024, backupCount=2, encoding="utf-8"
)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [WORKER] %(message)s",
    handlers=[_rot],
)
log = logging.getLogger(__name__)

# ───────────────────────────────────────────────────────────────────
#  SHARED CONFIG — mirrors bot.py
# ───────────────────────────────────────────────────────────────────
REDIS_URL       = os.getenv("REDIS_URL",        "redis://127.0.0.1:6379/0")
MONGODB_URI     = os.getenv("MONGODB_URI",       "")
MONGODB_DB      = os.getenv("MONGODB_DB",        "dealbot")
QUEUE_KEY       = "queue:deals"
PUBSUB_CHANNEL  = "deals:finalized"

EARNKARO_TOKEN  = os.getenv("EARNKARO_TOKEN",    "")
AMAZON_TAG      = os.getenv("AMAZON_AFFILIATE_TAG", "dealshare0b7-21")
AUTO_POST_SCORE = int(os.getenv("AUTO_POST_MIN_SCORE", "9"))
IMAGES_DIR      = Path(os.getenv("IMAGES_DIR", "images"))
IMAGES_DIR.mkdir(exist_ok=True)

# ───────────────────────────────────────────────────────────────────
#  REDIS + MONGODB CLIENTS
# ───────────────────────────────────────────────────────────────────
import redis as redis_lib
import aiohttp

_redis = redis_lib.Redis.from_url(REDIS_URL, decode_responses=True)
_motor_db = None

async def get_db():
    global _motor_db
    if _motor_db is not None:
        return _motor_db
    if not MONGODB_URI:
        return None
    import motor.motor_asyncio as motor
    client   = motor.AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    _motor_db = client[MONGODB_DB]
    return _motor_db

# ───────────────────────────────────────────────────────────────────
#  UTILITY — copied from bot.py (self-contained, no bot.py import)
# ───────────────────────────────────────────────────────────────────

def normalize_text(text: str) -> str:
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def sha256_fp(text: str) -> str:
    normalized = normalize_text(text)
    return hashlib.sha256(normalized.encode()).hexdigest()[:32]

def extract_urls(text: str) -> list[str]:
    return re.findall(r'https?://[^\s\)\]>\"\']+', text)

def extract_asin(url: str) -> str | None:
    m = re.search(r'/dp/([A-Z0-9]{10})', url)
    return m.group(1) if m else None

def detect_platform(url: str) -> str | None:
    host = urlparse(url).netloc.lower()
    if 'amazon'    in host: return 'Amazon India'
    if 'flipkart'  in host: return 'Flipkart'
    if 'myntra'    in host: return 'Myntra'
    if 'ajio'      in host: return 'AJIO'
    if 'meesho'    in host: return 'Meesho'
    if 'nykaa'     in host: return 'Nykaa'
    if 'swiggy'    in host: return 'Swiggy'
    if 'zomato'    in host: return 'Zomato'
    if 'blinkit'   in host: return 'Blinkit'
    if 'zepto'     in host: return 'Zepto'
    if 'jiomart'   in host: return 'JioMart'
    if 'croma'     in host: return 'Croma'
    if 'reliance'  in host: return 'Reliance Digital'
    return None

def extract_prices(text: str) -> dict:
    prices = {}
    sale   = re.findall(r'(?:₹|rs\.?|inr)\s*([\d,]+)', text, re.IGNORECASE)
    if sale:
        try: prices['sale'] = float(sale[0].replace(',', ''))
        except: pass
    return prices

def extract_product_name(text: str) -> str:
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines:
        if len(line) > 10 and not line.startswith('http') and not re.match(r'^[₹#@]', line):
            return line[:120]
    return text[:80].strip()

def detect_category(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ['phone','mobile','laptop','headphone','earphone','speaker','tv','tablet','camera','charger','cable','powerbank']): return '📱 Electronics'
    if any(w in t for w in ['shirt','dress','kurta','saree','jeans','shoes','sneaker','sandal','bag','watch','jewellery','fashion']): return '👗 Fashion'
    if any(w in t for w in ['rice','dal','atta','oil','ghee','milk','biscuit','grocery','snack','coffee','tea','spice']): return '🍎 Grocery'
    if any(w in t for w in ['sofa','bed','mattress','pillow','curtain','kitchen','cookware','appliance','vacuum','mixer']): return '🏠 Home'
    if any(w in t for w in ['lipstick','serum','moisturizer','shampoo','conditioner','perfume','makeup','skincare']): return '💄 Beauty'
    if any(w in t for w in ['game','ps5','xbox','nintendo','steam','gaming']): return '🎮 Gaming'
    if any(w in t for w in ['book','novel','textbook','kindle']): return '📚 Books'
    if any(w in t for w in ['toy','kids','baby','diaper','stroller']): return '🧸 Kids'
    if any(w in t for w in ['hotel','flight','travel','trip','holiday','tour']): return '🧳 Travel'
    if any(w in t for w in ['watch','smartwatch','fossil','titan']): return '⌚ Watches'
    if any(w in t for w in ['gym','yoga','treadmill','protein','fitness','cricket','football']): return '🏋️ Sports'
    if any(w in t for w in ['dog','cat','pet','collar','leash']): return '🐾 Pet'
    return '🛍️ General'

def extract_coupon(text: str) -> str | None:
    m = re.search(r'(?:coupon|code|promo)[:\s]+([A-Z0-9]{4,20})', text, re.IGNORECASE)
    return m.group(1).upper() if m else None

def is_short_url(url: str) -> bool:
    short = ['amzn.in','fkrt.it','bit.ly','tinyurl','t.co','ow.ly','buff.ly','goo.gl','rb.gy','tiny.cc']
    return any(s in url for s in short)

# ───────────────────────────────────────────────────────────────────
#  URL EXPANSION + AFFILIATE
# ───────────────────────────────────────────────────────────────────

async def expand_url(session: aiohttp.ClientSession, url: str) -> str:
    if not is_short_url(url):
        return url
    try:
        async with session.head(url, allow_redirects=True, timeout=aiohttp.ClientTimeout(total=8)) as r:
            return str(r.url)
    except:
        return url

def apply_amazon_tag(url: str) -> str:
    if 'amazon' not in url.lower():
        return url
    url = re.sub(r'tag=[^&]+', f'tag={AMAZON_TAG}', url)
    if 'tag=' not in url:
        sep = '&' if '?' in url else '?'
        url = f"{url}{sep}tag={AMAZON_TAG}"
    return url

async def earnkaro_convert(session: aiohttp.ClientSession, url: str) -> str | None:
    if not EARNKARO_TOKEN:
        return None
    try:
        async with session.post(
            "https://ekaro-api.affiliaters.in/api/converter/public",
            json={"deal": url, "convert_option": "convert_only"},
            headers={"Authorization": f"Bearer {EARNKARO_TOKEN}", "Content-Type": "application/json"},
            timeout=aiohttp.ClientTimeout(total=10),
        ) as r:
            data = await r.json()
            if data.get("success") == 1 and data.get("data") and data["data"] != url:
                if "We could not locate" in data["data"]:
                    return None
                return data["data"]
            return None
    except:
        return None

async def process_urls(text: str) -> tuple[str, list[str], list[str], bool]:
    """Returns: (aff_text, platforms, exp_urls, affiliate_applied)"""
    raw_urls = extract_urls(text)
    if not raw_urls:
        return text, [], [], False

    connector = aiohttp.TCPConnector(limit=5, ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        expanded = {}
        for url in raw_urls:
            expanded[url] = await expand_url(session, url)

        exp_urls  = list(expanded.values())
        platforms = list(dict.fromkeys(filter(None, [detect_platform(u) for u in exp_urls])))

        aff_text = text
        aff_applied = False
        for orig, exp in expanded.items():
            if 'amazon' in exp.lower():
                tagged = apply_amazon_tag(exp)
                aff_text = aff_text.replace(orig, tagged)
                aff_applied = True
            else:
                ek = await earnkaro_convert(session, exp)
                if ek:
                    aff_text = aff_text.replace(orig, ek)
                    aff_applied = True

    return aff_text, platforms, exp_urls, aff_applied

# ───────────────────────────────────────────────────────────────────
#  DEAL TYPE CLASSIFICATION
# ───────────────────────────────────────────────────────────────────

def classify_deal_type(text: str) -> str:
    """Classify a deal as 'product' or 'trick' based on text patterns."""
    trick_words = [
        'trick', 'loot trick', 'loot deal trick', 'free entry', 'quiz',
        'contest', 'method', 'steps:', 'cashback trick', 'earn free',
        'how to', 'free sample', 'free recharge', 'survey', 'spin and win',
        'refer and earn', 'signup bonus', 'new user offer', 'campaign',
        'complete kyc', 'complete registration', 'install app',
    ]
    text_lower = text.lower()
    if any(w in text_lower for w in trick_words):
        return 'trick'
    return 'product'

# ───────────────────────────────────────────────────────────────────
#  IMAGE SCRAPING — fetch product image from expanded URLs
# ───────────────────────────────────────────────────────────────────

async def fetch_product_image(urls: list[str]) -> tuple[str | None, str | None]:
    """Try to scrape a product image from the given URLs.
    Returns (img_path, img_url) or (None, None)."""
    if not urls:
        return None, None

    SKIP_DOMAINS = {
        'bit.ly', 'tinyurl.com', 't.co', 'amzn.to', 'amzn.in',
        'fkrt.it', 'clnk.in', 'earnkaro.com', 'ekaro.in',
    }

    connector = aiohttp.TCPConnector(limit=3, ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        for url in urls:
            try:
                domain = urlparse(url).netloc.lower()
                if any(d in domain for d in SKIP_DOMAINS):
                    continue

                # Try Amazon ASIN direct image first
                asin = extract_asin(url)
                if asin:
                    img_url = f"https://images-eu.ssl-images-amazon.com/images/P/{asin}.jpg"
                    try:
                        async with session.get(img_url, timeout=aiohttp.ClientTimeout(total=10)) as r:
                            if r.status == 200:
                                data = await r.read()
                                if len(data) > 5000:
                                    fname = IMAGES_DIR / f"amz_{asin}_{int(time.time())}.jpg"
                                    fname.write_bytes(data)
                                    log.info("  🖼️ Amazon ASIN image ✓ (%s)", asin)
                                    return str(fname), img_url
                    except:
                        pass

                # Fallback: OG image scraping
                hdrs = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,*/*;q=0.8",
                }
                async with session.get(url, headers=hdrs, allow_redirects=True,
                                       timeout=aiohttp.ClientTimeout(total=15)) as r:
                    if r.status != 200:
                        continue
                    html = await r.text()

                # Parse OG image from HTML
                import re as _re
                og_match = _re.search(
                    r'<meta[^>]+(?:property|name)=["\']og:image["\'][^>]+content=["\']([^"\'>]+)',
                    html, _re.IGNORECASE
                )
                if not og_match:
                    og_match = _re.search(
                        r'<meta[^>]+content=["\']([^"\'>]+)["\'][^>]+(?:property|name)=["\']og:image',
                        html, _re.IGNORECASE
                    )
                if not og_match:
                    continue

                og_url = og_match.group(1).strip()
                if not og_url.startswith('http'):
                    continue

                async with session.get(og_url, timeout=aiohttp.ClientTimeout(total=10)) as ir:
                    if ir.status == 200:
                        data = await ir.read()
                        if len(data) > 5000:
                            safe = _re.sub(r'[^\w]', '_', domain)[:25]
                            fname = IMAGES_DIR / f"og_{safe}_{int(time.time())}.jpg"
                            fname.write_bytes(data)
                            log.info("  🖼️ OG image ✓ (%s)", domain)
                            return str(fname), og_url
            except Exception as e:
                log.debug("  Image scrape failed for %s: %s", url[:60], e)
                continue

    return None, None

# ───────────────────────────────────────────────────────────────────
#  DEDUPLICATION
# ───────────────────────────────────────────────────────────────────

def is_duplicate(fp: str) -> bool:
    try:
        key = f"fp:{fp}"
        if _redis.exists(key):
            return True
        _redis.setex(key, 86400, "1")
        return False
    except:
        return False

def check_asin_price(asin: str, current_price: float) -> tuple[bool, float | None]:
    """Returns (is_dup, last_price). is_dup=True means skip."""
    if not asin or not current_price:
        return False, None
    try:
        key = f"asin:{asin}"
        val = _redis.get(key)
        if val:
            data = json.loads(val)
            last_price = data.get("price", 0)
            if current_price >= last_price:
                return True, last_price  # Same or higher — skip
            # Price dropped — update and allow
        _redis.setex(key, 172800, json.dumps({"price": current_price, "ts": time.time()}))
        return False, None
    except:
        return False, None

# ───────────────────────────────────────────────────────────────────
#  MONGODB SAVE
# ───────────────────────────────────────────────────────────────────

async def save_to_mongo(doc: dict):
    db = await get_db()
    if db is None:
        return
    try:
        await db.UniqueDeals.update_one(
            {"fp_hash": doc["fp_hash"]},
            {"$setOnInsert": doc},
            upsert=True,
        )
    except Exception as e:
        log.error("MongoDB save failed: %s", e)

def publish_to_pubsub(payload: dict):
    try:
        _redis.publish(PUBSUB_CHANNEL, json.dumps(payload, ensure_ascii=False))
    except Exception as e:
        log.warning("Pub/Sub publish failed: %s", e)

# ───────────────────────────────────────────────────────────────────
#  MAIN PROCESSING PIPELINE
# ───────────────────────────────────────────────────────────────────

async def process_deal(raw: dict):
    text    = raw.get("text", "")
    channel = raw.get("channel", "unknown")
    title   = raw.get("title",   channel)
    msg_id  = raw.get("msg_id",  0)
    ts      = raw.get("ts",      time.time())

    log.info("Processing msg_id=%s channel=%s", msg_id, channel)

    # 1. Fingerprint + dedup
    fp = sha256_fp(text)
    if is_duplicate(fp):
        log.info("  ♻️ Duplicate fingerprint — skipped")
        return

    # 2. URL expansion + affiliate conversion
    aff_text, platforms, exp_urls, aff_applied = await process_urls(text)

    # 3. Extract deal metadata
    prices    = extract_prices(text)
    prod_name = extract_product_name(text)
    category  = detect_category(text)
    coupon    = extract_coupon(text)
    sale_price = prices.get("sale")
    asin      = next((extract_asin(u) for u in exp_urls if extract_asin(u)), None)

    # 4. ASIN price drop check
    if asin and sale_price:
        is_dup, last_price = check_asin_price(asin, sale_price)
        if is_dup:
            log.info("  ♻️ ASIN %s same/higher price (₹%s vs ₹%s) — skipped",
                     asin, sale_price, last_price)
            return

    # 5. Use score from bot.py (already rated — scoring only in bot.py)
    score   = raw.get("score", 0)
    verdict = raw.get("verdict", "")
    if isinstance(score, str):
        try: score = int(score)
        except: score = 0

    # 6. Classify deal type
    deal_type = raw.get("deal_type") or classify_deal_type(text)

    # 7. Image: use bot.py's image, or scrape if missing
    img_url  = raw.get("img_url", None)
    img_path = raw.get("img_path", None)
    if not img_url and exp_urls:
        log.info("  🔍 No image — attempting scrape from %d URLs", len(exp_urls))
        scraped_path, scraped_url = await fetch_product_image(exp_urls)
        if scraped_path:
            img_path = scraped_path
            img_url  = scraped_url

    log.info("  📨 %s | plat=%s | ₹%s | score=%s %s | type=%s",
             category, platforms, sale_price, score, verdict, deal_type)

    # 8. Build final deal document
    doc = {
        "fp_hash":          fp,
        "asin":             asin,
        "prod_name":        prod_name,
        "category":         category,
        "platforms":        platforms,
        "original_text":    raw.get("original_text", text),
        "aff_text":         aff_text,
        "prices":           prices,
        "coupon":           coupon,
        "score":            score,
        "verdict":          verdict,
        "deal_type":        deal_type,
        "source":           raw.get("source", "telegram"),
        "source_channel":   channel,
        "channel_title":    title,
        "msg_id":           msg_id,
        "affiliate_applied": aff_applied,
        "expanded_urls":    raw.get("expanded_urls", {u: e for u, e in zip(extract_urls(text), exp_urls)}),
        "original_msg_link": raw.get("original_msg_link", ""),
        "img_url":          img_url,
        "img_path":         img_path,
        "status":           "auto_posted" if score >= AUTO_POST_SCORE else "pending_approval",
        "ts":               ts,
        "processed_ts":     time.time(),
    }

    # 9. Save to MongoDB
    await save_to_mongo(doc)

    # 10. Publish FULL deal to Pub/Sub → FastAPI → WebSocket → browser renders instantly
    publish_to_pubsub({
        "event":        "new_deal",
        **{k: v for k, v in doc.items() if k != "_id"},
    })

    log.info("  ✅ Saved | status=%s | aff=%s | img=%s", doc["status"], aff_applied, bool(img_url))


# ───────────────────────────────────────────────────────────────────
#  WORKER LOOP — blocking pop from Redis queue
# ───────────────────────────────────────────────────────────────────

async def worker_loop():
    log.info("Worker started — listening on queue:%s", QUEUE_KEY)
    log.info("Redis: %s", REDIS_URL)
    log.info("MongoDB: %s", "connected" if MONGODB_URI else "NOT CONFIGURED")

    # Verify Redis
    try:
        _redis.ping()
        log.info("Redis ping: OK")
    except Exception as e:
        log.error("Redis unavailable: %s", e)
        sys.exit(1)

    # Warm up MongoDB connection
    await get_db()

    consecutive_errors = 0

    while True:
        try:
            # BLPOP blocks up to 5s waiting for a queue item
            item = _redis.blpop(QUEUE_KEY, timeout=5)

            if item is None:
                # Timeout — queue empty, loop again
                continue

            _, raw_json = item
            try:
                raw = json.loads(raw_json)
            except json.JSONDecodeError as e:
                log.error("Invalid JSON in queue: %s", e)
                continue

            await process_deal(raw)
            consecutive_errors = 0

        except KeyboardInterrupt:
            log.info("Worker stopped by user")
            break
        except Exception as e:
            consecutive_errors += 1
            log.error("Worker error #%d: %s", consecutive_errors, e)
            if consecutive_errors >= 10:
                log.critical("10 consecutive errors — sleeping 60s before retry")
                await asyncio.sleep(60)
                consecutive_errors = 0
            else:
                await asyncio.sleep(2)


if __name__ == "__main__":
    asyncio.run(worker_loop())
