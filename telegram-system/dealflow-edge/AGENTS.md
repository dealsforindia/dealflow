# DealFlow Edge Gateway Agent Instructions

## Scope & Operating Context
Cloudflare Worker edge gateway (`dealflow-edge`) serving `dealflow-edge.pottemasshippo.workers.dev`:
- Fast edge caching for `/deals/public`.
- Dynamic OpenGraph preview unfurling for deals.

## Security Audit & Skills
- Cloudflare's `security-audit` skill is installed at `.agents/skills/security-audit/SKILL.md`.
- Focus areas: Cloudflare Workers bindings, CORS headers, SSRF in outbound proxies/crawlers, edge cache poison protection, and unauthenticated endpoint rate limiting.

