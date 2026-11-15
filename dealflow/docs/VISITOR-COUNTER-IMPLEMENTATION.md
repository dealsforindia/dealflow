# Visitor counter and dashboard refinement — 2026-11-02

Implemented locally:
- DealFlow review queue: quieter charcoal surfaces, flat product cards, consistent Lucide navigation, clear prices, keyboard focus and reduced-motion rules. Desktop and 390px mobile inspected; empty filter state inspected. Other screens retain existing component-specific styles.
- Header shows IndiaDealHunts visitors today. Counts unique browser IDs for the Kolkata calendar day; repeats deduplicate. Refreshes every minute. Missing endpoint/errors show Tracking unavailable rather than zero.
- Storefront sends only a random daily ID, on visible production pages; localhost is excluded. No URL, raw IP or user-agent is stored in visitor counts. Blocked browser storage is excluded; multiple devices/private browsing can count separately. This is a browser estimate, not a verified number of people.
- Backend POST /api/v1/analytics/visit validates storefront Origin and ID, rate limits submissions, and stores daily Redis sets for 48 hours. GET /api/v1/analytics/visitors requires the existing strict admin authentication. Redis outages return 503.

Deployment order:
1. Deploy the new analytics endpoints from dealbot_backend/dealbot/api.py to the existing API. Preserve unrelated remote changes. API must have Redis.
2. Deploy the storefront tracker (src/utils/visitorTracking.ts and App.tsx integration) to the existing IndiaDealHunts Vercel project. Existing /api/v1 rewrites cover the endpoint.
3. Deploy tg-setup to the existing DealFlow Vercel project. Do not create a new project or change domain/access.
4. Verify public tracker returns 204, authenticated dashboard count returns 200, repeat visits deduplicate, and Vercel dashboard displays the real number.

Tracking starts at deployment; historic daily visitors cannot be reconstructed by this implementation. Partial first day and Redis data loss can undercount. Public telemetry can include bots and is not billing-grade analytics.

Checks: both frontend builds and storefront TypeScript check passed; backend syntax passed. Focused regression scripts are in scratch/visitor-metrics (backend endpoints tested with a Redis double; browser tracker tested in a JS VM). Live deployment and Redis integration remain pending.
