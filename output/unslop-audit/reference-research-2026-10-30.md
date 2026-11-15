# IndiaDealHunts reference research — 30 October 2026

## Evidence limits

This is a source-backed planning note, not a claim that all reference interfaces were interactively tested. Direct Behance opens returned HTTP 403. Search indexing exposed the creators' descriptions for Aurevia, Cryon, Voltera and Kinetiq. Dribbble text opened for Explorely, Geovea, Nixtio and Jordan Hughes; TheTrail timed out twice. An Explorely image-CDN request returned cache miss. Therefore exact motion timings, responsive behaviour, audio and implementation libraries are **unverified**. The Cryon and Velox screenshots supplied by the user remain visual evidence for their panel hierarchy and materials, but do not establish implementation.

## What can be supported, and what we propose

| Reference | Verified creator evidence | Proposed IndiaDealHunts use (our design decision) |
|---|---|---|
| [Velox / Arounda](https://www.behance.net/gallery/247623775/WebApp-UIUX-Design-Mobile-App-Design-Brand-Identity) | Exact case page blocked. Arounda's [first-party profile](https://www.behance.net/arounda?locale=en_US) lists the matching WebApp UI/UX, Mobile App & Brand Identity project. User's supplied screenshot shows connected dark panels, pill navigation, a prominent search field and a table-like results section. | Keep discovery central; use a connected desktop detail panel for price evidence and comparison. Do not import a flight sidebar or map. Avoid glowing borders on every surface. |
| [Aurevia / Gliuk](https://www.behance.net/gallery/246859753/Real-Estate-App-Property-Platform-Aurevia) | Creator description explicitly concerns property price comparison, market tracking, dashboards and structured data visualization. | Product selection should connect a concise card to offer comparison and dated observations, with a persistent selection state. |
| [Cryon / Gliuk](https://www.behance.net/gallery/247354701/Modern-Fintech-App-Finance-Dashboard-Cryon) | Creator describes financial control, dashboard insights and tracking flows. User screenshot shows large numerical summaries with subordinate charts and muted surfaces. | Price history and saved-price watches: one clear number, its date/source, then a chart; no invented savings or fake chart points. |
| [Voltera / Gliuk](https://www.behance.net/gallery/246709783/Modern-Parking-App-design-Parking-Platform-Voltera) | Creator description names real-time availability, navigation and reservation flows. | Borrow clarity of availability and progressive selection: available, ended, checking, unavailable. Mobile deal detail should expose one next action. |
| [Kinetiq / Gliuk](https://www.behance.net/gallery/248330897/Padel-Sport-Platform-UXUI-Design-Kinetiq) | Creator describes training management, performance tracking, analytics and a scalable UI system. Its [first-party Dribbble shot](https://dribbble.com/shots/27437235-Kinetiq-Design-UI-UX) describes personalized coaching and progress dashboards. | Calculator and watch screens need a summary/result first, expandable assumptions and readable inputs. Use consistent graph grammar across tools. |
| [Explorely / Equal](https://dribbble.com/shots/24794831-Explorely-Map-design-Find-campervan-on-the-map) | Creator/title verified. Shot text is sparse; image fetch failed. No runnable app link verified. | Candidate split-view inspiration only: grid/list remains scrollable while product details stay visible. This is an adaptation, not observed interaction. |
| [Geovea / RonDesignLab](https://dribbble.com/shots/25501591-Geovea-AI-Assistant-Travel-Web-Dashboard) | Creator brief names recommendations, itinerary management, updates and reducing overwhelming choices. | Contextual discovery: keep advanced tools behind an explicit action; do not show all tool controls in the feed. Do not copy creator marketing metrics as evidence. |
| [TheTrail / RonDesignLab](https://dribbble.com/shots/26674669-TheTrail-Travel-App-Hiking-Mobile-Dashboard) | Page timed out; user-provided description identifies mobile cards, difficulty and elevation previews. Not independently verified this pass. | Provisional mobile inspiration: image, title, price, merchant, state in a tight hierarchy. Must inspect actual shot before locking visual measurements. |
| [Travel Planner / Nixtio](https://dribbble.com/shots/27709125-Travel-Planner-Trip-Itinerary-Mobile-App-UI-Design) | Creator explicitly describes upcoming trips and contextual local time/weather, destination photography, spacious type and a bright interface. | Light-mode mobile should be intentionally composed rather than inverted dark mode: product photography, relaxed spacing, compact contextual metadata. |
| [Filters slideout / Jordan Hughes](https://dribbble.com/shots/22456652-Filters-slideout-menu-Untitled-UI) | Creator explicitly describes saved filters, a slideout, visible results updating while filtering. Made with Untitled UI and Untitled UI Icons. That is design-kit attribution, **not a React library identification**. | Desktop side drawer keeps results visible; mobile bottom sheet has a stable Apply action and result count. Saved presets can follow existing filters if persistence is actually implemented. |

## Motion and sound proposal — not claims about the references

- Selection continuity: selected card retains identity as its detail panel appears; keep the image, title and price stable during the transition.
- Filter movement: side drawer on wide screens, bottom sheet on phones; preserve scroll and selections after closing.
- Save/compare feedback: short icon acknowledgement and a visible updated count, with an undo action where appropriate.
- Charts: animate initial appearance once; source/time-range changes should not replay decorative drawing continuously. No interpolation over missing observations without an explicit gap.
- Mascot: deferred until the model is ready. An optional short greeting can occur once per session; never compete with filtering/search or conceal the feed.
- Sound: **none was verified on these reference pages**. Our proposed sound system is opt-in and event-driven: save tick, alert confirmation, optional surprise reveal. No ambient loop, hover tones or automatic chirping. Respect the existing audio setting, browser activation requirements and reduced-motion preferences.
- Library choice belongs to implementation planning. The reference pages do not disclose reliable production frontend stacks. Keep current Motion, Three.js, Recharts and Lucide unless a concrete gap justifies adding a dependency.

## Recommended design assembly

Use Velox's connected composition, Aurevia's comparison hierarchy, Cryon's numerical restraint, Jordan's contextual filtering, and Nixtio/Voltera's phone-specific hierarchy. Keep the existing IndiaDealHunts routes and data flows. Build one fully reviewed desktop/mobile discovery-to-detail journey first, then apply the same component system to saves, tracking, calculators, profile, search and informational pages. A single palette replacement is not the requested redesign.

## Decisions to discuss before implementation

1. Should desktop product details open alongside the feed, or on a dedicated product page? Recommend alongside, with a shareable route.
2. Should the homepage prioritize daily discoveries or a personal savings workspace? Recommend daily discoveries, with tools accessible contextually.
3. Should sound be off by default with a deliberate enable control? Recommend yes; the user may prefer a richer mascot experience later.

