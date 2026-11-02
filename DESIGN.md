# DealFlow — restore first, refine interactions

Latest owner instruction: restore the original live dashboard, then upgrade it without stripping its rich visual system. Remove the oversized heading, extra overview counters, paper desk and broad typography/layout restyling. Do not publish.

The original App.tsx visual baseline is restored from the existing repository HEAD. Preserve original card gallery, typography, spacing, colors, 3D icons, badges, animation, sharing, multi-deal, editing and approval flows. Keep the separately requested compact visitor panel with an honest unavailable state.

Current local refinements: one shared animated quick-action dock retaining all five tools, keyboard-focus reveal, touch-tablet visibility, focus indicators, reduced-motion CSS, and a real initial loading indicator instead of a premature empty-queue claim. Card exit transitions use sync to avoid the function-component ref warning from popLayout.

Verification: production build passed; actual deals rendered on localhost; keyboard focus revealed the active card dock (computed opacity 1). No approval, skip, publish, or delete actions were executed during verification. No production deployment.

Sidebar-only refinement (owner-selected region): retained 220px width and Nav3DIcon family; added shared animated active panel, inset count badge, brand mark, sound switch and actual backend Redis/MongoDB health. Verified Settings navigation and return to Review, and no sidebar overflow at 900x600. Production build passes; local only.

Owner-selected top-controls region: unified search/actions, filter row and status row; kept original Stat3DPill styling. Fixed excess input padding, added clear/Escape/reset behavior and scroll access. Presets scroll independently of pinned Heatmap/Topology/Purge tools. Verified search reset, Amazon filter selection/reset, and no toolbar overflow at 390px (search width 212.5px). Dropdowns expose expansion state and full labels; status buttons expose pressed state.

Owner reported control congestion: default now shows search/Quick Drop and statuses only. Filters & tools expands the existing store/channel/sort/layout/page-size controls, metrics and presets; Radar/Select/Audio appear when expanded. No tools removed. Verified panel open/close; mobile header 121px, expanded panel 237.75px, neither horizontally overflows at390px. Build passes.

Owner corrections: filters now use a portaled right-side drawer with keyboard focus containment and Escape close, rather than an inline shelf. Editor adds a validated JPG/PNG/WebP (10 MB) local image dropzone with paste/picker and removable staged preview. Images upload only when Save draft/Save & broadcast is chosen. Save buttons have progress, double-submit prevention and inline errors; draft failure keeps editor open. Removed duplicate Tune in image dock, retained lower Tune. Affiliate converted marker is a green dot with accessible label. Verified drawer rendering, editor rendering, image picker staging/removal, clipboard PNG staging, and mobile footer visibility/no horizontal overflow. No backend mutation or broadcast performed; native file drag and actual upload/save network completion not exercised.
