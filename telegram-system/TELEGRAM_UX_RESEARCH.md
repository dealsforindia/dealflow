# Telegram System — User-Experience Research & Improvement Plan

**Scope:** Consumer-facing experience of the DealFlow Telegram deal channel (`@dealsforindiachannel` / `@bestindiandeals2025`) and its supporting bot (`dealbot_backend/dealbot/bot.py`, `listener.py`, `worker.py`, `api.py`) plus the admin curation deck (`tg-setup`).

**Sources:** Telegram Bot API & Bot Features documentation (core.telegram.org), Telegram product blog (2025–2026 releases), and a code-level review of `dealbot_backend/dealbot/` (formatting, broadcast, approval, alert, dedup paths).

---

## 1. Executive summary

The backend is strong on *ingestion and curation* (27 source channels, AI formatting, dedup, affiliate tagging, admin approval). The consumer-facing layer, however, is essentially **"image + caption text"**. Almost none of Telegram's interactive primitives (inline keyboards, reactions, deep links, Mini Apps, topics, suggested posts, channel direct messages, polls, auto-translate) are used to help a subscriber *find, filter, save, act on, or give feedback on* a deal.

**Top 5 highest-leverage changes for users:**
1. **Add "Grab Deal" / "Copy Coupon" inline URL buttons** to every post (currently links are buried in caption text).
2. **Per-deal "Expired?" reaction + auto-edit** so dead deals stop wasting taps.
3. **Channel topics by category** (Electronics, Fashion, Grocery, …) so users can mute noise and follow only what they want.
4. **A lightweight browse/filter Mini App** (or at least an inline-mode search bot) over the MongoDB deal store, since `tg-setup` is admin-only today.
5. **Price-drop / watchlist alerts** with an explicit opt-in flow (deep link `?start=watch_<asin>`), instead of the opaque `alerts.json` file.

---

## 2. What the system does today (user-facing)

| Surface | Behaviour (from code) |
|---|---|
| Public channel post | `_send_with_fallback` → photo/video + caption ≤ 1024 chars (`TG_CAPTION_LIMIT`). Falls back to plain text if markdown fails. No `reply_markup`. |
| Caption content | `format_rated/unrated/no_link`: price line, coupon code, flash-sale line, body text, raw affiliate URLs. |
| Admin approval | `send_for_approval` posts to `ADMIN_USER_ID` with `[🚀 Post] / [🗑️ Skip]` inline buttons. |
| Alerts | `notify_alert_users` reads `alerts.json` (product-name → users). Opt-in mechanism not visible to end users. |
| Dedup | ` DUP_TEXT_SIM` / `DUP_NAME_SIM` text similarity; canonical key by ASIN/Flipkart PID. |
| Live edits | Redis `deals:price_change` → edits live message price. |
| Web | `tg-setup` admin deck + `rudranil-deals-web` storefront; deal data in MongoDB `UniqueDeals`. |

**Gaps vs. a modern deal channel:** no buttons, no reactions handling, no topics, no deep links, no Mini App for consumers, no inline mode, no onboarding, no per-user preferences, no expiry handling, no feedback loop.

---

## 3. Telegram platform capabilities we are NOT using (and how they help users)

### 3.1 Inline keyboards on channel posts
Posts currently carry 2–4 bare URLs in the caption. Mobile users must long-press/copy. **Inline URL buttons** ("🛒 Grab Deal", "🎟️ Copy Coupon", "📊 Price History") put the primary action one tap away and keep captions clean. Telegram supports editing `reply_markup` in place, so a deal can flip from "Live" → "Expired" without reposting.

### 3.2 Reactions as feedback
Telegram channels support reactions. We can (a) let users react 👍/👎/🔥 to signal quality, (b) aggregate via `setMessageReaction`/updates to re-rank and suppress low-quality deals, (c) auto-mark expired deals with a "❌ Expired" reaction count threshold that triggers an edit. Today there is zero feedback loop from consumer to ranker.

### 3.3 Deep linking (`?start=`)
Bot has no `/start` handler exposed to users. Deep links let us encode intent: `?start=watch_<asin>`, `?start=cat_electronics`, `?start=deal_<id>`, `?start=bizChat…`. This is the foundation for watchlists, category opt-ins, and per-deal landing pages without a separate auth system.

### 3.4 Topics in channels (forum mode)
A single firehose channel forces users to either read everything or mute. Enabling forum topics lets us post each deal into `Electronics`, `Fashion`, `Home`, `Grocery`, `Beauty`, `Travel`, `Gaming`, etc. (we already compute `detect_category`). Users mute topics they don't care about — dramatically reducing notification fatigue, which is the #1 reason deal-channel subscribers leave.

### 3.5 Channel Direct Messages + Suggested Posts
Telegram now lets channels have a DM directory where users privately contact channel staff, and users can *suggest posts* to a channel. We could accept user-submitted deals via suggested posts, with the bot preparing/reviewing them (we already have an admin approval flow — extend it to user submissions). This grows supply and community ownership.

### 3.6 Mini Apps (consumer-facing)
`tg-setup` is an admin deck. The same React/Vite stack + our FastAPI/MongoDB backend could power a **consumer Mini App**: browse by category/store, search, price history chart, watchlist, notification prefs. Launch via inline button on every post ("📱 Open in App") and a menu button. This is the biggest UX upgrade available and reuses existing infra.

### 3.7 Inline mode
A `@dealbot` inline query ("@dealbot iphone") returning deal cards would let users share deals into any chat and would make the bot discoverable. Currently only admin uses the bot.

### 3.8 Auto-translate for channels
Telegram supports auto-translate for channel posts. Enable it in channel settings so non-Hindi/English users (or regional-language users) get deals in their language. Cheap win for reach.

### 3.9 Polls & checklists
Polls ("Which deal should we post next?") and checklists (shared shopping lists) increase engagement and give the curator demand signals. Polls can carry media now.

### 3.10 Streaming replies / drafts
For the bot's interactive flows (search, price lookup), `sendMessageDraft` shows "Thinking…" instead of silence. Improves perceived responsiveness.

### 3.11 Ephemeral messages in groups
If we ever run a community group alongside the channel, ephemeral replies keep it uncluttered (private answers to /commands visible only to the asker).

### 3.12 AI summaries for channel posts
Telegram now auto-generates AI summaries for channel posts. Our captions are already structured (price/coupon/links), so summaries will be accurate — but we should keep captions concise and front-load the key facts so the summary is useful.

### 3.13 Channel boosts / paid subscriptions
For monetization and "premium" tiers (e.g., early-access high-score deals, no-ads digest), Telegram supports channel subscriptions and boosts. Could fund operations; optional.

### 3.14 Pinned welcome + FAQ
New subscribers get no onboarding. A pinned "How to use / commands / categories" post plus a Welcome Message (new Telegram feature) reduces confusion.

---

## 4. Recommended improvements, prioritized

### Tier 1 — Quick wins (1–2 weeks, high user impact)

1. **Inline URL buttons on every post.** Modify `_send_with_fallback` to accept and send `reply_markup` (InlineKeyboardMarkup) with `Button.url("🛒 Grab Deal", url)` for the primary affiliate link, and `Button.url("🎟️ Copy Coupon", …)` where a coupon exists. Store `message_id` already returned; keep for later edits. *(Code: `bot.py:_send_with_fallback`, `format_*`.)*
2. **Caption hygiene.** Front-load price + discount + store in first 2 lines (helps AI summaries & truncated views); move raw URL dump to buttons; keep ≤ 900 chars to avoid split messages.
3. **Topics by category.** Enable forum mode on the channel; pass `message_thread_id` (topic) in `send_file`/`send_message` based on `detect_category`. Add a "General/Announcements" topic for meta posts.
4. **Welcome message + pinned FAQ.** Configure via BotFather / channel settings; pin a "How to use" post listing categories, coupon-copy tip, and the bot's deep-link commands.
5. **Auto-translate enablement** in channel settings.
6. **Coupon copy button.** Inline button with `copy_text` (Telegram supports copyable text buttons) for the coupon code — one tap to clipboard.

### Tier 2 — Medium (2–6 weeks)

7. **Deal expiry handling.** Track `posted_ts` + optional `valid_until`. A background job edits the message caption to prepend "❌ EXPIRED" and swaps buttons to "See similar deals" after expiry or when a price re-scrape shows OOS. Reuse existing `oos_expiry_worker.py`.
8. **Reactions feedback loop.** Subscribe to reaction updates; store per-deal reaction counts in Mongo; feed into ranking/dedup thresholds (suppress deals with strong negative signal).
9. **Watchlist / price alerts via deep links.** `/start watch_<asin>` adds to user's watchlist (Mongo collection `UserAlerts`); notify on price drop. Replace opaque `alerts.json`.
10. **Category opt-in.** `/start cat_<slug>` stores preference; a daily/weekly digest bot message to opted-in users with top N deals per preferred category (rate-limited, opt-out via `/stop`).
11. **Inline mode search.** Enable `/setinline`; implement `answerInlineQuery` returning deal cards with a "Share" button. Reuses Mongo search.
12. **Deep-link per deal.** `https://t.me/<bot>?start=deal_<fp_hash>` opens a DM with full deal details + buttons — useful for "tell me more" without cluttering the channel.

### Tier 3 — Strategic (1–3 months)

13. **Consumer Mini App.** Reuse `tg-setup` React stack + FastAPI. Features: browse/search/filter by category & store, price-history chart, watchlist, notification prefs, deal submission. Launch from inline button + menu button + direct link `t.me/bot?startapp`.
14. **User-submitted deals via Suggested Posts.** Accept, auto-format with existing AI pipeline, admin-approve, credit submitter. Grows supply and engagement.
15. **Channel direct messages.** Enable DM directory; bot handles support/queries in topics; reduces public noise.
16. **Digest & "top deals of the day"** scheduled message with inline buttons (reduces firehose fatigue).
17. **Personalization.** Store per-user category/store preferences; rank feed accordingly (server-side, delivered via digest or a personalized Mini App view).
18. **Accessibility.** Add `alt` text to images (product name), avoid emoji-only meaning, ensure links have descriptive labels.

### Tier 4 — Monetization / community (optional)

19. **Paid "early access" tier** via Telegram Stars subscriptions for high-score deals before public posting.
20. **Channel boosts** integration for premium features.
21. **Community group** with ephemeral command replies + topic-based Q&A.

---

## 5. Implementation notes (where to touch)

- `dealbot_backend/dealbot/bot.py`
  - `_send_with_fallback`: add `reply_markup` param + pass through to `send_file`/`send_message`; clean up temp files (already done).
  - `format_rated/unrated/no_link`: return a small struct `{text, buttons}` or add a parallel `build_buttons(deal)` helper.
  - Add `/start` handler (Telethon `@client.on(events.NewMessage(pattern='/start'))`) for deep-link routing.
  - Add reaction-update handler for feedback.
- `dealbot_backend/dealbot/api.py`: endpoints for watchlist, preferences, search (for Mini App + inline mode).
- `tg-setup` / new consumer app: reuse components; add consumer routes; gate admin by `adminAuth`.
- MongoDB: add `UserAlerts`, `UserPrefs`, `DealReactions` collections + indexes.
- Channel settings: enable topics, welcome message, auto-translate, reactions.

## 6. Success metrics

- Click-through rate per post (button taps vs. caption links) — expect 2–4× improvement.
- Mute/unsubscribe rate (should drop with topics + digest).
- Watchlist opt-ins and alert-driven conversions.
- Reaction volume and correlation with downstream conversions.
- Time-to-first-action for new subscribers (onboarding).
- Deal expiry complaints / dead-link reports (should drop).

## 7. Risks & constraints

- Telegram rate limits: 30 msg/s default (1000 with paid broadcasts); keep batched digests under limits.
- Caption 1024-char cap already handled; buttons don't count toward caption.
- Telethon `send_file` accepts `buttons=` (InlineKeyboard) — verify installed version supports; fallback to `reply_markup`.
- Forum topics require channel admin rights and a one-time migration; existing subscribers keep subscriptions.
- Mini App requires HTTPS hosting + BotFather registration; reuse Cloudflare edge (`dealflow-edge`).

---

*Generated as part of a user-experience research pass over the Telegram deal system. Treat as a living document; update as features ship.*
