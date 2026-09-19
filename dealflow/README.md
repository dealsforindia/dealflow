# DealFlow Workspace Directory

This folder contains all consolidated diagnostic tools, healing scripts, and architecture documentation for the DealFlow ecosystem.

## Structure

*   **`scripts/`**: One-off diagnostic, database audit, scraping tests, and coupon healing scripts:
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

*   **Admin Curation Deck**: `tg-setup/` (React 18 + Vite)
*   **Consumer Storefront**: `rudranil-deals-web/` (React 19 + Tailwind CSS v4)
*   **FastAPI Backend**: `dealbot_backend/dealbot/`
*   **Remote VM**: `/home/rudranil777/dealbot/` on `74.225.250.0`
