# Hyperframes Composition Brief: IndiaDealHunts

## Objective
Create a short, polished, high-energy launch brag video for IndiaDealHunts (https://www.indiadealhunts.me/).

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 18.0 seconds (540 frames at 30fps)

## Source Material
- Project root: `rudranil-deals-web/`
- Primary files read: `index.html`, `src/App.tsx`, `src/index.css`, `src/emerald.css`
- Product name: IndiaDealHunts
- Tagline / strongest claim: "#1 Verified Loot Deals & Price Drop Hunter in India — 0 Spam. 100% Real Hand-Tested Deals."
- Key UI or visual moment to recreate:
  - The obsidian glassmorphic Loot Deal card with store brand badges (Amazon, Flipkart, DesiDime)
  - The [74% OFF] discount flame pill and [STEAL DEAL 98/100] Worth Score badge
  - The live `[ • ⚡ Affiliated LIVE ]` electric tag
  - The high-tech radar sweep intro
- Copy that must appear verbatim:
  - "STOP PAYING RETAIL IN INDIA"
  - "100% Hand-Tested. Zero Spam."
  - "indiadealhunts.me"

## Creative Direction
- Tone preset: polished
- Creative direction: Cyberpunk Indian Loot Deal Hunter — High energy, dark obsidian glass, neon emerald accents, real savings proof.
- Interpretation: Sleek and high-tech with confident pacing. Crisp typography, smooth card animations, and rhythmic reveals that match the 120 BPM beat grid.
- Angle: IndiaDealHunts solves the massive spam and fake discounts problem across Indian e-commerce by scanning, verifying, and scoring real loot drops in real-time.
- Hook: "STOP PAYING RETAIL IN INDIA. 99% of deal groups are flooded with fake discounts."
- Outro / punchline: "Never miss a loot hunt again." → `indiadealhunts.me`.
- Avoid:
  - Generic SaaS language ("supercharge your workflow")
  - Abstract filler graphics
  - Blurry low-contrast text

## Visual Identity
- Background: #070A11 with ambient radial gradient `#0C0F1D`
- Text: #F8FAFC (primary crisp white), #94A3B8 (secondary slate)
- Accent: #10B981 (electric emerald) and #06B6D4 (cyber cyan)
- Hot / Highlight: #F59E0B (amber discount), #EF4444 (loot flame)
- Display font: Plus Jakarta Sans / Inter
- Body font: Plus Jakarta Sans / JetBrains Mono (for numbers/prices)
- Visual references from the project: IndiaDealHunts deal cards, Worth Score ring, live radar badge, 3D brand badges.

## Storyboard
Scene summary:
1. Hook — 3.5s (0.0s – 3.5s) — "STOP PAYING RETAIL IN INDIA" + radar sweep line.
2. Hero Loot Reveal — 5.0s (3.5s – 8.5s) — IndiaDealHunts brand mark + Zebronics ₹499 (74% OFF) deal card with Worth Score 98 and electric live tag.
3. Multi-Store Sweep — 5.5s (8.5s – 14.0s) — Sequential arrival of Amazon (Save ₹5,101), Flipkart (65% OFF), and DesiDime (Loot Error) cards + verification badges.
4. Outro / Call-to-Action — 4.0s (14.0s – 18.0s) — Glowing brand logo, "HUNT THE LOOT BEFORE IT EXPIRES", and prominent luminous `indiadealhunts.me` domain card.

## Audio (Custom Researched & Engineered)
- Audio role: Aggressive Cyberpunk Drift Phonk (136 BPM) with deep saturated 808 sub-bass slides, Memphis cowbell riffs, snappy trap snares, and authentic loot SFX matching the high-speed Indian loot hunt aesthetic.
- Audio arc: Ambient suspense rise & riser in Scene 1, massive 808 sub drop in Scene 2, driving multi-store sweeps in Scene 3, triumphant coin register resolve in Scene 4.
- Music: Custom algorithmic synthesis `cyberpunk_phonk.mp3` (136 BPM, 18.4s) precisely keyframed to match each scene transition.
- Music treatment: Intro hi-hats & cowbell hook $\to$ 200ms drop silence $\to$ 808 sub slam on Scene 2 $\to$ driving rhythm $\to$ smooth sub-bass tail on Scene 4.
- SFX:
  - 0.6s: `laser.wav` (1.20s duration, 75% volume) — Sci-fi radar sweep.
  - 3.5s: `thud.wav` (0.80s duration, 95% volume) — Heavy sub-bass impact on Zebronics deal drop.
  - 3.6s: `bling.wav` (0.90s duration, 85% volume) — Cash register coin loot chime on 74% OFF.
  - 8.8s, 10.0s, 11.2s: `whoosh.mp3` (0.18s duration, 75% volume) — Aerodynamic card swipes on Amazon, Flipkart, and Blinkit card entries.
  - 14.3s: `bling.wav` (0.90s duration, 90% volume) — Grand finale coin chime on `indiadealhunts.me`.
- Audio-reactive treatment: Subtle emerald radial glow and card shadows breathing to the beat.
- Audio-coupled moments:
  - 0.5s: Radar sweep ping
  - 3.5s: Bass drop & impact on Hero Card arrival
  - 4.2s: Chime on Worth Score / 74% OFF tag
  - 8.5s, 10.0s, 11.5s: Snappy UI clicks as store cards slide in
- SFX files: Selected from `skills/brag/assets/sfx/` (`impact`, `interface`, `ui`).

## Hyperframes Instructions
- Build the composition in `brag-output/composition/`.
- Show real UI, copy, and savings proof from IndiaDealHunts.
- Keep all text readable with high WCAG contrast.
- Ensure total duration is exactly 18.0 seconds.
- Copy music and SFX assets into `brag-output/composition/assets/`.
- Verify with `hyperframes check` and render with `hyperframes render`.

