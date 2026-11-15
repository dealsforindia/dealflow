# DealFlow ecosystem review — 27 October 2026

## Executive finding

The ecosystem is partially operational, not a completed end-to-end verified system. Live API, MongoDB/Redis health, public records, and admin reads work. Both web applications build. However, local ingestion scheduling, approval truthfulness, automation configuration, video completion authentication, and storefront pricing/evidence handling contain consequential defects.

This is a functional/integration and sampled UI review, not an exhaustive penetration test, proof of commercial readiness, or real-user satisfaction study. Local source findings are distinguished from observed live behaviour because the deployed source revision was not established.

## Scope and method

- Read API routes, worker/listener/bot handoffs, channel flags, admin request helpers, rules/settings UI, storefront sync, and GitHub video workflow.
- Opened the local storefront and DealFlow dashboard in a real browser. Reviewed storefront desktop/mobile and admin Review, Channels, and Settings screens.
- Built storefront into `.build-check/system-review-20261027` and built admin with its existing build command. Both passed with large-chunk warnings.
- Parsed seven backend core Python modules without importing their startup side effects. All seven parsed.
- Ran 40 existing storefront Node tests: 34 pass, 6 fail (details in the initial storefront review).
- Ran 30 selected backend unit tests: 27 completed successfully, 3 errors. Two lookup-route tests have stale mocks/missing test-scope `log`; another error concerned Windows event-loop socket permissions, varying by run. These errors are not three proven production failures.
- Added and ran `scratch/system_review_probes.py`: AST-extracted current functions with in-memory Mongo/Redis doubles. Reproduced five behaviours without contacting production.
- Performed bounded live GET requests, using existing locally configured admin credentials only against the documented owner API where needed. Credential values are neither recorded nor included here.
- Did not approve/reject/delete a real deal, change channel flags/settings, dispatch paid work, trigger scrapers, send Telegram posts, or deploy code.

## Verified live observations

| Component | Observation | What this does not prove |
|---|---|---|
| `https://api.rudranil.me/health` | HTTP 200; status `ok`; Redis true; MongoDB true; three connected WebSocket clients at sample time | Worker progress, scraper freshness, publishing success, model quality |
| Public deals API | HTTP 200; reported total 19,420; sampled records returned | All records are accurate, current, or visible for the right reason |
| Admin pending/recent | Authenticated reads succeeded; local dashboard eventually loaded 985 pending and 300 recent records | A full queue count of zero during initial loading was not authoritative |
| Channels | API and UI reported 48 configured channels | Every channel is actively receiving messages; old documentation still mentions 27 |
| Settings | Authenticated GET succeeded | Settings screen itself loads this response correctly |
| Auto-rules | Live GET returned `rules` without an `enabled` field | The master enable/disable UI is effective |
| Video records | Authenticated GET returned a record | A fresh dispatch-to-render-to-callback cycle works |
| Public website and deployed admin | Both returned HTTP 200 HTML | Deployed bundles match current local code or complete all user journeys |
| Ticker/stories | Successful HTTP 200 samples | Every offer has correct prices and expiration |

Some individual requests failed DNS resolution or were aborted by the host; subsequent owner API requests succeeded. Do not interpret each transient local transport failure as server downtime. The edge-worker hostname was not reachable in its sampled request.

## Findings ordered by consequence

### P1 — Local queue consumer starves processing tasks

**Evidence:** `dealbot_backend/dealbot/worker.py:2892`, synchronous Redis client at line 85, blocking `blpop` at line 2944. The normal infinite consumer loop schedules `_safe_process` using `asyncio.create_task` but contains no await on its success/empty-queue path. The semaphore limits active processing only after tasks get scheduled; it does not make the blocking consumer yield.

**Reproduction:** Isolated current loop polled five times; processed tasks remained zero until the harness stopped the consumer and explicitly yielded, after which one task ran.

**Impact:** In this local version, ingestion processing and maintenance coroutines can be starved while the process appears alive. Production worker revision and actual queue depth remain unverified.

**Repair:** Use an awaited asynchronous Redis consumer or a carefully bounded off-thread blocking call, bound queued tasks, retain task references, and test processing progress plus graceful shutdown. Preserve the legacy Telegram flow during any migration.

### P1 — Approval reports success despite missing record or failed publishing handoff

**Evidence:** `api.py:5491`. A missing record is rejected only when no request body is supplied. A nonempty body can construct a synthetic fallback deal and return approved. Redis publishing errors are logged but still return approved after the database has already been marked posted.

**Reproduction:** In-memory probes returned approved for a nonexistent record with destinations supplied, and returned approved/stored posted while Redis publish raised an exception.

**Impact:** Admin confirmation and stored publication state do not prove Telegram delivery. Pub/Sub handoff is also not a durable delivery acknowledgement.

**Repair:** Check matched record identity, separate curated/web-published/broadcast-pending/delivered states, add a durable outbox with idempotent retries, and report partial failure explicitly.

### P1 — Approval invents a current stock state

**Evidence:** `api.py:5503` onward unconditionally sets `is_oos=False`, `in_stock=True`, and `stock_status='In Stock'`.

**Reproduction:** A mock out-of-stock record became In Stock after an ordinary approval, without a merchant check.

**Repair:** Approval should mean editorial acceptance, not newly observed stock. Keep observation provenance/time and require explicit verification to change stock.

### P1 — Auto-rules master disable is ignored by the earlier route

**Evidence:** Duplicate GET/PUT registrations at `api.py:6116/6127` and `6533/6548`. Earlier PUT `update_auto_rules` writes rules and timestamp but ignores `enabled`. The admin `SmartAutoRulesDeck` sends `enabled` and displays success on HTTP OK. Live GET returned only `rules`, matching the earlier response shape.

**Reproduction:** Sending enabled false to the isolated earlier handler left stored enabled true.

**Repair:** Consolidate one route contract, persist/read enabled consistently, ensure worker reads it, and verify enable/disable round-trip against a staging database.

### P1 — Video completion workflow lacks required authentication

**Evidence:** `.github/workflows/viral_short_generator.yml:178` calls `/video-ready` with Content-Type only. `api.py:8164` requires `validate_admin_token` before executing its body. The callback additionally refers to `ADMIN_TOKEN`, while the dependency uses `ADMIN_API_TOKEN`. Curl uses `-s` without failing on HTTP errors, so a 401 can leave the workflow looking successful.

**Impact:** A rendered/uploaded asset may never reach ready state in the database/UI. This is a source-confirmed integration mismatch, not a deliberately executed live callback.

**Repair:** Use one explicit callback-auth contract supplied through workflow secrets, fail on unsuccessful HTTP responses, and track callback retries and render failures.

### P1 — Storefront evidence and calculation failures

The initial review established: missing reviews can render Verified Deal; a collection title says Under ₹399 while displaying ₹14,016; null delivery becomes zero; eligibilityConfirmed is ignored; unconfirmed price/MRP fields remain populated. These affect customer trust and correctness rather than decoration. See `INDIADEALHUNTS_INITIAL_REVIEW_2026-10-27.md`.

### P1 — Public search expands the curation boundary (source finding)

**Evidence:** `api.py:1662` includes pending_approval/pending when a public search term is supplied, unlike the normal public listing. This makes publication eligibility depend on the presence of a query.

**Live limit:** A single pending-record search did not reproduce a matching record, so public exposure of that particular record was not established. Later transformations or deployment differences may affect results.

**Repair:** Apply one explicit publication predicate across listing/search/ticker/stories/video feeds. If uncurated discoveries are intentional, give them a separate route, presentation, and evidence policy.

### P2 — Admin settings read lacks authentication; several tools do too

**Evidence:** `tg-setup/src/app/App.tsx:4862` loads protected settings without `getAdminHeaders`. It silently keeps hard-coded defaults on non-OK responses. Saving does send headers, so a user could overwrite real settings based on defaults they mistook for loaded configuration. `apiScrapeImage` and `apiGenerateBanner` also POST without headers to protected routes (`api.py:7083`, `7109`). No mutation was triggered during review.

**Repair:** Use one request client for authenticated calls, show loading/error states, and prevent saving unknown configuration.

### P2 — Duplicate API routes mask incompatible implementations

Found eight duplicate route groups among 144 decorated registrations: feedback, unpublish, delete-deal, auto-rules GET/PUT, video dispatch/delete/list. Function redefinition does not remove previously registered route objects. The earlier unpublish/delete handlers omit later cache/status-message logic. Video implementations disagree on auth, response/state fields, and whether dispatch starts work or just marks a record.

**Repair:** Retain one authoritative route per method/path; add route-uniqueness and consumer-contract checks. Consolidation must preserve required legacy behaviour.

### P2 — Health and empty-state claims are not measurements

**Evidence:** Admin sidebar strings Online / 5 Active / 100% OK are fixed in `App.tsx:5010` onward. Other channel-page health descriptions are also static. Backend `elite_engineering_facade.py:67` always emits ALL_SYSTEMS_OPERATIONAL; capabilities and latency labels are not live process checks. In contrast, `/health` actually pings Redis and MongoDB.

`fetchPendingDeals` catches transport errors as null, ignores non-OK responses other than 401/403, and can return an empty array. During initial load the UI displayed all caught up before actual data arrived.

**Repair:** Display unknown/loading/degraded states; retain last successful data on fetch failure; report measured queue age/depth, worker heartbeat/progress, and last publication acknowledgement.

### P2 — Edge source is absent from current checkout

**Evidence:** `dealflow-edge/wrangler.toml` points to `src/index.ts`; that file is deleted in the pre-existing working tree. TypeScript exits TS18003: no inputs found. The configured edge hostname failed DNS in one request.

**Impact:** The current local edge project cannot be rebuilt/redeployed from its configured entry. This review did not delete or restore it and does not establish whether an older deployed worker exists.

### P2 — Admin real-time refresh omits several lifecycle events

Admin WebSocket handler refreshes on new/approved and video events, but not deleted/unpublished/rejected/edited events from other clients. The storefront hook handles more of those events. Admin polling may eventually repair views, but instant cross-client consistency is not guaranteed. Reconnection cleanup also schedules a reconnect through onclose after closing the old socket.

### P2 — Verification and urgency labels exceed demonstrated evidence

Sample storefront details show Verified Amazon India, an MRP-based percentage described as a price drop, and precise remaining-stock estimates. Backend survival defaults and heuristics exist, but calibration/merchant stock truth was not verified. Distinguish merchant source, historical observation, model estimate, and verified current stock.

### P2 — Mobile Saved journey remains unresolved

The storefront save control changed and count increased, but repeated mobile Saved clicks left discovery visible. Desktop empty-state Saved navigation worked. Needs focused reproduction and a regression test before claiming the save/retrieve journey is complete.

## Test and environment limitations

- SSH read-only attempt to the documented VM failed authentication: Permission denied (publickey,password). Actual PM2 status, worker version, Redis backlog, process logs, scheduler freshness, and MongoDB indexes were not inspected directly.
- Did not start the entire backend locally: its imports include database clients, environment loading, background tasks, and production-oriented paths. Pure parsing, targeted fixture tests, and isolated handlers avoid accidental production side effects.
- Backend test mocks lag the current `_lookup_public_price` implementation: missing mocked scrape_product_live falls into an exception handler whose extracted test scope lacks log. These need harness repair before they can validate current lookup behaviour.
- Selected tests are not coverage of all 144 routes or every merchant. Live scraping, every channel, account/email flows, all mobile tools, affiliate attribution/commission credit, and a fresh video render were not exhaustively checked.
- Existing dirty/deleted files predate the review. No application fixes, deployment, or production writes were made. Build outputs and review artifacts were created.

## Recommended work order

1. Establish deployed source versions and read-only worker/queue observability.
2. Repair worker scheduling and approval/outbox state transitions in isolation; preserve legacy Telegram approvals.
3. Consolidate routes and fix the auto-rule master switch, admin authenticated requests, and video callback contract.
4. Correct public visibility rules and storefront price/evidence labels/calculations.
5. Repair the tests, restore an intentional edge entry point, then run a staging end-to-end synthetic deal through ingest → curate → web publish → broadcast acknowledgement → edit/unpublish → video completion.
6. After correctness, conduct usability sessions with intended users; a visually polished screen does not establish satisfaction.

**Plain-language conclusion:** Real components are connected and returning real data. Important pieces can still claim success while failing or guessing. The next milestone should be one trustworthy, observable complete deal journey, before more features are added.
