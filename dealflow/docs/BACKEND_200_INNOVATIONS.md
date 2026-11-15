# DealFlow Backend: 200 Unique Innovations (1-200), Revised

**Revision note:** rebuilt after checking against the real roadmap, strategic frontier document, and the existing backend blueprint. Items that duplicated built or planned work, or that broke an invariant, were replaced with new ideas.

**Invariants respected by every item:**
- DesiDime interval stays exactly 600s. Nothing lowers it.
- Single Amazon tag only, and no link cloaking or redirect tampering.
- No catalog crawling. Telegram channels are the sensor network.
- No on-VM image processing (upscaling, pHash, background removal).
- No WhatsApp or X scraping, no private mobile API reverse-engineering, no residential proxies, no multi-pincode crawling.
- No regional-language translation, no voice generation, no giveaway or game bots.
- Channel keys stay raw strings (`@channel`, `https://t.me/+...`).
- The 5 PM2 daemons stay 5 (`api`, `bot`, `desidime`, `listener`, `worker`). New logic runs as asyncio tasks in `worker.py`, at the edge, or in GitHub Actions.
- Atlas M0 stays far below 512MB. Gemini and Groq free quotas are treated as scarce.
- $0 spend. No fabricated data.

---

## A. Ingestion & Scraping Resilience (1-20)

1. **Cycle Overrun Guard**: If a DesiDime cycle runs longer than 600 seconds, the next one waits for the next boundary instead of starting immediately. A slow run can never cause a catch-up burst of requests.
2. **Conditional GET Poller**: Sends `If-None-Match` and `If-Modified-Since` on polls where a source supports them. A 304 skips parsing and writes entirely.
3. **Catch-Up Cursor per Channel**: Persists the last-seen message ID per channel key so a listener restart fetches only what was missed while it was down.
4. **Message-ID Gap Detector**: Flags jumps in message IDs larger than a channel's normal pattern. A gap creates a "possible missed window" record instead of silently losing deals.
5. **Bounded Backfill Lane**: Gap filling runs in a low-priority queue capped at a fixed message count per channel per run. Catch-up can never grow into bulk crawling.
6. **Raw-Key Channel Normalizer**: Canonicalizes `@Handle`, `t.me/handle`, and `https://t.me/+hash` into one stored form before lookup. Duplicate entries that differ only by spelling cannot exist.
7. **Numeric-ID Rejection at Config Load**: Refuses any `-100...` numeric ID in `channels_config` and prints the accepted formats. The raw-string rule is enforced at boot.
8. **Config Schema Validation on Boot**: Validates the full channels config against a schema before workers start. A malformed entry stops startup with a clear error instead of being skipped silently.
9. **Listener Reconnect Backoff with Jitter**: When the MTProto connection drops, reconnect attempts back off exponentially with jitter. Reduces FloodWait risk and avoids hammering Telegram.
10. **Sticky Impersonation Profile per Host**: Pins one curl_cffi browser profile per retail host for the length of a session. Avoids the inconsistent fingerprint that per-request switching creates.
11. **Warm Cookie Jar Persistence**: Stores warmed cookies per store in Redis with a TTL. Follow-up fetches look like one continuing session.
12. **Domain Terms Registry**: A per-domain record of robots and terms notes with a `scrape_allowed` flag. Adapters refuse domains marked disallowed.
13. **Hourly Retry Budget**: Caps total retries per source per hour with full-jitter backoff. A bad retailer day cannot balloon request volume against the VM's static IP.
14. **Listing Region Hash Skipper**: Hashes only the normalized deal-list region of a page. If unchanged since the last run, downstream parsing is skipped.
15. **Structured-Data-First Parser Chain**: Generic ordering of JSON-LD, then embedded app JSON, then CSS selectors for any new store. The most stable path wins.
16. **Selector Health Canary**: Once a day parses a known stable product per store and alerts if key fields return null. Layout changes are caught before bad deals are published.
17. **Parser Version Stamp**: Writes the parser version onto every ingested deal. After a regression, only deals from the bad version are reprocessed.
18. **On-Disk Raw Payload Sampler**: Keeps 1% of raw payloads compressed on VM disk, pruned after 7 days by the existing prune job. Nothing enters Atlas.
19. **Yield-Weighted Scheduling for Non-DesiDime Sources**: For future pollers such as Shopify or Reddit, order polling by approved-deal yield. DesiDime stays fixed at 600s.
20. **Queue-Depth Backpressure**: When the Redis ingest queue passes a threshold, low-priority sources pause until it drains. A flood cannot starve the deals that matter.

## B. Link Resolution & Affiliate Compliance (21-40)

21. **Shared Deadline for Unshorten Chains**: The whole redirect chain shares one 8-second deadline. A slow multi-hop shortener can never stall a worker.
22. **Homoglyph Domain Detector**: Flags resolved hosts that imitate retailers (`amaz0n.in`, `fIipkart.com`) before any scraping or monetization. Phishing links never enter the pipeline.
23. **Interstitial Page Detector**: Recognizes "click to continue" and ad interstitial pages inside a chain and marks the link for review instead of scraping the wrong page.
24. **Shortener Reliability Table**: A weekly table of success rate and latency per shortener domain. Shows which `SHORT_DOMAINS` entries deserve attention.
25. **Single-Tag Test Fixture Suite**: One shared test set run against `api.py`, `bot.py`, and `worker.py`, asserting the same single Amazon tag is produced everywhere. Backs the tag unification priority.
26. **Foreign Tag Leak Report**: Counts, per channel, how many posts arrive carrying another publisher's tag. A channel-quality signal separate from stripping itself.
27. **Conversion Outcome Ledger**: A small counters document recording converted, fallback, or error per store per day. Monetization rate becomes visible.
28. **Store Monetization Lapse Alert**: If a store's conversion success drops below a threshold, a system alert fires. Catches a lapsed EarnKaro campaign within hours.
29. **Monetization Eligibility Matrix**: A per-store table of whether a link can earn commission. Non-monetizable deals still publish but carry a flag for accurate disclosure.
30. **Amazon Fresh and Now Link Recognizer**: Identifies grocery-style Amazon links whose price depends on pincode and flags them. Their prices are never compared with normal listings.
31. **Amazon Deal-Page ID Resolver**: Maps `/deal/` page identifiers to the underlying ASINs so deal-page links flow into the normal product pipeline.
32. **Redirect-to-Homepage Expiry Detector**: Recognizes the common pattern where an expired product redirects to the store homepage. Such deals are marked expired without a full parse.
33. **Link Type Classifier**: Classifies each resolved link as product, search, category, coupon page, or store home. Only product links reach the scrapers.
34. **Coupon-in-URL Extractor**: Parses coupon parameters embedded in links into a structured `coupon` field instead of leaving them buried in the URL.
35. **Seller Type Inference**: Derives first-party versus marketplace seller from the page's seller block. The storefront shows it and scoring weighs it.
36. **Offer-Page Link Router**: Links to bank or store offer pages are captured as offer records rather than mistaken for products.
37. **Monetized Flag Propagation**: Each deal carries a boolean `monetized` from resolution to API. The frontend chooses disclosure wording from data.
38. **Beacon-Based Click Logging**: Outbound clicks go straight to the merchant, and a separate `sendBeacon` call reports the click. The link itself is never proxied or altered.
39. **Stored-URL Tag Drift Audit**: A one-off and then nightly scan of already-stored deal URLs for wrong or missing tags. Finds legacy records that predate tag unification.
40. **Double-Wrap Guard**: Detects an already-wrapped EarnKaro URL and refuses to wrap it again. Protects the upcoming auto-wrapping of direct store URLs from producing nested links.

## C. Price Extraction & Verification (41-60)

41. **Route Success Scoreboard**: Records which Amazon fetch route succeeded per hour and reorders attempts by recent success. Anti-bot weather changes are followed automatically.
42. **Stock Signal Ladder**: Combines availability text, add-to-cart presence, and price presence into in stock, out of stock, or unknown. No single fragile signal decides expiry.
43. **Two-Strike Expiry Rule**: A deal is marked out of stock only after two consecutive readings. One flaky page load cannot kill a live deal.
44. **Price Plausibility Bounds**: Rejects a parsed price below 5% or above 200% of the product's median unless a second source agrees. Catches an EMI amount mistaken for the item price.
45. **Indian Number Format Normalizer**: Parses `₹1,72,999.00`, `Rs. 999/-`, and `INR 1.2K` with property-based tests. Prices are never off by a factor of ten.
46. **MRP Provenance Field**: Records whether an MRP came from a struck-through page price, JSON-LD, or Telegram text. Page-derived MRPs are trusted more.
47. **Struck-Through MRP Presence Check**: Accepts a page-derived MRP only if a visible struck-through price element exists. Hidden or template values stop creating fake discounts.
48. **Bucketed Price Snapshots with TTL**: One document per product per day with a TTL and a per-product size cap. History stays useful and Atlas M0 stays small.
49. **Decimal Price Anomaly Rule**: Indian retail prices with paise, such as `₹1,745.05`, are unusual. They are flagged for a parse check before display.
50. **Extraction Confidence Score**: Scores each parse by how many key fields were found and by which method. Low-confidence deals route to review.
51. **Price Range Text Handler**: Parses "₹499 - ₹899" style prices, stores the lowest, and marks the deal as a range so it is never shown as one price.
52. **Structured Bank Offer Parser**: Extracts bank offers into bank, percent, max discount, minimum order, and card type. Free text becomes filterable data.
53. **Server-Side Net Price Calculator**: Computes effective price after coupon and the best bank offer, honoring caps and minimums. Clients receive a number with its assumptions.
54. **Coupon Stackability Flag**: Records whether page text says a coupon can combine with bank offers. Net price calculations stop assuming stacking.
55. **Shipping Fee Capture**: Extracts delivery charges and free-delivery thresholds. A cheap item with costly shipping is no longer presented as a win.
56. **Honest last_verified_at Clock**: The verification timestamp updates only after a successful live fetch, never on a cache hit. Any "checked X minutes ago" label is true.
57. **Verification Reuse Across Duplicates**: When a consensus group was verified in the last 15 minutes, its other members reuse that result instead of fetching again.
58. **Daily Fetch Budget Planner**: Caps live fetches per day and spends them on the highest-value deals first. Protects the VM IP and your standing with retailers.
59. **Pricing-Error Review Route**: A drop of more than 80% below the 30-day median from a marketplace seller is held for a human look instead of auto-publishing.
60. **Pack and Unit Normalizer**: Extracts quantity and weight (`2 x 500g`, `Pack of 6`) into normalized units so per-unit price is honest.

## D. Deduplication & Consensus (61-80)

61. **Product Identity Graph**: Links ASIN, FSN, GTIN, and model number as nodes joined by evidence edges. One product seen across stores resolves to one identity.
62. **GTIN Extraction from Structured Data**: Reads GTIN or EAN from JSON-LD when present. Provides an exact join key between Amazon and Flipkart listings.
63. **Model Number Extractor**: Pulls model numbers (`WH-1000XM5`, `SM-S911B`) from titles as strong join keys. Matching stops depending only on fuzzy titles.
64. **Late-Joiner Attachment**: Posts arriving after a deal was approved attach as extra sources on the live record without reopening review.
65. **Price Change Cooldown**: Ignores price movements under a small threshold within a short window. Prevents flapping updates and needless edits.
66. **Reliability Decay Toward Neutral**: Channel weights drift back toward neutral when no fresh evidence arrives. Neither old glory nor an old mistake lasts forever.
67. **Confidence Explainer Payload**: The API returns the components behind a confidence value (channels, weights, verification) so the UI can show why.
68. **Forward-Origin Independence Check**: Detects reposts through forward headers so a single origin post is not counted as many votes.
69. **Image Host Reputation**: Tracks which image hosts load reliably and prefers them when several source images exist.
70. **Claim Conflict Recorder**: When channels disagree on price, all claims are stored with source and time. Disagreement is data, not something overwritten.
71. **Recurring Deal Tagger**: Tags deals that reappear at a similar price after weeks. Builds a "recurring" history for honest storefront context.
72. **Combo Component Splitter**: Extracts the list of items in a combo title for display and unit pricing.
73. **Bundle vs Single Detector**: Recognizes "pack of", "combo", and "set of" and flags multi-item bundles so they are not compared with single-unit history.
74. **Coupon Outcome Ledger**: Stores reports of whether a coupon worked, with time and source. Dead codes are retired from evidence, not guesswork.
75. **Model Generation Guard**: Prevents matching "Galaxy S23" with "S23 FE" or "S23 Ultra" by requiring suffix tokens to agree.
76. **Deal Lineage Chain**: Edits and price changes to one deal form a parent-child chain. The full story of a deal can be reconstructed.
77. **Tombstones for Removed Deals**: Deleted or rejected deals leave a tombstone so re-ingesting the same post never resurrects them.
78. **Manual Merge/Split API**: An endpoint forces two deals to merge or one to split. Overrides are stored and honored by future ingest.
79. **Sole-Source Outcome Tracker**: Follows deals reported by only one channel and records whether they verified and were clicked. Measures the true value of unique scouts.
80. **Offline Similarity Threshold Tuning**: A GitHub Actions job replays admin merge decisions and suggests better similarity thresholds at no VM cost.

## E. Classification, Enrichment & LLM Layer (81-100)

81. **Cheapest-First LLM Escalation**: Each task goes to the smallest model first and escalates only if output fails validation. Free-tier quota is spent on hard cases only.
82. **Deterministic Fact Extraction Before LLM**: Regex extracts price, MRP, and links first, and the LLM receives them as fixed facts to phrase, not to discover.
83. **Prompt Version Stamping**: Each enrichment stores the prompt version that produced it. Quality changes trace back to a specific edit.
84. **Provider Quota Ledger**: Tracks daily requests and tokens against Gemini's 15 RPM and 1,500 RPD and Groq's limits. Exhausted providers are skipped until reset.
85. **Skip-LLM Fast Path**: If a raw caption already has price, link, and readable text, the template is used and the LLM call is skipped. Saves free-tier quota.
86. **Learned Brand Dictionary**: Builds a brand list with canonical spellings from approved deals. Deterministic matching improves over time.
87. **Title Quality Score**: A numeric score by length, capitals, hashtags, and symbols. Feeds QC lists and feed eligibility.
88. **Deal Shorthand Dictionary**: Expands common Indian deal abbreviations (CC for credit card, DC for debit card) during extraction so offers are read correctly.
89. **Deal Type Tagger**: Labels each deal as price drop, coupon, bank offer, freebie, cashback, or sale event. Enables type-based filtering and rules.
90. **Evidence-Only "Why It's Cheap"**: Assigns a reason only when source text or page data supports it; otherwise `unknown`. No invented explanations.
91. **Prompt Injection Sanitizer**: Strips instruction-like text from channel posts before it reaches an LLM. A post cannot steer the formatter.
92. **Versioned Category Taxonomy**: The taxonomy carries a version, and deals record which version classified them. Changes trigger targeted reclassification.
93. **Occasion and Season Tagger**: Tags deals as festive, monsoon, winter, or wedding season from title and date. Enables seasonal collections.
94. **Spec Unit Normalizer**: Normalizes GB and TB, mAh, and inches so specs compare across deals.
95. **Warranty Extractor**: Captures manufacturer warranty duration when the page states it. Displayed as data, not a marketing badge.
96. **Product Condition Detector**: Distinguishes new, refurbished, and open-box from titles and seller notes. Refurbished items are not compared with new-item history.
97. **Expiry Hint Extraction**: Turns "till midnight" or "first 100 orders" into a structured `expires_hint` with a confidence level.
98. **Post Readability Lint**: Checks line length and density of final posts and flags walls of text before publishing.
99. **Zero-Result Synonym Miner**: Reviews storefront zero-result queries and proposes synonym entries for admin approval.
100. **Admin Correction Feedback Set**: Every admin correction is stored as a labelled example. These feed few-shot prompts and evaluation cases.

## F. Storage, Indexes & Retention (101-120)

101. **Weekly Index Audit**: A scheduled script runs `explain()` on the most common queries and reports any that scan collections. Index drift is caught early.
102. **Index Size Budget**: Tracks index sizes against a target share of the 512MB Atlas cap and warns when indexes crowd out data.
103. **Cold Export to Private Repo**: A weekly Actions job exports expired deals as compressed JSONL to a private repo, then deletes them from Atlas. Long history costs nothing.
104. **Snapshot Write Coalescing**: Identical price readings within a window collapse into one write with a repeat count. Cuts writes and storage.
105. **Tiered History Downsampling**: Hourly points for 7 days, daily for 90, weekly beyond. Long charts stay light without losing recent detail.
106. **Schema Version with Lazy Migration**: Documents carry `schema_v`, and readers upgrade old shapes on access. No risky all-at-once migration.
107. **Idempotent Ingest Keys**: A unique index on channel plus message ID makes every ingest write safe to retry.
108. **Redis Namespace Registry**: One file documents every Redis key prefix with TTL and purpose. Orphan keys do not accumulate.
109. **Split Eviction Policies**: Cache keys use LRU eviction while queue keys are never evicted. Memory pressure cannot silently drop pending jobs.
110. **Edge Cache Purge on Approve or Expire**: After an approve or expire, the API purges the affected keys from the Cloudflare edge. Fresh state appears without waiting for the 60s TTL.
111. **Write Amplification Audit**: Measures database writes per deal and highlights redundant updates. Keeps Atlas load low.
112. **Explicit Projection Policy**: Every public query requests only needed fields. Smaller payloads, and admin-only fields cannot leak.
113. **Periodic Category Count Snapshots**: Category and store counts are recomputed every few minutes into a small collection. Filters show counts without per-request aggregation.
114. **Actions-Run Compressed Dump**: A nightly Actions job runs `mongodump` with a read-only Atlas user and stores the dump encrypted. The VM does no backup work.
115. **Monthly Restore Drill**: Actions restores the latest dump into a temporary local MongoDB container and runs sanity queries. An unrestorable backup is caught early.
116. **Secrets Never in Mongo**: A startup check fails if secret-looking strings appear in config collections. Keys stay in environment files only.
117. **Storage Growth Forecast**: Weekly job estimates days until the 512MB cap from collection growth and warns at 30 days. Capacity becomes a planned task.
118. **Orphan Record Cleaner**: Removes history and tombstones that no longer reference an existing product.
119. **Case-Insensitive Brand Collation**: Brand queries use a collation so `boAt`, `BOAT`, and `boat` match.
120. **Slow Query Logger**: Records queries over 100 ms into a small capped collection. The worst offenders are visible in admin.

## G. Telegram Publishing & Channel Operations (121-140)

121. **Edit Rate Governor**: Spaces automated edits to stay inside Telegram limits. Mass sold-out edits cannot trigger flood errors.
122. **Bot Edit Failure Classifier**: Categorizes edit failures (message deleted, content unchanged, permission lost) so retries happen only where they can succeed.
123. **Reply-Thread Price Drop Follow-ups**: A further price fall is posted as a reply to the original message, keeping the conversation in one thread.
124. **Template Registry per Channel and Category**: Post templates are stored per channel and category with version history.
125. **Link Position Guarantee**: After trimming, the affiliate link always sits within the visible part of the caption.
126. **Link Preview Policy**: A per-channel setting decides whether link previews are on or off.
127. **Cross-Channel Publish Stagger**: Spaces the same deal across different target channels by a few seconds to avoid bursts.
128. **Own-Analytics Slot Optimizer**: Suggests posting windows from your own historical click times.
129. **Posted Message Ledger**: Stores the message ID of every post per channel so later edits know exactly which message to touch.
130. **Publish Dead-Letter Queue**: Failed posts go to a queue tagged by reason (permissions, flood, content) so failures are actionable.
131. **Daily Bot Permission Audit**: Verifies the bot still has post and edit rights in each target channel.
132. **Channel Rename Detector**: Notices when a channel handle changes or redirects and prompts an update to `channels_config`.
133. **Session Join-State Monitor**: Tracks whether the reading session is still a member of every private source channel. Silent removals are found within a day.
134. **Encrypted Session Backup**: Stores an encrypted copy of the session string off the VM. A disk failure does not force manual reauthorization.
135. **Multi-Image Album Builder**: Deals with several source images can publish as an album of up to ten, with picks and order from admin.
136. **Sale Event Detector from Channel Chatter**: Detects a surge of festival keywords across channels and suggests turning on festival mode.
137. **Digest Post Generator**: Compiles an hourly or daily digest of the best verified deals.
138. **Sale Event Countdown Posts**: Scheduled posts for announced sale events using official dates only.
139. **Own-Channel Cross-Post Deduper**: Prevents the same deal being posted to two of your own channels within a window.
140. **Post Stats Pull**: Retrieves views and forwards for published messages into Mongo. Template and channel performance become measurable.

## H. Reliability, Observability & Self-Healing (141-160)

141. **Restart-Storm Detector**: If a process restarts more than N times in ten minutes, PM2 stops thrashing and alerts. A crash loop cannot mask a real bug.
142. **Event Loop Lag Monitor**: Measures asyncio loop lag inside `worker.py` to expose blocking code before it pushes idle CPU up.
143. **Dead-Man's Switch Ping**: A free healthcheck service expects a ping every few minutes. If the whole VM goes down, you still hear about it.
144. **Correlation-ID Structured Logs**: Every log line for a deal carries the same correlation ID. One search reconstructs its journey.
145. **Log Rotation with Size Cap**: Logs rotate by size and age with a hard total cap. Logs cannot fill the disk.
146. **Sentry Release Tagging**: Tags Sentry events with the git commit so an error spike is tied to a specific deploy.
147. **Idle CPU Budget Test**: A scheduled check samples worker CPU while idle and fails above 1%. Protects the near-0% idle promise.
148. **RSS Trend Watchdog**: Tracks resident memory per process and restarts gracefully above a threshold. Slow leaks never become outages.
149. **Graceful Shutdown Drain**: On stop, workers finish the current job and requeue the rest. Deploys do not lose in-flight deals.
150. **Poison Message Quarantine**: A job that fails repeatedly moves to quarantine with its payload. One bad message cannot block the queue.
151. **Clock Drift Check**: Verifies system time against an NTP source daily. Timestamps drive freshness claims, so drift is a defect.
152. **Tiered Disk Cleanup**: Thresholds trigger progressively: clear caches, then old logs, then alert. Recovery starts before space runs out.
153. **Pinned Dependencies**: Lockfiles and pinned versions for Python and Node. Builds are reproducible on the VM and in Actions.
154. **Automated Vulnerability Alerts**: GitHub Dependabot alerts on vulnerable packages at no cost.
155. **Parser Shadow Testing in Actions**: Sampled raw payloads replay against a new parser version in Actions and are diffed. No extra process on the VM.
156. **Hot-Reload Feature Flags**: Flags live in `SystemSettings` and reload without restart. Risky features can be disabled in seconds.
157. **Runbook Links in Alerts**: Each alert links to a short runbook for that failure.
158. **Ingest-to-Publish Latency SLO**: Measures p50 and p95 from first source post to storefront visibility.
159. **Synthetic End-to-End Test Deal**: Every six hours a tagged fake deal flows through the pipeline to a private test channel. Silent breakage between stages is caught.
160. **Automatic Incident Snapshot**: When an alert fires, recent logs, queue depths, and process states are captured together. Post-mortems start with evidence.

## I. $0 Budget, GitHub Actions & Edge Offload (161-180)

161. **Signed Actions Callbacks**: Actions jobs report results back with an HMAC signature. The VM accepts only authentic completion events.
162. **Workflow Dispatch Throttle**: Caps how many Actions runs the system triggers per day. A burst cannot exhaust free minutes.
163. **Actions Minutes Ledger**: Tracks estimated minutes used per workflow and month. Overruns are predicted, not discovered.
164. **Offloaded History Compaction**: Price history downsampling runs in Actions on an exported slice. The VM does no batch work.
165. **Export Handoff via Private Repo**: The VM commits a small daily JSON export to a private repo where Actions read it for analytics.
166. **IndexNow Ping**: After new deal pages go live, ping IndexNow so search engines that support it learn about them without waiting for a crawl.
167. **Weekly Top-Deals Image in Actions**: Actions render a weekly summary graphic for the Telegram channel from the export. No image work on the VM.
168. **Edge KV Kill Switch**: The Cloudflare Worker reads a KV flag so maintenance or a feed freeze can be flipped without touching the VM.
169. **Turnstile on Lookup Forms**: Cloudflare Turnstile protects the lookup endpoint from bots for free.
170. **Edge Stale-If-Error**: The Worker serves the last good response for a limited time when the VM API is unreachable.
171. **Email Sender Warm-Up Plan**: Ramps email volume gradually on a new sender domain while respecting SendGrid or Mailgun free limits.
172. **VAPID Web Push**: Web push uses self-generated VAPID keys with no paid service.
173. **DigitalOcean Credit Burn-Down Tracker**: Tracks remaining GitHub Education credit and expiry. Isolated jobs stop before the credit does.
174. **Zero-Spend Audit Script**: Lists connected services and asserts each is on a free plan. Accidental paid upgrades are noticed.
175. **Offline LLM Reclassification**: Bulk reclassification runs as a batch in Actions using free-tier keys. The live pipeline is not slowed.
176. **Storefront Link Crawler**: Actions crawl the storefront weekly for broken internal and outbound links.
177. **Lighthouse CI Budget**: Each deploy runs Lighthouse in Actions and fails on regressions.
178. **Weekly Data Quality Report**: Actions generate a report of missing fields, stale deals, and duplicate rates and post it to an admin Telegram chat.
179. **Prompt Regression Tests**: Actions replay saved examples against prompt changes and diff the results.
180. **Secret Rotation Reminders**: A scheduled workflow reminds you when keys reach a set age, including the 60-day EarnKaro token cycle.

## J. Public API, Security & Data Quality (181-200)

181. **Versioned Public API with OpenAPI Spec**: Public endpoints live under a version prefix with a generated spec so the storefront can evolve safely.
182. **ETag on Feed Endpoints**: Feed responses carry an ETag so unchanged data returns 304, saving mobile data.
183. **Cursor Pagination**: Feeds paginate by cursor instead of offset. New deals arriving mid-scroll never cause duplicates or skips.
184. **Lookup Cost Weighting**: In the rate limiter, live-fetch lookups cost more tokens than cached ones, so heavy calls are limited more strictly.
185. **DNS Rebinding Guard**: Resolve once, validate the IP, and connect to that pinned IP. A hostname cannot flip to an internal address between check and use.
186. **Lookup Input Sanitizer**: Normalizes and validates pasted text before any network call. Malformed input fails fast and cheaply.
187. **Public Field Allowlist**: Public endpoints return only allowlisted fields, so internal ones such as `submitted_by` and `unshorten_trace` never leak.
188. **Short-Lived Admin Tokens with IP Allowlist**: Admin calls use short-lived tokens and, optionally, an IP allowlist. A leaked token expires quickly.
189. **Audit Log Hash Chain**: Each audit entry stores the hash of the previous one, making tampering detectable.
190. **Salted-Hash Visitor Counting**: Visitors are counted with a daily-rotating salted hash. No raw IP is stored.
191. **Bot-Filtered Click Beacons**: Ignores beacons from known bot user agents and repeats within a second so click numbers reflect real interest.
192. **Per-Deal Data Quality Score**: Scores each deal by completeness of image, MRP, category, and verification freshness.
193. **Low-Quality Auto-Hide Threshold**: Deals below a quality score are hidden from public feeds but remain visible in admin.
194. **Backend-Frontend Contract Tests**: CI checks that API responses match the types the storefront expects. Schema drift fails a build, not a page.
195. **Shared Enum Registry**: Stores, categories, and condition values live in one source and generate TypeScript types.
196. **Inbound Webhook Signature Verification**: Every inbound webhook is verified against a shared secret. Forged calls are rejected.
197. **Takedown Report Endpoint**: Merchants and visitors report a deal through a validated endpoint that opens an audit-logged admin task.
198. **Retention Policy Jobs**: Scheduled jobs delete or anonymize click and lookup logs after a fixed period, aligning with India's DPDP expectations.
199. **Per-Store Scraper Kill-Switch**: Each retailer adapter has a flag that disables it instantly from admin.
200. **Buyback Quote Freshness Guard (experimental)**: The Cashify/CeX arbitrage engine shows a margin only if its quote is under six hours old, labelled as an estimate.
