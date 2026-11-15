import os
import sys
import json
import time
import subprocess
from datetime import datetime, timezone
from dotenv import load_dotenv
import pymongo
import redis

load_dotenv("/home/rudranil777/dealbot/.env")
load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI") or "mongodb://localhost:27017/"
DB_NAME = os.getenv("MONGODB_DB") or os.getenv("MONGO_DB") or "dealbot"
REDIS_URL = os.getenv("REDIS_URL") or "redis://localhost:6379/0"

audit = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "database_audit": {},
    "recent_ingestion": {},
    "schema_breakdown": {},
    "pm2_logs": {},
    "api_health": {}
}

# 1. DB connection
client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]
col = db["UniqueDeals"]

# 2. Distinct statuses
statuses = col.distinct("status")
status_map = {}
for s in statuses:
    status_map[str(s)] = col.count_documents({"status": s})
audit["database_audit"]["distinct_statuses"] = status_map

# 3. Newest 5 deals inspection
newest_docs = list(col.find().sort("_id", -1).limit(5))
sample_list = []
for d in newest_docs:
    # check time fields
    time_fields = {k: str(d.get(k)) for k in ["created_at", "timestamp", "time", "date", "scraped_at"] if k in d}
    sample_list.append({
        "id": str(d.get("_id")),
        "title": (d.get("prod_name") or d.get("title") or "")[:50],
        "status": d.get("status"),
        "store": d.get("store"),
        "channel": d.get("channel"),
        "price": d.get("price"),
        "mrp": d.get("mrp"),
        "has_aff_url": bool(d.get("aff_url")),
        "has_url": bool(d.get("url")),
        "has_aff_text": bool(d.get("aff_text")),
        "has_ai_formatted_text": bool(d.get("ai_formatted_text")),
        "time_fields": time_fields,
        "oid_time": str(d.get("_id").generation_time) if hasattr(d.get("_id"), "generation_time") else None
    })
audit["recent_ingestion"]["samples"] = sample_list

# 4. Deals ingested in last 24h by ObjectId timestamp
now_utc = datetime.now(timezone.utc)
deals_last_24h = 0
deals_last_7d = 0
for d in col.find({}, {"_id": 1}).sort("_id", -1).limit(3000):
    gen_time = d["_id"].generation_time
    diff = (now_utc - gen_time).total_seconds()
    if diff <= 86400:
        deals_last_24h += 1
    if diff <= 7 * 86400:
        deals_last_7d += 1
    else:
        break
audit["recent_ingestion"]["deals_last_24h_by_oid"] = deals_last_24h
audit["recent_ingestion"]["deals_last_7d_by_oid"] = deals_last_7d

# 5. Check channels activity in last 500 deals
channel_counts = {}
for d in col.find({}, {"channel": 1, "source_channel": 1}).sort("_id", -1).limit(500):
    ch = d.get("channel") or d.get("source_channel") or "Unknown"
    channel_counts[ch] = channel_counts.get(ch, 0) + 1
audit["recent_ingestion"]["channel_distribution_last_500"] = channel_counts

# 6. PM2 Worker Logs
for svc in ["api", "worker", "listener", "bot", "desidime"]:
    try:
        res = subprocess.run(
            ["pm2", "logs", svc, "--lines", "15", "--nostream"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=8
        )
        lines = [line.strip() for line in res.stdout.split("\n") if line.strip()]
        # filter out boilerplate headers
        meaningful = [l for l in lines if not l.startswith("[TAILING]") and not l.startswith(">>>")][-10:]
        audit["pm2_logs"][svc] = meaningful
    except Exception as ex:
        audit["pm2_logs"][svc] = f"Error fetching logs: {ex}"

# 7. Local API curl check
try:
    api_res = subprocess.run(
        ["curl", "-s", "http://127.0.0.1:8000/api/v1/deals/public?limit=3"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=5
    )
    if api_res.stdout:
        data = json.loads(api_res.stdout)
        audit["api_health"]["status_code"] = 200
        audit["api_health"]["deals_returned"] = len(data.get("deals", []))
    else:
        audit["api_health"]["status"] = "empty response"
except Exception as ex:
    audit["api_health"]["error"] = str(ex)

print(json.dumps(audit, indent=2))
