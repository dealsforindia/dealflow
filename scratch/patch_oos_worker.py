import subprocess, time

time.sleep(2.5)

remote_code = r'''
with open("/home/rudranil777/dealbot/oos_expiry_worker.py", "r", encoding="utf-8") as f:
    code = f.read()

target = """            _deals_col.update_one(
                {"fp_hash": fp_hash},
                {
                    "$set": update_fields,
                    "$push": {
                        "price_history": [int(time.time() * 1000), float(new_price)]
                    }
                }
            )
        except Exception as e:
            log.error("Failed to update price in MongoDB for %s: %s", fp_hash, e)"""

replacement = """            _deals_col.update_one(
                {"fp_hash": fp_hash},
                {
                    "$set": update_fields,
                    "$push": {
                        "price_history": [int(time.time() * 1000), float(new_price)]
                    }
                }
            )
            # Also record continuous snapshot into PriceHistory collection
            if _db is not None:
                try:
                    cid = deal.get("canonical_key")
                    if not cid:
                        from price_history_tracker import extract_canonical_id
                        cid = extract_canonical_id(deal)
                    if cid:
                        _db["PriceHistory"].insert_one({
                            "canonical_id": cid,
                            "sale_price": float(new_price),
                            "price": float(new_price),
                            "mrp": float(mrp) if mrp else None,
                            "store": deal.get("platform") or deal.get("store") or "Direct",
                            "title": title[:120],
                            "ts": time.time(),
                        })
                except Exception as _ph_e:
                    log.debug("PriceHistory recording error: %s", _ph_e)
        except Exception as e:
            log.error("Failed to update price in MongoDB for %s: %s", fp_hash, e)"""

if target in code:
    new_code = code.replace(target, replacement)
    with open("/home/rudranil777/dealbot/oos_expiry_worker.py", "w", encoding="utf-8") as f:
        f.write(new_code)
    print("Successfully patched oos_expiry_worker.py!")
else:
    print("Already patched or target not found.")
'''

for attempt in range(3):
    res = subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
        input=remote_code,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    if res.returncode == 0:
        print("STDOUT:", res.stdout)
        break
    else:
        print(f"Attempt {attempt+1} failed, waiting 2s...")
        time.sleep(2.5)

if res.returncode == 0 and "Successfully patched" in res.stdout:
    time.sleep(1)
    res2 = subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'pm2 restart price-scanner && pm2 logs price-scanner --lines 10 --nostream'],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    print("Restart STDOUT:", res2.stdout.encode('ascii', errors='replace').decode('ascii'))
