# IndiaDealHunts rebuild proposal — discussion draft

30 October 2026. Planning only; no application changes in this pass. 3D conversion deferred by user.

## Current evidence

React 19/Vite/Tailwind 4 with Motion, Recharts, Lucide, Three.js already installed (rudranil-deals-web/package.json). src/main.tsx imports seven global style files; emerald.css overrides earlier layers. This makes continued global overrides a poor base for detailed UI work. src/utils/audio.ts already implements preference-gated synthesized click and success sounds. DealOrb currently uses an illustration with a real-offer callback, not a finished 3D character. Existing custom useModalSurface handles focus, Escape and scroll locks. Preserve functional data flows and user's preexisting ProductPriceHistory.tsx changes.

Reference evidence and access limits: [research](reference-research-2026-10-30.md). Do not assert the reference designers used GSAP, Three.js, a specific timing curve, or sounds. Those were not verified. Jordan dashboard explicitly credits Untitled UI/Icons: https://dribbble.com/shots/27113092-Dashboard-Untitled-UI . Travique direct page also returned 403.

## Three approaches to discuss

A. Connected discovery (recommended): established feed first, one compact mascot area, contextual side detail on wide screens and phone detail sheet/page. Strong browsing continuity; needs careful history, focus and responsive state handling.
B. Editorial Daily Find: stronger typographic composition and curated feeling, calmer controls, feed remains central. Fits the earlier selected direction; cannot imply human curation if offers are algorithmic.
C. Personal shopping workspace: watches, comparisons and tool results prominent. Useful for returning users, but changes the homepage hierarchy most and risks crowding the feed.

Recommended synthesis: A's interaction model with B's deliberate typography and composition, respecting the approved emerald/ivory palette. Preserve existing navigation and functionality. No new dashboard sidebar, fake delivery controls or travel/map features.

## System decisions

- Materials: opaque readable product/content surfaces; glass reserved for header, floating toolbar and overlays. Emerald-black dark canvas, forest midtones, muted champagne details, restrained lime action. Ivory/sage light surfaces with forest actions, separately tuned shadows and image backgrounds.
- Typography: existing Plus Jakarta Sans, consistent 12/14/16 body/meta roles and deliberate heading scale; tabular numbers for price and charts. Avoid tiny metadata and excessive capitals.
- One component layer: tokens -> primitives -> composed features. Migrate legacy styles component by component, removing superseded rules in the same step. No eighth stylesheet or blanket recolour regex pass.
- Shared primitives: buttons, icon buttons, fields, select/popover, segmented controls, badges, cards, drawers, dialogs, toasts, loading/empty/error states. Define hover/focus/pressed/selected/disabled/loading before page assembly.

## Page and interaction scope

| Area | Composition and behaviour |
| --- | --- |
| Header/navigation | Same routes and tools, consolidated menus, clear selected state, stable sticky bounds and unified gutters. Desktop search expands without covering account actions. |
| Discover | Compact introduction/search, optional mascot, category rail, filter summary, real feed, price-lookup callout and purposeful footer. Products visible early. |
| Search/results | Query retained, active filter chips removable, source groups distinct, count/loading/empty/error states clear. Cancel stale requests; preserve useful results during refresh. |
| Filters | Desktop drawer while results stay visible; phone bottom sheet with Apply/reset/count and retained draft selections. Category chips remain the quick path. |
| Product detail | Wide-screen connected detail panel candidate; phone detail surface with stable merchant action. Evidence, conditions, source and history progressively disclosed. Back restores feed scroll. |
| Save/compare | Clear save acknowledgement, persistent save state, compact compare tray; comparison aligns actual product fields, flags differing models and missing values. |
| Watches/history | Target-price form, watch state, dated observations and chart gaps; no 'verified', stock, freshness or savings claims without supporting data. |
| Calculators/tools | Inputs grouped by purpose, primary result first, expandable assumptions; same field and chart language across calculators. |
| Profile/settings | Clear identity, saved/watches links, explicit appearance and sound controls. No unrelated dashboard decoration. |
| About/verification/contact/submit/community/legal | Same tokens and navigation, readable layouts and purposeful sections, preserve forms/validation/content. Verify footer actions. |
| Mobile | Intentionally arranged at 360/390/430px, five-item bottom nav retained, safe-area spacing, touch targets, no miniature desktop sidebar or fixed-width panel. |

## Proposed motion score (starting values, not reference measurements)

- Buttons: 100–160ms colour/press feedback, icons settle 160–220ms.
- Category selection: 220–280ms travelling indicator, interruptible on rapid input.
- Filter/details surface: 280–360ms eased slide with backdrop fade; restore focus and scroll.
- Feed filtering: short opacity/layout transition, stable keys; do not replay the whole feed entrance.
- Save to shortlist/compare: icon feedback plus count change; no long flying-object animation on every tap.
- Chart range: 300–450ms restrained update only when data changes, never fabricate observations to make curves smoother.
- Mascot later: idle -> greeting -> offer-held -> tapped/reveal -> settle. Pause when hidden/offscreen, no constant waves or automatic sound. Illustration fallback remains functional.
- Reduced motion: retain state feedback with fades/instant positioning, stop idle loops and large transforms.

Motion supports layout/layoutId continuity: https://motion.dev/docs/react-layout-animations . Reduced-motion controls: https://motion.dev/docs/react-accessibility . These are proposed implementation tools, not identified reference stacks.

## Sound proposal

Default off, retained user preference. Short soft save tick, distinct alert-success cue, optional surprise reveal chime. No hover sounds, autoplay background track or repeating robot chatter. Audio failure never blocks actions. Reuse current Web Audio singleton and add gain/volume if expressive sounds are chosen. User activation and explicit control: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices . Do not introduce Howler merely for three synthesized cues; consider it only if loaded multi-clip audio becomes an actual requirement.

## Library plan

- Keep Motion for React for interface state/layout transitions; CSS for simple visual states.
- Keep Recharts for actual recorded data and tool charts: https://recharts.github.io/en-US/api/AreaChart/ . Do not base code on newer docs without checking installed version/types.
- Keep Lucide for the established icon system.
- Keep native Web Audio for optional event cues.
- Defer Three.js/GLB until a suitable model exists. Load separately, cap resolution, pause invisibility, dispose geometry/materials/textures: https://threejs.org/manual/pages/cleanup.html .
- Evaluate Radix Dialog only if replacing the modal foundation: focus/Escape/title support https://www.radix-ui.com/primitives/docs/components/dialog . Current custom hook must be tested before choosing migration; don't mix foundations casually.
- GSAP only if a concrete mascot timeline requires it. It can coordinate Three/canvas sequences and has React cleanup support: https://gsap.com/resources/React/ . Do not run Motion and GSAP on the same properties.
- No smooth-scroll hijack, 3D background, added framework or dependency collection for appearances.

## Proposed sequence and review gates

1. Agree homepage hierarchy, sound scope and detail navigation; select A/B/C or synthesis. All-page inventory and state map precede implementation.
2. Define shared tokens/material/type/motion contracts and make real desktop/mobile discovery-to-detail journey in the existing app.
3. Review rendered desktop 1440/1024 and phone 390/360 in both themes; actually test search/filter/save/detail/back/compare, loading/error/empty and keyboard. Do not equate build success with visual verification.
4. Carry approved primitives through search, saves, watches, comparison, tools and profile, then informational pages/footer and every modal.
5. Verify full journeys, preserve affiliate/source and price-evidence rules, check responsive overflow/focus/reduced motion/audio off and user opt-in.
6. Add mascot 3D separately after asset review. Production deployment is a distinct later action.

Open decisions were sent as questions: deals-first versus mascot-first, subtle versus expressive/no audio, complete homepage first versus all screens together. No assumption counts as approval.
