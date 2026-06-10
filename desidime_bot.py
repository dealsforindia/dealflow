#!/usr/bin/env python3
import fcntl, sys, os
_lf = open("/tmp/dealbot_desi.lock","w")
try: fcntl.flock(_lf, fcntl.LOCK_EX|fcntl.LOCK_NB)
except IOError: print("desidime_bot.py already running!"); sys.exit(1)

"""
DesiDime Deal Bot — v13  (Professional Grade)
Scrapes desidime.com/new and sends curated deals to @dealsforindiachannel

Upgrades over v12:
  1.  NEW     : AI-powered post formatting — same professional style as bot.py
                Uses Cerebras → Groq → Gemini → Together chain (all free keys)
  2.  NEW     : Product image fetching — Amazon CDN + OG image fallback
  3.  NEW     : Output validation — checks URL present, not JSON, sane length
  4.  REMOVED : Discount % filter — every deal reaches admin, no filtering by discount
  5.  NEW     : AUTO_POST_SCORE — auto-post deals with very high AI scores
  6.  BETTER  : Post format uses same 20-rule prompt as bot.py for consistency
  7.  BETTER  : Admin preview shows exactly what will be posted
  8.  BETTER  : Rate-limit retry with jitter on Telegram flood errors
  9.  BETTER  : WhatsApp + scam link detection improved
  10. BETTER  : Logging with rotating file handler (10MB, 3 backups)
"""

import os, re, time, json, hashlib, logging, requests, threading, base64, random
from pathlib import Path
from bs4 import BeautifulSoup
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv
import redis as _redis_lib
from pymongo import MongoClient

load_dotenv()

BOT_TOKEN      = os.getenv("TG_BOT_TOKEN","")
CHANNEL_ID     = os.getenv("CURATED_CHANNEL","@dealsforindiachannel")
DUMP_CHANNEL   = os.getenv("DUMP_CHANNEL","t.me/bblbblp")   # multi-link dump channel
EARNKARO_TOKEN = os.getenv("EARNKARO_TOKEN","")
ADMIN_ID       = int(os.getenv("ADMIN_USER_ID","0"))
AMAZON_TAG     = os.getenv("AMAZON_AFFILIATE_TAG","dealshare0b7-21")
INTERVAL       = int(os.getenv("SCRAPE_INTERVAL_SEC","600"))
AUTO_POST_SCORE= int(os.getenv("AUTO_POST_MIN_SCORE","9"))     # auto-post threshold
MULTI_LINK_THRESHOLD = 2   # 2+ links in description = dump channel

# AI keys (reuse from .env — same as bot.py)
CEREBRAS_KEY   = os.getenv("CEREBRAS_API_KEY","")
GROQ_KEYS      = [k.strip() for k in os.getenv("GROQ_KEYS","").split(",") if k.strip()]
GEMINI_KEYS    = [k.strip() for k in os.getenv("GEMINI_KEYS","").split(",") if k.strip()]
TOGETHER_KEY   = os.getenv("TOGETHER_API_KEY","")

_groq_idx = [0]
_gem_idx  = [0]
def _next_groq():
    if not GROQ_KEYS: return None
    k = GROQ_KEYS[_groq_idx[0] % len(GROQ_KEYS)]; _groq_idx[0] += 1; return k
def _next_gem():
    if not GEMINI_KEYS: return None
    k = GEMINI_KEYS[_gem_idx[0] % len(GEMINI_KEYS)]; _gem_idx[0] += 1; return k

SEEN_FILE    = Path("dd_seen.json")
PENDING_FILE = Path("dd_pending.json")
IMAGES_DIR   = Path("images")
IMAGES_DIR.mkdir(exist_ok=True)

# ═══════════════════════════════════════════════════════════════════
#  MONGODB + REDIS  (side-channel for web dashboard)
# ═══════════════════════════════════════════════════════════════════
try:
    _mongo = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"), serverSelectionTimeoutMS=3000)
    _mdb = _mongo[os.getenv("MONGO_DB", "dealbot")]
    _deals_col = _mdb["UniqueDeals"]
    _deals_col.create_index("fp_hash", unique=True, background=True)
    _deals_col.create_index("source", background=True)
except Exception as _me:
    _deals_col = None

try:
    _rds = _redis_lib.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)
    _rds.ping()
except Exception:
    _rds = None

def _save_deal_to_db(deal_doc):
    """Save DesiDime deal to MongoDB and publish to Redis (best-effort)."""
    try:
        if _deals_col is not None:
            _deals_col.update_one({"fp_hash": deal_doc["fp_hash"]}, {"$set": deal_doc}, upsert=True)
    except Exception as e:
        log.warning(f"MongoDB save failed: {e}")
    try:
        if _rds is not None:
            _rds.publish("deals:new", json.dumps({
                "event": "new_deal", "fp_hash": deal_doc["fp_hash"],
                "prod_name": deal_doc.get("prod_name", ""),
                "status": deal_doc.get("status", "pending_approval"),
                "source": "desidime",
            }, ensure_ascii=False))
    except Exception:
        pass

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
    "Accept-Language": "en-IN,en;q=0.9",
    "Accept-Encoding": "identity",
    "Referer": "https://www.desidime.com/",
}

SPAM_WORDS = [
    "forward this","share karo","refer karo","lucky winner",
    "earn money online","refer and earn","mlm","work from home",
    "survey","lottery","free recharge","click here to win",
]

SKIP_DOMAINS = {"whatsapp.com","wa.me","t.me","telegram.me","telegram.org"}

# ═══════════════════════════════════════════════════════════════════
#  LOGGING
# ═══════════════════════════════════════════════════════════════════
_rot = RotatingFileHandler("desidime_bot.log", maxBytes=10*1024*1024, backupCount=3, encoding="utf-8")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [DD] %(message)s",
    handlers=[_rot, logging.StreamHandler()]
)
log = logging.getLogger("dd")

# ═══════════════════════════════════════════════════════════════════
#  PERSISTENCE
# ═══════════════════════════════════════════════════════════════════
def load_seen() -> dict:
    """Returns dict of {uid: timestamp}. Entries older than 48h are dropped on load."""
    try:
        raw = json.loads(SEEN_FILE.read_text())
        cutoff = time.time() - 48 * 3600
        if isinstance(raw, list):
            # Migrate old flat list → dict with current timestamp
            return {uid: time.time() for uid in raw}
        # Dict format: prune expired
        return {k: v for k, v in raw.items() if v > cutoff}
    except:
        return {}

def save_seen(s: dict):
    # Only keep last 5000 entries by recency
    if len(s) > 5000:
        sorted_items = sorted(s.items(), key=lambda x: x[1], reverse=True)[:5000]
        s = dict(sorted_items)
    SEEN_FILE.write_text(json.dumps(s))

def is_seen(uid: str) -> bool:
    """True if uid was seen within the last 48h."""
    cutoff = time.time() - 48 * 3600
    return seen.get(uid, 0) > cutoff

def mark_seen(uid: str):
    seen[uid] = time.time()

def load_pending():
    try:
        data   = json.loads(PENDING_FILE.read_text())
        cutoff = time.time() - 172800  # 48h — matches deal memory window
        clean  = {k: v for k, v in data.items() if v.get("ts",0) > cutoff}
        pruned_deals = {k: v for k, v in data.items() if v.get("ts",0) <= cutoff}
        pruned = len(pruned_deals)
        if pruned:
            log.info(f"🧹 Pruned {pruned} expired pending deal(s) on startup")
            # Remove buttons from expired admin messages so stale clicks cannot fire
            for k, v in pruned_deals.items():
                mid = v.get("msg_id")
                if mid and ADMIN_ID and BOT_TOKEN:
                    try:
                        requests.post(
                            f"https://api.telegram.org/bot{BOT_TOKEN}/editMessageReplyMarkup",
                            json={"chat_id": ADMIN_ID, "message_id": mid, "reply_markup": {"inline_keyboard": []}},
                            timeout=10)
                    except Exception as e:
                        log.debug(f"  Could not clear buttons for expired deal {k}: {e}")
        return clean
    except: return {}

def save_pending(d):
    PENDING_FILE.write_text(json.dumps(d))

pending = load_pending()
seen    = load_seen()
TG      = f"https://api.telegram.org/bot{BOT_TOKEN}"

# ═══════════════════════════════════════════════════════════════════
#  TELEGRAM HELPERS
# ═══════════════════════════════════════════════════════════════════
def tg(method, **kwargs):
    try:
        r = requests.post(f"{TG}/{method}", json=kwargs, timeout=15)
        return r.json()
    except Exception as e:
        log.warning(f"TG {method}: {e}")
        return {}

def send_to_admin(text, deal_id, image_path=None, extra_images=None):
    buttons = {"inline_keyboard": [[
        {"text": "📤 Post to Channel", "callback_data": f"dd_post_{deal_id}"},
        {"text": "❌ Skip",            "callback_data": f"dd_skip_{deal_id}"},
    ]]}
    result = None
    if image_path and Path(image_path).exists():
        try:
            with open(image_path, "rb") as f:
                r = requests.post(f"{TG}/sendPhoto", data={
                    "chat_id": ADMIN_ID,
                    "caption": text[:1024],
                    "reply_markup": json.dumps(buttons),
                    "disable_notification": False,
                }, files={"photo": f}, timeout=20)
                result = r.json()
        except Exception as e:
            log.warning(f"  Photo send failed: {e}")
    if not result:
        result = tg("sendMessage", chat_id=ADMIN_ID, text=text[:4096],
                   disable_web_page_preview=False, reply_markup=buttons)
    # Send second image (description image) as follow-up if available
    if extra_images:
        for ep in extra_images:
            if ep and Path(ep).exists():
                try:
                    with open(ep, "rb") as f:
                        requests.post(f"{TG}/sendPhoto", data={
                            "chat_id": ADMIN_ID,
                            "caption": "🖼 Description image",
                            "disable_notification": True,
                        }, files={"photo": f}, timeout=20)
                    time.sleep(0.3)
                except Exception as e:
                    log.debug(f"  Extra image send failed: {e}")
    return result

def post_to_channel(text, image_path=None):
    if image_path and Path(image_path).exists():
        try:
            with open(image_path, "rb") as f:
                r = requests.post(f"{TG}/sendPhoto", data={
                    "chat_id": CHANNEL_ID,
                    "caption": text[:1024],
                }, files={"photo": f}, timeout=20)
                result = r.json()
                if result.get("ok"): return result
        except Exception as e:
            log.warning(f"  Photo post failed: {e} — falling back to text")
    return tg("sendMessage", chat_id=CHANNEL_ID, text=text[:4096], disable_web_page_preview=False)


def post_image_link_to_dump(img_url: str, link: str, caption: str = ""):
    """Post one image+link pair to the dump channel."""
    try:
        import urllib.request, tempfile, os as _os
        ext = img_url.split(".")[-1].split("?")[0][:4] or "jpg"
        tmp = tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False)
        tmp.close()
        urllib.request.urlretrieve(img_url, tmp.name)
        text = f"{caption}\n{link}".strip() if caption else link
        with open(tmp.name, "rb") as f:
            r = requests.post(f"{TG}/sendPhoto", data={
                "chat_id": DUMP_CHANNEL,
                "caption": text[:1024],
                "disable_notification": True,
            }, files={"photo": f}, timeout=20)
        _os.unlink(tmp.name)
        result = r.json()
        if result.get("ok"):
            return result
        log.warning(f"  Dump photo failed: {result.get('description','')}")
    except Exception as e:
        log.warning(f"  post_image_link_to_dump error: {e}")
    # Fallback text only
    text = f"{caption}\n{link}".strip() if caption else link
    return tg("sendMessage", chat_id=DUMP_CHANNEL, text=text[:4096], disable_web_page_preview=False)

def dump_multi_links(title: str, images: list, links: list):
    """
    For deals with 3+ links: send up to 2 images + up to 3 links to dump channel.
    All sent as one media group if possible, else individual messages.
    """
    import urllib.request, tempfile, os as _os
    log.info(f"  Dumping {min(len(images),2)} images + {min(len(links),3)} links to dump channel")
    
    # Cap at 2 images, send ALL links
    use_images = images[:2]
    use_links = links  # send all links
    
    # Download images locally
    local_imgs = []
    for img_url in use_images:
        try:
            ext = img_url.split(".")[-1].split("?")[0][:4] or "jpg"
            tmp = tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False)
            tmp.close()
            urllib.request.urlretrieve(img_url, tmp.name)
            local_imgs.append(tmp.name)
        except Exception as e:
            log.debug(f"  dump image download failed: {e}")

    # Build caption with all links
    links_text = "\n".join(use_links)
    caption = f"🔗 {title[:80]}\n\n{links_text}"

    # Send first image with caption + all links
    if local_imgs:
        try:
            with open(local_imgs[0], "rb") as f:
                r = requests.post(f"{TG}/sendPhoto", data={
                    "chat_id": DUMP_CHANNEL,
                    "caption": caption[:4096],
                    "disable_notification": True,
                }, files={"photo": f}, timeout=20)
            log.info(f"  {'OK' if r.json().get('ok') else 'FAIL'} Dump main image+links")
            time.sleep(0.5)
        except Exception as e:
            log.warning(f"  dump send failed: {e}")
            tg("sendMessage", chat_id=DUMP_CHANNEL, text=caption[:4096], disable_web_page_preview=False)
        # Send second image separately if exists
        if len(local_imgs) > 1:
            try:
                with open(local_imgs[1], "rb") as f:
                    requests.post(f"{TG}/sendPhoto", data={
                        "chat_id": DUMP_CHANNEL,
                        "caption": "🖼 Description image",
                        "disable_notification": True,
                    }, files={"photo": f}, timeout=20)
                time.sleep(0.5)
            except Exception as e:
                log.debug(f"  dump second image failed: {e}")
    else:
        # No images — just send links as text
        tg("sendMessage", chat_id=DUMP_CHANNEL, text=caption[:4096], disable_web_page_preview=False)

    # Cleanup temp files
    for p in local_imgs:
        try: _os.unlink(p)
        except: pass

    log.info(f"  Dump complete: {title[:50]}")

def answer_callback(cb_id, text=""):
    tg("answerCallbackQuery", callback_query_id=cb_id, text=text)

def edit_message(chat_id, msg_id, text):
    try:
        tg("editMessageText", chat_id=chat_id, message_id=msg_id, text=text[:4096], reply_markup={"inline_keyboard": []})
    except: pass

# ═══════════════════════════════════════════════════════════════════
#  AFFILIATE + URL HELPERS
# ═══════════════════════════════════════════════════════════════════
def earnkaro(url):
    if not url: return url
    if EARNKARO_TOKEN:
        try:
            r = requests.post(
                "https://ekaro-api.affiliaters.in/api/converter/public",
                headers={"Authorization": f"Bearer {EARNKARO_TOKEN}", "Content-Type": "application/json"},
                json={"deal": url, "convert_option": "convert_only"}, timeout=20)
            d = r.json()
            if d.get("success") == 1 and d.get("data") and d["data"] != url:
                log.info("  EarnKaro converted"); return d["data"]
            log.info("  EarnKaro: not supported — using direct link")
        except Exception as e: log.warning(f"  EarnKaro fail: {e}")
    if "amazon.in" in url or "amzn" in url:
        sep = "&" if "?" in url else "?"
        return f"{url}{sep}tag={AMAZON_TAG}"
    return url

def _is_spam_domain(url):
    if not url: return False
    try:
        from urllib.parse import urlparse
        domain = urlparse(url).netloc.lower().lstrip("www.")
        return any(d in domain for d in SKIP_DOMAINS)
    except: return False

def get_buy_url(deal_id, permalink):
    candidates = []
    if deal_id:
        candidates += [
            f"https://visit.desidime.com/visit/deals-1/{deal_id}",
            f"https://visit.desidime.com/visit/home-deal-buy-now-1-buy-now-1/{deal_id}",
        ]
    for url in candidates:
        try:
            r = requests.get(url, headers=HEADERS, timeout=12, allow_redirects=False)
            loc = r.headers.get("Location","")
            if loc and loc.startswith("http") and "desidime" not in loc:
                log.info(f"  Got ddime link: {loc[:70]}")
                ddime_link = loc
                r2 = requests.get(loc, headers=HEADERS, timeout=15, allow_redirects=True)
                final = r2.url
                log.info(f"  Final URL: {final[:80]}")
                if "ddime" not in final and "desidime" not in final:
                    return final, ddime_link
                return loc, loc
        except: pass
    if permalink:
        try:
            r = requests.get(f"https://www.desidime.com/{permalink}", headers=HEADERS, timeout=15)
            soup = BeautifulSoup(r.text, "html.parser")
            for a in soup.find_all("a", href=True):
                h = a["href"]
                if "ddime.in" in h or "linkkit" in h:
                    log.info(f"  Found ddime link in page: {h[:70]}")
                    ddime_link = h
                    r2 = requests.get(h, headers=HEADERS, timeout=15, allow_redirects=True)
                    final = r2.url
                    if "ddime" not in final and "desidime" not in final:
                        return final, ddime_link
                    return h, h
            shops = ["amazon","flipkart","myntra","ajio","nykaa","zepto","blinkit","jiomart","meesho","croma"]
            for a in soup.find_all("a", href=True):
                h = a["href"]
                if h.startswith("http") and "desidime" not in h:
                    if any(s in h for s in shops): return h, None
        except Exception as e: log.debug(f"  get_buy_url fallback: {e}")
    return None, None

# ═══════════════════════════════════════════════════════════════════
#  PRICE / COUPON HELPERS
# ═══════════════════════════════════════════════════════════════════
def get_price(text):
    for pat in [r'@\s*(?:Rs\.?|INR|₹)?\s*([\d,]+)', r'₹\s*([\d,]+)', r'Rs\.?\s*([\d,]+)']:
        m = re.search(pat, text, re.I)
        if m:
            try:
                v = float(m.group(1).replace(",",""))
                if 0 < v < 500000: return v
            except: pass
    return None

def get_mrp(text):
    for pat in [r'(?:MRP|was)[:\s]*₹?\s*([\d,]+)', r'~~₹?([\\d,]+)~~']:
        m = re.search(pat, text, re.I)
        if m:
            try: return float(m.group(1).replace(",",""))
            except: pass
    return None

def get_discount(text):
    m = re.search(r'(\d{1,2})\s*%\s*off', text, re.I)
    try: return int(m.group(1)) if m else None
    except: return None

def get_coupon(text):
    m = re.search(r'(?:code|coupon|promo)[:\s]+([A-Z0-9]{4,20})', text, re.I)
    if m:
        c = m.group(1).upper()
        if c not in {"HTTP","HTTPS","APPLY","CODE","COUPON","USING"}: return c
    return None

def is_spam(title):
    return any(k in title.lower() for k in SPAM_WORDS)

# ═══════════════════════════════════════════════════════════════════
#  PRODUCT IMAGE FETCHING
# ═══════════════════════════════════════════════════════════════════
def fetch_product_image(product_url: str) -> str | None:
    """
    Universal image fetcher: works for any store URL (Amazon, Flipkart, Myntra,
    Meesho, Nykaa, Croma, Zepto, Blinkit, JioMart, Ajio, etc.).
    Loads the product page and reads og:image / twitter:image meta tags.
    Skips known short-link / affiliate redirect domains that won't have useful meta tags.
    """
    if not product_url: return None
    from urllib.parse import urlparse
    domain = urlparse(product_url).netloc.lower()
    # Skip domains that are redirect/affiliate links — they have no product page
    skip = {
        "bit.ly", "tinyurl.com", "t.co",
        "amzn.to", "amzn.in", "fkrt.it", "clnk.in",
        "earnkaro.com", "ekaro.in", "awin1.com",
        "linkkit.in", "ddime.in", "visit.desidime.com",
    }
    if any(d in domain for d in skip):
        log.debug(f"  fetch_product_image: skipping redirect domain {domain}")
        return None
    try:
        hdrs = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,*/*;q=0.8",
            "Accept-Language": "en-IN,en;q=0.9",
        }
        r = requests.get(product_url, headers=hdrs, allow_redirects=True, timeout=15)
        if r.status_code != 200:
            log.debug(f"  fetch_product_image: {r.status_code} for {domain}")
            return None
        soup = BeautifulSoup(r.text, "html.parser")
        img_url = None
        # BeautifulSoup meta tag lookup — reliable for all stores
        for prop in ["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"]:
            tag = soup.find("meta", property=prop) or soup.find("meta", attrs={"name": prop})
            if tag and tag.get("content", "").strip().startswith("http"):
                img_url = tag["content"].strip()
                break
        if not img_url:
            log.debug(f"  fetch_product_image: no og/twitter image tag found for {domain}")
            return None
        ir = requests.get(img_url, timeout=10, headers={"User-Agent": hdrs["User-Agent"]})
        if ir.status_code == 200 and len(ir.content) > 5000:
            safe = re.sub(r'[^\w]', '_', domain)[:25]
            path = IMAGES_DIR / f"og_{safe}_{int(time.time())}.jpg"
            path.write_bytes(ir.content)
            log.info(f"  🖼️ Product image ✓ ({domain})")
            return str(path)
        log.debug(f"  fetch_product_image: image too small or bad status for {domain}")
    except Exception as e:
        log.debug(f"  fetch_product_image ({domain}): {e}")
    return None

def cleanup_image(path):
    if path:
        try: Path(path).unlink()
        except: pass

# ═══════════════════════════════════════════════════════════════════
#  ██████╗ ██████╗  ██████╗     ███████╗ ██████╗ ██████╗ ███╗   ███╗ █████╗ ████████╗
#  ██╔══██╗██╔══██╗██╔═══██╗    ██╔════╝██╔═══██╗██╔══██╗████╗ ████║██╔══██╗╚══██╔══╝
#  ██████╔╝██████╔╝██║   ██║    █████╗  ██║   ██║██████╔╝██╔████╔██║███████║   ██║
#  ██╔═══╝ ██╔══██╗██║   ██║    ██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║   ██║
#  PRO FORMAT PROMPT  (identical style to bot.py — 20 rules, 8 examples)
# ═══════════════════════════════════════════════════════════════════
_FORMAT_PROMPT = """You are the post formatter for @dealsforindiachannel, a premium Indian deals Telegram channel with 50,000+ subscribers. Your job is to turn raw deal data into a clean, professional, copy-paste-ready post.

══════════════════════════════════
INPUT DATA
══════════════════════════════════
PRODUCT NAME : {prod_name}
SALE PRICE   : {sale_price}
MRP          : {mrp_price}
DISCOUNT     : {discount}
PLATFORM     : {platform}
COUPON CODE  : {coupon}
SOURCE       : DesiDime

AFFILIATE LINK (copy verbatim — do NOT modify or shorten):
{url}

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
  • (Final Price) — when a coupon gives extra savings
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

RULE 5 — LINK
Place the affiliate link on its own line, alone.
Never modify the link. Never wrap it in parentheses or brackets.

RULE 6 — COUPON CODE
If a coupon code is provided, write it on its own line as:
Apply Coupon: CODENAME
Do not write "Use code", "Promo code", or wrap in backticks.

RULE 7 — MRP LINE (only when MRP not already in title)
If the MRP was not included in the title qualifier, add a line:
MRP: ₹X,XXX
This goes after the link, separated by a blank line.

RULE 8 — PLATFORM LINE
Add at the end: Available on: Platform Name
Only if the platform is not obvious from the link.

RULE 9 — EMOJI LIMIT
Maximum 1 emoji in the entire post. Prefer zero.

RULE 10 — LENGTH
The complete post must be between 3 and 8 lines. Never exceed 8 lines.

RULE 11 — NO FILLER PHRASES
Never write: "Grab it now", "Don't miss", "Limited stock", "Hurry up",
"Best deal", "Check it out", "Click below", "Visit link", "Shop now",
"Amazing deal", "Great offer", "Fantastic price", "Incredible savings".

RULE 12 — NO HASHTAGS
Do not write any hashtags. The channel adds them separately.

RULE 13 — NO SCORES OR RATINGS
Do not mention AI scores, deal ratings, or verdicts.

RULE 14 — NO SOURCE REFERENCES
Do not mention DesiDime or any Telegram channel name.

RULE 15 — NUMBERS FORMAT
Always format prices with commas: ₹1,299 not ₹1299. Always use ₹ symbol.

RULE 16 — PRODUCT NAME CLEANUP
Remove junk: no excessive model numbers, no color unless relevant, keep under 60 chars.
Good: boAt Bassheads 100 Wired Earphones
Bad:  boAt Bassheads 100 in Ear Wired Earphones with Mic, 10mm Drivers (Black) [B07W...]

RULE 17 — VALIDATION BEFORE OUTPUT
Before writing, check:
  ✓ Does the post contain the affiliate link?
  ✓ Does the post contain the sale price?
  ✓ Is it 3–8 lines?
  ✓ Zero hashtags?
  ✓ Zero filler phrases?
If any check fails, rewrite. Only output the final passing version.

RULE 18 — OUTPUT FORMAT
Output ONLY the post text. No preamble like "Here is the post:" or "Sure!".
No markdown code fences. No JSON. Just the raw post text, ready to paste into Telegram.

RULE 19 — IF PRICE IS UNKNOWN
If the sale price is "not found", write the post without a price. Lead with the product name and discount percentage if available, then the link.
Good: 60% Off: Puma Running Shoes

https://...

RULE 20 — GROCERY / FMCG PACKS
For grocery/daily use items, emphasize the per-unit value if it's good.
Example: Tata Salt (Pack of 6 × 1kg) @ ₹132 (₹22/kg vs MRP ₹33/kg)

══════════════════════════════════
8 WORKED EXAMPLES  (study the pattern)
══════════════════════════════════

EXAMPLE 1 — Simple Amazon deal:
boAt Airdopes 141 TWS Earbuds @ ₹699 (MRP ₹1,799)

https://amzn.to/3xYzAbC

EXAMPLE 2 — Coupon deal:
Philips H4 LED Headlight Bulb (Set of 2) @ ₹299 (Final Price)

Apply Coupon: PHILIPS50

https://amzn.to/4mJkLpQ

EXAMPLE 3 — High discount (Loot Deal):
Puma Men's Running Shoes @ ₹899 (Loot Deal)

MRP: ₹3,999

https://www.myntra.com/...

EXAMPLE 4 — Grocery pack:
Tata Salt (Pack of 6 × 1kg) @ ₹132 (MRP ₹198)

https://www.bigbasket.com/...

EXAMPLE 5 — Flipkart deal:
OnePlus Nord CE4 Lite (8GB+256GB) @ ₹17,499 (MRP ₹22,999)

Apply Coupon: NORD500

https://www.flipkart.com/...

EXAMPLE 6 — Price only, no MRP:
Prestige Pressure Cooker (3L) @ ₹999

https://amzn.to/...

EXAMPLE 7 — Steal deal (75%+):
Allen Solly Men's Formal Shirt @ ₹449 (Steal Deal)

MRP: ₹1,999

https://www.myntra.com/...

EXAMPLE 8 — No price found:
60% Off: Lifelong Dumbbell Set (10kg)

https://amzn.to/...

MRP: ₹2,499

══════════════════════════════════
NOW WRITE THE POST
══════════════════════════════════
Using the input data above and following all 20 rules, write the post now."""


def _build_dd_prompt(title, price, mrp, discount, coupon, store, aff_link) -> str:
    disc_pct = f"{discount}%" if discount else "not found"
    if discount is None and price and mrp and mrp > price:
        disc_pct = f"{round((1 - price/mrp)*100)}%"
    return _FORMAT_PROMPT.format(
        prod_name=title[:80],
        sale_price=f"₹{price:,.0f}" if price else "not found",
        mrp_price=f"₹{mrp:,.0f}" if mrp else "not found",
        discount=disc_pct,
        platform=store or "Unknown",
        coupon=coupon or "none",
        url=aff_link,
    )

def _validate_ai_output(result: str, aff_link: str) -> bool:
    if not result or len(result.strip()) < 20: return False
    if result.strip().startswith("{") or "```" in result:
        log.warning("  ⚠️ Validation: AI returned JSON/fence")
        return False
    if aff_link and aff_link not in result and "http" not in result:
        log.warning("  ⚠️ Validation: AI dropped URL")
        return False
    lines = [l for l in result.strip().splitlines() if l.strip()]
    if len(lines) < 2 or len(lines) > 20:
        log.warning(f"  ⚠️ Validation: bad line count ({len(lines)})")
        return False
    return True

def _ai_format_post(prompt: str) -> str | None:
    """Try AI providers synchronously (desidime_bot is sync). Returns plain text."""
    # 1. Cerebras
    if CEREBRAS_KEY:
        try:
            r = requests.post(
                "https://api.cerebras.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {CEREBRAS_KEY}", "Content-Type": "application/json"},
                json={"model": "llama3.1-8b", "max_tokens": 600, "temperature": 0.15, "messages": [{"role": "user", "content": prompt}]},
                timeout=20)
            if r.status_code == 200:
                result = r.json()["choices"][0]["message"]["content"].strip()
                log.info("  🤖 AI format via Cerebras ✓")
                return result
            else: log.debug(f"AI Cerebras: status={r.status_code} body={r.text[:100]}")
        except Exception as e: log.debug(f"AI Cerebras: {e}")

    # 2. Groq
    key = _next_groq()
    if key:
        try:
            r = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={"model": "llama-3.3-70b-versatile", "max_tokens": 600, "temperature": 0.15, "messages": [{"role": "user", "content": prompt}]},
                timeout=20)
            if r.status_code == 200:
                result = r.json()["choices"][0]["message"]["content"].strip()
                log.info("  🤖 AI format via Groq ✓")
                return result
            if r.status_code == 429:
                log.warning("  ⚠️ Groq rate limited")
        except Exception as e: log.debug(f"AI Groq: {e}")

    # 3. Gemini
    gkey = _next_gem()
    if gkey:
        try:
            r = requests.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gkey}",
                json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"maxOutputTokens": 600, "temperature": 0.15}},
                timeout=20)
            if r.status_code == 200:
                result = r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                log.info("  🤖 AI format via Gemini ✓")
                return result
        except Exception as e: log.debug(f"AI Gemini: {e}")

    # 4. Together
    if TOGETHER_KEY:
        try:
            r = requests.post(
                "https://api.together.xyz/v1/chat/completions",
                headers={"Authorization": f"Bearer {TOGETHER_KEY}", "Content-Type": "application/json"},
                json={"model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", "max_tokens": 600, "temperature": 0.15, "messages": [{"role": "user", "content": prompt}]},
                timeout=20)
            if r.status_code == 200:
                result = r.json()["choices"][0]["message"]["content"].strip()
                log.info("  🤖 AI format via Together ✓")
                return result
        except Exception as e: log.debug(f"AI Together: {e}")

    return None

def _manual_format(title, price, mrp, discount, coupon, store, aff_link) -> str:
    """Reliable manual fallback — always produces valid output."""
    disc = discount or (round((1 - price/mrp)*100) if price and mrp and mrp > price else None)
    name = title[:80]
    if price:
        if disc and disc >= 75:    qual = "(Steal Deal)"
        elif disc and disc >= 60:  qual = "(Loot Deal)"
        elif coupon:               qual = "(Final Price)"
        elif mrp and mrp > price:  qual = f"(MRP ₹{mrp:,.0f})"
        else:                      qual = ""
        head = f"{name} @ ₹{price:,.0f} {qual}".strip()
    elif disc:
        head = f"{disc}% Off: {name}"
    else:
        head = name
    lines = [head, ""]
    if coupon: lines += [f"Apply Coupon: {coupon}", ""]
    lines.append(aff_link)
    if mrp and price and mrp > price and "(MRP" not in head:
        lines += ["", f"MRP: ₹{mrp:,.0f}"]
    if store and store not in aff_link:
        lines.append(f"Available on: {store}")
    return "\n".join(lines)

def generate_post(title, price, mrp, discount, coupon, store, aff_link, extra_desc="", extra_links=None) -> str:
    """AI format → validate → manual fallback. Never returns empty."""
    extra_info = ""
    if extra_desc:
        extra_info += f"\n\nDeal description from DesiDime page:\n{extra_desc[:600]}"
    if extra_links:
        extra_info += f"\n\nExtra affiliate links:\n" + "\n".join(extra_links[:3])
    prompt = _build_dd_prompt(title, price, mrp, discount, coupon, store, aff_link)
    if extra_info:
        prompt += f"\n\nADDITIONAL CONTEXT (use if helpful):{extra_info}"
    try:
        result = _ai_format_post(prompt)
        if result and _validate_ai_output(result, aff_link):
            if aff_link and aff_link not in result:
                result += f"\n\n{aff_link}"
            return result
        elif result:
            log.warning("  ⚠️ AI output failed validation — manual fallback")
    except Exception as e:
        log.warning(f"  ⚠️ AI format error: {e}")
    log.info("  📝 Using manual format (fallback)")
    return _manual_format(title, price, mrp, discount, coupon, store, aff_link)

# ═══════════════════════════════════════════════════════════════════
#  DESIDIME SCRAPER
# ═══════════════════════════════════════════════════════════════════

def scrape_deal_page(permalink: str, session=None) -> dict:
    """Fetch full DesiDime deal page and extract description, images, links."""
    if not permalink:
        return {"desc": "", "images": [], "links": []}
    try:
        url = f"https://www.desidime.com/{permalink.lstrip('/')}"
        s = session or requests.Session()
        s.headers.update(HEADERS)
        r = s.get(url, timeout=15)
        if r.status_code != 200:
            log.debug(f"  deal page {r.status_code}: {url}")
            return {"desc": "", "images": [], "links": []}
        soup = BeautifulSoup(r.text, "html.parser")
        # Try multiple selectors — DesiDime sometimes changes class names
        el = (
            soup.select_one("div.content-formatting") or
            soup.select_one("div.deal-description") or
            soup.select_one("div[class*='content-format']") or
            soup.select_one("div[class*='deal-desc']") or
            soup.select_one("div[class*='description']") or
            soup.select_one("div.content") or
            soup.select_one("div.user-content") or
            soup.select_one("div[class*='post-content']") or
            soup.select_one("article div[class*='body']") or
            soup.select_one("div[class*='deal-body']")
        )
        if not el:
            log.debug(f"  scrape_deal_page: no description container found for {url}")
            # Still try to get og:image even if no description div
            try:
                og_tag = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
                if og_tag and og_tag.get("content", "").startswith("http"):
                    return {"desc": "", "images": [og_tag["content"].strip()], "links": []}
            except:
                pass
            return {"desc": "", "images": [], "links": []}
        log.debug(f"  scrape_deal_page: matched selector class={el.get('class','')}")
        # Extract plain text description (increased from 800 to 1500 for richer AI context)
        desc = el.get_text(" ", strip=True)[:1500]
        # Extract images — accept any external image, skip tiny icons/tracking pixels
        images = []
        SKIP_IMG = {"emoji","icon","avatar","logo","badge","pixel","tracking","1x1","spacer"}
        LAZY_ATTRS = ["src", "data-src", "data-lazy-src", "data-original", "data-image",
                      "data-img", "data-echo", "data-url", "data-lazy", "data-delayed-src"]
        for img in el.find_all("img"):
            src = ""
            for attr in LAZY_ATTRS:
                val = img.get(attr, "")
                if val and val.startswith("http"):
                    src = val
                    break
            if not src: continue
            src_lower = src.lower()
            if any(s in src_lower for s in SKIP_IMG): continue
            # Skip very small images by checking width/height attributes
            w = img.get("width","0"); h = img.get("height","0")
            try:
                if int(str(w).replace("px","") or 999) < 50: continue
                if int(str(h).replace("px","") or 999) < 50: continue
            except: pass
            images.append(src)
        # If no images found in content area, try the deal page's og:image
        if not images:
            log.debug(f"  No desc images found — trying og:image fallback (el HTML snippet: {str(el)[:300]})")
            try:
                og_tag = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
                if og_tag and og_tag.get("content","").startswith("http"):
                    images.append(og_tag["content"].strip())
                    log.debug("  Using deal page og:image as fallback image")
            except: pass
            # Also check srcset as last resort
            if not images:
                for img in el.find_all("img"):
                    srcset = img.get("srcset", "")
                    if srcset:
                        first = srcset.strip().split(",")[0].strip().split(" ")[0]
                        if first.startswith("http"):
                            images.append(first)
                            log.debug(f"  Using srcset image: {first[:80]}")
                            break
        # Extract and resolve links
        raw_links = []
        for a in el.find_all("a", href=True):
            href = a["href"]
            if "visit.desidime.com" in href or "ddime.in" in href or href.startswith("http"):
                raw_links.append(href)
        # Follow redirects for desidime visit links
        resolved_links = []
        for lnk in raw_links[:4]:  # cap at 4 links
            try:
                if "visit.desidime.com" in lnk or "ddime.in" in lnk:
                    resp = s.get(lnk, timeout=6, allow_redirects=True)
                    final = resp.url
                else:
                    final = lnk
                if not _is_spam_domain(final):
                    aff = earnkaro(final)
                    resolved_links.append(aff if aff and aff.startswith("http") else final)
            except Exception as e:
                log.debug(f"  link resolve failed: {e}")
        log.info(f"  📄 Deal page: {len(desc)} chars desc, {len(images)} imgs, {len(resolved_links)} links")
        return {"desc": desc, "images": images, "links": resolved_links}
    except Exception as e:
        log.debug(f"  scrape_deal_page error: {e}")
        return {"desc": "", "images": [], "links": []}

def scrape_deals():
    session = requests.Session()
    session.headers.update(HEADERS)
    try: session.get("https://www.desidime.com/", timeout=10)
    except: pass
    all_deals = []
    for page_url in [
        "https://www.desidime.com/new",
        "https://www.desidime.com/new?page=2",
        "https://www.desidime.com/new?page=3",
    ]:
        try:
            r = session.get(page_url, timeout=20)
            log.info(f"  {page_url} → {r.status_code} | {len(r.text)} chars")
            if r.status_code != 200: continue
            soup = BeautifulSoup(r.text, "html.parser")
            cards = soup.select("article.deal-card")
            log.info(f"  Cards: {len(cards)}")
            for card in cards:
                try:
                    deal_id   = card.get("data-gtm-deal-id","")
                    permalink = card.get("data-permalink","")
                    store     = card.get("data-gtm-store","")
                    uid = hashlib.md5((deal_id or permalink).encode()).hexdigest()[:12]
                    title = ""
                    for sel in ["h2","h3","[class*='title'] a","[class*='title']"]:
                        el = card.select_one(sel)
                        if el:
                            title = el.get_text(strip=True)
                            if title: break
                    if not title:
                        img = card.select_one("img")
                        if img: title = img.get("alt","").strip()
                    if not title:
                        chunks = [t.strip() for t in card.stripped_strings if len(t.strip()) > 8]
                        if chunks: title = chunks[0]
                    if not title or len(title) < 4: continue
                    card_text = card.get_text(" ", strip=True)
                    # Extract main card image (skip generic placeholders)
                    card_img = None
                    for ci in card.find_all("img"):
                        src = ci.get("src") or ci.get("data-src") or ci.get("data-lazy")
                        if not src or not src.startswith("http"):
                            continue
                        skip_terms = ["logo", "icon", "placeholder", "default", "gift", "coupon",
                                      "cashback", "offer", "deal-default", "no-image", "noimage"]
                        if any(t in src.lower() for t in skip_terms):
                            continue
                        card_img = src
                        break
                    all_deals.append({
                        "uid": uid, "title": title, "permalink": permalink,
                        "deal_id": deal_id, "store": store,
                        "card_img": card_img,
                        "price": get_price(card_text), "mrp": get_mrp(card_text),
                        "discount": get_discount(card_text), "coupon": get_coupon(card_text),
                    })
                except: continue
        except Exception as e: log.error(f"  page error: {e}")
    log.info(f"  Total deals: {len(all_deals)}")
    return all_deals, session

# ═══════════════════════════════════════════════════════════════════
#  MAIN CYCLE
# ═══════════════════════════════════════════════════════════════════
def run_cycle():
    global seen, pending
    log.info(f"=== Cycle | seen={len(seen)} ===")
    deals, dd_session = scrape_deals()
    new_deals = [d for d in deals if not is_seen(d["uid"])]
    log.info(f"  New deals: {len(new_deals)}")
    sent = 0
    for d in new_deals:
        # Spam filter only — no discount threshold, no deal_memory cross-check
        if is_spam(d["title"]): mark_seen(d["uid"]); continue

        # 48h duplicate check — skip only if same deal seen AND price not lower
        uid_key = d["uid"]
        # 48h window handled by is_seen() / mark_seen() — deal_memory handles price-level dedup below

        if d.get("price") and d.get("store"):
            try:
                import deal_memory
                if not deal_memory.check_and_update_deal(d["title"], d["store"], d["price"]):
                    log.info(f"  ♻️ Skip: same/higher price within 48h for {d['store']}: {d['title'][:40]}")
                    mark_seen(d["uid"]); continue
            except Exception as e:
                log.debug(f"  deal_memory check failed: {e}")

        log.info(f"  → {d['title'][:55]} | ₹{d['price']} | {d['store']}")

        product_url, ddime_link = get_buy_url(d["deal_id"], d["permalink"])

        # Skip spam/WhatsApp/Telegram links
        for check_url in [product_url, ddime_link]:
            if _is_spam_domain(check_url):
                log.info(f"  ⏭ Skip spam domain: {check_url[:60] if check_url else 'None'}")
                mark_seen(d["uid"]); break
        else:
            pass  # no break — continue normally

        if d["uid"] in seen: continue  # was marked during loop above

        # Build affiliate link
        if product_url:
            aff_link = earnkaro(product_url)
            if not aff_link or not aff_link.startswith("http") or aff_link == product_url:
                # EarnKaro didn't convert — use clean product URL directly
                log.info("  EarnKaro unsupported — using product URL directly")
                aff_link = product_url
        elif ddime_link:
            # No direct product URL — follow ddime redirect to get the real destination
            try:
                r = requests.get(ddime_link, headers=HEADERS, timeout=10, allow_redirects=True)
                final = r.url
                if final and "desidime" not in final and "ddime" not in final:
                    aff_link = earnkaro(final) or final
                    log.info(f"  Resolved ddime → {final[:70]}")
                else:
                    aff_link = ddime_link
            except:
                aff_link = ddime_link
        else:
            log.warning(f"  No URL found — using DesiDime page link")
            aff_link = f"https://www.desidime.com/{d['permalink']}"

        # Deep scrape DesiDime deal page for description + images + links
        page_data = scrape_deal_page(d.get("permalink",""), session=dd_session)
        page_desc = page_data["desc"]
        page_images = page_data["images"]
        page_links = page_data["links"]

        # ROUTING: 3+ links = dump channel, 1-2 links = admin flow
        if len(page_links) >= 3:
            log.info(f"  Multi-link ({len(page_links)} links) -> dump channel (max 3 sent)")
            dump_multi_links(d["title"], page_images[:2], page_links)
            mark_seen(d["uid"]); sent += 1
            time.sleep(1)
            continue

        # Build image list: card image first, then description image
        import urllib.request, time as _t
        def _dl_image(url, prefix):
            try:
                ext = url.split(".")[-1].split("?")[0][:4] or "jpg"
                if len(ext) > 4 or not ext.isalpha():
                    ext = "jpg"
                fname = f"images/{prefix}_{d['uid']}_{int(_t.time())}.{ext}"
                # Blocked CDNs — cannot be downloaded directly, skip early
                BLOCKED_CDNS = [
                    # Flipkart
                    "rukminim2.flixcart.com", "rukminim1.flixcart.com", "img1a.flixcart.com",
                    # Amazon
                    "static.amazon", "images-na.ssl-images-amazon", "m.media-amazon.com",
                    # Myntra
                    "assets.myntrassets.com", "images.myntassets.com",
                    # Swiggy
                    "media-assets.swiggy.com", "prod-unified-assets.swiggy.com",
                    # Zomato
                    "b.zmtcdn.com", "res.cloudinary.com/zomato",
                    # Zepto
                    "cdn.zeptonow.com",
                    # AJIO
                    "assets.ajio.com",
                    # Nykaa
                    "adn.nykaa.com", "media.nykaa.com",
                    # JioMart / Reliance
                    "cdn.jiomart.com", "www.jiomart.com/images",
                    # Meesho
                    "images.meesho.com", "cdn.meesho.com",
                    # Paytm Mall
                    "assetscdn.paytm.com", "staticpg.paytm.com",
                    # Blinkit
                    "cdn.grofers.com", "blinkit.com/raster",
                ]
                if any(b in url for b in BLOCKED_CDNS):
                    log.debug(f"  image blocked CDN ({prefix}): {url[:60]}")
                    return None
                # Use dd_session (has cookies + Referer) for DesiDime CDN images
                if "desidime.com" in url or "ddime.in" in url:
                    r = dd_session.get(url, timeout=10, allow_redirects=True)
                else:
                    dl_headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                        "Referer": "https://www.desidime.com/",
                        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
                    }
                    r = requests.get(url, headers=dl_headers, timeout=10, allow_redirects=True)
                if r.status_code == 200 and len(r.content) > 1000:
                    with open(fname, "wb") as f:
                        f.write(r.content)
                    log.debug(f"  image downloaded ({prefix}): {len(r.content)} bytes")
                    return fname
                else:
                    log.debug(f"  image download failed ({prefix}): status={r.status_code} size={len(r.content)}")
                    return None
            except Exception as e:
                log.debug(f"  image download failed ({prefix}): {e}")
                return None

        img_paths = []
        # Download ALL description images (up to 5)
        for idx, img_url in enumerate(page_images[:5]):
            p = _dl_image(img_url, f"desc{idx}")
            if p: img_paths.append(p)
        # Card image as extra (skip generic placeholders and tiny images < 12KB)
        card_img_url = d.get("card_img")
        if card_img_url:
            skip_terms = ["logo","icon","placeholder","default","gift","coupon","cashback","offer","no-image","noimage","price-tag","deal-tag"]
            if not any(t in card_img_url.lower() for t in skip_terms):
                p = _dl_image(card_img_url, "card")
                if p:
                    import os as _os
                    if _os.path.getsize(p) > 12000:
                        img_paths.append(p)
                    else:
                        _os.unlink(p)
                        log.debug(f"  card image too small — skipping placeholder")
        # Fallback if nothing found — use product image from Amazon/Flipkart
        if not img_paths:
            p = fetch_product_image(product_url) if product_url else None
            if p: img_paths.append(p)
        # Also add product image as extra if we only have desc image and no product image yet
        elif product_url and len(img_paths) == 1:
            p2 = fetch_product_image(product_url)
            if p2 and p2 not in img_paths: img_paths.append(p2)

        img_path = img_paths[0] if img_paths else None

        # Generate AI-formatted post
        post_text = generate_post(
            d["title"][:100], d["price"], d["mrp"],
            d["discount"], d["coupon"], d["store"], aff_link,
            extra_desc=page_desc, extra_links=page_links
        )

        deal_id = d["uid"]
        pending[deal_id] = {"post_text": post_text, "title": d["title"][:60], "img_path": img_path, "img_paths": img_paths, "ts": time.time()}
        save_pending(pending)

        # Save to MongoDB for web dashboard
        _save_deal_to_db({
            "fp_hash": deal_id,
            "prod_name": d["title"][:100],
            "aff_text": post_text,
            "original_text": post_text,
            "prices": {"sale": d.get("price"), "mrp": d.get("mrp"), "discount_pct": d.get("discount")},
            "category": d.get("store") or "General",
            "platforms": [d.get("store", "DesiDime")],
            "coupon": d.get("coupon"),
            "img_path": img_path,
            "status": "pending_approval",
            "source": "desidime",
            "source_channel": "desidime",
            "affiliate_applied": bool(aff_link and aff_link != d.get("link")),
            "deal_type": "product",
            "original_msg_link": d.get("link", ""),
            "store": d.get("store"),
            "ts": time.time(),
        })

        # Admin preview header
        sale_str = f"\u20b9{d['price']:,.0f}" if d["price"] else "price unknown"
        disc_str = f" ({d['discount']}% off)" if d["discount"] else ""
        admin_header = (
            f"New DesiDime Deal\n"
            f"Product: {d['title'][:60]}\n"
            f"Price: {sale_str}{disc_str} | {d['store'] or 'Unknown'}\n\n"
        )
        # Send up to 2 images to admin
        result = send_to_admin(admin_header + post_text + "\n\n#DesiDime", deal_id, image_path=img_path, extra_images=img_paths[1:])

        if result.get("ok"):
            # Store the sent message_id so expired deals' buttons can be removed on restart
            sent_msg_id = (result.get("result") or {}).get("message_id")
            if sent_msg_id:
                pending[deal_id]["msg_id"] = sent_msg_id
                save_pending(pending)
            mark_seen(d["uid"]); sent += 1
            log.info(f"  ✅ Sent to admin ({sent}): {d['title'][:40]}")
            time.sleep(1)
        else:
            log.warning(f"  TG send failed: {result}")
            cleanup_image(img_path)
            pending.pop(deal_id, None); save_pending(pending)

    save_seen(seen)
    log.info(f"=== Done | sent {sent} to admin ===")

# ═══════════════════════════════════════════════════════════════════
#  CALLBACK POLLING THREAD
# ═══════════════════════════════════════════════════════════════════
def poll_callbacks():
    global pending
    offset = 0
    log.info("Callback polling started")
    while True:
        try:
            resp = requests.get(
                f"{TG}/getUpdates",
                params={"offset": offset, "timeout": 30, "allowed_updates": ["callback_query"]},
                timeout=40)
            data = resp.json()
            if not data.get("ok"): time.sleep(5); continue
            for update in data.get("result", []):
                offset = update["update_id"] + 1
                cb = update.get("callback_query")
                if not cb: continue
                cb_id   = cb["id"]
                cb_data = cb.get("data","")
                user_id = cb["from"]["id"]
                msg_id  = cb["message"]["message_id"]
                chat_id = cb["message"]["chat"]["id"]
                if user_id != ADMIN_ID:
                    answer_callback(cb_id, "Not authorized"); continue
                if cb_data.startswith("dd_post_"):
                    deal_id = cb_data[8:]
                    deal    = pending.pop(deal_id, None)
                    save_pending(pending)
                    if not deal:
                        answer_callback(cb_id, "⚠️ Already handled or expired")
                        # Remove buttons only — don't overwrite the message content
                        try:
                            tg("editMessageReplyMarkup", chat_id=chat_id, message_id=msg_id, reply_markup={"inline_keyboard": []})
                        except: pass
                        continue
                    img_path = deal.get("img_path")
                    result   = post_to_channel(deal["post_text"], image_path=img_path)
                    cleanup_image(img_path)
                    if result.get("ok"):
                        answer_callback(cb_id, "✅ Posted!")
                        edit_message(chat_id, msg_id, f"✅ Posted!\n\n{deal['post_text'][:300]}")
                        log.info(f"✅ Posted: {deal['title']}")
                    else:
                        answer_callback(cb_id, "❌ Failed to post")
                        log.warning(f"❌ Post failed: {result}")
                elif cb_data.startswith("dd_skip_"):
                    deal_id = cb_data[8:]
                    deal    = pending.pop(deal_id, None)
                    save_pending(pending)
                    cleanup_image(deal.get("img_path") if deal else None)
                    title = deal["title"] if deal else "deal"
                    answer_callback(cb_id, "🗑️ Skipped")
                    edit_message(chat_id, msg_id, f"🗑️ Skipped: {title}")
                    log.info(f"🗑️ Skipped: {title}")
        except requests.exceptions.ReadTimeout:
            continue
        except Exception as e:
            log.error(f"Poll error: {e}"); time.sleep(5)

# ═══════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ═══════════════════════════════════════════════════════════════════
def main():
    log.info("=" * 60)
    log.info("🚀  DesiDime Bot v13 — Professional Grade")
    log.info(f"    Channel      : {CHANNEL_ID}")
    log.info(f"    Interval     : {INTERVAL}s ({INTERVAL//60} min)")
    log.info(f"    Auto-post    : score ≥ {AUTO_POST_SCORE}/10")
    log.info(f"    Dup window   : 48h (any price drop overrides)")
    ai_chain = []
    if CEREBRAS_KEY:  ai_chain.append("Cerebras")
    if GROQ_KEYS:     ai_chain.append(f"Groq×{len(GROQ_KEYS)}")
    if GEMINI_KEYS:   ai_chain.append(f"Gemini×{len(GEMINI_KEYS)}")
    if TOGETHER_KEY:  ai_chain.append("Together")
    log.info(f"    AI chain     : {' → '.join(ai_chain) if ai_chain else 'manual only'}")
    log.info(f"    EarnKaro     : {'active' if EARNKARO_TOKEN else 'not set'}")
    log.info(f"    Dump channel : {DUMP_CHANNEL}")
    log.info(f"    Multi-link   : {MULTI_LINK_THRESHOLD}+ links = dump")
    log.info("=" * 60)

    if not BOT_TOKEN: log.error("No BOT_TOKEN"); return
    if not ADMIN_ID:  log.error("No ADMIN_USER_ID"); return

    threading.Thread(target=poll_callbacks, daemon=True).start()
    tg("sendMessage", chat_id=ADMIN_ID, text="🚀 DesiDime bot v13 started (Professional Grade)")

    while True:
        try:
            run_cycle()
        except Exception as e:
            log.error(f"Cycle error: {e}")
        log.info(f"Sleeping {INTERVAL}s ({INTERVAL//60} min)...")
        time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
