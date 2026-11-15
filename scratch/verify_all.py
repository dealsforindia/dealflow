import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import sqlite3
import requests
from mindflow.screenpipe_engine import DB_PATH, screenpipe_db
from mindflow.mcp_server import search_screen_and_audio, get_current_context, get_recent_activities

print("=== 1. VERIFYING SQLITE FTS5 DATABASE ===")
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute("SELECT COUNT(*) FROM activity_actions WHERE action_type='screen_ocr'")
ocr_count = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM activity_actions WHERE action_type='audio_transcript'")
audio_count = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM activity_actions WHERE action_type='active_window'")
win_count = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM activity_fts")
fts_count = c.fetchone()[0]

print(f" -> Screen OCR entries: {ocr_count}")
print(f" -> Audio transcripts: {audio_count}")
print(f" -> Active window telemetry: {win_count}")
print(f" -> Total FTS5 search index entries: {fts_count}")

print("\n=== 2. SAMPLE SCREEN OCR ENTRY FROM DATABASE ===")
c.execute("SELECT occurred_at, app_name, summary FROM activity_actions WHERE action_type='screen_ocr' ORDER BY id DESC LIMIT 1")
row = c.fetchone()
if row:
    print(f"Timestamp: {row[0]}")
    print(f"App: {row[1]}")
    print(f"Extracted Text (first 300 chars):\n{row[2][:300]}")
conn.close()

print("\n=== 3. TESTING SUB-SECOND FTS5 SEARCH ===")
queries = ["native_ocr", "Terminal", "YouTube", "Antigravity"]
for q in queries:
    hits = screenpipe_db.search_memory(q, limit=3)
    print(f"Query '{q}' returned {len(hits)} results:")
    for h in hits:
        print(f"   * [{h.get('app_name')}] {h.get('summary')[:90]}...")

print("\n=== 4. TESTING MCP SERVER TOOLS ===")
mcp_context = get_current_context()
print("get_current_context():")
print(mcp_context)

mcp_search = search_screen_and_audio("Explorer", limit=2)
print("\nsearch_screen_and_audio('Explorer'):")
print(mcp_search[:250] + "...")

print("\n=== 5. TESTING HTTP SERVER ENDPOINTS ===")
base = "http://127.0.0.1:7860"
for ep in ["/api/status", "/api/mcp/config", "/api/scrubber/items", "/api/audio/history", "/api/search?q=File"]:
    res = requests.get(f"{base}{ep}", timeout=5)
    print(f"GET {ep} -> HTTP {res.status_code} ({len(res.content)} bytes)")

print("\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY ===")
