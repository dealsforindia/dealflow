# Cleanup log — Niloptal portfolio (Next.js)

This pass removed the AI-slop surface and fixed the defects that actually block the
site from doing its job. Content decisions that need Nilotpal's input are listed at the
bottom, not silently changed.

## Removed

| What | Why |
| --- | --- |
| `/igloo` route + `IglooExperience.tsx` | Verbatim clone of igloo.inc (three.js, "// Copyright c 2026 Igloo, Inc.") with Pudgy Penguins / Overpass case studies. Not Nilotpal's work, unreachable from the nav but live. Moved to `_archive/igloo-clone-*`. |
| `TelemetryHUD.tsx` | Live Kolkata clock, pulsing "available for select commissions" dot, ⌘K trigger. |
| `CommandPalette.tsx` | ⌘K palette with a confetti command; noise on a six-section site. |
| `CustomCursor.tsx` | Drew a dot + ring, but `cursor: none` was never set — users saw two cursors. |
| `ScopeEstimator.tsx` | "Real-time scope projection" with hardcoded `days = 5/7/12/30` and fake add-on math. |
| Theme switcher (4 skins) | Deep Space / Cyberpunk / Tokyo Sunset / Frost. One palette now. |
| SFX engine (`lib/audio.ts`) | WebAudio blips on every click/hover, toggled from the HUD. |
| Lenis smooth scroll | `SmoothScroll.tsx` removed; native scrolling restored. |
| `NilotpalPortfolioFull.tsx.bak` | 192 KB / 2000-line dead component. Moved to `_archive/`. |
| `CreativeProcess.tsx` | Unused "Five-Stage Production Pipeline" component. |
| Dead CSS | `body.theme-*` blocks, marquee keyframes, `no-scrollbar`. |
| Orphan assets | `aarav_portrait.jpg` (from a different portfolio), `client_avatars.jpg`, `iridescent_*`, 3 unused work images. |
| Dependencies | `three`, `@types/three`, `lenis`, `canvas-confetti`, `@types/canvas-confetti`, `clsx`, `tailwind-merge`. `lucide-react` is now the only runtime dep beyond React/Next. |

## Fixed

- **Contact form was fake.** `handleSubmit` ran `setTimeout(1200)` → confetti → "Project
  Brief Dispatched!". Nothing was ever sent. It now composes a real `mailto:` with the
  brief prefilled, shows a manual fallback link if the client does not open, and the
  submit button says what it does: "Open in email app".
- **Title contradicted itself.** Navbar said "Senior Graphic Designer & Video Editor",
  the hero and metadata said "Senior Art Director". Now "Art Director & Video Editor"
  everywhere.
- **Dead typecheck.** `_archive/` was being compiled and `.next` types were stale. Both
  excluded/cleared; `npm run typecheck` added.
- **Recycled metric.** "+37% web traffic growth" appeared in the hero pill, the about
  section, *and* a testimonial. Now it appears once, in the experience timeline, where it
  originates.
- **Fake audio visualiser** in the production lab drew `Math.random()` bars. Removed.
- **Showreel section was a filmstrip of stills** labelled with invented specs ("KODAK
  2383", "ACEScg"). Rebuilt as a real player over the six MP4s that already shipped,
  with a clip list.
- **Hero** lost the studio/lifestyle photo toggle and the tilt-on-hover card. Copy
  rewritten from plain facts instead of "brand identity architectures" and "precise
  colour science, narrative pacing, and typography".
- **Project data extracted** from `BentoWorkGrid.tsx` into `src/lib/projects.ts`, and the
  Frame.io-style annotation pin deck (state + tab + 230 lines of render) removed. The
  component went from 2007 → ~1330 lines.

## Verified

- `tsc --noEmit` clean.
- `next build` clean; single `/` route at 134 kB first load JS.
- All 36 asset/route URLs referenced by the built HTML return 200; `/igloo` returns 404.

## Still your call (not changed)

1. **Three testimonials** from "Karan Mehta", "Neha Sharma", "Rohit Sen" with
   AI-generated avatars. The names do not match the employers in the timeline. Replace
   with real quotes or delete `Testimonials.tsx` — I left them rather than delete social
   proof that might be genuine.
2. **Project list vs. real work.** The selected-work grid has 16 entries, several of
   which look like they belong to other people: "IndiaDealHunts 3D Chakra Sacred Geometry
   Identity" and "DealFlow Real-Time Market Liquidity & Order Radar". Four "UI/UX
   platform" projects (Finova, enterprise telemetry, Lumina) also overstate a graphic
   designer's scope. Every project should map to a file in the Drive archive or come out.
3. **Eighteen nesting boxes.** The work grid still has a search box, grid/index toggle,
   autoplay toggle, filter chips, a showreel theatre, and per-project interactive
   sandboxes (Finova phone simulator, Maya rig sliders, CMYK plate toggles, ping test).
   This is the remaining bulk of the slop. The content file is now extracted, so trimming
   it is a contained job.
4. **`strict: false`** in `tsconfig.json`. Worth flipping once the grid is split up.
