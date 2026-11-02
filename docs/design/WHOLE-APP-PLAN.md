# Whole-app DealFlow improvement plan

Status: proposed implementation plan, 2026-11-02. No redesign implementation is authorized by this document alone. Current user request is planning.

## Outcome
A recognizable moderation application that makes inspecting offers, editing posts, controlling destinations and understanding publication results clear. Preserve all working product functions. Keep identity separate from IndiaDealHunts. Improve every existing screen and its states, rather than treating Review Deck as the whole product.

## Evidence and boundaries
Use the current whole-site critique and20 captures in .impeccable/review/whole-site as the baseline. Fixtures establish layout and state presentation only, never real data quality, successful external delivery or production performance. Existing unrelated user changes must remain intact. No deployment, live posting, channel automation change, credential rotation or dependency installation as a side effect.

Pasted anti-slop lists are candidate checks, not evidence of AI authorship. Fonts, Lucide, component libraries, rounded corners, localStorage preferences and a CSR admin shell can be intentional. Preserve noindex for this private administration app. Do not add stock photos, testimonials, marketing heroes, fake data, ornamental graphs or a different preset aesthetic merely to avoid familiar defaults.

## Phase1 — Preserve behavior and establish the design contract
Inventory screens, fields, buttons, handlers, endpoints, destinations and important states. Include Review/cards/Inspector/editor/Quick Drop, Published/details, Channels/directory/invite/rename, Heatmap, Rules/simulator/create, Videos/player/Creator Kit, Settings and Login. Record source ownership, before screenshots and known limitations.
Capture product truth in PRODUCT.md and a concise design contract from established user preferences: independent identity, readable and distinctive, no cyberpunk decoration, no generic recoloring, all functions retained. Present2 realistic directions for the SAME screen with real content before committing the whole app. Avoid abstract theme names as the only decision evidence.

Acceptance: function preservation checklist and screen/state matrix exist; owner can review an actual direction rather than a prose promise.

## Phase2 — Correct trust and persistence
- Distinguish unknown price, known zero/free, base sale price and coupon-adjusted price consistently in cards, Inspector, editor, history and copied content.
- Make channel pause, delete, alias, destination toggles and rule saves show pending/confirmed/error; restore previous state on failure.
- Choose one rule-saving model. Recommended: edit locally, show unsaved changes, Save rules explicitly; simulator can test local drafts without implying deployment. Include loading/error/last saved state.
- Replace literal health assurances with confirmed observations, loading/unknown/stale states and last checked time. Do not imply worker counts from a Redis ping.
- Give Videos distinct loading, failed/retry, stale, empty and no-match states. Restore history items after failed unpublish/delete.
- Remove unconditional verification promises from Creator Kit; omit unavailable discount/MRP instead of making unsupported claims.
- Review browser-bundled credentials and frontend authentication separately. If an embedded credential is privileged, removing its literal is insufficient: backend enforcement and owner-coordinated rotation are needed. Do not print secret values or silently rotate them.

Acceptance: mocked success, non-OK, network failure and retry tests cover each changed persistence path; no false success or lost edits; no actual posts made by verification. UI checks cannot certify backend security.

## Phase3 — Shared UI foundation
Consolidate token ownership and stylesheet import order. Replace conflicting legacy rules in affected components rather than accumulating another global override layer. Define semantic surface/text/action/selection/status/focus tokens plus typography, spacing, radius and motion scales. Keep usable existing dependencies; no package added solely for novelty.
Create reusable Button, Field, Status, Tabs/Filters, Dialog and DataState patterns where reuse actually exists. Standardize icon stroke/size and reserve icons for recognition. All controls have keyboard focus, clear names, pending/disabled/error states and practical phone targets. Dialogs share focus entry/trap/return, Escape, scroll and dirty-close behavior. Reduced-motion handling covers CSS, Motion, portals and confetti.

Acceptance: one primary-action vocabulary and one selected-state vocabulary across screens; measured text/control contrast; no unintentional fixed-color theme islands.

## Phase4 — Apply throughout the product in complete slices
1. Shell, Login, Settings: navigation and form consistency, clear health status, labels and errors.
2. Review, Inspector, editor, Quick Drop: product evidence leads; full titles available; tuning/media tools grouped without feature loss; destination and publication outcomes explicit.
3. Published history: mobile stacked metadata/actions; all edit/unpublish/delete controls visible and reachable; pending/error recovery.
4. Channels and Heatmap: compact verified service information, responsive subtabs, explicit TG/Web controls, visibly contained horizontal chart scrolling or a phone-friendly alternate view.
5. Automation: clear rule conditions/actions, consistent draft/save state, readable simulator, accessible creation dialog.
6. Videos and Creator Kit: media-led composition, consistent controls, realistic job status and copy, accessible player, no unsupported trust claims.

Acceptance per slice: desktop, intermediate and phone captures plus long/missing data, loading/error/empty, focus and open-dialog checks. No slice declared complete from build success alone.

## Phase5 — Whole-app verification and handoff
Use Impeccable for independent product/design review and deterministic evidence. Hallmark is already installed; use its audit/render checks where compatible with this React admin application and record limitations. Its landing-page rules are not authority to add marketing sections, cap necessary operational data at80words, or redesign from a randomly dealt theme.
Use Hallmark before/kept inventories where supported, supplemented by the endpoint/function matrix. Scope any security tooling to a separately defined read-only/authorized assessment; a visual linter cannot validate authorization or secret safety.
Test360,390,768,1024 and1440px plus200% text/zoom where practical. Measure clipped internal content, not only document overflow. Exercise keyboard filters and dialogs, synthesized touch where available, reduced motion, server failures and duplicate publication results. Check real media separately from placeholder fixtures.
Run relevant build/type checks and focused regression tests. Obtain a cold independent whole-app review. Produce before/after pairs, changed-function inventory, actual test results and remaining limitations. Deploy only when explicitly requested.

## Tool roles
- Impeccable: product-specific critique, hierarchy, polish and independent review.
- Hallmark: supplementary visual/render guardrails and preservation checks; no fresh installation needed.
- Existing browser test harness: controlled fixture states, success/failure and interaction checks with no production mutations.
- Security review: separate scoped work with findings and remediation; never inferred from aesthetic patterns or industry statistics.

## Completion criteria
Every inventoried function remains findable and works as before except explicitly agreed repairs. All five navigation areas and secondary dialogs share the approved system. No clipped phone actions, unknown-as-free prices, false save success, fabricated service claims, inaccessible core controls or undisclosed placeholder functionality. Remaining physical-device, screen-reader, production-delivery and security validation limits are stated plainly.
