# Full Project Health Scan Report

**Workspace Root:** `e:\Rudranildocs0066543\html-yt`  
**Date:** November 10, 2026  
**Auditor:** Senior Infrastructure & Software Engineer  
**Scope:** Memory Vulnerabilities, Dependency Topology & Package Integrity, Massive Build/Log Files & Background Loop Risks  

---

## 📊 Comprehensive Findings Matrix

| ID | Category | Severity | Location / Component | Root Cause & Impact | Recommended Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MEM-01** | Memory Vulnerability | **Critical** | `telegram-system/dealbot_backend/dealbot/gorilla_timeseries.py:62` | `_encode_varint` performs `n >>= 7` in a `while True:` loop. For negative numbers (e.g. clock drift or negative price deltas), Python arithmetic right-shift evaluates `-1 >> 7 == -1`, producing an **unbounded infinite loop at 100% CPU**. | Enforce unsigned assertion `if n < 0: raise ValueError(...)` or apply ZigZag encoding prior to VLQ serialization. |
| **MEM-02** | Memory Vulnerability | **Critical** | `telegram-system/dealbot_backend/dealbot/headless_resolver.py:171` | `pw.chromium.launch()` is not encapsulated within a `try...finally: await browser.close()` block. Any exception during context creation, navigation timeout, or DOM query abandons headless Chromium processes in host RAM (~150–300MB leak per event). | Wrap entire browser lifecycle in `try: ... finally: await browser.close()`. |
| **MEM-03** | Memory Vulnerability | **Critical** | `dealflow-remotion/package.json` | High-severity vulnerability in `zod < 4.6.6` (GHSA-mrhx-c7xc-m3w5) causing memory exhaustion DoS when parsing unbounded collections, plus `source-map-js <= 1.2.1` event-loop DoS. | Upgrade to `zod@^4.6.7` and run `npm audit fix` in `dealflow-remotion`. |
| **DEP-01** | Broken Dependency | **Critical** | `telegram-system/dealbot_backend` | **No dependency manifest** (`requirements.txt` or `pyproject.toml`). 39 imported external packages (`motor`, `pymongo`, `aioredis`, `playwright`, `curl_cffi`, `z3`, `telethon`) are unpinned, preventing reproducible Docker/VM builds. | Generate pinned `requirements.txt` from production environment and track under VCS. |
| **DEP-02** | Broken Dependency | **Critical** | `telegram-system/dealbot_backend/dealbot/desidime_bot.py:1595, 1784` | Missing local modules: `import deal_memory` and `from heal_hyperlocal_deals import resolve_shortlink_fast` reference modules that do not exist in the codebase, triggering silent fallback exceptions on every deal evaluation. | Vendor or restore `deal_memory.py` and `heal_hyperlocal_deals.py`, or refactor to internal utility functions. |
| **BLD-01** | Massive Build/Log File | **Critical** | `graphify-out/graph.json` | **174.34 MB** single JSON file. Loading or parsing this in Node.js or Python requires ~1.2GB–2GB RAM, risking V8 heap out-of-memory crashes and severe I/O lag when agents run graph queries. | Scope Graphify indexing to exclude `scratch/`, `_archive/`, and binary directories; re-generate with pruning. |
| **BLD-02** | Massive Build/Log File | **Critical** | `telegram-system/rudranil-deals-web/dist` & `public` | **183.24 MB** dist and **164.88 MB** public folder. Over 100 uncompressed PNG animation frames (`brand/expressions/*/*.png`, ~1.5MB each) are duplicated into build artifacts, bloating client download size and deployment bundles. | Convert frame sequences to optimized WebP spritesheets or MP4/WebM video clips; exclude unoptimized frames from `public/`. |
| **MEM-04** | Memory Vulnerability | **Necessary** | `telegram-system/dealbot_backend/dealbot/bot.py:1339, 3495` | `deal_cache` and `pending_deals` grow unboundedly in memory. `prune_deal_cache()` is called only on startup (`bot_main()`). Every deal saved triggers synchronous serialization of 2MB+ JSON on the event loop thread (`PENDING_FILE.write_text`). | Implement an in-memory TTL/LRU cache (e.g. `cachetools.TTLCache`) and offload disk persistence to an async worker or Redis. |
| **MEM-05** | Memory Vulnerability | **Necessary** | `telegram-system/dealbot_backend/dealbot/api.py:4026` | In the SSE stream endpoint, synchronous `redis_lib.Redis.from_url` is instantiated inside an `async def event_generator()`, executing blocking socket calls (`get_message()`) on the asyncio event loop thread for each open client connection. | Switch to `redis.asyncio` (`aioredis`) with async connection pooling. |
| **MEM-06** | Memory Vulnerability | **Necessary** | `telegram-system/rudranil-deals-web/src/utils/visitorTracking.ts:53` | Client-side memory leak: `window.setInterval` (25s heartbeat), `window.addEventListener('beforeunload')`, and `document.addEventListener('visibilitychange')` lack unmount teardown or cleanup handlers. | Export a `destroyTracking()` cleanup function and invoke it in the root component `useEffect` return hook. |
| **DEP-03** | Broken Dependency | **Necessary** | `fast-jev-compaction/package.json` | 4 declared core dependencies missing (`@types/node`, `tsx`, `typescript`, `vitest`). The `node_modules` folder exists as a dead 0-byte directory. | Run `npm install` inside `fast-jev-compaction` or remove stale directory if retired. |
| **DEP-04** | Broken Dependency | **Necessary** | `screenpipe_src` & Subprojects | 12 subpackages across `screenpipe_src` (`screenpipe-app-tauri`, `workflows-web`, `ai-gateway`, `packages/sdk`, etc.) completely lack `node_modules` (uninstalled dependencies). | Run workspace package manager (`pnpm install` / `cargo build`) or isolate `screenpipe_src` if it is a vendor checkout. |
| **DEP-05** | Broken Dependency | **Necessary** | `india-estate/package.json` | 37 vulnerabilities (3 Critical, 24 High) including prototype pollution in `swiper@6.5.1-12.1.1` and arbitrary code execution in `react-router` turbo-stream deserialization. | Run `npm audit fix` in `india-estate` to patch upstream supply chain vulnerabilities. |
| **BLD-03** | Massive Build/Log File | **Necessary** | Workspace Root & `.github` | `impeccable.exe` binary (**19.49 MB each**, 58.5 MB total) is duplicated across 3 separate folders (`.github/skills`, `.claude/skills`, `rudranil-deals-web/.agents/skills`). | Deduplicate binary executables using a shared path or `.gitignore` pre-compiled binaries. |
| **BLD-04** | Massive Build/Log File | **Necessary** | `_archive/` & `scratch/` | **249.54 MB** in `_archive` (including 78.7MB `video.mp4` and raw college images) + **14.46 MB** in `scratch/full_deploy_payload.json`. | Relocate static media to external object storage (S3/Cloudflare R2) and clean obsolete scratch payloads. |
| **BLD-05** | Massive Build/Log File | **Necessary** | Monorepo Node Modules | **880.67 MB** in `dealflow-remotion/node_modules`, **530.49 MB** in `india-estate/node_modules`, **338.84 MB** in `nilotpal-portfolio-next/node_modules`. | Implement package deduplication or pnpm hardlinks to eliminate redundant disk duplication. |
| **MEM-07** | Memory Vulnerability | **Low** | `telegram-system/dealbot_backend/dealbot/api.py:296` | Rate limiter failover state `_RATE_LIMIT_REDIS_FAILED = True` permanently locks the app into in-memory storage upon a single Redis blip. Exceeding 5,000 keys causes an abrupt `_RATE_LIMIT_MEMORY.clear()`, dropping all rate limit states. | Add exponential backoff reconnection for Redis rate-limiting and use `OrderedDict` with LRU eviction for in-memory fallback. |
| **DEP-06** | Broken Dependency | **Low** | Root `package.json` | Root package manifest contains 1 dependency with empty script definitions (`"scripts": {}`). | Clean up or document root workspace manifest intent. |
| **DEP-07** | Broken Dependency | **Low** | `telegram-system/dealbot_backend/dealbot/bot.py:4` | Direct `import fcntl` without platform check. Handled via `try...except ImportError`, but disables file locking entirely on Windows hosts without fallback. | Use `portalocker` or cross-platform named mutexes for local file lock coordination. |
| **BLD-06** | Massive Build/Log File | **Low** | `nilotpal-portfolio-next/.next` | 82.83 MB Next.js compilation cache persisted on disk. | Clean `.next` build caches prior to archiving or packaging. |

---

## 🔬 In-Depth Engineering Details

### 1. Arithmetic Right-Shift Infinite Loop (`gorilla_timeseries.py:62`)
In `telegram-system/dealbot_backend/dealbot/gorilla_timeseries.py:59-70`:
```python
@staticmethod
def _encode_varint(n: int) -> bytes:
    buf = bytearray()
    while True:
        towrite = n & 0x7F
        n >>= 7
        if n:
            buf.append(towrite | 0x80)
        else:
            buf.append(towrite)
            break
    return bytes(buf)
```
- **Mechanism:** In Python's arbitrary-precision arithmetic, `n >>= 7` on a negative integer evaluates to `-1` permanently (`-1 >> 7 == -1`). Because `-1` is truthy, `if n:` always branch-predicts taken, making `break` unreachable.
- **Trigger:** Any timestamp drift backwards, out-of-order event, or negative price difference.

### 2. Playwright Headless Process Leaks (`headless_resolver.py:171`)
In `telegram-system/dealbot_backend/dealbot/headless_resolver.py:170-182`:
```python
async with async_playwright() as pw:
    browser = await pw.chromium.launch(headless=True, args=['--no-sandbox'])
    ctx = await browser.new_context(...)
    page = await ctx.new_page()
    ...
```
- **Mechanism:** While `async_playwright` cleans up its driver RPC, the spawned Chromium child process remains unclosed if an exception occurs prior to the explicit `await browser.close()` statements.
- **Impact:** Each crashed resolution leaves an orphaned Chromium process in OS RAM (~150MB to 300MB working set).

### 3. Missing Manifests & Phantom Module Imports
- `telegram-system/dealbot_backend` imports 39 external packages across 20+ production scripts without a `requirements.txt` or `pyproject.toml`.
- `desidime_bot.py` imports `deal_memory` and `heal_hyperlocal_deals`, which do not exist on disk, throwing suppressed exceptions on every deal run.

### 4. Build Artifacts & Monorepo Scaling
- `graphify-out/graph.json`: 174.34 MB.
- `rudranil-deals-web/dist`: 183.24 MB (due to 164.88 MB of uncompressed `.png` frames in `public/brand/expressions`).
- `node_modules` total footprint: > 2.3 GB (`dealflow-remotion` 880MB, `india-estate` 530MB, `nilotpal-portfolio-next` 338MB).

---

## 🛠️ Step-by-Step Remediation Plan

1. **Phase 1: Memory & Loop Hotfixes (P0)**
   - Fix `_encode_varint` in `gorilla_timeseries.py` to reject or ZigZag encode negative numbers.
   - Wrap `headless_resolver.py` browser context in `try: ... finally: await browser.close()`.
   - Upgrade `zod` in `dealflow-remotion`.
2. **Phase 2: Dependency Stabilization (P1)**
   - Generate `dealbot_backend/requirements.txt` with locked versions.
   - Convert synchronous `redis_lib` calls in `api.py` SSE to `aioredis`.
   - Add teardown handlers to `visitorTracking.ts`.
3. **Phase 3: Disk & Build Optimization (P2)**
   - Re-index `graphify` with exclusions for `scratch/`, `_archive/`, and binary assets.
   - Convert raw PNG expression sequences to WebP spritesheets or compact WebM video.
   - Remove duplicate `impeccable.exe` binaries.

