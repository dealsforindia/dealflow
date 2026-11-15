# DealFlow Ecosystem Workspace

This folder contains all consolidated diagnostic tools, healing scripts, and architecture documentation for the DealFlow ecosystem.

## Structure

*   **`scripts/`**: Diagnostic, database audit, scraping tests, and coupon healing scripts:
    *   `heal_all_coupons.py`: Database coupon auditor and cleaner
    *   `heal_ambhe_deals.py`, `heal_coupon_deal.py`: Specific deal repair scripts
    *   `test_coupon.py`, `test_amz_bypass.py`, `test_full_scrape.py`: Scraper testing utilities
    *   `check_oos.py`, `check_amz_img.py`, `check_fk_json.py`: Store inspection scripts
    *   `update_channels.py`, `verify_db_stats.py`: Telemetry and channel configuration utilities
*   **`docs/`**: Architecture diagrams and system audit reports:
    *   `DEALFLOW_STRATEGIC_FRONTIER_ROADMAP.md`: Strategic roadmap, security hardening, quota management, and zero-pressure offloaded architectures
    *   `SYSTEM_AUDIT_REPORT.md`: Comprehensive audit report covering guardrails, pricing, and scraping logic
    *   `dealflow-architecture.html`: Interactive architecture topology view
    *   `dealflow.architecture.json`: Architecture graph data

## Main Engine Locations

*   **Consumer Storefront**: `rudranil-deals-web/` (React 19 + Vite + Tailwind CSS v4)
    *   GitHub: `dealsforindia/indiadealhunts`
    *   Live URL: `https://indiadealhunts.vercel.app`
    *   Features: Mobile-first 2-column layout, on-device semantic vector search, WhatsApp deal sharing, real-time Worth Score.
*   **Cloudflare Edge Gateway**: `dealflow-edge/` (Cloudflare Workers + TypeScript)
    *   Live URL: `https://dealflow-edge.pottemasshippo.workers.dev`
    *   Features: 60s edge caching for `/deals/public`, dynamic OpenGraph cards for social unfurling, sub-15ms edge latency.
*   **Admin Curation Deck**: `tg-setup/` (React 18.3 + Vite + Tailwind CSS v4)
    *   Live URL: `https://dealflow-topaz-seven.vercel.app`
*   **FastAPI Backend Core**: `dealbot_backend/dealbot/`
    *   Production API: `https://api.rudranil.me`
    *   Remote Azure VM: `/home/rudranil777/dealbot/` on `74.225.250.0`
    *   PM2 Daemons: `api` (id 7), `bot` (id 0), `desidime` (id 10), `listener` (id 2), `worker` (id 3).
