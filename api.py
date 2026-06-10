#!/usr/bin/env python3
"""
api.py — FastAPI gateway
REST routes + WebSocket server for the React Command Deck.

Endpoints:
  GET  /api/v1/deals/pending          → list pending deals
  GET  /api/v1/deals/recent           → last 50 posted deals
  PUT  /api/v1/deals/{fp}/approve     → approve a deal
  PUT  /api/v1/deals/{fp}/reject      → reject a deal
  GET  /api/v1/stats                  → system stats
  GET  /api/v1/settings               → system settings
  PUT  /api/v1/settings               → update system settings
  GET  /api/v1/channels               → channel list
  GET  /ws                            → WebSocket stream (real-time events)

Run:
  uvicorn api:app --host 0.0.0.0 --port 8000 --reload
"""

import asyncio, os, json, time, logging, shutil
from typing import Any
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import mimetypes
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")
import redis as redis_lib
import motor.motor_asyncio as motor

IMAGES_DIR = Path(os.getenv("IMAGES_DIR", "/home/rudranil777/dealbot/images"))
IMAGES_DIR.mkdir(exist_ok=True)
IMAGES_BASE_URL = os.getenv("IMAGES_BASE_URL", "http://74.225.250.0/images")

# ───────────────────────────────────────────────────────────────────
#  CONFIG
# ───────────────────────────────────────────────────────────────────
REDIS_URL      = os.getenv("REDIS_URL",    "redis://127.0.0.1:6379/0")
MONGODB_URI    = os.getenv("MONGODB_URI",  "")
MONGODB_DB     = os.getenv("MONGODB_DB",   "dealbot")
PUBSUB_CHANNEL = "deals:finalized"

log = logging.getLogger("api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [API] %(message)s")

# ───────────────────────────────────────────────────────────────────
#  APP
# ───────────────────────────────────────────────────────────────────
app = FastAPI(title="DealBot API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten this when frontend domain is known
    allow_methods=["*"],
    allow_headers=["*"],
)

# ───────────────────────────────────────────────────────────────────
#  CLIENTS
# ───────────────────────────────────────────────────────────────────
_redis = redis_lib.Redis.from_url(REDIS_URL, decode_responses=True)
_mongo_client = None
_db           = None

def get_db():
    global _mongo_client, _db
    if _db is None and MONGODB_URI:
        _mongo_client = motor.AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        _db = _mongo_client[MONGODB_DB]
    return _db

# ───────────────────────────────────────────────────────────────────
#  WEBSOCKET MANAGER
# ───────────────────────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        log.info("WS client connected — total=%d", len(self.active))

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
        log.info("WS client disconnected — total=%d", len(self.active))

    async def broadcast(self, data: dict):
        if not self.active:
            return
        msg  = json.dumps(data, ensure_ascii=False)
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(msg)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

manager = ConnectionManager()

# ───────────────────────────────────────────────────────────────────
#  REDIS PUB/SUB → BROADCAST LOOP
# ───────────────────────────────────────────────────────────────────
async def pubsub_listener():
    """Runs as background task — subscribes to Redis Pub/Sub and broadcasts to all WS clients.
    Uses polling loop instead of async for to avoid RuntimeError: aclose() crash."""
    await asyncio.sleep(1)  # let startup complete
    import redis.asyncio as aioredis
    while True:
        try:
            r = aioredis.Redis.from_url(REDIS_URL, decode_responses=True)
            pubsub = r.pubsub()
            await pubsub.subscribe(PUBSUB_CHANNEL, "deals:new")
            log.info("Pub/Sub subscribed: %s + deals:new", PUBSUB_CHANNEL)
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message["type"] == "message":
                    try:
                        payload = json.loads(message["data"])
                        await manager.broadcast(payload)
                    except Exception as e:
                        log.warning("Pub/Sub broadcast error: %s", e)
                await asyncio.sleep(0.1)
        except Exception as e:
            log.warning("Pub/Sub listener crashed, restarting in 2s: %s", e)
            await asyncio.sleep(2)

@app.on_event("startup")
async def startup():
    asyncio.create_task(pubsub_listener())
    log.info("DealBot API started")

# ───────────────────────────────────────────────────────────────────
#  WEBSOCKET ENDPOINT
# ───────────────────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)

    # Send current system snapshot on connect
    try:
        db = get_db()
        snapshot = {
            "event":         "snapshot",
            "queue_depth":   _redis.llen("queue:deals"),
            "redis_memory":  _redis.info("memory")["used_memory_human"],
            "pending_count": await db.UniqueDeals.count_documents({"status": "pending_approval"}) if db else 0,
            "posted_today":  await db.UniqueDeals.count_documents({
                "status": "posted",
                "processed_ts": {"$gte": time.time() - 86400}
            }) if db else 0,
            "ts": time.time(),
        }
        await ws.send_text(json.dumps(snapshot))
    except Exception as e:
        log.warning("Snapshot error: %s", e)

    try:
        while True:
            # Keep connection alive — ping every 30s
            await asyncio.sleep(30)
            await ws.send_text(json.dumps({"event": "ping", "ts": time.time()}))
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        manager.disconnect(ws)

# ───────────────────────────────────────────────────────────────────
#  REST — DEALS
# ───────────────────────────────────────────────────────────────────
def _clean(doc: dict) -> dict:
    """Remove MongoDB _id from response."""
    doc.pop("_id", None)
    return doc

@app.get("/api/v1/deals/pending")
async def get_pending(limit: int = 50, skip: int = 0):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    cursor = db.UniqueDeals.find(
        {"status": "pending_approval"},
        {"_id": 0}
    ).sort("processed_ts", -1).skip(skip).limit(limit)  # newest first
    deals = await cursor.to_list(length=limit)
    total = await db.UniqueDeals.count_documents({"status": "pending_approval"})
    return {"deals": deals, "total": total, "skip": skip, "limit": limit}

@app.get("/api/v1/deals/recent")
async def get_recent(limit: int = 50):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    cursor = db.UniqueDeals.find(
        {"status": "posted"},
        {"_id": 0}
    ).sort("processed_ts", -1).limit(limit)
    deals = await cursor.to_list(length=limit)
    return {"deals": deals, "total": len(deals)}

@app.get("/api/v1/deals/duplicates")
async def get_duplicates(limit: int = 50):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    cursor = db.DuplicateLogs.find({}, {"_id": 0}).sort("ts", -1).limit(limit)
    dupes = await cursor.to_list(length=limit)
    return {"duplicates": dupes, "total": len(dupes)}

from fastapi import Request

@app.put("/api/v1/deals/{fp_hash}/approve")
async def approve_deal(fp_hash: str, req: Request):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
        
    try:
        body = await req.json()
    except Exception:
        body = {}
        
    updates = {"status": "posted", "approved_ts": time.time()}
    if body:
        if "message" in body: updates["message"] = body["message"]
        if "title" in body: updates["prod_name"] = body["title"]
        
        # Safely update prices if they exist in the payload
        prices_update = {}
        if "price" in body and body["price"]:
            try: prices_update["prices.sale"] = float(body["price"])
            except: pass
        if "original_price" in body and body["original_price"]:
            try: prices_update["prices.mrp"] = float(body["original_price"])
            except: pass
            
        updates.update(prices_update)
        
        if "affiliate_link" in body and body["affiliate_link"]: 
            updates["aff_text"] = body["affiliate_link"]

    result = await db.UniqueDeals.update_one(
        {"fp_hash": fp_hash},
        {"$set": updates}
    )
    if result.modified_count == 0 and not body:
        raise HTTPException(404, f"Deal {fp_hash} not found")

    # Broadcast approval event to all WS clients
    deal = await db.UniqueDeals.find_one({"fp_hash": fp_hash}, {"_id": 0})
    await manager.broadcast({
        "event":   "deal_approved",
        "fp_hash": fp_hash,
        "deal":    deal,
        "ts":      time.time(),
    })
    
    # Also publish to Redis so bot.py can actually post it to Telegram
    try:
        _redis.publish("deals:approved", json.dumps(deal, ensure_ascii=False))
        log.info("Published deals:approved to Redis for fp_hash: %s", fp_hash)
    except Exception as e:
        log.error("Failed to publish deals:approved to Redis: %s", e)
        
    return {"status": "approved", "fp_hash": fp_hash}

@app.put("/api/v1/deals/{fp_hash}/reject")
async def reject_deal(fp_hash: str):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    result = await db.UniqueDeals.update_one(
        {"fp_hash": fp_hash},
        {"$set": {"status": "rejected", "rejected_ts": time.time()}}
    )
    if result.modified_count == 0:
        raise HTTPException(404, f"Deal {fp_hash} not found")
    await manager.broadcast({
        "event":   "deal_rejected",
        "fp_hash": fp_hash,
        "ts":      time.time(),
    })
    return {"status": "rejected", "fp_hash": fp_hash}

# ───────────────────────────────────────────────────────────────────
#  REST — EDIT DEAL
# ───────────────────────────────────────────────────────────────────
@app.put("/api/v1/deals/{fp_hash}/edit")
async def edit_deal(fp_hash: str, body: dict[str, Any]):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")

    allowed = {"aff_text", "prod_name", "prices", "category", "coupon", "img_url", "message", "title", "price", "original_price", "affiliate_link"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(400, "No valid fields to update")
    updates["edited_ts"] = time.time()

    result = await db.UniqueDeals.update_one(
        {"fp_hash": fp_hash},
        {"$set": updates}
    )
    if result.modified_count == 0:
        raise HTTPException(404, f"Deal {fp_hash} not found")

    deal = await db.UniqueDeals.find_one({"fp_hash": fp_hash}, {"_id": 0})
    await manager.broadcast({
        "event":   "deal_edited",
        "fp_hash": fp_hash,
        "deal":    deal,
        "ts":      time.time(),
    })
    return {"status": "updated", "fp_hash": fp_hash, "updated_fields": list(updates.keys())}

# ───────────────────────────────────────────────────────────────────
#  REST — IMAGE UPLOAD
# ───────────────────────────────────────────────────────────────────
@app.post("/api/v1/deals/{fp_hash}/image")
async def upload_deal_image(fp_hash: str, file: UploadFile = File(...)):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")

    deal = await db.UniqueDeals.find_one({"fp_hash": fp_hash})
    if not deal:
        raise HTTPException(404, f"Deal {fp_hash} not found")

    # Save uploaded file
    ext = Path(file.filename).suffix or ".jpg"
    filename = f"upload_{fp_hash[:16]}_{int(time.time())}{ext}"
    dest = IMAGES_DIR / filename
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    img_url = f"{IMAGES_BASE_URL}/{filename}"

    await db.UniqueDeals.update_one(
        {"fp_hash": fp_hash},
        {"$set": {"img_url": img_url, "img_path": str(dest)}}
    )

    await manager.broadcast({
        "event":   "deal_image_updated",
        "fp_hash": fp_hash,
        "img_url": img_url,
        "ts":      time.time(),
    })
    return {"status": "uploaded", "img_url": img_url}

@app.delete("/api/v1/deals/{fp_hash}/image")
async def delete_deal_image(fp_hash: str):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")

    await db.UniqueDeals.update_one(
        {"fp_hash": fp_hash},
        {"$set": {"img_url": None, "img_path": None}}
    )
    return {"status": "deleted", "fp_hash": fp_hash}

# ───────────────────────────────────────────────────────────────────
#  REST — STATS
# ───────────────────────────────────────────────────────────────────
@app.get("/api/v1/stats")
async def get_stats():
    db = get_db()
    redis_info = _redis.info("memory")
    queue_depth = _redis.llen("queue:deals")
    redis_keys  = _redis.dbsize()

    stats = {
        "redis": {
            "queue_depth":   queue_depth,
            "total_keys":    redis_keys,
            "memory_used":   redis_info["used_memory_human"],
            "memory_peak":   redis_info["used_memory_peak_human"],
            "memory_max":    "100mb",
        },
        "ts": time.time(),
    }

    if db is not None:
        stats["mongodb"] = {
            "pending":  await db.UniqueDeals.count_documents({"status": "pending_approval"}),
            "posted":   await db.UniqueDeals.count_documents({"status": "posted"}),
            "rejected": await db.UniqueDeals.count_documents({"status": "rejected"}),
            "total":    await db.UniqueDeals.count_documents({}),
            "dupes":    await db.DuplicateLogs.count_documents({}),
        }
        stats["mongodb"]["posted_today"] = await db.UniqueDeals.count_documents({
            "status": "posted",
            "processed_ts": {"$gte": time.time() - 86400}
        })

    stats["websocket_clients"] = len(manager.active)
    return stats

# ───────────────────────────────────────────────────────────────────
#  REST — SETTINGS
# ───────────────────────────────────────────────────────────────────
@app.get("/api/v1/settings")
async def get_settings():
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    doc = await db.SystemSettings.find_one({"_id": "config"}, {"_id": 0})
    return {"settings": doc or {}}

@app.put("/api/v1/settings")
async def update_settings(body: dict[str, Any]):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")

    if not body:
        raise HTTPException(400, "No settings provided")

    await db.SystemSettings.update_one(
        {"_id": "config"},
        {"$set": {**body, "updated_ts": time.time()}},
        upsert=True,
    )

    # Broadcast settings change to workers via Redis
    _redis.publish("system:settings_changed", json.dumps(body))

    return {"updated": body}

# ───────────────────────────────────────────────────────────────────
#  REST — CHANNELS
# ───────────────────────────────────────────────────────────────────
@app.get("/api/v1/channels")
@app.get("/api/v1/channels/config")
async def get_channels():
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
        
    doc = await db.SystemSettings.find_one({"_id": "channels_config"})
    if not doc:
        # Fallback to .env if not found in Mongo
        source_channels = [ch.strip() for ch in os.getenv("SOURCE_CHANNELS", "").split(",") if ch.strip()]
        doc = {"channels": {ch: True for ch in source_channels}}
        await db.SystemSettings.update_one({"_id": "channels_config"}, {"$set": doc}, upsert=True)
    
    active_map = doc.get("channels", {})

    # Get recent activity per channel from MongoDB
    channel_stats = {}
    pipeline = [
        {"$match": {"processed_ts": {"$gte": time.time() - 86400}}},
        {"$group": {
            "_id":   "$source_channel",
            "count": {"$sum": 1},
            "avg_score": {"$avg": "$score"},
            "last_ts":   {"$max": "$processed_ts"},
        }}
    ]
    async for d in db.UniqueDeals.aggregate(pipeline):
        channel_stats[d["_id"]] = {
            "deals_24h": d["count"],
            "avg_score": round(d["avg_score"] or 0, 1),
            "last_ts":   d["last_ts"],
        }

    channels = []
    for ch, is_active in active_map.items():
        stats = channel_stats.get(ch, {"deals_24h": 0, "avg_score": 0, "last_ts": None})
        channels.append({
            "channel": ch,
            "active":  is_active,
            **stats,
        })

    return {"channels": channels, "total": len(channels)}

@app.post("/api/v1/channels/config")
async def add_channel(body: dict[str, Any]):
    ch = body.get("channel", "").strip()
    if not ch:
        raise HTTPException(400, "Missing channel")
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    
    await db.SystemSettings.update_one(
        {"_id": "channels_config"},
        {"$set": {f"channels.{ch}": True}},
        upsert=True
    )
    _redis.publish("system:channels_changed", "added")
    return {"status": "ok", "channel": ch}

@app.put("/api/v1/channels/config/{channel_id:path}/toggle")
async def toggle_channel(channel_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
        
    doc = await db.SystemSettings.find_one({"_id": "channels_config"})
    if not doc or "channels" not in doc:
        current_state = True
    else:
        current_state = doc["channels"].get(channel_id, True)
        
    new_state = not current_state
    await db.SystemSettings.update_one(
        {"_id": "channels_config"},
        {"$set": {f"channels.{channel_id}": new_state}},
        upsert=True
    )
    _redis.publish("system:channels_changed", "toggled")
    return {"status": "ok", "channel": channel_id, "active": new_state}

@app.delete("/api/v1/channels/config/{channel_id:path}")
async def delete_channel(channel_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    await db.SystemSettings.update_one(
        {"_id": "channels_config"},
        {"$unset": {f"channels.{channel_id}": ""}}
    )
    _redis.publish("system:channels_changed", "deleted")
    return {"status": "ok", "deleted": channel_id}

# ───────────────────────────────────────────────────────────────────
#  V2 — AI REWRITE
# ───────────────────────────────────────────────────────────────────
@app.post("/api/v1/deals/{fp_hash}/ai-rewrite")
async def ai_rewrite(fp_hash: str, body: dict[str, Any]):
    """User-triggered AI rewrite via backend (keeps API keys server-side)."""
    import aiohttp
    instruction = body.get("instruction", "Clean up and format nicely")
    current_text = body.get("current_text", "")
    deal_type = body.get("deal_type", "product")
    
    if not current_text:
        raise HTTPException(400, "No text to rewrite")
    
    # Try Gemini first
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_key:
        keys = [k.strip() for k in os.getenv("GEMINI_KEYS", "").split(",") if k.strip()]
        gemini_key = keys[0] if keys else ""
    
    if not gemini_key:
        raise HTTPException(503, "No AI keys configured")
    
    prompt = f"""You are a Telegram channel deal formatter for @dealsforindiachannel.
Rewrite the following deal post based on the user's instruction.

User instruction: {instruction}
Deal type: {deal_type}
Current post text:
---
{current_text}
---

Rules:
- Keep ALL links intact
- Keep ALL important information (prices, coupons, steps)
- Use emojis appropriately
- For tricks: NEVER shorten steps, keep ALL steps and links
- For products: Include price, link, and key features
- Output ONLY the rewritten text, nothing else"""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"maxOutputTokens": 2048, "temperature": 0.7}
            }, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                data = await resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"rewritten_text": text.strip()}
    except Exception as e:
        log.error("AI rewrite failed: %s", e)
        raise HTTPException(500, f"AI rewrite failed: {str(e)}")

# ───────────────────────────────────────────────────────────────────
#  V2 — SCRAPE IMAGE
# ───────────────────────────────────────────────────────────────────
@app.post("/api/v1/deals/{fp_hash}/scrape-image")
async def scrape_image(fp_hash: str):
    """Scrape product image from expanded URLs."""
    import aiohttp
    from bs4 import BeautifulSoup
    
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    
    deal = await db.UniqueDeals.find_one({"fp_hash": fp_hash}, {"_id": 0})
    if not deal:
        raise HTTPException(404, "Deal not found")
    
    urls = list((deal.get("expanded_urls") or {}).values())
    if not urls:
        # Try extracting from aff_text
        import re
        urls = re.findall(r'https?://\S+', deal.get("aff_text", ""))
    
    if not urls:
        raise HTTPException(400, "No URLs found in deal")
    
    img_url = None
    try:
        async with aiohttp.ClientSession() as session:
            for url in urls[:3]:
                try:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10), headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    }) as resp:
                        if resp.status != 200:
                            continue
                        html = await resp.text()
                        soup = BeautifulSoup(html, "html.parser")
                        # Try OG image
                        og = soup.find("meta", property="og:image")
                        if og and og.get("content"):
                            img_url = og["content"]
                            break
                        # Try product image
                        for sel in ["#landingImage", "#imgBlkFront", ".product-image img", "img.product-img"]:
                            tag = soup.select_one(sel)
                            if tag and tag.get("src"):
                                img_url = tag["src"]
                                break
                        if img_url:
                            break
                except Exception:
                    continue
    except Exception as e:
        log.error("Image scrape failed: %s", e)
    
    if not img_url:
        raise HTTPException(404, "Could not find product image")
    
    await db.UniqueDeals.update_one(
        {"fp_hash": fp_hash},
        {"$set": {"img_url": img_url, "img_path": img_url}}
    )
    return {"img_url": img_url}

# ───────────────────────────────────────────────────────────────────
#  V2 — RETRY AFFILIATE
# ───────────────────────────────────────────────────────────────────
@app.post("/api/v1/deals/{fp_hash}/retry-affiliate")
async def retry_affiliate(fp_hash: str):
    """Retry EarnKaro affiliate conversion."""
    import aiohttp
    
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    
    deal = await db.UniqueDeals.find_one({"fp_hash": fp_hash}, {"_id": 0})
    if not deal:
        raise HTTPException(404, "Deal not found")
    
    earnkaro_token = os.getenv("EARNKARO_TOKEN", "")
    if not earnkaro_token:
        return {"success": False, "error": "EarnKaro token not configured"}
    
    text = deal.get("original_text") or deal.get("aff_text", "")
    import re
    urls = re.findall(r'https?://\S+', text)
    
    if not urls:
        return {"success": False, "error": "No URLs found in deal text"}
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://ekaro.in/api/v1/link/convert",
                json={"text": text},
                headers={"Authorization": f"Bearer {earnkaro_token}"},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                data = await resp.json()
                if data.get("success") and data.get("text"):
                    new_text = data["text"]
                    await db.UniqueDeals.update_one(
                        {"fp_hash": fp_hash},
                        {"$set": {"aff_text": new_text, "affiliate_applied": True}}
                    )
                    return {"success": True, "aff_text": new_text}
                return {"success": False, "error": data.get("message", "Conversion failed")}
    except Exception as e:
        log.error("Retry affiliate failed: %s", e)
        return {"success": False, "error": str(e)}

# ───────────────────────────────────────────────────────────────────
#  V2 — MARK SPAM
# ───────────────────────────────────────────────────────────────────
@app.put("/api/v1/deals/{fp_hash}/spam")
async def mark_spam(fp_hash: str):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    result = await db.UniqueDeals.update_one(
        {"fp_hash": fp_hash},
        {"$set": {"status": "spam", "spam_ts": time.time()}}
    )
    if result.modified_count == 0:
        raise HTTPException(404, f"Deal {fp_hash} not found")
    await manager.broadcast({
        "event": "deal_rejected", "fp_hash": fp_hash, "ts": time.time(),
    })
    return {"status": "spam", "fp_hash": fp_hash}

# ───────────────────────────────────────────────────────────────────
#  V2 — COMPOSE DEAL
# ───────────────────────────────────────────────────────────────────
@app.post("/api/v1/deals/compose")
async def compose_deal(body: dict[str, Any]):
    """Manually create a new deal."""
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    
    fp_hash = f"manual_{int(time.time())}_{hash(body.get('prod_name', '')) % 10000}"
    deal = {
        "fp_hash": fp_hash,
        "prod_name": body.get("prod_name", ""),
        "aff_text": body.get("aff_text", ""),
        "original_text": body.get("original_text", body.get("aff_text", "")),
        "prices": body.get("prices", {}),
        "category": body.get("category", "General"),
        "platforms": body.get("platforms", []),
        "coupon": body.get("coupon"),
        "affiliate_link": body.get("affiliate_link", ""),
        "deal_type": body.get("deal_type", "product"),
        "source": "manual",
        "status": "pending_approval",
        "ts": time.time(),
    }
    
    await db.UniqueDeals.insert_one(deal)
    deal.pop("_id", None)
    
    await manager.broadcast({
        "event": "new_deal", **deal, "ts": time.time(),
    })
    return {"status": "created", "fp_hash": fp_hash}

# ───────────────────────────────────────────────────────────────────
#  V2 — DESIDIME DEALS
# ───────────────────────────────────────────────────────────────────
@app.get("/api/v1/deals/desidime")
async def get_desidime_deals(limit: int = 100):
    db = get_db()
    if db is None:
        raise HTTPException(503, "MongoDB not configured")
    cursor = db.deals.find(
        {"source": "desidime"},
        {"_id": 0}
    ).sort("ts", -1).limit(limit)
    deals = await cursor.to_list(length=limit)
    return {"deals": deals, "total": len(deals)}

# ───────────────────────────────────────────────────────────────────
#  HEALTH CHECK
# ───────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    redis_ok = False
    mongo_ok = False
    try:
        _redis.ping()
        redis_ok = True
    except:
        pass
    try:
        db = get_db()
        if db is not None:
            await db.command("ping")
            mongo_ok = True
    except:
        pass
    return {
        "status":  "ok" if redis_ok and mongo_ok else "degraded",
        "redis":   redis_ok,
        "mongodb": mongo_ok,
        "ws_clients": len(manager.active),
        "ts": time.time(),
    }

# ───────────────────────────────────────────────────────────────────
#  REST — CLONES
# ───────────────────────────────────────────────────────────────────
@app.get("/api/v1/clones")
async def get_clones():
    db = get_db()
    if db is None: raise HTTPException(503, "MongoDB not configured")
    cursor = db.CloneProfiles.find({}, {"_id": 0})
    profiles = await cursor.to_list(length=100)
    return {"profiles": profiles}

@app.post("/api/v1/clones")
async def add_clone(req: Request):
    db = get_db()
    if db is None: raise HTTPException(503, "MongoDB not configured")
    try:
        body = await req.json()
    except:
        body = {}
    body["ts"] = time.time()
    await db.CloneProfiles.insert_one(body)
    return {"status": "added"}

# ───────────────────────────────────────────────────────────────────
#  SERVE REACT DASHBOARD
# ───────────────────────────────────────────────────────────────────
import os
from pathlib import Path

# Mount the images directory (contains deal images)
import os
os.makedirs("images", exist_ok=True)
app.mount("/images", StaticFiles(directory="images"), name="images")

# Mount the assets directory (contains css, js, images)
app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

# Catch-all route to serve the React SPA index.html or specific files
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    path = Path("static") / full_path
    if path.is_file():
        return FileResponse(path)
    return FileResponse("static/index.html")
