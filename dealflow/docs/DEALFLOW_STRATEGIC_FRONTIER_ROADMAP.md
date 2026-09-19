# DealFlow Strategic Frontier Roadmap, Security Hardening & Zero-Pressure Architecture

**Date**: 19 September 2026  
**Status**: Authoritative Strategic Reference  
**Scope**: DealFlow Ecosystem (`dealbot_backend`, `tg-setup`, `rudranil-deals-web`, VM `74.225.250.0`)

---

## 📑 Executive Summary

This document consolidates our deep 360-degree audit of the DealFlow platform across four critical pillars:
1. **Security Vulnerability Audit**: Immediate attack vectors and concrete hardening steps.
2. **Metered Resources & Quota Management**: Managing non-unlimited assets (APIs, MongoDB, Telegram, VM storage) with $0 spend.
3. **Dead Weight & Simplification**: Pruning zombie API keys, redundant scoring formulas, and bloated VM PM2 processes.
4. **Frontier Zero-Cost Architectures**: 6 next-gen features (Viral video pipeline, secret coupon brute-forcing, cash arbitrage, P2P residential mesh, on-device edge search) engineered to run with **zero pressure** on our low-end VM using our **GitHub Education Pack**.

---

## 🛡️ 1. Security Vulnerability Audit & Hardening

### Critical Vulnerabilities Identified
1. **Unauthenticated Admin & Mutation Endpoints (🔥 Critical)**:
   * **Root Cause**: In `api.py`, `validate_admin_token` contains:
     ```python
     expected = os.getenv("ADMIN_API_TOKEN", "").strip()
     if not expected:
         return True  # Permits all requests when env var is unset!
     ```
   * Because `ADMIN_API_TOKEN` is unset in `.env`, `/approve` and `/reject` can be triggered by anyone.
   * Furthermore, management endpoints (`PUT /api/v1/settings`, `PUT /api/v1/channels/update-link`, `PUT /api/v1/channels/config/.../toggle`, `DELETE /api/v1/channels/config/...`, `POST /api/v1/deals/purge-non-deals`, `POST /api/v1/deals/.../ai-rewrite`) completely lack token verification.
2. **Permissive CORS Policy (`allow_origins=["*"]`) (🔴 High)**:
   * Any website visited by a user can dispatch cross-origin background `fetch()` calls to `https://api.rudranil.me`.
3. **Server-Side Request Forgery (SSRF) (🔴 High)**:
   * `/api/v1/deals/lookup` and `/api/v1/deals/submit` fetch external URLs without blocking private or loopback IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.0.0/16`).
4. **Path Traversal on Base64 Image Uploads (🟡 Medium)**:
   * `approve_deal` and `edit_deal` construct file paths using raw URL path variable `fp_hash` (`upload_{fp_hash[:16]}...`) without verifying that the resolved path remains inside `IMAGES_DIR`.

### Immediate Security Hardening Plan
* [ ] **Strict Token Guard**: Set a cryptographically secure `ADMIN_API_TOKEN` in `.env` and `tg-setup/.env` (`VITE_ADMIN_TOKEN`). Remove the fallback `if not expected: return True` in `validate_admin_token`.
* [ ] **Protect All Mutation Routes**: Add `Depends(validate_admin_token)` to `/settings`, `/channels/*`, `/purge-non-deals`, `/ai-rewrite`, and `/deals/{fp}/edit`.
* [ ] **Lock Down CORS**: Restrict `allow_origins` strictly to `https://dealflow-topaz-seven.vercel.app`, `https://indiadealhunts.vercel.app`, and `http://localhost:5173`.
* [ ] **SSRF IP Filter**: Resolve domain IP addresses in `store_scraper.py` and drop any IP in private, loopback, or cloud-metadata ranges.
* [ ] **Filename Sanitization**: Enforce `re.sub(r'[^a-zA-Z0-9_-]', '', fp_hash)` before formatting file paths.

---

## 📊 2. Metered Resources & Operational Quota Blueprint

Everything in DealFlow that is **not unlimited**, how it behaves when exhausted, and how we handle it for **$0**:

| Resource | Hard Constraint | Exhaustion Risk | Zero-Cost Solution & Safeguard |
|---|---|---|---|
| **Google Gemini API** | 15 RPM / 1,500 RPD (Free) | HTTP 429 quota error | Add 2 backup keys (`GEMINI_KEYS=k1,k2,k3`) to triple daily limit. Local 20-rule regex formatter serves as 100% free fallback. |
| **Groq API** | 30 RPM / Daily token limits | HTTP 429 quota error | Rotate 3 existing keys. Keep fast, low-cost models (`llama-3.1-8b-instant`). |
| **MongoDB Atlas (M0)** | **512 MB hard storage cap** | Atlas locks writes; scrapers crash | `worker.py` `db_maintenance_loop()` runs every 6h purging pending (>14d) and rejected (>30d). Keeps DB locked at ~20–25 MB. Never store base64 in MongoDB. |
| **Telegram MTProto** | 500 channels / FloodWait | FloodWait freeze (60s–24h) or ban | Use dedicated secondary/burner number for `LISTENER_SESSION_STRING`. Broadcast exclusively via Bot API (`TG_BOT_TOKEN`, 30 msg/s). |
| **Store Scrapers** | Cloudflare & Akamai WAF | IP ban on `74.225.250.0` | **Permanently keep 600s DesiDime interval**. Use Android mobile User-Agents and mobile Amazon `/gp/aw/d/` endpoints (90% lower CAPTCHA rate). |
| **VM Storage & RAM** | Finite disk / 2–4 GB RAM | Linux OOM kills MongoDB or API | `worker.py` auto-prunes temp disk images older than 7 days. Offload heavy compute outside the VM. |
| **EarnKaro Token** | Session JWT expiration | Links post unmonetized | Add automated Telegram alert when EarnKaro API returns HTTP 401. Refresh token every 60 days. |
| **Vercel Frontend** | 100 GB monthly bandwidth | Bandwidth overage / throttle | Images are hosted on VM (`api.rudranil.me/images`), preserving 95% of Vercel bandwidth for HTML/JS. |

---

## ✂️ 3. Dead Weight, Bloat & Simplification (What to Cut)

1. **Purge Zombie AI Keys from `.env`**:
   * Remove or ignore `OPENROUTER_API_KEY`, `MISTRAL_API_KEY`, `CEREBRAS_API_KEY`, `SAMBANOVA_API_KEY`, `COHERE_API_KEY`, and `TOGETHER_API_KEY`.
   * `ai_formatter.py` only ever uses Groq and Gemini. Cutting the unused keys eliminates confusion.
2. **Consolidate 8 Fragmented PM2 Python Processes**:
   * Currently running: `api` (#7), `bot` (#0), `desidime` (#10), `listener` (#2), `worker` (#3), `oos_expiry` (#15), `analyzer`, and `d2c_radar`.
   * Merging `analyzer`, `oos_expiry`, and `d2c_radar` into `worker.py` as background `asyncio` tasks cuts running runtimes from 8 to 4, immediately **saving ~400MB–500MB of VM RAM**.
3. **Unify Competing Score Formulas**:
   * Eliminate separate calculations for `Worth Score`, `Heat Score`, and `Min Score`. Standardize on a single unified Deal Score: `Discount % + Verified Lowest Price + Channel Consensus`.
4. **Retire Synthetic Price Graphs**:
   * Replace `generate_synthetic_history()` with transparent labeling: *"Newly Tracked Loot — Verified at ₹X"* to maintain 100% data integrity with users.
5. **Phase Out Legacy Telegram PM Inline Curation**:
   * Migrate curation fully to the Web Admin Deck (`dealflow-topaz-seven.vercel.app`). Repurpose Telegram PM strictly for critical system alerts (dead links, low disk, auth errors).

---

## 🚀 4. Frontier Zero-Cost Architectures (The Next Era)

### 1. 🎬 Autonomous 15-Second Viral Video Pipeline (Shorts & Reels)
* **What it does**: Turns every $>70\%$ loot deal into an automated 9:16 vertical video with animated zoom, dynamic captions, countdown timer, and neural Hinglish voiceover (Edge-TTS).
* **Zero-Pressure Execution**: **Rendered on GitHub Actions** (16 GB RAM, 4 vCPUs runner triggered via repository dispatch webhook).
* **VM Load**: **0% CPU**. The VM only sends a tiny webhook.

### 2. 🤖 Combinatorial Cart Optimizer & Secret Promo Code Brute-Forcer
* **What it does**: Headless Chromium dictionary runner testing 200+ known coupon prefixes (`WELCOME`, `AXIS10`, `FLAT50`, `UPI`) and bank card combinations on product checkout pages to uncover undocumented price drops.
* **Zero-Pressure Execution**: Run inside an ephemeral container on **DigitalOcean using $200 GitHub Education credits**, completely isolated from the production API.

### 3. 🕸️ P2P Residential Edge Proxy Mesh
* **What it does**: Eliminates datacenter IP CAPTCHAs and Cloudflare 403s on Amazon/Flipkart by distributing price checks across real opt-in user browsers via a DealFlow Chrome extension / PWA service worker.
* **Cost & Load**: **$0 proxy bill, 0% VM CPU**.

### 4. 💰 Real-Time Cash Arbitrage Engine (Flipkart/Amazon ➔ Cashify Buyback)
* **What it does**: Compares live deal drops against Cashify and CeX instant buyback rates. When a smartphone/gadget drops below the instant buyback rate, it generates a guaranteed cash-profit alert:
  > *"💸 Instant Cash Arbitrage: Buy on Flipkart at ₹10,499 ➔ Cashify Buyback is ₹12,800 (+₹2,301 pure profit)!"*
* **Zero-Pressure Execution**: Pure in-memory math lookup against a cached Redis dictionary. Takes **< 0.001ms CPU**.

### 5. ⏳ Predictive Stock Survival Analysis
* **What it does**: Uses a mathematical survival curve (Cox Proportional Hazards) based on discount depth, store velocity, and historical category drops to calculate authentic remaining shelf-life:
  > *"⚡ Predicted Expiry: ~14 minutes remaining (87% confidence based on 38 historical drops)"*

### 6. 🧠 On-Device Edge Semantic Search on Storefront
* **What it does**: Full natural language deal search (*"waterproof gym backpack with shoe compartment"*) powered by **`transformers.js` directly in the shopper's browser via WebGPU**.
* **Zero-Pressure Execution**: The user's device performs the vector math. **0 backend queries, 0 server RAM used**.

---

## 🎓 5. GitHub Education Pack Superpowers

| Perk | Value | DealFlow Integration |
|---|---|---|
| **GitHub Actions** | 2,000–3,000 free runner mins/mo | Offloaded 1080p video rendering (16 GB RAM runner). VM stays at 0% CPU. |
| **GitHub Models** | Free API tier | Free access to GPT-4o-mini, Llama 3.3 70B, and Llama 3.2 Vision via personal access token (`ghp_...`). |
| **DigitalOcean** | $200 cloud credit | Dedicated 4 GB RAM worker droplet for Playwright headless browser automation. |
| **SendGrid / Mailgun** | Thousands of free emails/mo | Automated email delivery for the Price Drop Alerts engine. |
| **Sentry** | 50,000 free events/mo | Real-time crash telemetry for scrapers, API endpoints, and channel stream health. |

---

## 🎯 6. Immediate Next Steps (Priority Execution)

1. **Security Lockdown**: Patch `api.py` with `ADMIN_API_TOKEN`, restrict CORS to production origins, and add SSRF domain validation.
2. **Process Consolidation**: Merge `analyzer`, `oos_expiry`, and `d2c_radar` into `worker.py` to reclaim 400MB RAM on VM `74.225.250.0`.
3. **Outbound Click Tracker (`/r/{id}`)**: Add redirect route in `api.py` to log real-time affiliate clicks and revenue per deal and channel.
4. **Deploy Edge Vector Search**: Integrate browser-side semantic search into `rudranil-deals-web`.
