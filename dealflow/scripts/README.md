# `dealflow/scripts/` — maintenance toolbox

These are one-off operator scripts, not part of the running pipeline. Nothing in
the API, worker, listener or storefront imports them.

## They write to a live database

Ten of these scripts mutate the `UniqueDeals` collection (or `SystemSettings`).
**None of them has a `--dry-run` or `--apply` flag.** They connect, read, and write
in a single pass. Run one with the wrong `MONGODB_URI` exported and it edits that
database.

| Script | Writes | Last line of defence |
|---|---|---|
| `clean_junk_non_deals.py` | delete | `MONGODB_URI` env |
| `enrich_posted_deals.py` | `$set` on posted deals | `MONGODB_URI` env |
| `enrich_recent_top.py` | `$set` on recent deals | `MONGODB_URI` env |
| `fix_backend.py` | `$set` | `MONGODB_URI` env |
| `heal_all_coupons.py` | `$set` (coupons, prices) | `MONGODB_URI`/`MONGO_URI`, else `localhost` |
| `heal_ambhe_deals.py` | `$set` | `MONGODB_URI` env |
| `heal_corrupted_prices.py` | `$set` (prices) | `MONGODB_URI`/`MONGO_URI`, else `localhost` |
| `heal_coupon_deal.py` | `$set` | `MONGODB_URI` env |
| `sanitize_deals_db.py` | `$set` (text, prices) | `MONGODB_URI` **required**, exits otherwise |
| `update_channels.py` | `SystemSettings` update | `MONGODB_URI` **required**, exits otherwise |

The rest are read-only inspectors (`check_*`, `inspect_*`, `find_loot.py`,
`test_*`) or scrapers that print without persisting.

## Rules before running any of them

1. **Export the intended URI explicitly.** Do not rely on a `.env` that happens to
   be present. Several scripts call `load_dotenv("/home/rudranil777/dealbot/.env")`
   first, which on the VM means production.
2. **Snapshot first.** `mongodump --uri "$MONGODB_URI" --collection UniqueDeals`
   costs seconds; every one of these scripts edits live deal rows.
3. **Read the filter.** `list(db.UniqueDeals.find({...}))` near the top tells you
   the blast radius. If it has no filter, it is the whole collection.

## Hardcoded credentials

The committed versions of `find_loot.py`, `sanitize_deals_db.py` and
`update_channels.py` used to embed a `mongodb+srv://dealbot:...` URI. The working
tree no longer does, and `git grep -F 'mongodb+srv://dealbot:'` returns nothing,
but the secret is still in 19 past commits of the parent repository. Rotating that
database user is the only real fix — see `SECURITY-ROTATION-RUNBOOK.md`.
