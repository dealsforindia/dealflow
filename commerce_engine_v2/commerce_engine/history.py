from __future__ import annotations

import asyncio
import hashlib
import json
import sqlite3
from datetime import timedelta
from decimal import Decimal
from pathlib import Path
from statistics import median

from .categories import CRITICAL
from .models import ProductSnapshot, to_jsonable, utcnow


def observation_key(snapshot: ProductSnapshot) -> str:
    # Merchant offer, exact variant attributes, location, seller, and currency form the partition.
    payload = {"offer": snapshot.offer_key, "variant": snapshot.variant_id, "seller": snapshot.seller_id,
               "currency": snapshot.currency, "region": to_jsonable(snapshot.observed_context),
               "attributes": to_jsonable({k: snapshot.attributes[k] for k in CRITICAL if k in snapshot.attributes})}
    return hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


class HistoryStore:
    """SQLite store for approved merchant observations. Offline/listing prices are refused."""
    def __init__(self, path: str | Path):
        self.path = str(Path(path).resolve())
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.execute("""CREATE TABLE IF NOT EXISTS observations (
                observation_key TEXT NOT NULL,
                checked_at TEXT NOT NULL,
                price TEXT NOT NULL,
                snapshot_json TEXT NOT NULL,
                PRIMARY KEY (observation_key, checked_at)
            )""")

    def _connect(self):
        return sqlite3.connect(self.path, timeout=5)

    def _assess_and_record(self, snapshot: ProductSnapshot) -> tuple[bool, dict]:
        if not snapshot.publishable or not snapshot.price_verified or not snapshot.is_live or not snapshot.checked_at:
            return False, {"count": 0, "recorded": False, "reason": "UNVERIFIED_OBSERVATION"}
        age = (utcnow() - snapshot.checked_at).total_seconds()
        if age > 300 or age < -60:
            return False, {"count": 0, "recorded": False, "reason": "STALE_OBSERVATION"}
        key = observation_key(snapshot)
        with self._connect() as db:
            # Serialize assess+insert so concurrent workers cannot insert through a stale baseline.
            db.execute("BEGIN IMMEDIATE")
            rows = db.execute("SELECT checked_at, price FROM observations WHERE observation_key=? ORDER BY checked_at", (key,)).fetchall()
            values = [Decimal(row[1]) for row in rows]
            reference = median(values[-90:]) if values else None
            anomaly = bool(len(values) >= 3 and reference and
                           (snapshot.sale_price < reference * Decimal("0.35") or snapshot.sale_price > reference * Decimal("3")))
            if anomaly:
                summary = self._summary(rows)
                summary.update(recorded=False, anomaly=True, reference_median=reference)
                return False, summary
            db.execute("INSERT OR IGNORE INTO observations VALUES (?,?,?,?)",
                       (key, snapshot.checked_at.isoformat(), format(snapshot.sale_price, "f"),
                        json.dumps(snapshot.to_dict(), ensure_ascii=False)))
            rows = db.execute("SELECT checked_at, price FROM observations WHERE observation_key=? ORDER BY checked_at", (key,)).fetchall()
            summary = self._summary(rows)
            summary.update(recorded=True, anomaly=False, is_lowest_observed_price=bool(rows and snapshot.sale_price == min(Decimal(r[1]) for r in rows)))
            return True, summary

    @staticmethod
    def _summary(rows) -> dict:
        values = [Decimal(r[1]) for r in rows]
        now = utcnow()
        windows = {}
        for days in (30, 90):
            cutoff = (now - timedelta(days=days)).isoformat()
            window = [Decimal(value) for checked_at, value in rows if checked_at >= cutoff]
            windows[f"low_{days}d"] = min(window) if window else None
        return {"count": len(rows), "all_time_observed_low": min(values) if values else None,
                "median": median(values) if values else None,
                "average": (sum(values) / len(values)).quantize(Decimal("0.01")) if values else None,
                "history": [{"checked_at": row[0], "price": Decimal(row[1])} for row in rows[-200:]],
                **windows}

    async def assess_and_record(self, snapshot: ProductSnapshot) -> tuple[bool, dict]:
        return await asyncio.to_thread(self._assess_and_record, snapshot)
