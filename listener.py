#!/usr/bin/env python3
"""
listener.py — Passive Telegram channel listener
Zero processing logic. One job: receive messages → LPUSH to Redis queue:deals.

Replaces the scraper loop inside bot.py.
Uses the existing scraper_session.session file (read-only — no new auth needed).
"""

import asyncio, os, json, logging, time, sys
from logging.handlers import RotatingFileHandler
from pathlib import Path
from dotenv import load_dotenv
from telethon import TelegramClient, events

load_dotenv()

# ───────────────────────────────────────────────────────────────────
#  LOGGING
# ───────────────────────────────────────────────────────────────────
_rot = RotatingFileHandler(
    "listener.log", maxBytes=5*1024*1024, backupCount=2, encoding="utf-8"
)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [LISTENER] %(message)s",
    handlers=[_rot],
)
log = logging.getLogger(__name__)

# ───────────────────────────────────────────────────────────────────
#  CONFIG
# ───────────────────────────────────────────────────────────────────
API_ID   = int(os.getenv("TG_API_ID", "0"))
API_HASH = os.getenv("TG_API_HASH", "")

# Hardcoded negative 10-digit channel IDs (from your SOURCE_CHANNELS env)
# listener.py uses entity IDs directly — no channel username lookups.
# This prevents Telegram flagging the account for enumeration behaviour.
SOURCE_CHANNELS: list[str] = [
    ch.strip() for ch in os.getenv("SOURCE_CHANNELS", "").split(",") if ch.strip()
]

REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
QUEUE_KEY = "queue:deals"

# ───────────────────────────────────────────────────────────────────
#  REDIS
# ───────────────────────────────────────────────────────────────────
import redis as redis_lib

_redis = redis_lib.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
    socket_connect_timeout=3,
    socket_timeout=3,
)

def push(payload: dict):
    try:
        _redis.lpush(QUEUE_KEY, json.dumps(payload, ensure_ascii=False))
    except Exception as e:
        log.error("Redis push failed: %s", e)

# ───────────────────────────────────────────────────────────────────
#  TELETHON LISTENER
# ───────────────────────────────────────────────────────────────────
async def main():
    if not API_ID or not API_HASH:
        log.error("TG_API_ID / TG_API_HASH missing in .env")
        sys.exit(1)

    if not SOURCE_CHANNELS:
        log.error("SOURCE_CHANNELS empty in .env")
        sys.exit(1)

    # Ping Redis before starting
    try:
        _redis.ping()
        log.info("Redis connected at %s", REDIS_URL)
    except Exception as e:
        log.error("Redis unavailable: %s — cannot start listener", e)
        sys.exit(1)

    # Reuse the existing scraper session — no new login needed
    from telethon.sessions import StringSession
    _ss = os.getenv("LISTENER_SESSION_STRING")
    client = TelegramClient(StringSession(_ss), API_ID, API_HASH)
    await client.start()
    log.info("Telegram session started (read-only listener)")

    # Resolve channel entities once on startup
    entities = {}
    from telethon import utils
    for ch in SOURCE_CHANNELS:
        try:
            entity = await client.get_entity(ch)
            peer_id = utils.get_peer_id(entity)
            entities[peer_id] = {
                "channel":  ch,
                "username": getattr(entity, "username", None) or ch,
                "title":    getattr(entity, "title",    None) or ch,
            }
            log.info("  Watching: %s (id=%s)", ch, peer_id)
        except Exception as e:
            log.warning("  Could not resolve %s: %s", ch, e)

    if not entities:
        log.error("No channels resolved — check SOURCE_CHANNELS in .env")
        await client.disconnect()
        sys.exit(1)

    log.info("Listening to %d channels → queue:%s", len(entities), QUEUE_KEY)

    # ── Event handler — fires on every new message ──────────────────
    @client.on(events.NewMessage(chats=list(entities.keys())))
    async def on_message(event):
        msg  = event.message
        text = msg.text or ""

        # Skip empty messages with no media
        if len(text) < 5 and not msg.media:
            return

        ch_info = entities.get(event.chat_id, {})

        # Download media if present
        img_path_str = None
        img_url = None
        if msg.media and hasattr(msg.media, "photo"):
            try:
                os.makedirs("/home/rudranil777/dealbot/images", exist_ok=True)
                ext = "jpg"
                filename = f"listen_{msg.id}_{int(time.time())}.{ext}"
                abs_path = f"/home/rudranil777/dealbot/images/{filename}"
                await client.download_media(msg, file=abs_path)
                img_path_str = abs_path
                img_url = f"http://74.225.250.0/images/{filename}"
                log.info("  Downloaded image: %s", filename)
            except Exception as e:
                log.warning("  Failed to download image: %s", e)

        payload = {
            "source":   "telegram",
            "channel":  ch_info.get("channel",  str(event.chat_id)),
            "username": ch_info.get("username", str(event.chat_id)),
            "title":    ch_info.get("title",    str(event.chat_id)),
            "msg_id":   msg.id,
            "text":     text,
            "has_media": bool(msg.media),
            "media_type": type(msg.media).__name__ if msg.media else None,
            "img_path": img_path_str,
            "img_url":  img_url,
            "date":     msg.date.isoformat() if msg.date else None,
            "ts":       time.time(),
        }

        push(payload)

        queue_len = _redis.llen(QUEUE_KEY)
        log.info(
            "→ queued msg_id=%s channel=%s len=%d chars queue_depth=%d",
            msg.id,
            ch_info.get("channel", "?"),
            len(text),
            queue_len,
        )

    # ── Run forever ─────────────────────────────────────────────────
    log.info("Listener running — press Ctrl+C to stop")
    await client.run_until_disconnected()


if __name__ == "__main__":
    asyncio.run(main())
