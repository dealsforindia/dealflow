#!/usr/bin/env python3
import fcntl, sys, os
_lf = open("/tmp/dealbot_main.lock","w")
try: fcntl.flock(_lf, fcntl.LOCK_EX|fcntl.LOCK_NB)
except IOError: print("bot.py already running!"); sys.exit(1)

"""
Telegram Deal Bot — Indian Edition v8  (Professional Grade)
For @dealsforindiachannel  |  Output: @bestindiandeals2025

Upgrades over v7:
  1.  BETTER  : CLEAN_FORMAT_PROMPT rewritten — ultra-detailed, 20 strict rules,
                real examples for every deal type (Amazon, Flipkart, Myntra, AJIO,
                Meesho, Nykaa, grocery, electronics, fashion, combo packs)
  2.  BETTER  : Output validation — checks URL present, price present, length sane,
                no raw JSON, no markdown fences — falls back to manual if AI fails
  3.  NEW     : AUTO-POST — deals rated 9+/10 skip admin queue, post directly
                (configurable: AUTO_POST_MIN_SCORE in .env)
  4.  REMOVED : Discount % filter — every deal reaches admin, no filtering by discount
  5.  BETTER  : Admin preview shows AI-formatted text so you see exactly what
                will be posted before you approve
  6.  BETTER  : /preview <deal_id> command to see formatted text before posting
  7.  BETTER  : Rate-limit retry with jitter on Telegram flood errors
  8.  BETTER  : Image cleanup is more aggressive — no stale files on disk
  9.  BETTER  : desidime_bot shares the same AI formatting chain via shared module
  10. FIXED   : Pending deals now pruned on startup with a log message
"""

import asyncio, os, re, json, base64, logging, aiohttp, aiofiles
import time, sys, hashlib, random
from logging.handlers import RotatingFileHandler
from pathlib import Path
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse, quote_plus
from datetime import datetime, timezone, timedelta
from difflib import SequenceMatcher
from telethon import TelegramClient, events, Button
from telethon.tl.types import MessageMediaPhoto, MessageMediaDocument
from dotenv import load_dotenv
import redis
from pymongo import MongoClient

load_dotenv()
# ═══════════════════════════════════════════════════════════════════
#  LOGGING
# ═══════════════════════════════════════════════════════════════════
_rot = RotatingFileHandler("bot.log", maxBytes=10*1024*1024, backupCount=3, encoding="utf-8")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[_rot, logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger(__name__)
for _n in ["aiohttp", "aiohttp.connector", "aiohttp.client", "aiohttp.internal", "aiohttp.access"]:
    logging.getLogger(_n).setLevel(logging.CRITICAL)

# ═══════════════════════════════════════════════════════════════════
#  CONFIG  (all tunable via .env)
# ═══════════════════════════════════════════════════════════════════
API_ID           = int(os.getenv("TG_API_ID", "0"))
API_HASH         = os.getenv("TG_API_HASH", "")
BOT_TOKEN        = os.getenv("TG_BOT_TOKEN", "")
OUTPUT_CHANNEL   = os.getenv("OUTPUT_CHANNEL", "")
CURATED_CHANNEL  = os.getenv("CURATED_CHANNEL", "@dealsforindiachannel")
ADMIN_USER_ID    = int(os.getenv("ADMIN_USER_ID", "0"))

GEMINI_KEY       = os.getenv("GEMINI_API_KEY", "")
GROQ_KEY         = os.getenv("GROQ_API_KEY", "")
OPENROUTER_KEY   = os.getenv("OPENROUTER_API_KEY", "")
MISTRAL_KEY      = os.getenv("MISTRAL_API_KEY", "")
COHERE_KEY       = os.getenv("COHERE_API_KEY", "")
TOGETHER_KEY     = os.getenv("TOGETHER_API_KEY", "")
CEREBRAS_KEY     = os.getenv("CEREBRAS_API_KEY", "")
SAMBANOVA_KEY    = os.getenv("SAMBANOVA_API_KEY", "")

GEMINI_KEYS: list[str] = [k.strip() for k in os.getenv("GEMINI_KEYS","").split(",") if k.strip()]
if GEMINI_KEY and GEMINI_KEY not in GEMINI_KEYS:
    GEMINI_KEYS.insert(0, GEMINI_KEY)
GROQ_KEYS: list[str] = [k.strip() for k in os.getenv("GROQ_KEYS","").split(",") if k.strip()]
if GROQ_KEY and GROQ_KEY not in GROQ_KEYS:
    GROQ_KEYS.insert(0, GROQ_KEY)

EARNKARO_TOKEN   = os.getenv("EARNKARO_TOKEN", "")
AMAZON_AFFL_TAG  = os.getenv("AMAZON_AFFILIATE_TAG", "dealshare0b7-21")
SCRAPE_INTERVAL  = int(os.getenv("SCRAPE_INTERVAL_SEC",    "600"))
LOOKBACK_HOURS   = int(os.getenv("LOOKBACK_HOURS",         "2"))
MSGS_PER_CHAN    = int(os.getenv("MSGS_PER_CHANNEL",       "50"))
PRICE_DROP_PCT   = float(os.getenv("PRICE_DROP_REPOST_PCT","5"))
DUP_TEXT_SIM     = float(os.getenv("DUPLICATE_SIMILARITY", "0.82"))
DUP_NAME_SIM     = float(os.getenv("DUPLICATE_NAME_SIM",   "0.75"))
MSG_TIMEOUT      = int(os.getenv("MSG_TIMEOUT_SEC",        "90"))
MAX_POSTS_CYCLE  = int(os.getenv("MAX_POSTS_PER_CYCLE",    "40"))
AUTO_POST_SCORE  = int(os.getenv("AUTO_POST_MIN_SCORE",    "9"))    # auto-post threshold

SOURCE_CHANNELS: list[str] = [
    ch.strip() for ch in os.getenv("SOURCE_CHANNELS","").split(",") if ch.strip()
]

SEEN_IDS_FILE   = Path("seen_ids.json")
DEAL_CACHE_FILE = Path("deal_cache.json")
STATS_FILE      = Path("daily_stats.json")
ALERTS_FILE     = Path("alerts.json")
TRENDING_FILE   = Path("trending.json")
LAST_CYCLE_FILE = Path("last_cycle.json")
PENDING_FILE    = Path("pending_deals.json")
IMAGES_DIR      = Path("images")
IMAGES_DIR.mkdir(exist_ok=True)

TG_CAPTION_LIMIT = 1024
BOT_START_TIME   = time.time()

# ═══════════════════════════════════════════════════════════════════
#  MONGODB + REDIS  (side-channel for web dashboard)
# ═══════════════════════════════════════════════════════════════════
try:
    _mongo = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"), serverSelectionTimeoutMS=3000)
    _db = _mongo[os.getenv("MONGO_DB", "dealbot")]
    _deals_col = _db["deals"]
    _deals_col.create_index("fp_hash", unique=True, background=True)
    _deals_col.create_index("status", background=True)
    _deals_col.create_index("ts", background=True)
    log.info("📦 MongoDB connected for web dashboard")
except Exception as _me:
    log.warning(f"⚠️ MongoDB not available (dashboard won't update): {_me}")
    _deals_col = None

try:
    _redis = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)
    _redis.ping()
    log.info("📡 Redis connected for PubSub")
except Exception as _re:
    log.warning(f"⚠️ Redis not available: {_re}")
    _redis = None

def _save_deal_to_db(deal_doc: dict):
    """Save deal to MongoDB and publish to Redis PubSub (best-effort)."""
    try:
        if _deals_col is not None:
            _deals_col.update_one(
                {"fp_hash": deal_doc["fp_hash"]},
                {"$set": deal_doc},
                upsert=True
            )
    except Exception as e:
        log.warning(f"MongoDB save failed: {e}")
    try:
        if _redis is not None:
            _redis.publish("deals:new", json.dumps({
                "event": "new_deal",
                "fp_hash": deal_doc["fp_hash"],
                "prod_name": deal_doc.get("prod_name", ""),
                "status": deal_doc.get("status", "pending_approval"),
                "source": "telegram",
            }, ensure_ascii=False))
    except Exception as e:
        log.warning(f"Redis publish failed: {e}")

# ═══════════════════════════════════════════════════════════════════
#  PENDING DEALS  (survive restarts)
# ═══════════════════════════════════════════════════════════════════
def _load_pending() -> dict:
    if PENDING_FILE.exists():
        try:
            data   = json.loads(PENDING_FILE.read_text(encoding="utf-8"))
            cutoff = time.time() - 172800  # 48h — admin may not check for a long time
            clean  = {k: v for k, v in data.items() if v.get("ts", 0) > cutoff}
            pruned = len(data) - len(clean)
            if pruned:
                log.info(f"🧹 Pruned {pruned} expired pending deal(s) on startup")
            return clean
        except Exception as e:
            log.warning(f"Could not load pending_deals.json: {e}")
    return {}

def _save_pending(d: dict):
    try:
        PENDING_FILE.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as e:
        log.warning(f"Could not save pending_deals.json: {e}")

pending_deals: dict = _load_pending()
log.info(f"📂 Loaded {len(pending_deals)} pending deal(s) from disk")

# ═══════════════════════════════════════════════════════════════════
#  KEY ROTATION
# ═══════════════════════════════════════════════════════════════════
_gi = [0]; _ri = [0]

def _next(keys, ref):
    if not keys: return None
    k = keys[ref[0] % len(keys)]; ref[0] += 1; return k

next_gemini = lambda: _next(GEMINI_KEYS, _gi)
next_groq   = lambda: _next(GROQ_KEYS,   _ri)

# ═══════════════════════════════════════════════════════════════════
#  GLOBAL CONNECTOR
# ═══════════════════════════════════════════════════════════════════
_connector: aiohttp.TCPConnector | None = None

def get_connector() -> aiohttp.TCPConnector:
    global _connector
    if _connector is None or _connector.closed:
        _connector = aiohttp.TCPConnector(limit=15, ttl_dns_cache=300, use_dns_cache=True)
    return _connector

def make_session() -> aiohttp.ClientSession:
    return aiohttp.ClientSession(connector=get_connector(), connector_owner=False)

# ═══════════════════════════════════════════════════════════════════
#  PLATFORMS
# ═══════════════════════════════════════════════════════════════════
INDIAN_PLATFORMS = {
    "amazon.in": "Amazon India", "amzn.in": "Amazon India",
    "flipkart.com": "Flipkart",  "dl.flipkart.com": "Flipkart",
    "myntra.com": "Myntra",      "ajio.com": "AJIO",
    "meesho.com": "Meesho",      "nykaa.com": "Nykaa",
    "nykaafashion.com": "Nykaa Fashion",
    "tatacliq.com": "Tata CLiQ", "snapdeal.com": "Snapdeal",
    "reliancedigital.in": "Reliance Digital",
    "croma.com": "Croma",        "vijaysales.com": "Vijay Sales",
    "jiomart.com": "JioMart",    "shopsy.in": "Shopsy",
    "bigbasket.com": "BigBasket","blinkit.com": "Blinkit",
    "myntr.in": "Myntra",        "myntassets.com": "Myntra",
    "swiggy.com": "Swiggy",      "zepto.com": "Zepto",
}

PLATFORM_BADGES = {
    "Amazon India": "🛒", "Flipkart": "🛍", "Myntra": "👗",
    "AJIO": "👔", "Meesho": "📦", "Nykaa": "💄",
    "Nykaa Fashion": "💄", "Tata CLiQ": "🏬", "Croma": "💻",
    "Reliance Digital": "📱", "Shopsy": "🛍️", "JioMart": "🛒",
    "BigBasket": "🥦", "Swiggy": "🍔", "Zepto": "⚡",
}

SHORT_LINK_DOMAINS = {
    "bit.ly","bitly.com","tinyurl.com","t.co","ow.ly","is.gd",
    "buff.ly","tiny.cc","short.link","rebrand.ly","cutt.ly",
    "amzn.to","amzn.eu","a.co","amzn.in","fkrt.it","fkrt.cc",
    "go.redirectingat.com","fave.co","awin1.com","rstyle.me",
    "howl.me","shrsl.com","shareasale.com","ekaro.in","clnk.in",
    "inr.deals","extp.in","earnkaro.com","myntr.in",
    "dl.flipkart.com","ckaro.in","cashk.in","ajio.com",
}

TRACKING_PARAMS = {
    "utm_source","utm_medium","utm_campaign","utm_term","utm_content",
    "ref","tag","linkCode","camp","creative","creativeASIN",
    "ascsubtag","subId","sub_id","clickId","click_id","affid",
    "aff_id","affiliate","partner","source","via","otracker",
    "otrackid","lid","ltype","pid",
}

SCAM_DOMAINS = {
    "amaz0n.in","amazon-india.com","flipkart.net","deals-india.tk",
    "free-products.ml","amazon.com.co","amazonin.net",
    "amazon-deals.in","amazon-offer.in","amazon-sale.in",
    "flipkart-offer.com","flipkart-deals.in","flipkart-sale.in",
    "myntra-sale.com","myntra-offer.in","ajio-sale.com",
    "free-iphone.in","free-recharge.tk","cashbackoffer.tk",
    "luckywinners.in","getfreenow.in","claimprize.in",
    "india-deals.tk","dealszone.ml","shoppingoffer.ga",
    "amzon.in","fipkart.com","myntr4.com","amazn.in",
}

AMAZON_DOMAINS = {"amazon.in","amazon.com","amzn.in","amzn.to","amzn.eu","a.co"}

def detect_platform(url: str) -> str | None:
    try:
        d = urlparse(url).netloc.lower().lstrip("www.")
        for k, v in INDIAN_PLATFORMS.items():
            if d == k or d.endswith("." + k):
                return v
    except: pass
    return None

def sim(a, b):
    if not a or not b: return 0.0
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def is_scam_url(url: str) -> bool:
    try:
        domain = urlparse(url).netloc.lower().lstrip("www.")
        if domain in SCAM_DOMAINS: return True
        for legit in ["amazon.in","flipkart.com","myntra.com","ajio.com"]:
            if sim(domain, legit) > 0.85 and domain != legit:
                log.warning(f"🚨 Lookalike domain: {domain} ~ {legit}")
                return True
    except: pass
    return False

# ═══════════════════════════════════════════════════════════════════
#  CATEGORY DETECTION
# ═══════════════════════════════════════════════════════════════════
CATEGORIES = {
    "📱 Electronics":  ["phone","mobile","laptop","tablet","earphone","headphone",
                        "speaker","charger","cable","powerbank","smartwatch","tv",
                        "monitor","keyboard","mouse","router","camera","led",
                        "adapter","hub","ssd","hard disk","pendrive","ipad"],
    "👗 Fashion":      ["shirt","jeans","dress","shoes","sneakers","kurta","saree",
                        "jacket","bag","wallet","sandal","heels","tshirt","trouser",
                        "blazer","jumpsuit","sweatshirt","hoodie","co-ords","kurti"],
    "🏠 Home":         ["mixer","cooker","iron","vacuum","fan","ac","refrigerator",
                        "washing","geyser","mattress","pillow","curtain","bedsheet",
                        "air cooler","water purifier","induction","ceiling fan"],
    "💄 Beauty":       ["shampoo","cream","serum","moisturizer","lipstick","perfume",
                        "sunscreen","facewash","hair","makeup","foundation","lotion",
                        "fragrance","deodorant","cologne","lip balm","vaseline"],
    "🍎 Grocery":      ["oil","rice","dal","atta","sugar","biscuit","chocolate",
                        "juice","coffee","tea","ghee","spice","sauce","protein",
                        "dry fruits","nuts","dates"],
    "📚 Books":        ["book","novel","textbook","comics","kindle","paperback"],
    "🎮 Gaming":       ["game","controller","console","ps5","xbox","nintendo","gaming"],
    "🏋️ Sports":      ["gym","yoga","cycle","fitness","dumbbell","treadmill","whey",
                        "cricket","football","badminton","tennis","sports"],
    "🧸 Kids":         ["toy","baby","kids","child","school","crayon","board game"],
    "🐾 Pet":          ["dog","cat","pet food","collar","treat","aquarium"],
    "🧳 Travel":       ["luggage","bag","suitcase","backpack","travel","touring",
                        "rucksack","duffel","trolley"],
    "⌚ Watches":      ["watch","smartwatch","chronograph","analog","digital watch"],
}

def detect_category(text: str) -> str:
    tl = text.lower()
    scores = {cat: sum(1 for k in kws if k in tl) for cat, kws in CATEGORIES.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "🛍️ General"

# ═══════════════════════════════════════════════════════════════════
#  PRICE EXTRACTION
# ═══════════════════════════════════════════════════════════════════
def extract_prices(text: str) -> dict:
    result = {"mrp": None, "sale": None, "discount_pct": None}

    m = re.search(r'Regular[:\s]*([\d,]+)', text, re.I)
    if m:
        try: result["mrp"] = float(m.group(1).replace(",",""))
        except: pass

    if not result["mrp"]:
        for pat in [
            r'(?:MRP|M\.R\.P|original price|was|mrp price)[:\s]*₹\s*([\d,]+)',
            r'(?:MRP|M\.R\.P|original price|was|mrp price)[:\s]*Rs\.?\s*([\d,]+)',
            r'₹\s*([\d,]+)\s*(?:~~|strike|crossed|strikethrough)',
        ]:
            m = re.search(pat, text, re.I)
            if m:
                try: result["mrp"] = float(m.group(1).replace(",","")); break
                except: pass

    at_m = re.search(r'@\s*(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d+)?)', text, re.I)
    if at_m:
        try:
            v = float(at_m.group(1).replace(",",""))
            if 10 < v < 500000: result["sale"] = v
        except: pass

    if not result["sale"]:
        for pat in [
            r'(?:now|offer|sale|deal|get|buy)[:\s]*(?:at|for|@)?\s*₹\s*([\d,]+)',
            r'(?:now|offer|sale|deal|get|buy)[:\s]*(?:at|for|@)?\s*Rs\.?\s*([\d,]+)',
            r'(?:just|only|price|final|effectively)[:\s]+(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d+)?)',
            r'(?:INR|inr)\s*([\d,]+)',
            r'(\d{3,6})\s*(?:/-|only|rupees)',
            r'₹\s*([\d,]+)',
            r'Rs\.?\s*([\d,]+)',
        ]:
            m = re.search(pat, text, re.I)
            if m:
                try:
                    v = float(m.group(1).replace(",",""))
                    if result["mrp"] and v >= result["mrp"]: continue
                    if 10 < v < 500000: result["sale"] = v; break
                except: pass

    m = re.search(r'(\d{1,2})\s*%\s*off', text, re.I)
    if m:
        try: result["discount_pct"] = int(m.group(1))
        except: pass

    if not result["discount_pct"]:
        m = re.search(r'^(\d{1,2})\s*%\s*:', text, re.I | re.MULTILINE)
        if m:
            try: result["discount_pct"] = int(m.group(1))
            except: pass

    if result["mrp"] and result["sale"] and not result["discount_pct"]:
        if result["mrp"] > result["sale"]:
            result["discount_pct"] = round((1 - result["sale"] / result["mrp"]) * 100)

    return result

# ═══════════════════════════════════════════════════════════════════
#  BANK OFFER EXTRACTION
# ═══════════════════════════════════════════════════════════════════
BANK_NAMES = [
    "HDFC","SBI","ICICI","Axis","Kotak","BOB","RBL",
    "Yes Bank","AU Bank","OneCard","HSBC","Federal","Citibank",
    "Amazon Pay","Paytm","PhonePe","GPay","Google Pay",
]

EMI_PATTERNS = [
    r'(?:no\s*cost\s*emi|0%?\s*emi)',
    r'emi\s*(?:starting|from|at)\s*(?:Rs\.?|₹)\s*[\d,]+',
    r'(?:\d+)\s*months?\s*(?:emi|no\s*cost)',
]

def extract_bank_offers(text: str) -> list[str]:
    offers = []
    seen_banks = set()
    for line in text.splitlines():
        line_clean = line.strip()
        if not line_clean or len(line_clean) < 8: continue
        line_lower = line_clean.lower()
        for bank in BANK_NAMES:
            if bank.lower() in line_lower and bank not in seen_banks:
                if any(kw in line_lower for kw in ["off","discount","cashback","instant","emi","credit","debit","card","pay","%","₹","rs"]):
                    ctx = re.sub(r'^[-*•\s]+', '', line_clean).strip()
                    if 8 < len(ctx) < 160:
                        offers.append(f"💳 {ctx}")
                        seen_banks.add(bank)
                        break
    for pat in EMI_PATTERNS:
        m = re.search(pat, text, re.I)
        if m:
            offers.append(f"📅 {m.group(0).strip()}")
            break
    coupon_m = re.search(r'(?:coupon|apply|use)\s+(?:discount|code|coupon)?\s*(?:of)?\s*(?:Rs\.?|₹)\s*([\d,]+)', text, re.I)
    if coupon_m:
        offers.append(f"🎟️ Coupon Discount: ₹{coupon_m.group(1)}")
    return offers[:4]

def extract_combo_info(text: str) -> str | None:
    patterns = [
        r'pack\s*(?:of|x)\s*(\d+)',
        r'(\d+)\s*(?:pcs?|pieces?|units?|bottles?|pairs?|tablets?|capsules?)',
        r'combo\s*(?:of|pack)?\s*(\d+)',
        r'set\s*of\s*(\d+)',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.I)
        if m and m.group(1):
            qty = int(m.group(1))
            if qty > 1: return f"Pack of {qty}"
    return None

def extract_coupon(text: str) -> str | None:
    for pat in [
        r'(?:code|coupon|promo|use|apply)[:\s]+([A-Z0-9]{4,20})',
        r'(?:code|coupon)\s*[:\-]\s*([A-Z0-9]{4,20})',
        r'\b([A-Z]{2,}[0-9]{2,}|[0-9]{2,}[A-Z]{2,})\b',
    ]:
        m = re.search(pat, text, re.I)
        if m:
            code = m.group(1).upper()
            if code not in {"HTTP","HTTPS","FLIPKART","AMAZON","MYNTRA","AJIO","MEESHO","NYKAA","APPLY","CODE","COUPON"}:
                return code
    return None

# ═══════════════════════════════════════════════════════════════════
#  FLASH SALE DETECTION
# ═══════════════════════════════════════════════════════════════════
FLASH_PATTERNS = [
    r'\d+\s*(?:hour|hr|hrs|hours?)\s*(?:left|only|deal|offer|remaining)',
    r'(?:today|tonight|midnight|12am|ends?)\s+only',
    r'(?:flash|lightning|limited\s*time?)\s+(?:sale|deal|offer)',
    r'only\s+\d+\s+(?:left|remaining|pieces?|units?)',
    r'(?:expires?|ending|valid\s+till?)\s+(?:today|tonight|soon|midnight)',
    r'(?:hurry|grab\s*fast|act\s*fast|last\s*chance)',
    r'(?:loot|steal|lowest|all[-]?time\s*low)',
]

def detect_flash_sale(text: str) -> str | None:
    for pat in FLASH_PATTERNS:
        m = re.search(pat, text, re.I)
        if m: return m.group(0).strip()
    return None

# ═══════════════════════════════════════════════════════════════════
#  PRODUCT NAME EXTRACTION
# ═══════════════════════════════════════════════════════════════════
def extract_product_name(text: str) -> str:
    m = re.match(r'^(.+?)\s*@\s*[\d,₹Rs\.]+', text.strip(), re.I)
    if m:
        name = m.group(1).strip()
        name = re.sub(r'^\d+\s*%\s*:\s*', '', name).strip()
        name = re.sub(r'^[^\w\u0900-\u097F]+', '', name).strip()
        if len(name) > 4: return name[:120]
    for line in text.splitlines():
        clean = re.sub(r'https?://\S+', '', line).strip()
        clean = re.sub(r'^[^\w\u0900-\u097F]+', '', clean).strip()
        if len(clean) > 8: return clean[:120]
    return ""

# ═══════════════════════════════════════════════════════════════════
#  TEXT / URL HELPERS
# ═══════════════════════════════════════════════════════════════════
def extract_urls(text: str) -> list[str]:
    return re.findall(r'https?://[^\s\)\]\>\"\' ]+', text)

def extract_asin(url: str) -> str | None:
    m = re.search(r'/(?:dp|gp/product|ASIN)/([A-Z0-9]{10})', url)
    return m.group(1) if m else None

def extract_flipkart_pid(url: str) -> str | None:
    m = re.search(r'/p/([a-z0-9]+)', url, re.I)
    return m.group(1) if m else None

def normalize(text: str) -> str:
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip().lower()

def url_fp(url: str) -> str:
    try:
        p = urlparse(url)
        return f"{p.scheme}://{p.netloc.lower()}{p.path.rstrip('/')}"
    except: return url

def is_short(url: str) -> bool:
    try: return urlparse(url).netloc.lower().lstrip("www.") in SHORT_LINK_DOMAINS
    except: return False

def strip_tracking(url: str) -> str:
    try:
        p = urlparse(url)
        params = {k: v for k, v in parse_qs(p.query, keep_blank_values=True).items() if k.lower() not in TRACKING_PARAMS}
        return urlunparse(p._replace(query=urlencode(sorted(params.items()), doseq=True), fragment=""))
    except: return url

def _is_amazon_url(url: str) -> bool:
    try:
        domain = urlparse(url).netloc.lower().lstrip("www.")
        return domain in AMAZON_DOMAINS or any(domain.endswith("."+d) for d in AMAZON_DOMAINS)
    except: return False

# ═══════════════════════════════════════════════════════════════════
#  URL EXPANSION
# ═══════════════════════════════════════════════════════════════════
async def expand_url(session: aiohttp.ClientSession, url: str) -> str:
    cur = url
    visited: set[str] = set()
    hdrs = {"User-Agent": "Mozilla/5.0 (Android 13) AppleWebKit/537.36"}
    for _ in range(10):
        if cur in visited: break
        visited.add(cur)
        try:
            async with session.head(cur, headers=hdrs, allow_redirects=False, timeout=aiohttp.ClientTimeout(total=8)) as r:
                loc = r.headers.get("Location","")
                if r.status in (301,302,303,307,308) and loc:
                    cur = loc if loc.startswith("http") else f"{urlparse(cur).scheme}://{urlparse(cur).netloc}{loc}"
                else: break
        except:
            try:
                async with session.get(cur, headers=hdrs, allow_redirects=True, timeout=aiohttp.ClientTimeout(total=10)) as r:
                    cur = str(r.url); break
            except: break
    return strip_tracking(cur)

async def expand_all_urls(urls: list[str]) -> dict[str, str]:
    if not urls: return {}
    async with aiohttp.ClientSession() as session:
        async def one(u: str):
            if is_short(u):
                e = await expand_url(session, u)
                if e != u: log.info(f"  🔗 {u[:45]} → {e[:55]}")
                return u, e
            return u, strip_tracking(u)
        res = await asyncio.gather(*[one(u) for u in urls], return_exceptions=True)
    return {u: (r[1] if not isinstance(r, Exception) else u) for u, r in zip(urls, res)}

# ═══════════════════════════════════════════════════════════════════
#  AFFILIATE LINKS
# ═══════════════════════════════════════════════════════════════════
EK_API_URL = "https://ekaro-api.affiliaters.in/api/converter/public"

def apply_amazon_tag(url: str) -> str:
    if not _is_amazon_url(url): return url
    try:
        p = urlparse(url)
        params = parse_qs(p.query, keep_blank_values=True)
        clean_keys = {"tag","linkCode","linkcode","camp","creative","creativeASIN","ref_","ref","psc","smid","th","pf_rd_p","pf_rd_r","pd_rd_wg","pd_rd_r","pd_rd_w","pd_rd_i","ascsubtag"}
        params = {k: v for k, v in params.items() if k.lower() not in clean_keys and k.lower() not in TRACKING_PARAMS}
        params["tag"] = [AMAZON_AFFL_TAG]; params["linkCode"] = ["ll2"]
        new_url = urlunparse(p._replace(query=urlencode({k: v[0] for k, v in sorted(params.items())}), fragment=""))
        log.info(f"  🏷️ Amazon tag → ...{new_url[-55:]}")
        return new_url
    except Exception as e:
        log.debug(f"Amazon tag error: {e}"); return url

async def earnkaro_convert_text(text: str) -> str | None:
    if not EARNKARO_TOKEN: return None
    hdrs = {"Authorization": f"Bearer {EARNKARO_TOKEN}", "Content-Type": "application/json", "Accept": "application/json"}
    payload = {"deal": text, "convert_option": "convert_only"}
    for attempt in range(2):
        try:
            async with aiohttp.ClientSession() as s:
                async with s.post(EK_API_URL, json=payload, headers=hdrs, timeout=aiohttp.ClientTimeout(total=30)) as r:
                    raw = await r.text()
                    log.info(f"  EK API → {r.status}: {raw[:80]}")
                    if r.status == 401: return None
                    if r.status == 429:
                        if attempt == 0: await asyncio.sleep(61); continue
                        return None
                    if r.status != 200: return None
                    try: d = json.loads(raw)
                    except: return None
                    if d.get("success") == 1:
                        converted = d.get("data","")
                        if converted and converted != text:
                            log.info("  💰 EarnKaro ✓")
                            return converted
                        return None
                    log.warning(f"  ⚠️ EarnKaro: {d.get('message','unknown')}"); return None
        except Exception as e:
            log.warning(f"  ⚠️ EK EXCEPTION {type(e).__name__}: {e}"); return None
    return None

async def apply_affiliate_to_text(original_text: str, expanded_map: dict) -> tuple[str, bool]:
    if not original_text: return original_text, False
    if EARNKARO_TOKEN:
        log.info("  📤 Sending to EarnKaro...")
        ek_result = await earnkaro_convert_text(original_text)
        if ek_result: return ek_result, True
        log.warning("  ❗ EarnKaro failed — fallback")
    if not expanded_map: return original_text, False
    fallback_text = original_text
    amazon_applied = False
    for orig_url, exp_url in expanded_map.items():
        if _is_amazon_url(exp_url):
            tagged = apply_amazon_tag(exp_url)
            fallback_text = fallback_text.replace(orig_url, tagged)
            if tagged != orig_url: amazon_applied = True
        elif orig_url != exp_url:
            fallback_text = fallback_text.replace(orig_url, exp_url)
    return fallback_text, amazon_applied

# ═══════════════════════════════════════════════════════════════════
#  PRICE SCRAPING FROM PRODUCT URL
# ═══════════════════════════════════════════════════════════════════
_BROWSER_HDRS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "max-age=0",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "DNT": "1",
}

async def scrape_price_from_url(url: str) -> dict:
    result = {"sale": None, "mrp": None, "discount_pct": None, "product_name": None}
    try:
        jar = aiohttp.CookieJar()
        connector = aiohttp.TCPConnector(ssl=True)
        async with aiohttp.ClientSession(connector=connector, cookie_jar=jar, headers=_BROWSER_HDRS) as s:
            is_amazon   = "amazon" in url.lower() or "amzn" in url.lower()
            is_flipkart = "flipkart" in url.lower() or "fkrt" in url.lower()
            if is_amazon:
                try:
                    async with s.get("https://www.amazon.in", timeout=aiohttp.ClientTimeout(total=8)): pass
                except: pass
                await asyncio.sleep(0.3)
            elif is_flipkart:
                try:
                    async with s.get("https://www.flipkart.com", timeout=aiohttp.ClientTimeout(total=8)): pass
                except: pass
                await asyncio.sleep(0.3)
            async with s.get(url, allow_redirects=True, timeout=aiohttp.ClientTimeout(total=20)) as r:
                if r.status != 200: return result
                final_url = str(r.url).lower()
                html = await r.text()
                if len(html) < 8000: return result
                for pat in [
                    r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']',
                    r'content=["\']([^"\']+)["\'][^>]+property=["\']og:title["\']',
                ]:
                    m = re.search(pat, html, re.I)
                    if m: result["product_name"] = m.group(1).strip()[:120]; break
                if not result["product_name"]:
                    m = re.search(r'<title>(.+?)</title>', html, re.I)
                    if m:
                        title = m.group(1).strip()
                        for rm in [r'\s*[:\-|]\s*Amazon\.in.*$', r'\s*[:\-|]\s*Flipkart\.com.*$', r'\s*[-|]\s*Online Shopping.*$', r'\s*Buy\s*$']:
                            title = re.sub(rm, '', title, flags=re.I).strip()
                        if 5 < len(title) < 150: result["product_name"] = title[:120]
                if is_amazon or "amazon" in final_url:
                    for pat in [
                        r'"priceAmount"\s*:\s*"?([\d,.]+)"?',
                        r'"priceToPay"[^}]*?"value"\s*:\s*"?([\d,.]+)"?',
                        r'a-price-whole["\'"][^>]*>([\d,]+)',
                        r'priceblock_dealprice["\'"][^>]*>\s*(?:₹|Rs\.?)\s*([\d,]+)',
                        r'>\s*₹\s*([\d,]+(?:\.\d+)?)\s*<',
                    ]:
                        m = re.search(pat, html, re.I | re.DOTALL)
                        if m and not result["sale"]:
                            try:
                                v = float(m.group(1).replace(",",""))
                                if 1 < v < 500000: result["sale"] = v
                            except: pass
                    for pat in [
                        r'"listPrice"\s*:\s*"?([\d,.]+)"?',
                        r'a-text-price[^>]*>\s*(?:₹|Rs\.?)\s*([\d,]+)',
                        r'a-text-strike[^>]*>\s*(?:₹|Rs\.?)\s*([\d,]+)',
                    ]:
                        m = re.search(pat, html, re.I | re.DOTALL)
                        if m and not result["mrp"]:
                            try: result["mrp"] = float(m.group(1).replace(",",""))
                            except: pass
                    m = re.search(r'savingsPercentage.*?(\d{1,2})\s*%', html, re.I)
                    if not m: m = re.search(r'-(\d{1,2})%', html)
                    if m:
                        try: result["discount_pct"] = int(m.group(1))
                        except: pass
                elif is_flipkart or "flipkart" in final_url:
                    for pat in [r'"sellingPrice"\s*:\s*"?(\d+)"?', r'Nx9bqj[^>]*>\s*₹\s*([\d,]+)', r'_30jeq3["\'"][^>]*>\s*(?:₹|Rs\.?)\s*([\d,]+)']:
                        m = re.search(pat, html, re.I)
                        if m and not result["sale"]:
                            try:
                                v = float(m.group(1).replace(",",""))
                                if 1 < v < 500000: result["sale"] = v
                            except: pass
                    for pat in [r'"mrp"\s*:\s*"?(\d+)"?', r'_3I9_wc["\'"][^>]*>\s*(?:₹|Rs\.?)\s*([\d,]+)']:
                        m = re.search(pat, html, re.I)
                        if m and not result["mrp"]:
                            try: result["mrp"] = float(m.group(1).replace(",",""))
                            except: pass
                    m = re.search(r'(\d{1,2})%\s*off', html, re.I)
                    if m:
                        try: result["discount_pct"] = int(m.group(1))
                        except: pass
                for jm in re.finditer(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.+?)</script>', html, re.I | re.DOTALL):
                    try:
                        ld = json.loads(jm.group(1))
                        items = ld if isinstance(ld, list) else [ld]
                        for item in items:
                            offers = item.get("offers", item.get("Offers", {}))
                            if isinstance(offers, list): offers = offers[0] if offers else {}
                            price = offers.get("price") or offers.get("lowPrice")
                            if price and not result["sale"]:
                                try: result["sale"] = float(str(price).replace(",",""))
                                except: pass
                            if not result["product_name"]:
                                n = item.get("name","")
                                if n: result["product_name"] = str(n)[:120]
                    except: pass
                if not result["sale"]:
                    for pat in [r'"price"\s*:\s*"?([\d,.]+)"?', r'data-price=["\']([\d,.]+)["\']', r'itemprop=["\'"]price["\'"][^>]*content=["\']([\d,.]+)["\']']:
                        m = re.search(pat, html, re.I)
                        if m:
                            try: result["sale"] = float(m.group(1).replace(",","")); break
                            except: pass
                if result["mrp"] and result["sale"] and not result["discount_pct"]:
                    if result["mrp"] > result["sale"]:
                        result["discount_pct"] = round((1 - result["sale"] / result["mrp"]) * 100)
                if result["sale"]:
                    log.info(f"    💲 Scraped: ₹{result['sale']:,.0f}" + (f" {result['discount_pct']}% off" if result["discount_pct"] else ""))
    except Exception as e:
        log.debug(f"Price scrape error ({url[:40]}): {e}")
    return result

async def scrape_prices_from_urls(exp_urls: list[str]) -> dict:
    for url in exp_urls[:3]:
        domain = urlparse(url).netloc.lower()
        if any(skip in domain for skip in ["bit.ly","earnkaro","ekaro","clnk.in","awin","t.co"]): continue
        try:
            result = await asyncio.wait_for(scrape_price_from_url(url), timeout=18)
            if result.get("sale"): return result
        except asyncio.TimeoutError: log.debug(f"Price scrape timeout: {url[:50]}")
        except Exception as e: log.debug(f"Price scrape fail: {e}")
    return {"sale": None, "mrp": None, "discount_pct": None, "product_name": None}

# ═══════════════════════════════════════════════════════════════════
#  CHANNEL QUALITY TRACKER
# ═══════════════════════════════════════════════════════════════════
CHANNEL_QUALITY: dict[str, list] = {}

def update_channel_quality(channel: str, score: int):
    CHANNEL_QUALITY.setdefault(channel, [])
    CHANNEL_QUALITY[channel] = (CHANNEL_QUALITY[channel] + [score])[-50:]

def channel_avg_score(channel: str) -> float | None:
    scores = CHANNEL_QUALITY.get(channel, [])
    return round(sum(scores)/len(scores), 1) if len(scores) >= 5 else None

# ═══════════════════════════════════════════════════════════════════
#  PERSISTENCE
# ═══════════════════════════════════════════════════════════════════
def load_json(path: Path, default):
    if path.exists():
        try: return json.loads(path.read_text(encoding="utf-8"))
        except: pass
    return default

def save_json(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def load_seen() -> dict: return load_json(SEEN_IDS_FILE, {})
def save_seen(d: dict): save_json(SEEN_IDS_FILE, {ch: ids[-500:] for ch, ids in d.items()})
def load_deal_cache() -> dict: return load_json(DEAL_CACHE_FILE, {})
def save_deal_cache(d: dict): save_json(DEAL_CACHE_FILE, d)

def prune_deal_cache(cache: dict) -> dict:
    cutoff = time.time() - 7 * 86400
    return {k: (v if isinstance(v, dict) else {"price": v, "ts": time.time()}) for k, v in cache.items() if (v.get("ts", 0) if isinstance(v, dict) else time.time()) > cutoff}

def load_stats() -> dict:
    today = datetime.now().strftime("%Y-%m-%d")
    s = load_json(STATS_FILE, {})
    if s.get("date") != today:
        s = {"date": today, "posted": 0, "checked": 0, "dup": 0, "unrated": 0, "no_link": 0, "price_drops": 0, "affiliate": 0, "scam": 0, "auto_posted": 0}
    return s

def save_stats(s: dict): save_json(STATS_FILE, s)
def load_last_cycle() -> dict: return load_json(LAST_CYCLE_FILE, {"stats_day": "", "trending_week": ""})
def save_last_cycle(d: dict): save_json(LAST_CYCLE_FILE, d)

def update_trending(category: str):
    data = load_json(TRENDING_FILE, {})
    today = datetime.now().strftime("%Y-%m-%d")
    if today not in data: data[today] = {}
    data[today][category] = data[today].get(category, 0) + 1
    cutoff = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    save_json(TRENDING_FILE, {d: v for d, v in data.items() if d >= cutoff})

# ═══════════════════════════════════════════════════════════════════
#  DUPLICATE DETECTION
# ═══════════════════════════════════════════════════════════════════
class DuplicateTracker:
    def __init__(self, hrs: int = 24):
        self.hrs = hrs
        self._s: list[dict] = []

    def _prune(self):
        c = time.time() - self.hrs * 3600
        self._s = [d for d in self._s if d["ts"] > c]

    def check(self, asin: str | None, fps: list, name: str, text: str) -> tuple[bool, str]:
        self._prune()
        nt, nn = normalize(text), normalize(name)
        for it in self._s:
            if asin and it.get("asin") == asin: return True, f"ASIN {asin}"
            for fp in fps:
                if fp and fp in it.get("fps", []): return True, "same URL"
            if nn and it.get("name") and sim(nn, it["name"]) >= DUP_NAME_SIM: return True, f"name {int(sim(nn, it['name'])*100)}%"
            if nt and it.get("text") and sim(nt, it["text"]) >= DUP_TEXT_SIM: return True, f"text {int(sim(nt, it['text'])*100)}%"
        return False, ""

    def add(self, asin: str | None, fps: list, name: str, text: str, price: float | None):
        self._prune()
        self._s.append({"asin": asin, "fps": fps, "name": normalize(name), "text": normalize(text), "price": price, "ts": time.time()})

    def last_price(self, asin: str | None, fps: list) -> float | None:
        for it in reversed(self._s):
            if asin and it.get("asin") == asin: return it.get("price")
            for fp in fps:
                if fp and fp in it.get("fps", []): return it.get("price")
        return None

dup = DuplicateTracker(hrs=48)

# ═══════════════════════════════════════════════════════════════════
#  PRICE HISTORY  (BuyHatke + CamelCamelCamel)
# ═══════════════════════════════════════════════════════════════════
async def check_buyhatke(url: str) -> dict | None:
    bh_url = f"https://buyhatke.com/price-history?url={quote_plus(url)}"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120", "Accept": "text/html,*/*;q=0.8", "Accept-Language": "en-IN,en;q=0.9", "Referer": "https://buyhatke.com/"}
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get(bh_url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as r:
                if r.status != 200: return None
                html = await r.text()
                found = {}
                for pat, key in [
                    (r'"lowestPrice"\s*:\s*"?([\d.]+)"?', "low"),
                    (r'"lowest_price"\s*:\s*"?([\d.]+)"?', "low"),
                    (r'"averagePrice"\s*:\s*"?([\d.]+)"?', "avg"),
                    (r'"avg_price"\s*:\s*"?([\d.]+)"?', "avg"),
                    (r'"highestPrice"\s*:\s*"?([\d.]+)"?', "high"),
                ]:
                    if key not in found:
                        m = re.search(pat, html, re.I)
                        if m:
                            try: found[key] = float(m.group(1))
                            except: pass
                if found.get("low") or found.get("avg"):
                    return {"source": "BuyHatke", "low": found.get("low"), "avg": found.get("avg"), "high": found.get("high"), "url": bh_url}
    except Exception as e: log.debug(f"BuyHatke: {e}")
    return None

async def check_camelcamelcamel(asin: str) -> dict | None:
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get(f"https://api.camelcamelcamel.com/v1/products/{asin}?country=in", headers={"User-Agent": "TelegramDealBot/8.0"}, timeout=aiohttp.ClientTimeout(total=12)) as r:
                if r.status == 200:
                    az = ((await r.json()).get("product", {}).get("prices", {}).get("amazon", {}))
                    if az: return {"source": "CamelCamelCamel", "low": az.get("lowest"), "high": az.get("highest"), "avg": az.get("avg90"), "url": f"https://camelcamelcamel.com/product/{asin}"}
    except Exception as e: log.debug(f"CCC: {e}")
    return None

async def get_price_history(exp_urls: list[str]) -> dict:
    empty = {"found": False, "primary": None, "fallback": None, "summary": ""}
    if not exp_urls: return empty
    result = {**empty}
    tasks = []
    for url in exp_urls[:3]:
        asin = extract_asin(url)
        tasks.append(("bh", check_buyhatke(url)))
        if asin: tasks.append(("ccc", check_camelcamelcamel(asin)))
    done = await asyncio.gather(*[t[1] for t in tasks], return_exceptions=True)
    for (lbl, _), res in zip(tasks, done):
        if isinstance(res, Exception) or not res: continue
        result["found"] = True
        if lbl == "bh"  and not result["primary"]:  result["primary"]  = res
        if lbl == "ccc" and not result["fallback"]: result["fallback"] = res
    ph = result["primary"] or result["fallback"]
    fb = result["fallback"] if result["primary"] else None
    lines = []
    if ph:
        parts = []
        if ph.get("avg"):  parts.append(f"avg ₹{ph['avg']:,.0f}")
        if ph.get("low"):  parts.append(f"low ₹{ph['low']:,.0f}")
        if ph.get("high"): parts.append(f"high ₹{ph['high']:,.0f}")
        if parts: lines.append(f"📊 *{ph['source']}:* {' | '.join(parts)}")
        if ph.get("url"): lines.append(f"   [📈 View chart]({ph['url']})")
    if fb and fb.get("source") != (ph or {}).get("source"):
        parts2 = []
        if fb.get("avg"): parts2.append(f"avg ₹{fb['avg']:,.0f}")
        if fb.get("low"): parts2.append(f"low ₹{fb['low']:,.0f}")
        if parts2: lines.append(f"📊 *{fb['source']}:* {' | '.join(parts2)}")
    result["summary"] = "\n".join(lines)
    return result

def price_verdict(sale_price: float | None, history: dict) -> str:
    if not sale_price or not history["found"]: return ""
    ph = history.get("primary") or history.get("fallback")
    if not ph: return ""
    avg = ph.get("avg"); low = ph.get("low")
    if not avg: return ""
    pct = round((1 - sale_price / avg) * 100)
    if low and sale_price <= low * 1.02: return f"🏆 *ALL-TIME LOW!* ({pct}% below avg)"
    if pct >= 30: return f"🔥 *Exceptional —* {pct}% below avg!"
    if pct >= 15: return f"✅ *Good deal —* {pct}% below avg"
    if pct >= 5:  return f"🟡 *Slight saving —* {pct}% below avg"
    if pct < 0:   return f"🔴 *Overpriced —* {abs(pct)}% ABOVE avg!"
    return              f"😐 *Around average* ({pct}% off avg)"

# ═══════════════════════════════════════════════════════════════════
#  AI RATING
# ═══════════════════════════════════════════════════════════════════
RATING_PROMPT = """You are a sharp Indian deal analyst. Analyze this Telegram deal post.
Channel: {channel}

MESSAGE:
{text}

EXTRACTED DATA:
- MRP: {mrp}
- Sale price: {sale}
- Discount: {disc}
- Coupon code: {coupon}
- Platform: {platform}
- Category: {category}
{price_history}

Respond ONLY with valid JSON (no markdown):
{{"score":<1-10>,"verdict":"<GREAT DEAL|GOOD DEAL|AVERAGE|POOR DEAL|SCAM|SPAM>",
"reason":"<one punchy sentence>","is_spam":<true|false>,
"has_suspicious_link":<true|false>,"product_name":"<clean name or empty>",
"hashtags":["tag1","tag2","tag3"]}}

Scoring: 10=all-time low, 9=30%+ off with history, 8=15-30% below avg,
7=5-15% below avg, 6=average, 5=minor, 4=above avg, 3=misleading, 2=suspicious, 1=scam"""

def _build_rating_prompt(text, channel, prices, coupon, platforms, price_ctx, category):
    return RATING_PROMPT.format(
        channel=channel, text=text[:2000],
        mrp=f"₹{prices['mrp']:,.0f}" if prices.get("mrp") else "unknown",
        sale=f"₹{prices['sale']:,.0f}" if prices.get("sale") else "unknown",
        disc=f"{prices['discount_pct']}%" if prices.get("discount_pct") else "unknown",
        coupon=coupon or "none",
        platform=", ".join(platforms) if platforms else "unknown",
        category=category,
        price_history=f"\nPRICE HISTORY:\n{price_ctx}" if price_ctx else "",
    )

def _parse_json(raw: str) -> dict:
    clean = re.sub(r"```json|```", "", raw).strip()
    m = re.search(r'\{.*\}', clean, re.DOTALL)
    if m: clean = m.group()
    return json.loads(clean)

async def _call_ai_text(url: str, headers: dict, payload: dict, name: str) -> str | None:
    try:
        async with aiohttp.ClientSession() as s:
            async with s.post(url, headers=headers, json=payload, timeout=aiohttp.ClientTimeout(total=20)) as r:
                if r.status == 429:
                    await asyncio.sleep(random.uniform(2, 6))
                    return None
                if r.status != 200: return None
                return (await r.json())["choices"][0]["message"]["content"]
    except Exception as e:
        log.debug(f"{name}: {e}")
        return None

async def _cerebras(prompt: str) -> dict | None:
    if not CEREBRAS_KEY: return None
    for model in ["llama-3.3-70b", "llama3.1-8b"]:
        try:
            async with aiohttp.ClientSession() as s:
                async with s.post("https://api.cerebras.ai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {CEREBRAS_KEY}", "Content-Type": "application/json"},
                    json={"model": model, "max_tokens": 350, "temperature": 0.1, "messages": [{"role": "user", "content": prompt}]},
                    timeout=aiohttp.ClientTimeout(total=15)) as r:
                    if r.status == 200:
                        res = _parse_json((await r.json())["choices"][0]["message"]["content"])
                        log.info(f"    🤖 Cerebras ({model}) ✓")
                        return res
        except Exception as e: log.debug(f"Cerebras({model}): {e}")
    return None

async def _groq(prompt: str) -> dict | None:
    for _ in range(len(GROQ_KEYS) or 1):
        key = next_groq()
        if not key: return None
        try:
            async with aiohttp.ClientSession() as s:
                async with s.post("https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                    json={"model": "llama-3.3-70b-versatile", "max_tokens": 350, "temperature": 0.1, "messages": [{"role": "user", "content": prompt}]},
                    timeout=aiohttp.ClientTimeout(total=20)) as r:
                    if r.status == 429: continue
                    if r.status != 200: continue
                    res = _parse_json((await r.json())["choices"][0]["message"]["content"])
                    log.info("    🤖 Groq ✓")
                    return res
        except Exception as e: log.debug(f"Groq: {e}"); continue
    return None

async def _gemini(prompt: str, img64: str | None = None) -> dict | None:
    for _ in range(len(GEMINI_KEYS) or 1):
        key = next_gemini()
        if not key: return None
        parts = []
        if img64: parts.append({"inline_data": {"mime_type": "image/jpeg", "data": img64}})
        parts.append({"text": prompt})
        for model in ["gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                async with aiohttp.ClientSession() as s:
                    async with s.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
                        json={"contents": [{"parts": parts}], "generationConfig": {"maxOutputTokens": 350, "temperature": 0.1}},
                        timeout=aiohttp.ClientTimeout(total=20)) as r:
                        if r.status in (429, 503): continue
                        if r.status != 200: continue
                        d = await r.json()
                        res = _parse_json(d["candidates"][0]["content"]["parts"][0]["text"])
                        log.info(f"    🤖 Gemini ({model}) ✓")
                        return res
            except Exception as e: log.debug(f"Gemini({model}): {e}")
    return None

async def _sambanova(prompt: str) -> dict | None:
    if not SAMBANOVA_KEY: return None
    try:
        async with aiohttp.ClientSession() as s:
            async with s.post("https://api.sambanova.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {SAMBANOVA_KEY}", "Content-Type": "application/json"},
                json={"model": "Meta-Llama-3.3-70B-Instruct", "max_tokens": 350, "temperature": 0.1, "messages": [{"role": "user", "content": prompt}]},
                timeout=aiohttp.ClientTimeout(total=20)) as r:
                if r.status != 200: return None
                res = _parse_json((await r.json())["choices"][0]["message"]["content"])
                log.info("    🤖 Sambanova ✓"); return res
    except Exception as e: log.debug(f"Sambanova: {e}")
    return None

async def _together(prompt: str) -> dict | None:
    if not TOGETHER_KEY: return None
    try:
        async with aiohttp.ClientSession() as s:
            async with s.post("https://api.together.xyz/v1/chat/completions",
                headers={"Authorization": f"Bearer {TOGETHER_KEY}", "Content-Type": "application/json"},
                json={"model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", "max_tokens": 350, "temperature": 0.1, "messages": [{"role": "user", "content": prompt}]},
                timeout=aiohttp.ClientTimeout(total=20)) as r:
                if r.status != 200: return None
                res = _parse_json((await r.json())["choices"][0]["message"]["content"])
                log.info("    🤖 Together ✓"); return res
    except Exception as e: log.debug(f"Together: {e}")
    return None

async def _cohere(prompt: str) -> dict | None:
    if not COHERE_KEY: return None
    try:
        async with aiohttp.ClientSession() as s:
            async with s.post("https://api.cohere.com/v2/chat",
                headers={"Authorization": f"Bearer {COHERE_KEY}", "Content-Type": "application/json"},
                json={"model": "command-r", "max_tokens": 350, "temperature": 0.1, "messages": [{"role": "user", "content": prompt}]},
                timeout=aiohttp.ClientTimeout(total=20)) as r:
                if r.status != 200: return None
                res = _parse_json((await r.json())["message"]["content"][0]["text"])
                log.info("    🤖 Cohere ✓"); return res
    except Exception as e: log.debug(f"Cohere: {e}")
    return None

async def _openrouter(prompt: str) -> dict | None:
    if not OPENROUTER_KEY: return None
    for model in ["meta-llama/llama-3.1-8b-instruct:free", "google/gemma-2-9b-it:free", "mistralai/mistral-7b-instruct:free"]:
        try:
            async with aiohttp.ClientSession() as s:
                async with s.post("https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {OPENROUTER_KEY}", "Content-Type": "application/json", "HTTP-Referer": "https://t.me", "X-Title": "DealBot"},
                    json={"model": model, "max_tokens": 350, "temperature": 0.1, "messages": [{"role": "user", "content": prompt}]},
                    timeout=aiohttp.ClientTimeout(total=20)) as r:
                    if r.status == 200:
                        res = _parse_json((await r.json())["choices"][0]["message"]["content"])
                        log.info("    🤖 OpenRouter ✓"); return res
        except Exception as e: log.debug(f"OpenRouter: {e}")
    return None

async def _mistral(prompt: str) -> dict | None:
    if not MISTRAL_KEY: return None
    try:
        async with aiohttp.ClientSession() as s:
            async with s.post("https://api.mistral.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {MISTRAL_KEY}", "Content-Type": "application/json"},
                json={"model": "mistral-small-latest", "max_tokens": 350, "temperature": 0.1, "messages": [{"role": "user", "content": prompt}]},
                timeout=aiohttp.ClientTimeout(total=20)) as r:
                if r.status != 200: return None
                res = _parse_json((await r.json())["choices"][0]["message"]["content"])
                log.info("    🤖 Mistral ✓"); return res
    except Exception as e: log.debug(f"Mistral: {e}")
    return None

async def rate_deal(text, img64, channel, prices, coupon, platforms, price_ctx, category) -> dict | None:
    prompt = _build_rating_prompt(text, channel, prices, coupon, platforms, price_ctx, category)
    ai_chain = [
        lambda: _cerebras(prompt), lambda: _groq(prompt), lambda: _gemini(prompt, img64),
        lambda: _sambanova(prompt), lambda: _together(prompt), lambda: _cohere(prompt),
        lambda: _openrouter(prompt), lambda: _mistral(prompt),
    ]
    for attempt in range(3):
        if attempt > 0:
            log.info(f"    🔄 AI retry #{attempt} in {attempt*5}s...")
            await asyncio.sleep(attempt * 5)
        for fn in ai_chain:
            try:
                res = await fn()
                if res: return res
            except Exception: pass
    log.warning("    ⚠️ All AIs failed — paste as-is")
    return None

# ═══════════════════════════════════════════════════════════════════
#  ██████╗ ██████╗  ██████╗      ██████╗ ██████╗  █████╗ ██████╗ ███████╗
#  ██╔══██╗██╔══██╗██╔═══██╗    ██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔════╝
#  ██████╔╝██████╔╝██║   ██║    ██║  ███╗██████╔╝███████║██║  ██║█████╗
#  ██╔═══╝ ██╔══██╗██║   ██║    ██║   ██║██╔══██╗██╔══██║██║  ██║██╔══╝
#  ██║     ██║  ██║╚██████╔╝    ╚██████╔╝██║  ██║██║  ██║██████╔╝███████╗
#  PROFESSIONAL CLEAN FORMAT PROMPT  (v8 — 20 strict rules, 8 examples)
# ═══════════════════════════════════════════════════════════════════
CLEAN_FORMAT_PROMPT = """You are the post formatter for @dealsforindiachannel, a premium Indian deals Telegram channel with 50,000+ subscribers. Your job is to turn raw deal data into a clean, professional, copy-paste-ready post.

══════════════════════════════════
INPUT DATA
══════════════════════════════════
PRODUCT NAME : {prod_name}
SALE PRICE   : {sale_price}
MRP          : {mrp_price}
DISCOUNT     : {discount}
PLATFORM     : {platform}
COUPON CODE  : {coupon}
BANK OFFERS  : {bank_offers}
FLASH SALE   : {flash}
COMBO/PACK   : {combo}
CATEGORY     : {category}

ALL AFFILIATE LINKS (copy every single one verbatim — do NOT modify, shorten, or drop any):
{url_list}

ORIGINAL SOURCE TEXT (context only — do not copy-paste from this):
{original_text}

══════════════════════════════════
THE 20 RULES — FOLLOW ALL OF THEM
══════════════════════════════════

RULE 1 — TITLE FORMAT
Write the title as: ProductName @ ₹Price (Qualifier)
The qualifier in brackets must be one of:
  • (MRP ₹X) — when MRP is known and discount is under 40%
  • (X% off) — when discount is 40–59%
  • (Loot Deal) — when discount is 60–74%
  • (Steal Deal) — when discount is 75%+
  • (Final Price) — when a coupon or bank offer gives extra savings
  • (Flash Sale) — only if flash sale data is present
Never use more than one qualifier. Never put the channel name in the title.

RULE 2 — TITLE MUST BE CLEAN
No emojis in the title. No hashtags. No "Buy Now". No exclamation marks. No ALL CAPS.
Good: Boat Airdopes 141 @ ₹699 (MRP ₹1,799)
Bad:  🔥🔥 BOAT AIRDOPES 141 BUY NOW ONLY ₹699!! 🔥🔥

RULE 3 — PACK / COMBO
If it is a combo or pack deal, include it in the product name naturally.
Good: Vaseline Lip Balm (Pack of 3) @ ₹320 (MRP ₹446)
Bad:  Vaseline Lip Balm Pack of (Pack of 3) @ ₹320

RULE 4 — BLANK LINE AFTER TITLE
Always leave exactly one blank line between the title and the next section.

RULE 5 — LINKS
Place every affiliate link on its own line. If there is only one link, place it alone. If there are multiple links (e.g. different sizes/colors), add a short context label before each link using a dash:
  - Blue: https://amzn.to/...
  - Red: https://amzn.to/...
Never modify links. Never wrap links in parentheses or brackets.

RULE 6 — COUPON CODE
If a coupon code is provided, write it on its own line as:
Apply Coupon: CODENAME
Do not write "Use code", "Promo code", or wrap in backticks.

RULE 7 — BANK OFFERS
If bank offers are present, write each on its own line, keeping it short (max 60 chars).
Start each with a dash. Example:
- Extra 5% off with HDFC Credit Card
- No Cost EMI available from ₹299/month

RULE 8 — MRP LINE  (only when MRP not already in title)
If the MRP was not included in the title qualifier, add a line:
MRP: ₹X,XXX
This goes after the links section, separated by a blank line.

RULE 9 — PLATFORM LINE
If the platform is not obvious from the link, add a line at the end:
Available on: Platform Name

RULE 10 — EMOJI LIMIT
Maximum 2 emojis in the entire post. Prefer zero. Never put emojis mid-sentence.
Acceptable uses: a single emoji on the MRP line to indicate a price drop, or a ⚡ for flash sale.

RULE 11 — LENGTH
The complete post must be between 3 and 10 lines. Never exceed 10 lines.
If you have less information, write fewer lines. Do not pad with filler text.

RULE 12 — NO FILLER PHRASES
Never write any of these: "Grab it now", "Don't miss", "Limited stock", "Hurry up",
"Best deal", "Check it out", "Click below", "Visit link", "Shop now", "Amazing deal",
"Great offer", "Fantastic price", "Incredible savings", "You won't believe".

RULE 13 — NO HASHTAGS
Do not write any hashtags anywhere in the post. The channel adds them separately.

RULE 14 — NO SCORES OR RATINGS
Do not mention AI scores, deal ratings, or verdicts. The post is for subscribers, not analysis.

RULE 15 — NO SOURCE REFERENCES
Do not mention which Telegram channel the deal came from.

RULE 16 — NUMBERS FORMAT
Always format prices with commas: ₹1,299 not ₹1299. Always use ₹ symbol, not Rs or INR.

RULE 17 — PRODUCT NAME CLEANUP
Remove junk from the product name: no model numbers unless they matter, no color unless relevant, no size/variant unless it identifies the deal. Keep it under 60 characters.
Good: boAt Bassheads 100 Wired Earphones
Bad:  boAt Bassheads 100 in Ear Wired Earphones with Mic, 10mm Drivers, in-line mic (Black) [B07WKJD...]

RULE 18 — FLASH SALE  (only when flash data is present)
Add ⚡ Flash Sale at the very end as its own line. Never invent a flash sale if the data says "none".

RULE 19 — VALIDATION BEFORE OUTPUT
Before writing the final post, check:
  ✓ Does the post contain at least one URL from the URL list?
  ✓ Does the post contain the sale price?
  ✓ Is it 3–10 lines?
  ✓ Zero hashtags?
  ✓ Zero filler phrases?
If any check fails, rewrite. Only output the final passing version.

RULE 20 — OUTPUT FORMAT
Output ONLY the post text. No preamble like "Here is the post:" or "Sure!".
No markdown code fences. No JSON. Just the raw post text, ready to paste into Telegram.

══════════════════════════════════
8 WORKED EXAMPLES  (study the pattern)
══════════════════════════════════

EXAMPLE 1 — Simple Amazon deal with MRP:
boAt Airdopes 141 TWS Earbuds @ ₹699 (MRP ₹1,799)

https://amzn.to/3xYzAbC

EXAMPLE 2 — Coupon deal (Final Price):
Philips H4 LED Headlight Bulb (Set of 2) @ ₹299 (Final Price)

Apply Coupon: PHILIPS50

https://amzn.to/4mJkLpQ

EXAMPLE 3 — Bank offer deal:
Samsung 65" 4K QLED TV @ ₹54,990 (MRP ₹1,09,900)

- Extra 10% off with SBI Credit Card
- No Cost EMI from ₹4,583/month

https://www.flipkart.com/...

EXAMPLE 4 — Flash sale:
Realme Narzo 70 Pro 5G (8GB+128GB) @ ₹16,999 (MRP ₹24,999)

https://amzn.to/5nKoRtW

⚡ Flash Sale

EXAMPLE 5 — High discount (Loot Deal):
Puma Men's Running Shoes @ ₹899 (Loot Deal)

MRP: ₹3,999

https://www.myntra.com/...

EXAMPLE 6 — Multiple links (size variants):
Levi's 511 Slim Fit Jeans @ ₹1,299 (MRP ₹2,999)

- 28W: https://amzn.to/aaa
- 30W: https://amzn.to/bbb
- 32W: https://amzn.to/ccc

EXAMPLE 7 — Grocery / FMCG combo:
Tata Salt (Pack of 6 × 1kg) @ ₹132 (MRP ₹198)

https://www.bigbasket.com/...

EXAMPLE 8 — Flipkart deal with coupon + bank:
OnePlus Nord CE4 Lite (8GB+256GB) @ ₹17,499 (Final Price)

Apply Coupon: NORD500
- Extra 5% off with Axis Bank Credit Card

https://www.flipkart.com/...

══════════════════════════════════
NOW WRITE THE POST
══════════════════════════════════
Using the input data above and following all 20 rules, write the post now."""


def _build_clean_prompt(aff_text, prices, prod_name, category, platforms, coupon, bank_offers, combo_info, flash) -> str:
    all_urls = extract_urls(aff_text)
    sale = prices.get("sale"); mrp = prices.get("mrp"); disc = prices.get("discount_pct")
    platform = platforms[0] if platforms else ""
    display_name = prod_name or "Unknown Product"
    if combo_info and combo_info.lower() not in display_name.lower():
        display_name = f"{display_name} ({combo_info})"
    return CLEAN_FORMAT_PROMPT.format(
        prod_name=display_name,
        sale_price=f"₹{sale:,.0f}" if sale else "not found",
        mrp_price=f"₹{mrp:,.0f}" if mrp else "not found",
        discount=f"{disc}%" if disc else "not found",
        platform=platform or "Unknown",
        coupon=coupon or "none",
        bank_offers="\n".join(bank_offers) if bank_offers else "none",
        flash=flash or "none",
        combo=combo_info or "none",
        category=category,
        url_list="\n".join(all_urls) if all_urls else "none",
        original_text=aff_text[:600],
    )


def _validate_clean_output(result: str, aff_text: str) -> bool:
    """Return True if the AI output passes quality checks."""
    if not result or len(result.strip()) < 20:
        return False
    # Must contain at least one URL from the original
    original_urls = set(extract_urls(aff_text))
    result_urls   = set(extract_urls(result))
    if original_urls and not result_urls:
        log.warning("  ⚠️ Validation: AI dropped all URLs")
        return False
    # Must not be JSON or contain fences
    if result.strip().startswith("{") or "```" in result:
        log.warning("  ⚠️ Validation: AI returned JSON or code fence")
        return False
    # Reasonable length: 3 to 25 lines
    lines = [l for l in result.strip().splitlines() if l.strip()]
    if len(lines) < 2 or len(lines) > 25:
        log.warning(f"  ⚠️ Validation: bad line count ({len(lines)})")
        return False
    return True


async def _ai_clean_format(prompt: str) -> str | None:
    """Try AI providers for clean post text. Returns plain text."""
    providers = []
    if CEREBRAS_KEY:
        providers.append(("Cerebras", "https://api.cerebras.ai/v1/chat/completions",
            {"Authorization": f"Bearer {CEREBRAS_KEY}", "Content-Type": "application/json"},
            {"model": "llama-3.3-70b", "max_tokens": 600, "temperature": 0.15, "messages": [{"role": "user", "content": prompt}]}))
    key = next_groq()
    if key:
        providers.append(("Groq", "https://api.groq.com/openai/v1/chat/completions",
            {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            {"model": "llama-3.3-70b-versatile", "max_tokens": 600, "temperature": 0.15, "messages": [{"role": "user", "content": prompt}]}))
    gkey = next_gemini()
    if gkey:
        providers.append(("Gemini", None, None, None))
    if TOGETHER_KEY:
        providers.append(("Together", "https://api.together.xyz/v1/chat/completions",
            {"Authorization": f"Bearer {TOGETHER_KEY}", "Content-Type": "application/json"},
            {"model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", "max_tokens": 600, "temperature": 0.15, "messages": [{"role": "user", "content": prompt}]}))

    for name, url, headers, payload in providers:
        if name == "Gemini":
            try:
                async with aiohttp.ClientSession() as s:
                    async with s.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gkey}",
                        json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"maxOutputTokens": 600, "temperature": 0.15}},
                        timeout=aiohttp.ClientTimeout(total=20)) as r:
                        if r.status == 200:
                            d = await r.json()
                            result = d["candidates"][0]["content"]["parts"][0]["text"].strip()
                            log.info("  ✨ Clean format via Gemini ✓")
                            return result
            except Exception as e: log.debug(f"Clean format Gemini: {e}")
            continue
        try:
            async with aiohttp.ClientSession() as s:
                async with s.post(url, headers=headers, json=payload, timeout=aiohttp.ClientTimeout(total=20)) as r:
                    if r.status == 200:
                        result = (await r.json())["choices"][0]["message"]["content"].strip()
                        log.info(f"  ✨ Clean format via {name} ✓")
                        return result
        except Exception as e: log.debug(f"Clean format {name}: {e}")
    return None


def _manual_clean_format(aff_text, prices, prod_name, category, platforms, coupon, bank_offers, combo_info, flash) -> str:
    """Robust manual fallback — always produces valid output."""
    all_urls = extract_urls(aff_text)
    sale = prices.get("sale"); mrp = prices.get("mrp"); disc = prices.get("discount_pct")
    name = (prod_name or "Deal")[:80]
    if combo_info and combo_info.lower() not in name.lower():
        name = f"{name} ({combo_info})"
    lines = []
    if sale:
        if disc and disc >= 75:   qual = "(Steal Deal)"
        elif disc and disc >= 60: qual = "(Loot Deal)"
        elif coupon or bank_offers: qual = "(Final Price)"
        elif flash:               qual = "(Flash Sale)"
        elif mrp and mrp > sale:  qual = f"(MRP ₹{mrp:,.0f})"
        else:                     qual = ""
        title = f"{name} @ ₹{sale:,.0f} {qual}".strip()
    elif disc:
        title = f"{disc}% Off: {name}"
    else:
        title = name
    lines.append(title)
    lines.append("")
    offer_lines = []
    if coupon: offer_lines.append(f"Apply Coupon: {coupon}")
    for bo in bank_offers:
        clean_bo = re.sub(r'^[💳📅🎟️]\s*', '', bo).strip()
        offer_lines.append(f"- {clean_bo}")
    if offer_lines:
        for ol in offer_lines: lines.append(ol)
        lines.append("")
    if not all_urls:
        lines.append(aff_text[:300])
    elif len(all_urls) == 1:
        lines.append(all_urls[0])
    else:
        for url in all_urls:
            idx = aff_text.find(url)
            label = ""
            if idx > 0:
                before = aff_text[max(0, idx-60):idx].strip()
                label_parts = before.split('\n')
                raw_label = label_parts[-1].strip().rstrip(':').rstrip('→').strip()
                raw_label = re.sub(r'https?://\S+', '', raw_label).strip()
                raw_label = re.sub(r'^[-*•\s]+', '', raw_label).strip()
                if 3 < len(raw_label) < 40: label = raw_label
            lines.append(f"- {label}: {url}" if label else url)
    if flash: lines.append("\n⚡ Flash Sale")
    return "\n".join(lines)


async def generate_clean_post(aff_text, prices, prod_name, category, platforms, coupon, bank_offers, combo_info, flash) -> str:
    """Main entry. AI → validate → manual fallback. Never returns empty."""
    prompt = _build_clean_prompt(aff_text, prices, prod_name, category, platforms, coupon, bank_offers, combo_info, flash)
    try:
        ai_result = await asyncio.wait_for(_ai_clean_format(prompt), timeout=30)
        if ai_result and _validate_clean_output(ai_result, aff_text):
            # Ensure all original URLs survive
            original_urls = set(extract_urls(aff_text))
            result_urls   = set(extract_urls(ai_result))
            missing = original_urls - result_urls
            if missing:
                log.warning(f"  ⚠️ AI dropped {len(missing)} URL(s) — appending")
                ai_result += "\n\n" + "\n".join(missing)
            return ai_result
        elif ai_result:
            log.warning("  ⚠️ AI output failed validation — using manual fallback")
    except asyncio.TimeoutError:
        log.warning("  ⏱️ AI clean format timed out")
    except Exception as e:
        log.warning(f"  ⚠️ AI clean format error: {e}")
    log.info("  📝 Using manual clean format (fallback)")
    return _manual_clean_format(aff_text, prices, prod_name, category, platforms, coupon, bank_offers, combo_info, flash)

# ═══════════════════════════════════════════════════════════════════
#  PRODUCT IMAGE FETCHING
# ═══════════════════════════════════════════════════════════════════
async def fetch_amazon_image(asin: str) -> tuple:
    for img_url in [
        f"https://images-in.ssl-images-amazon.com/images/P/{asin}.01.L.jpg",
        f"https://images-in.ssl-images-amazon.com/images/P/{asin}.jpg",
        f"https://m.media-amazon.com/images/P/{asin}.jpg",
    ]:
        try:
            async with aiohttp.ClientSession() as s:
                async with s.get(img_url, timeout=aiohttp.ClientTimeout(total=10)) as r:
                    if r.status == 200:
                        data = await r.read()
                        if len(data) > 5000:
                            path = IMAGES_DIR / f"amz_{asin}.jpg"
                            path.write_bytes(data)
                            log.info("    🖼️ Amazon image ✓")
                            return path, base64.b64encode(data).decode()
        except Exception as e: log.debug(f"Amz img: {e}")
    return None, None

async def fetch_og_image(url: str, label: str = "product") -> tuple:
    try:
        hdrs = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Accept": "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Language": "en-IN,en;q=0.9"}
        async with aiohttp.ClientSession() as s:
            async with s.get(url, headers=hdrs, allow_redirects=True, timeout=aiohttp.ClientTimeout(total=12)) as r:
                if r.status != 200: return None, None
                html = await r.text()
                for pat in [
                    r'<meta\s+(?:property|name)=["\']og:image["\']\s+content=["\'"]([^"\']+)["\']',
                    r'content=["\'"]([^"\']+)["\']\s+(?:property|name)=["\']og:image["\']',
                    r'<meta\s+(?:property|name)=["\']twitter:image["\']\s+content=["\'"]([^"\']+)["\']',
                ]:
                    m = re.search(pat, html, re.I)
                    if m:
                        img_url = m.group(1)
                        if not img_url.startswith("http"):
                            base = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
                            img_url = base + img_url
                        async with s.get(img_url, timeout=aiohttp.ClientTimeout(total=10)) as ir:
                            if ir.status == 200:
                                data = await ir.read()
                                if len(data) > 5000:
                                    safe = re.sub(r'[^\w]', '_', urlparse(url).netloc)[:20]
                                    path = IMAGES_DIR / f"og_{safe}_{int(time.time())}.jpg"
                                    path.write_bytes(data)
                                    log.info(f"    🖼️ OG image ({label}) ✓")
                                    return path, base64.b64encode(data).decode()
    except Exception as e: log.debug(f"OG img ({label}): {e}")
    return None, None

async def download_image(client, message) -> tuple:
    try:
        if message.media and isinstance(message.media, (MessageMediaPhoto, MessageMediaDocument)):
            path = IMAGES_DIR / f"{message.chat_id}_{message.id}.jpg"
            await client.download_media(message, file=str(path))
            async with aiofiles.open(path, "rb") as f:
                raw = await f.read()
            return path, base64.b64encode(raw).decode()
    except Exception as e: log.warning(f"Image dl: {e}")
    return None, None

async def fetch_product_image(scraper, msg, exp_urls: list[str]) -> tuple:
    for url in exp_urls:
        asin = extract_asin(url)
        if asin:
            r = await fetch_amazon_image(asin)
            if r[0]: return r
    for url in exp_urls:
        if "flipkart.com" in url:
            r = await fetch_og_image(url, "flipkart")
            if r[0]: return r
    skip_domains = {"bit.ly","earnkaro","ekaro","clnk.in","awin","t.co","amzn.to","amzn.in","fkrt.it"}
    for url in exp_urls[:4]:
        domain = urlparse(url).netloc.lower()
        if any(d in domain for d in skip_domains): continue
        r = await fetch_og_image(url, label=domain)
        if r[0]: return r
    return await download_image(scraper, msg)

def cleanup_image(path):
    if path and path.exists():
        try: path.unlink()
        except: pass

# ═══════════════════════════════════════════════════════════════════
#  FORMAT POST  (for analytics output channel)
# ═══════════════════════════════════════════════════════════════════
def _se(s): return "🔥" if s >= 9 else "✅" if s >= 7 else "🟡" if s >= 5 else "🔴" if s >= 3 else "☠️"
def _ve(v): return {"GREAT DEAL": "🏆", "GOOD DEAL": "👍", "AVERAGE": "😐", "POOR DEAL": "👎", "SCAM": "🚨", "SPAM": "🗑️"}.get(v.upper(), "❓")
def chtag(ch): return f"#{re.sub(r'[^a-zA-Z0-9_]', '', ch.lstrip('@'))}"
def _platform_line(platforms): return " ".join(PLATFORM_BADGES.get(p, "🏪") + p for p in platforms[:3]) if platforms else ""

def _price_line(prices, price_drop_info):
    parts = []
    if prices.get("sale"): parts.append(f"₹{prices['sale']:,.0f}")
    if prices.get("mrp") and prices.get("sale") and prices["mrp"] != prices["sale"]: parts.append(f"~~₹{prices['mrp']:,.0f}~~")
    if prices.get("discount_pct"): parts.append(f"*{prices['discount_pct']}% off*")
    line = " | ".join(parts)
    if price_drop_info: line = f"🚨 *PRICE DROP!* {price_drop_info}\n" + line
    return line

def format_rated(channel, aff_text, rating, msg_link, price_history, prices, price_drop_info, platforms, aff_map, coupon, category, flash) -> str:
    score = rating.get("score", 5); verdict = rating.get("verdict", "UNKNOWN")
    reason = rating.get("reason", ""); is_spam = rating.get("is_spam", False)
    tags = rating.get("hashtags", []); ct = chtag(channel)
    aitags = " ".join(f"#{t.strip('#').replace(' ','_')}" for t in tags[:5])
    pl = _platform_line(platforms); pline = _price_line(prices, price_drop_info)
    coupon_line = f"\n🎟️ *USE CODE:* `{coupon}`" if coupon else ""
    flash_line  = f"\n⚡ *FLASH SALE:* _{flash}_" if flash else ""
    cat_line    = f"  {category}" if category != "🛍️ General" else ""
    ph_block = ""
    if price_history["found"] and price_history["summary"]:
        pv = price_verdict(prices.get("sale"), price_history)
        ph_block = f"\n\n💰 *Price History*\n{price_history['summary']}"
        if pv: ph_block += f"\n➡️ {pv}"
    all_links = extract_urls(aff_text)
    links_block = "\n".join(all_links) if all_links else ""
    aff_note = "\n💸 _(Profit links — supports this channel)_" if aff_map else ""
    return (
        f"{_se(score)} *{score}/10* {_ve(verdict)} *{verdict}*\n"
        + (f"🏪 {pl}{cat_line}\n" if pl else (f"{cat_line}\n" if cat_line.strip() else ""))
        + (f"💵 {pline}\n" if pline else "")
        + coupon_line + flash_line
        + f"\n📢 {ct}\n"
        + (f"{links_block}\n" if links_block else "")
        + aff_note
        + ph_block + "\n\n"
        f"🤖 {reason}\n"
        + ("🗑️ *Likely spam*\n" if is_spam else "")
        + f"🔗 [Source]({msg_link})\n\n"
        f"{ct} {aitags} #IndianDeals #deals"
    )

def format_unrated(channel, aff_text, msg_link, platforms, aff_map, prices, coupon, category, flash) -> str:
    ct = chtag(channel); pl = _platform_line(platforms)
    pline = _price_line(prices, ""); aff = "\n💸 _(Profit links added)_" if aff_map else ""
    coupon_line = f"\n🎟️ *USE CODE:* `{coupon}`" if coupon else ""
    flash_line  = f"\n⚡ *FLASH SALE:* _{flash}_" if flash else ""
    cat_line    = f"  {category}" if category != "🛍️ General" else ""
    return (
        f"📢 {ct}" + (f"  🏪 {pl}" if pl else "") + cat_line + "\n"
        + (f"💵 {pline}\n" if pline else "")
        + coupon_line + flash_line + "\n\n"
        f"{aff_text}{aff}\n\n"
        f"🔗 [Source]({msg_link})\n"
        f"{ct} #IndianDeals #deals"
    )

def format_no_link(channel, aff_text, rating, msg_link, coupon) -> str:
    ct = chtag(channel)
    score = rating.get("score") if rating else None
    verdict = rating.get("verdict","") if rating else ""; reason = rating.get("reason","") if rating else ""
    tags = rating.get("hashtags",[]) if rating else []
    aitags = " ".join(f"#{t.strip('#').replace(' ','_')}" for t in tags[:5])
    header = f"{_se(score)} *{score}/10* {_ve(verdict)} *{verdict}*\n" if score else ""
    coupon_line = f"🎟️ *USE CODE:* `{coupon}`\n" if coupon else ""
    return (
        f"{header}📢 {ct}  🏷️ Text deal / coupon\n{coupon_line}\n"
        f"{aff_text}\n\n"
        + (f"🤖 {reason}\n\n" if reason else "")
        + f"🔗 [Source]({msg_link})\n\n"
        f"{ct} {aitags} #IndianDeals #deals #coupon"
    )

# ═══════════════════════════════════════════════════════════════════
#  SEND HELPERS  (with jitter on flood errors)
# ═══════════════════════════════════════════════════════════════════
async def _send_with_fallback(client, target, text: str, img_path=None, parse_mode: str = "markdown") -> bool:
    attempts = [{"parse_mode": parse_mode}, {"parse_mode": None}, {"parse_mode": None, "text_only": True}]
    for i, opts in enumerate(attempts):
        try:
            text_to_send = text
            if opts.get("text_only"):
                text_to_send = re.sub(r'[*_`~]', '', text)
            if img_path and img_path.exists() and not opts.get("text_only"):
                cap = text_to_send[:TG_CAPTION_LIMIT]
                await client.send_file(target, file=str(img_path), caption=cap, parse_mode=opts.get("parse_mode"))
                if len(text_to_send) > TG_CAPTION_LIMIT:
                    await asyncio.sleep(0.3)
                    await client.send_message(target, text_to_send[TG_CAPTION_LIMIT:], parse_mode=opts.get("parse_mode"), link_preview=False)
            else:
                await client.send_message(target, text_to_send[:4096], parse_mode=opts.get("parse_mode"), link_preview=False)
            return True
        except Exception as e:
            err_str = str(e).lower()
            if "flood" in err_str:
                wait = random.uniform(10, 20)
                log.warning(f"  ⏳ Flood wait {wait:.0f}s")
                await asyncio.sleep(wait)
            log.debug(f"  Send attempt {i+1}/3 failed: {e}")
            if i < len(attempts) - 1: await asyncio.sleep(1)
    return False

# ═══════════════════════════════════════════════════════════════════
#  USER ALERTS
# ═══════════════════════════════════════════════════════════════════
async def notify_alert_users(poster, product_name: str, post_text: str, score: int):
    alerts = load_json(ALERTS_FILE, {})
    if not alerts or not product_name: return
    name_lower = product_name.lower()
    for user_id, keywords in alerts.items():
        for kw in keywords:
            if kw.lower() in name_lower:
                try:
                    await poster.send_message(int(user_id), f"🔔 *Deal Alert!* Keyword: `{kw}`\nScore: {score}/10\n\n{post_text[:400]}…", parse_mode="markdown")
                    log.info(f"  🔔 Alert → {user_id} for '{kw}'")
                except Exception as e: log.debug(f"Alert {user_id}: {e}")
                break

# ═══════════════════════════════════════════════════════════════════
#  ADMIN COMMAND HANDLERS
# ═══════════════════════════════════════════════════════════════════
def register_handlers(poster):

    @poster.on(events.NewMessage(pattern=r'/start'))
    async def start(event):
        await event.reply(
            "👋 *Welcome to IndianDeals Bot!*\n\n"
            "📢 I post the best deals with AI ratings.\n\n"
            "🔔 *Set deal alerts:*\n"
            "`/alert iphone` — get alerted for iPhone deals\n"
            "`/myalerts` — see your alerts\n"
            "`/removealert iphone` — remove an alert\n\n"
            f"📣 Join: {OUTPUT_CHANNEL}", parse_mode="markdown")

    @poster.on(events.NewMessage(pattern=r'/alert (.+)'))
    async def set_alert(event):
        kw = event.pattern_match.group(1).strip().lower(); uid = str(event.sender_id)
        alerts = load_json(ALERTS_FILE, {}); alerts.setdefault(uid, [])
        if kw not in alerts[uid]:
            alerts[uid].append(kw); save_json(ALERTS_FILE, alerts)
            await event.reply(f"✅ Alert set for: *{kw}*", parse_mode="markdown")
        else:
            await event.reply(f"ℹ️ Alert already exists for *{kw}*.", parse_mode="markdown")

    @poster.on(events.NewMessage(pattern=r'/myalerts'))
    async def list_alerts(event):
        uid = str(event.sender_id)
        kws = load_json(ALERTS_FILE, {}).get(uid, [])
        if kws: await event.reply("🔔 *Your alerts:*\n" + "\n".join(f"• `{k}`" for k in kws), parse_mode="markdown")
        else: await event.reply("No alerts set. Use /alert keyword")

    @poster.on(events.NewMessage(pattern=r'/removealert (.+)'))
    async def remove_alert(event):
        kw = event.pattern_match.group(1).strip().lower(); uid = str(event.sender_id)
        alerts = load_json(ALERTS_FILE, {})
        if uid in alerts and kw in alerts[uid]:
            alerts[uid].remove(kw); save_json(ALERTS_FILE, alerts)
            await event.reply(f"✅ Removed alert for *{kw}*", parse_mode="markdown")
        else: await event.reply(f"No alert found for *{kw}*", parse_mode="markdown")

    @poster.on(events.NewMessage(pattern=r'/status'))
    async def bot_status(event):
        if event.sender_id != ADMIN_USER_ID: await event.reply("❌ Admin only"); return
        stats = load_stats(); uptime_sec = int(time.time() - BOT_START_TIME)
        h, rem = divmod(uptime_sec, 3600); m, s = divmod(rem, 60)
        ai_status = []
        if CEREBRAS_KEY:   ai_status.append("✅ Cerebras")
        if GROQ_KEYS:      ai_status.append(f"✅ Groq ×{len(GROQ_KEYS)}")
        if GEMINI_KEYS:    ai_status.append(f"✅ Gemini ×{len(GEMINI_KEYS)}")
        if SAMBANOVA_KEY:  ai_status.append("✅ Sambanova")
        if TOGETHER_KEY:   ai_status.append("✅ Together")
        if COHERE_KEY:     ai_status.append("✅ Cohere")
        if OPENROUTER_KEY: ai_status.append("✅ OpenRouter")
        if MISTRAL_KEY:    ai_status.append("✅ Mistral")
        if not ai_status:  ai_status.append("⚠️ No AI keys")
        msg = (
            f"🤖 *Bot v8 Status*\n\n"
            f"⏱ Uptime: `{h}h {m}m {s}s`\n"
            f"📬 Pending approvals: `{len(pending_deals)}`\n\n"
            f"📊 *Today ({stats['date']})*\n"
            f"  ✅ Posted: {stats.get('posted',0)}\n"
            f"  ⚡ Auto-posted (score ≥{AUTO_POST_SCORE}): {stats.get('auto_posted',0)}\n"
            f"  🔍 Checked: {stats.get('checked',0)}\n"
            f"  ♻️ Duplicates: {stats.get('dup',0)}\n"
            f"  💸 Price drops: {stats.get('price_drops',0)}\n"
            f"  🚨 Scams: {stats.get('scam',0)}\n"
            f"  ⚠️ Unrated: {stats.get('unrated',0)}\n"
            f"  💰 Affiliate: {stats.get('affiliate',0)}\n\n"
            f"🧠 *AI Chain*\n" + "\n".join(f"  {a}" for a in ai_status) + "\n\n"
            f"⚙️ *Settings*\n"
            f"  Auto-post score: ≥{AUTO_POST_SCORE}/10\n"
            f"  Dup window: 48h (price drop overrides)\n"
            f"  Interval: {SCRAPE_INTERVAL}s\n"
            f"  Channels: {len(SOURCE_CHANNELS)}\n"
            f"{'✅ EarnKaro active' if EARNKARO_TOKEN else '❌ EarnKaro not set'}"
        )
        await event.reply(msg, parse_mode="markdown")

    @poster.on(events.NewMessage(pattern=r'/pending'))
    async def list_pending(event):
        if event.sender_id != ADMIN_USER_ID: await event.reply("❌ Admin only"); return
        if not pending_deals: await event.reply("📭 No pending deals."); return
        lines = [f"📬 *{len(pending_deals)} pending deals:*\n"]
        for i, (deal_id, d) in enumerate(pending_deals.items(), 1):
            name = d.get("prod_name","Unknown")[:50]; sale = d.get("prices",{}).get("sale")
            age  = int((time.time() - d.get("ts", time.time())) / 60)
            lines.append(f"{i}. {name}{f' ₹{sale:,.0f}' if sale else ''} ({age}m ago)")
        await event.reply("\n".join(lines), parse_mode="markdown")

    @poster.on(events.NewMessage(pattern=r'/clearall'))
    async def clear_all_pending(event):
        if event.sender_id != ADMIN_USER_ID: await event.reply("❌ Admin only"); return
        count = len(pending_deals); pending_deals.clear(); _save_pending(pending_deals)
        await event.reply(f"🗑️ Cleared {count} pending deal(s).")

    @poster.on(events.CallbackQuery(pattern=b"post_(.+)"))
    async def approve_deal(event):
        if event.sender_id != ADMIN_USER_ID: await event.answer("❌ Not authorized", alert=True); return
        deal_id = event.data.decode().replace("post_","")
        deal    = pending_deals.pop(deal_id, None)
        _save_pending(pending_deals)
        if not deal:
            await event.answer("⚠️ Deal expired or already posted", alert=True)
            try: await event.edit(buttons=None)
            except: pass
            return
        await event.answer("⏳ Formatting & posting...")
        try:
            clean_text = await generate_clean_post(
                aff_text=deal["aff_text"], prices=deal["prices"], prod_name=deal["prod_name"],
                category=deal["category"], platforms=deal["platforms"], coupon=deal.get("coupon"),
                bank_offers=deal.get("bank_offers",[]), combo_info=deal.get("combo_info"), flash=deal.get("flash"),
            )
        except Exception as e:
            log.error(f"  ❌ Clean format failed: {e}")
            clean_text = deal["aff_text"]
        if not clean_text or len(clean_text.strip()) < 5: clean_text = deal["aff_text"]
        img_path = Path(deal["img_path"]) if deal.get("img_path") else None
        success  = await _send_with_fallback(poster, CURATED_CHANNEL, clean_text, img_path)
        if success:
            preview = clean_text[:300] + ("..." if len(clean_text) > 300 else "")
            try: await event.edit(f"✅ *Posted to {CURATED_CHANNEL}!*\n\n{preview}", parse_mode="markdown", buttons=None)
            except:
                try: await event.edit(f"✅ Posted to {CURATED_CHANNEL}!", buttons=None)
                except: pass
            log.info(f"  ✅ Admin posted deal {deal_id}")
        else:
            pending_deals[deal_id] = deal; _save_pending(pending_deals)
            try: await event.answer("❌ Failed after 3 attempts. Deal saved — try again.", alert=True)
            except: pass

    @poster.on(events.CallbackQuery(pattern=b"skip_(.+)"))
    async def skip_deal(event):
        if event.sender_id != ADMIN_USER_ID: await event.answer("❌ Not authorized", alert=True); return
        deal_id = event.data.decode().replace("skip_","")
        deal    = pending_deals.pop(deal_id, None)
        _save_pending(pending_deals)
        if not deal:
            await event.answer("⚠️ Already handled", alert=True)
            try: await event.edit(buttons=None)
            except: pass
            return
        await event.answer("🗑️ Skipped")
        prod = deal.get("prod_name","deal")[:60]
        try: await event.edit(f"🗑️ *Skipped:* _{prod}_", parse_mode="markdown", buttons=None)
        except: pass
        log.info(f"  🗑️ Admin skipped {deal_id}")

    log.info("  ✅ All handlers registered")

# ═══════════════════════════════════════════════════════════════════
#  SEND FOR ADMIN APPROVAL  (or auto-post if score ≥ threshold)
# ═══════════════════════════════════════════════════════════════════
async def send_for_approval(poster, img_path, post_text, deal_id, aff_text, prices, prod_name, category, platforms, coupon, bank_offers, combo_info, flash, score=None, stats=None, original_text=None, expanded_urls=None, channel=None, affiliate_applied=False, msg_link=None, deal_type=None):
    if not ADMIN_USER_ID: return

    # AUTO-POST: skip admin queue for very high-rated deals
    if score and score >= AUTO_POST_SCORE:
        log.info(f"  ⚡ Auto-posting (score={score} ≥ {AUTO_POST_SCORE})...")
        try:
            clean_text = await generate_clean_post(aff_text, prices, prod_name, category, platforms, coupon, bank_offers, combo_info, flash)
            success = await _send_with_fallback(poster, CURATED_CHANNEL, clean_text, img_path)
            if success:
                log.info(f"  ✅ Auto-posted deal {deal_id}")
                if stats: stats["auto_posted"] = stats.get("auto_posted", 0) + 1
                # Save to DB as auto_posted
                _save_deal_to_db({
                    "fp_hash": deal_id, "prod_name": prod_name, "aff_text": aff_text,
                    "original_text": original_text or aff_text, "prices": prices,
                    "category": category, "platforms": platforms, "coupon": coupon,
                    "img_path": str(img_path) if img_path and img_path.exists() else None,
                    "status": "auto_posted", "score": score, "source": "telegram",
                    "source_channel": channel, "affiliate_applied": affiliate_applied,
                    "expanded_urls": expanded_urls or {}, "original_msg_link": msg_link,
                    "deal_type": deal_type or "product", "ts": time.time(),
                })
                try:
                    await poster.send_message(ADMIN_USER_ID,
                        f"⚡ *Auto-posted* (score {score}/10)\n\n_{prod_name[:60]}_",
                        parse_mode="markdown")
                except: pass
                return
        except Exception as e:
            log.error(f"  ❌ Auto-post failed: {e} — falling through to admin queue")

    # Store deal
    deal_data = {
        "aff_text": aff_text, "prices": prices, "prod_name": prod_name,
        "category": category, "platforms": platforms, "coupon": coupon,
        "bank_offers": bank_offers or [], "combo_info": combo_info, "flash": flash,
        "img_path": str(img_path) if img_path and img_path.exists() else None,
        "ts": time.time(),
        # V2 fields for web dashboard
        "original_text": original_text or aff_text,
        "expanded_urls": expanded_urls or {},
        "source_channel": channel,
        "affiliate_applied": affiliate_applied,
        "original_msg_link": msg_link,
        "deal_type": deal_type or "product",
        "score": score,
    }
    pending_deals[deal_id] = deal_data
    _save_pending(pending_deals)

    # Save to MongoDB for web dashboard
    _save_deal_to_db({
        **deal_data,
        "fp_hash": deal_id,
        "status": "pending_approval",
        "source": "telegram",
    })

    # Prune old pending
    cutoff = time.time() - 172800  # 48h
    expired = [k for k, v in list(pending_deals.items()) if v["ts"] < cutoff]
    for k in expired: pending_deals.pop(k, None)
    if expired: _save_pending(pending_deals)

    sale = prices.get("sale"); disc = prices.get("discount_pct"); plat = platforms[0] if platforms else ""
    header = f"🔔 *New Deal*"
    if prod_name: header += f": _{prod_name[:50]}_"
    if sale: header += f"\n💰 ₹{sale:,.0f}" + (f" ({disc}% off)" if disc else "")
    if plat: header += f" | {plat}"
    if score: header += f" | AI: {score}/10"
    header += "\n\n"
    admin_text = header + post_text
    buttons = [[Button.inline("📤 Post to Deals For India", data=f"post_{deal_id}"), Button.inline("❌ Skip", data=f"skip_{deal_id}")]]
    try:
        if img_path and img_path.exists():
            cap = admin_text[:TG_CAPTION_LIMIT]
            try: sent = await poster.send_file(ADMIN_USER_ID, file=str(img_path), caption=cap, parse_mode="markdown", buttons=buttons)
            except: sent = await poster.send_file(ADMIN_USER_ID, file=str(img_path), caption=cap[:500], buttons=buttons)
        else:
            try: sent = await poster.send_message(ADMIN_USER_ID, admin_text[:4096], parse_mode="markdown", buttons=buttons)
            except: sent = await poster.send_message(ADMIN_USER_ID, admin_text[:4096], buttons=buttons)
        # Store message ID so we can remove buttons if deal expires
        pending_deals[deal_id]["msg_id"] = sent.id
        _save_pending(pending_deals)
        log.info("  📬 Sent to admin for approval")
    except Exception as e:
        log.error(f"  ❌ Failed to send to admin: {e}")
        pending_deals.pop(deal_id, None); _save_pending(pending_deals)

# ═══════════════════════════════════════════════════════════════════
#  BACKGROUND TASKS
# ═══════════════════════════════════════════════════════════════════
async def pending_cleanup_loop(poster=None):
    while True:
        await asyncio.sleep(1800)
        cutoff = time.time() - 172800; before = len(pending_deals)  # 48h
        expired = [k for k, v in list(pending_deals.items()) if v["ts"] < cutoff]
        for k in expired:
            deal = pending_deals.pop(k, None)
            # Remove inline buttons from expired admin messages so clicks no longer trigger the popup
            if poster and deal and deal.get("msg_id"):
                try:
                    await poster.edit_message(ADMIN_USER_ID, deal["msg_id"], buttons=None)
                except Exception as e:
                    log.debug(f"  Could not clear buttons for expired deal {k}: {e}")
        if expired:
            _save_pending(pending_deals)
            log.info(f"🧹 Pruned {len(expired)} expired pending deals ({before} → {len(pending_deals)})")

# ═══════════════════════════════════════════════════════════════════
#  DAILY STATS + WEEKLY TRENDING
# ═══════════════════════════════════════════════════════════════════
async def post_daily_summary(poster, stats: dict):
    msg = (
        f"📊 *Daily Stats — {stats['date']}*\n\n"
        f"✅ Posted: {stats['posted']}\n"
        f"⚡ Auto-posted: {stats.get('auto_posted',0)}\n"
        f"🔍 Checked: {stats['checked']}\n"
        f"♻️ Duplicates: {stats['dup']}\n"
        f"💸 Price drops: {stats['price_drops']}\n"
        f"🏷️ No-link deals: {stats['no_link']}\n"
        f"⚠️ Unrated: {stats['unrated']}\n"
        f"💰 Affiliate links: {stats['affiliate']}\n"
    )
    if CHANNEL_QUALITY:
        msg += "\n📡 *Channel Quality*\n"
        for ch, scores in sorted(CHANNEL_QUALITY.items(), key=lambda x: -(sum(x[1])/len(x[1]) if x[1] else 0)):
            if len(scores) >= 3:
                avg = sum(scores)/len(scores)
                emoji = "🟢" if avg >= 7 else "🟡" if avg >= 5 else "🔴"
                name = ch.split('/')[-1].lstrip('@')
                msg += f"{emoji} @{name}: {avg:.1f}/10\n"
    try: await poster.send_message(OUTPUT_CHANNEL, msg, parse_mode="markdown"); log.info("📊 Daily stats posted")
    except Exception as e: log.error(f"Stats post failed: {e}")

async def post_weekly_trending(poster):
    data = load_json(TRENDING_FILE, {})
    if not data: return
    totals: dict[str, int] = {}
    for day_data in data.values():
        for cat, count in day_data.items(): totals[cat] = totals.get(cat, 0) + count
    if not totals: return
    msg = "📈 *Weekly Trending Categories*\n\n"
    for cat, count in sorted(totals.items(), key=lambda x: x[1], reverse=True)[:8]:
        bar = "█" * min(count//5, 10)
        msg += f"{cat}: {count} deals {bar}\n"
    try: await poster.send_message(OUTPUT_CHANNEL, msg, parse_mode="markdown"); log.info("📈 Weekly trending posted")
    except Exception as e: log.error(f"Trending failed: {e}")

# ═══════════════════════════════════════════════════════════════════
#  PROCESS ONE MESSAGE
# ═══════════════════════════════════════════════════════════════════
async def process_message(scraper, poster, msg, channel, entity, seen_ch, deal_cache, stats) -> bool:
    text = msg.text or ""
    if len(text) < 5 and not msg.media: return False

    raw_urls     = extract_urls(text)
    has_link     = bool(raw_urls)
    expanded_map = await expand_all_urls(raw_urls) if raw_urls else {}
    exp_urls     = list(expanded_map.values())
    platforms    = list(dict.fromkeys(filter(None, [detect_platform(u) for u in exp_urls])))

    if expanded_map:
        aff_text, affiliate_applied = await apply_affiliate_to_text(text, expanded_map)
    else:
        aff_text, affiliate_applied = text, False
    aff_map_display = {"_applied": "✓"} if affiliate_applied else {}
    if affiliate_applied: stats["affiliate"] += 1

    asin        = next((extract_asin(u) for u in exp_urls if extract_asin(u)), None)
    fps         = [url_fp(u) for u in exp_urls]
    prod_name   = extract_product_name(text)
    prices      = extract_prices(text)
    coupon      = extract_coupon(text)
    sale_price  = prices.get("sale")
    category    = detect_category(text)
    flash       = detect_flash_sale(text)
    bank_offers = extract_bank_offers(text)
    combo_info  = extract_combo_info(text)

    # Scrape price from product page if not in text
    if not sale_price and exp_urls:
        log.info("    💲 No price in text — scraping product page...")
        scraped = await scrape_prices_from_urls(exp_urls)
        if scraped.get("sale"):
            prices["sale"]         = scraped["sale"]
            sale_price             = scraped["sale"]
            if scraped.get("mrp") and not prices.get("mrp"):      prices["mrp"]          = scraped["mrp"]
            if scraped.get("discount_pct") and not prices.get("discount_pct"): prices["discount_pct"] = scraped["discount_pct"]
            if scraped.get("product_name") and len(prod_name) < 10: prod_name = scraped["product_name"]
            if scraped.get("product_name"): category = detect_category(text + " " + scraped["product_name"])

    # ── Duplicate check — 48h window, any price drop overrides ─────
    # Rule: same deal seen in last 48h → skip UNLESS price is lower than last seen.
    # After 48h the deal is forgotten and can post freely again.
    is_dup, dup_reason = dup.check(asin, fps, prod_name, text)
    drop_info = ""
    if is_dup:
        last_p = dup.last_price(asin, fps)
        if sale_price and last_p and sale_price < last_p:
            # Price went down by any amount — allow repost
            is_dup    = False
            drop_info = f"Was ₹{last_p:,.0f} → Now ₹{sale_price:,.0f} (⬇️ {round((last_p-sale_price)/last_p*100,1)}%)"
            stats["price_drops"] += 1
            log.info(f"    💸 Price drop: {drop_info}")
        else:
            log.info(f"    ♻️ Dup ({dup_reason}) — same/higher price within 48h")
            stats["dup"] += 1
            return False

    log.info(
        f"    📨 id={msg.id} {category} plat={platforms} ₹{sale_price} disc={prices.get('discount_pct')}%"
        + (f" ⚡FLASH" if flash else "") + (f" 💳BANK:{len(bank_offers)}" if bank_offers else "")
        + (f" 📦{combo_info}" if combo_info else "")
    )

    _empty_hist = {"found": False, "primary": None, "fallback": None, "summary": ""}
    (img_path, img64), price_hist = await asyncio.gather(
        fetch_product_image(scraper, msg, exp_urls),
        get_price_history(exp_urls) if exp_urls else asyncio.sleep(0, result=_empty_hist),
    )

    clean_name = getattr(entity, 'title', None) or getattr(entity, 'username', channel.split('/')[-1])

    rating = await rate_deal(text or "[image]", img64, clean_name, prices, coupon, platforms, price_hist.get("summary",""), category)
    if rating: update_channel_quality(channel, rating.get("score", 5))

    if sale_price:
        ck = asin or (fps[0] if fps else None)
        if ck: deal_cache[ck] = {"price": sale_price, "ts": time.time()}; save_deal_cache(deal_cache)

    try: msg_link = f"https://t.me/{entity.username or entity.id}/{msg.id}"
    except: msg_link = "https://t.me"

    if not has_link:
        post_text = format_no_link(clean_name, aff_text, rating, msg_link, coupon)
        stats["no_link"] += 1
    elif rating is None:
        post_text = format_unrated(clean_name, aff_text, msg_link, platforms, aff_map_display, prices, coupon, category, flash)
        stats["unrated"] += 1
    else:
        post_text = format_rated(clean_name, aff_text, rating, msg_link, price_hist, prices, drop_info, platforms, aff_map_display, coupon, category, flash)

    # 1. Post to analytics channel
    await _send_with_fallback(poster, OUTPUT_CHANNEL, post_text, img_path)

    dup.add(asin, fps, prod_name, text, sale_price)
    update_trending(category)
    stats["posted"] += 1

    if prod_name and rating:
        await notify_alert_users(poster, prod_name, post_text, rating.get("score", 0))

    # 2. Send to admin for approval (or auto-post if high score)
    if ADMIN_USER_ID:
        deal_id    = f"{msg.id}_{int(time.time())}"
        deal_score = rating.get("score") if rating else None
        # Classify deal type
        _trick_words = ['trick', 'loot', 'free entry', 'quiz', 'contest', 'method', 'steps:', 'cashback trick']
        _text_lower = (text or '').lower()
        _has_price = bool(sale_price and sale_price > 0)
        _has_trick = any(w in _text_lower for w in _trick_words)
        _deal_type = 'trick' if (_has_trick and not _has_price) else 'product'
        await send_for_approval(
            poster, img_path, post_text, deal_id, aff_text, prices, prod_name,
            category, platforms, coupon, bank_offers, combo_info, flash,
            score=deal_score, stats=stats,
            original_text=text, expanded_urls=expanded_map, channel=channel,
            affiliate_applied=affiliate_applied, msg_link=msg_link,
            deal_type=_deal_type,
        )

    return True

# ═══════════════════════════════════════════════════════════════════
#  CORE SCRAPE LOOP
# ═══════════════════════════════════════════════════════════════════
async def scrape_and_post(scraper, poster, seen, deal_cache, stats):
    log.info("─" * 60)
    log.info(f"🔍 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    cutoff  = datetime.now(timezone.utc) - timedelta(hours=LOOKBACK_HOURS)
    ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    last_cycle = load_last_cycle()
    ist_date = ist_now.strftime("%Y-%m-%d")
    if ist_now.hour == 0 and last_cycle["stats_day"] != ist_date and stats.get("posted",0) > 0:
        await post_daily_summary(poster, stats)
        last_cycle["stats_day"] = ist_date
        stats.update({"date": ist_date, "posted": 0, "checked": 0, "dup": 0, "unrated": 0, "no_link": 0, "price_drops": 0, "affiliate": 0, "scam": 0, "auto_posted": 0})
        save_stats(stats); save_last_cycle(last_cycle)
    ist_week = ist_now.strftime("%Y-W%W")
    if ist_now.weekday() == 6 and last_cycle["trending_week"] != ist_week:
        await post_weekly_trending(poster); last_cycle["trending_week"] = ist_week; save_last_cycle(last_cycle)

    cycle_posted = 0
    for channel in SOURCE_CHANNELS:
        if cycle_posted >= MAX_POSTS_CYCLE: log.info(f"🛑 Cycle cap {MAX_POSTS_CYCLE} reached"); break
        try:
            entity       = await scraper.get_entity(channel)
            ch_seen_list = seen.get(channel, [])
            ch_seen      = set(ch_seen_list)
            new_ids      = []
            consecutive  = 0; new_count = 0
            avg          = channel_avg_score(channel)
            log.info(f"  📡 {channel}" + (f" (avg:{avg})" if avg else ""))
            async for msg in scraper.iter_messages(entity, limit=MSGS_PER_CHAN):
                if cycle_posted >= MAX_POSTS_CYCLE: break
                mt = msg.date
                if mt.tzinfo is None: mt = mt.replace(tzinfo=timezone.utc)
                if mt < cutoff: break
                stats["checked"] += 1
                if msg.id in ch_seen:
                    consecutive += 1
                    if consecutive >= 10: log.info("    ⏹ Early stop"); break
                    continue
                consecutive = 0; new_count += 1
                try:
                    posted = await asyncio.wait_for(
                        process_message(scraper, poster, msg, channel, entity, ch_seen, deal_cache, stats),
                        timeout=MSG_TIMEOUT)
                except asyncio.TimeoutError:
                    log.warning(f"    ⏱️ Timeout msg {msg.id}"); posted = False
                except Exception as e:
                    log.error(f"    ❌ msg {msg.id}: {e}"); posted = False
                if posted: cycle_posted += 1; await asyncio.sleep(2)
                ch_seen.add(msg.id); new_ids.append(msg.id)
            seen[channel] = (ch_seen_list + new_ids)[-500:]
            log.info(f"    → new={new_count}")
        except Exception as e: log.error(f"  ❌ {channel}: {e}")

    save_seen(seen); save_stats(stats)
    log.info(f"✅ checked={stats['checked']} posted={stats['posted']} dup={stats['dup']} drops={stats['price_drops']} unrated={stats['unrated']} auto={stats.get('auto_posted',0)} cycle={cycle_posted}")

# ═══════════════════════════════════════════════════════════════════
#  CLEANUP
# ═══════════════════════════════════════════════════════════════════
def cleanup_old_images():
    cutoff = time.time() - 3600; deleted = 0
    for f in IMAGES_DIR.glob("*.jpg"):
        if f.stat().st_mtime < cutoff:
            try: f.unlink(); deleted += 1
            except: pass
    if deleted: log.info(f"🧹 Cleaned {deleted} old image(s)")

import redis.asyncio as aioredis

async def pubsub_listener(poster):
    """Listens for 'deals:approved' from the web dashboard and posts to Telegram."""
    log.info("Starting Redis Pub/Sub listener for deals:approved...")
    while True:
        try:
            r = aioredis.Redis.from_url(os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0"), decode_responses=True)
            pubsub = r.pubsub()
            await pubsub.subscribe("deals:approved")
            log.info("Pub/Sub subscribed: deals:approved")
            
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message["type"] == "message":
                    try:
                        deal = json.loads(message["data"])
                        fp_hash = deal.get("fp_hash", "unknown")
                        log.info(f"  📥 Received approved deal from Web UI: {fp_hash}")
                        
                        
                        if deal.get("message") and len(deal["message"].strip()) > 5:
                            clean_text = deal["message"]
                        else:
                            clean_text = await generate_clean_post(
                            aff_text=deal.get("aff_text", ""), 
                            prices=deal.get("prices", {}), 
                            prod_name=deal.get("prod_name", ""),
                            category=deal.get("category", "🛍️ General"), 
                            platforms=deal.get("platforms", []), 
                            coupon=deal.get("coupon"),
                            bank_offers=deal.get("bank_offers", []), 
                            combo_info=deal.get("combo_info"), 
                            flash=deal.get("flash"),
                        )

                        if not clean_text or len(clean_text.strip()) < 5: 
                            clean_text = deal.get("aff_text", "Deal")
                            
                        img_path = Path(deal["img_path"]) if deal.get("img_path") else None
                        
                        success = await _send_with_fallback(poster, CURATED_CHANNEL, clean_text, img_path)
                        if success:
                            log.info(f"  ✅ Web Admin posted deal {fp_hash} to {CURATED_CHANNEL}")
                        else:
                            log.error(f"  ❌ Failed to post deal {fp_hash} to {CURATED_CHANNEL}")
                            
                    except Exception as e:
                        log.error("Error processing deals:approved message: %s", e)
                        
                await asyncio.sleep(0.1)
                
        except Exception as e:
            log.warning("Pub/Sub listener crashed, restarting in 5s: %s", e)
            await asyncio.sleep(5)

# ═══════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════
async def bot_main():
    for k, v in {"TG_API_ID": API_ID, "TG_API_HASH": API_HASH, "TG_BOT_TOKEN": BOT_TOKEN, "OUTPUT_CHANNEL": OUTPUT_CHANNEL}.items():
        if not v: raise RuntimeError(f"Missing .env: {k}")
    if not SOURCE_CHANNELS: raise RuntimeError("SOURCE_CHANNELS empty")

    loop = asyncio.get_running_loop()
    def _exc_handler(loop, context):
        exc = context.get("exception"); msg = context.get("message","")
        if isinstance(exc, OSError) and getattr(exc,"errno",None) == 11001: return
        if "gaierror" in msg.lower() or "getaddrinfo" in msg.lower(): return
        loop.default_exception_handler(context)
    loop.set_exception_handler(_exc_handler)

    ai = []
    if CEREBRAS_KEY:   ai.append("Cerebras (fastest)")
    if GROQ_KEYS:      ai.append(f"Groq×{len(GROQ_KEYS)}")
    if GEMINI_KEYS:    ai.append(f"Gemini×{len(GEMINI_KEYS)}")
    if SAMBANOVA_KEY:  ai.append("Sambanova")
    if TOGETHER_KEY:   ai.append("Together")
    if COHERE_KEY:     ai.append("Cohere")
    if OPENROUTER_KEY: ai.append("OpenRouter")
    if MISTRAL_KEY:    ai.append("Mistral")
    ai.append("Paste-as-is")

    log.info("═" * 60)
    log.info("🚀  Telegram Deal Bot v8 — Indian Edition (Professional)")
    log.info(f"    Channels     : {len(SOURCE_CHANNELS)}")
    log.info(f"    Interval     : {SCRAPE_INTERVAL}s | Timeout: {MSG_TIMEOUT}s")
    log.info(f"    AI chain     : {' → '.join(ai)}")
    log.info(f"    Amazon tag   : ✅ {AMAZON_AFFL_TAG}")
    log.info(f"    EarnKaro     : {'✅ active' if EARNKARO_TOKEN else '❌ not set'}")
    log.info(f"    Admin ID     : {ADMIN_USER_ID or '❌ not set'}")
    log.info(f"    Auto-post    : score ≥ {AUTO_POST_SCORE}/10")
    log.info(f"    Dup window   : 48h (any price drop overrides)")
    log.info(f"    Curated      : {CURATED_CHANNEL}")
    log.info(f"    Output       : {OUTPUT_CHANNEL}")
    log.info("═" * 60)

    cleanup_old_images()
    scraper = TelegramClient("scraper_session", API_ID, API_HASH)
    poster  = TelegramClient("poster_session",  API_ID, API_HASH)
    await scraper.start()
    await poster.start(bot_token=BOT_TOKEN)
    register_handlers(poster)

    seen       = load_seen()
    deal_cache = prune_deal_cache(load_deal_cache())
    save_deal_cache(deal_cache)
    stats      = load_stats()

    try:
        cleanup_task = asyncio.create_task(pending_cleanup_loop(poster))
        pubsub_task = asyncio.create_task(pubsub_listener(poster))
        while True:
            await scrape_and_post(scraper, poster, seen, deal_cache, stats)
            log.info(f"⏳ Next cycle in {SCRAPE_INTERVAL}s\n")
            await asyncio.sleep(SCRAPE_INTERVAL)
    finally:
        cleanup_task.cancel()
        pubsub_task.cancel()
        try: await cleanup_task
        except asyncio.CancelledError: pass
        try: await pubsub_task
        except asyncio.CancelledError: pass
        await scraper.disconnect(); await poster.disconnect()
        global _connector
        if _connector and not _connector.closed: await _connector.close()

async def run_forever():
    n = 0
    while True:
        try:
            await bot_main()
        except KeyboardInterrupt:
            log.info("Stopped."); break
        except Exception as e:
            n += 1; w = min(60*n, 300)
            log.error(f"💥 Crash #{n}: {e} — restart in {w}s")
            await asyncio.sleep(w)

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_forever())
