# DealFlow function preservation map

Baseline: current working tree, 2026-11-02. This map is a redesign contract, not a claim that every existing function is correct.

| Area | Functions to preserve | States to verify | Ownership |
|---|---|---|---|
| Shell/login | Token authentication, navigation, sound preferences, backend health | Connecting, accepted, denied, offline, reduced motion | App.tsx, LoginScreen.tsx |
| Review | Search, store/channel multiselect, sort, pagination, status filters, presets, bulk selection, quick URL intake, D2C radar | Loading, error/retry, empty, filtered empty, long titles, missing price/image | App.tsx ReviewView |
| Deal cards | Inspect image, edit, skip, approve, coupon/effective price, source/cluster/community evidence, multi-item offers | Pending, scheduled/Undo, accepted, failed, duplicate partial failure | App.tsx DealCard and API helpers |
| Inspector/editor | Title/price/MRP/coupon/message/images, Telegram preview, destinations, draft save, AI rewrites, price history, source refresh, affiliate refresh, upload/download, banner/video generation | Dirty close, save failure, missing data, keyboard/focus, generated media pending/error | App.tsx SplitPaneInspector/EditModal |
| Sharing | Post/WhatsApp/X copy, merchant/source links | Clipboard denied, correct platform formatting, safe links | App.tsx |
| Published | Search history, preview, edit, unpublish, delete, video generation/status | Long mobile rows, rollback, confirmation, unavailable media | App.tsx PostedView/PostedDealCard |
| Channels | Directory, add, alias, pause/resume, delete, invite update, Telegram/Web automation switches | Initial load, saving, failed rollback, disconnected/stale | App.tsx ChannelsView |
| Heatmap | Hourly activity, tier filters, sort, view switch, source rename/link/control | Narrow viewport, visible contained scroll, unavailable analytics | ChannelPerformanceHeatmap.tsx |
| Rules | Enable engine/rule, add/delete, discount/score/consensus/stores, save/sync, simulator | Unsaved changes, validation, save failure, loading/unknown | SmartAutoRulesDeck.tsx |
| Videos | Search/status filter, refresh, single/batch generation, playback, download, delete, Creator Kit title/description copy | Queued, processing, ready, failed, empty, failed fetch | VideosView.tsx |
| Settings | Destination, AI formatting prompt, existing scraping configuration values, save | Verified initial load, dirty, saving, error | App.tsx SettingsView |
| Auxiliary | Quick Drop, heatmap overlay, system architecture view, link-update dialogs | Accessible open/close, focus return, no accidental mutation | App.tsx and child components |

## Baseline defects to repair, not preserve
Unknown price shown as free; misleading health assertions; inconsistent rule save model; optimistic channel/history actions without rollback; secondary dialog semantics; mobile clipping; unverified Creator Kit claims.

## Preservation verification
Record before/after controls, endpoints and visible destinations per slice. Retain explicit access to advanced tools. Mock requests during tests; do not publish, delete channels, dispatch media or change automation on production as visual QA. Clipboard formatting and links must be checked separately from appearance.
