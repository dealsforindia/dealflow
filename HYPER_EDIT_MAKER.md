# HYPER EDIT MAKER

A fully customisable "hyper edit" maker for NIS Graphics: one config file in, a rendered MP4 (and a live web version) out. Everything below is written so a human **or** an agent (Claude Code, Codex, Cursor) can follow it without guessing.

Written 7 Nov 2026. Sources are listed in section 15. Anything I could not verify this session is marked `unverified`.

---

## 0. The one-paragraph version

Write the video as **HTML + CSS + GSAP**. A paused GSAP timeline is the whole edit. **HyperFrames** (HeyGen, Apache-2.0) plays that timeline in headless Chrome, captures every frame, and encodes MP4 with FFmpeg. Because it is just HTML, the same scenes can also run live on the website. A single `maker.config.json` holds every knob (colours, fonts, motion feel, character, audio, scenes) so a new video is a config change, not a rewrite.

```
maker.config.json  ->  build-composition  ->  index.html (+ GSAP timeline)
                                                |
                          npm run check  <------+
                          npx hyperframes snapshot --at 1,3,5   (look at frames)
                          npm run render  ->  out.mp4 + poster.jpg
```

---

## 1. What already exists on your machine (use these first)

Paths are under `E:\Rudranildocs0066543\html-yt\`.

| Path | What it is | Use it for |
|---|---|---|
| `brag-output\composition\` | A working HyperFrames project. `index.html` is an 18 s, 1920x1080 launch video (IndiaDealHunts) with GSAP timeline, 4 scenes, music + SFX tracks. `package.json` pins `hyperframes@0.9.3`. | **The reference template.** Copy its structure. |
| `brag-output\brag-plan.md`, `composition-brief.md` | A finished plan + brief: hook, storyboard, audio cues, SFX timestamps. | Model for the brief section of every new video. |
| `brag-source\brag-main\` | The `/brag` skill repo (`latent-spaces/brag`). `skills\brag\references\` has `tones.md`, `audio.md`, `step-1..4`. Bundled music + CC0 SFX in `skills\brag\assets\`. | Tone presets, audio rules, SFX library, beat-sync method. |
| `dealflow-remotion\` | Remotion 4 project (`remotion ^4.0.240`, `three ^0.186.1`). Compositions: `DealShort`, `PhonkEggEdit`, `SevereTitanDrop`, `SatisfyingEgg`. | React/three.js scenes you may want to keep. Port with `/remotion-to-hyperframes`. |
| `nis-graphics-frame\rooftop.html` | The animated rooftop site: sky engine, cat, character, thought bubbles, customise panel, pixel mode. | The **live web layer** and the character bible (section 9). |
| `nis-graphics-frame\index.html`, `proof.html` | The "Press Proof" calendar site and a proof sheet. | Brand tokens, slug device. |
| `NIS_GRAPHICS_VISION.md` | Positioning, voice, palette, "the calendar is the brief". | Brand rules (section 6). |
| `.claude\skills\impeccable\` | Design skill with `animate.md`, `colorize.md`, `polish.md`, `critique.md`, etc. | Motion and colour review rules (sections 7, 8). |
| `AGENTS.md` | Mentions an `ai-video-editor` skill (local Whisper + ffmpeg + headless Chromium, 7 motion-graphic styles, English/Hindi) installed from `C:\Users\Neel\Downloads\ai-video-editor.zip`. | I did **not** find it under `.claude\skills\` in this folder, so it may not be installed. Check before relying on it. |

Local facts I read directly from files: GSAP is loaded from CDN pinned at `3.15.0`; HyperFrames is pinned at `0.9.3`; the composition root is `<div id="root" data-composition-id="main" ...>`; the timeline is registered as `window.__timelines["main"]`.

---

## 2. Stack decision

### 2.1 Video render engines (pick one per project)

| Engine | Authoring | Licence | Pick it when |
|---|---|---|---|
| **HyperFrames** (`heygen-com/hyperframes`) | HTML + CSS + GSAP | Apache-2.0 | **Default.** Fastest from an idea to a video, agent-friendly, same HTML runs on the website. 20 agent skills ship with it. |
| **Remotion** | React components | Source-available. Free for individuals and small for-profit teams (sources say under four people); paid per seat above that. Check current terms before a company uses it. | You already have React scenes, three.js, or need Lambda scale. `dealflow-remotion` already uses it. |
| **Motion Canvas** | TypeScript generators on a `<canvas>` | MIT | Technical explainers, vector diagrams, voice-synced steps. |
| **Revideo** | TypeScript, Motion Canvas fork with headless rendering | MIT | Embedding video generation inside your own app. |

Recommendation: **HyperFrames for everything new**, keep Remotion only for the existing `dealflow-remotion` scenes, and port them over when you touch them.

### 2.2 Animation libraries (browser side)

| Library | Role | Cost / licence | Use it for |
|---|---|---|---|
| **GSAP** (3.15.0 already pinned in your composition) | Timeline engine | Free (reported as free including plugins; confirm on gsap.com) | Everything seekable. The video timeline. ScrollTrigger on the site. |
| **Lenis** | Smooth scroll | MIT (unverified) | Fluid scrolling on the site, paired with ScrollTrigger. |
| **Motion** (ex Framer Motion) | UI springs, gestures, layout | Free | React/Vue UI. Not for the video timeline. |
| **Anime.js v4** | Light tweens, SVG, springs | MIT | Small SVG/CSS motion without GSAP. |
| **Lottie / dotLottie** | Play authored After Effects exports | MIT (unverified) | Designer-made icon or loader animations. |
| **Rive** | Interactive state-machine animation | Runtime is open source (unverified) | Characters that react to input. A future home for the Nilotpal character. |
| **Theatre.js** | Visual timeline editor for JS | Apache-2.0 (unverified) | Hand-tuning easing visually. Last commit was ~25 months ago per one 2026 survey, so treat as maintenance-mode. |
| **three.js** (`0.186.1` in dealflow-remotion) | 3D / WebGL | MIT | 3D scenes. Keep them deterministic (no random, fixed seeds). |
| **Splitting / manual split** | Per-letter and per-word text | MIT | Kinetic type. A 10-line manual split is in section 11. |
| **View Transitions API** | Native page/state transitions | Browser feature | Shared-element continuity on the site. |

Rule of thumb from the 2026 comparisons: GSAP for choreography and scrubbing, Motion for React UI state, Anime.js for tiny framework-free motion, Lottie when a designer hands you a file, Rive when the animation must react.

---

## 3. HyperFrames contract (non-negotiable)

Taken from `brag-output\composition\AGENTS.md` plus the working composition.

1. Root: `<div id="root" data-composition-id="main" data-start="0" data-duration="18" data-width="1920" data-height="1080">`.
2. Every timed element has `data-start` and `data-duration`, and `class="clip"` (the shared CSS gives scenes their full-frame box; lint warns without it). `data-track-index` is only a Studio lane label.
3. One **paused** root timeline per composition: `window.__timelines["main"] = gsap.timeline({ paused: true })`. Child scene timelines added to the root must **not** be paused.
4. Audio: `<audio data-start data-duration data-track-index data-volume src="assets/...">`. Overlapping audio never shares a `data-track-index`.
5. Video with its own sound: keep audio on the `<video>` with `data-has-audio="true"` and no `muted`. Silent b-roll: `muted`.
6. **Deterministic only.** No `Date.now()`, no `Math.random()`, no network fetches at render time. Use the seeded RNG in section 11.
7. Asset paths are **relative to the composition folder**. Absolute paths silently fail in the renderer.
8. Sub-compositions: `data-composition-src="compositions/file.html"`.
9. After every edit: `npm run check` (lint + runtime + layout + motion + contrast). Then `npx hyperframes snapshot --at <seconds>` and **look** at the frames. A passing check does not show how it looks.
10. Infinite loops are not seek-safe. Use `repeat: Math.ceil(duration / period)` instead of `repeat: -1`.

Commands (from the composition folder):

```bash
npm run dev                              # human preview
npx hyperframes preview --background     # agent-safe preview
npx hyperframes preview --status
npx hyperframes preview --stop
npm run check
npx hyperframes snapshot --at 1,3,5      # PNGs to inspect
npm run render
npx hyperframes docs gsap                # topics: data-attributes, gsap, compositions, rendering, examples, troubleshooting
npx hyperframes@latest upgrade --project . --check
```

Requirements (from the `/brag` README): Node.js 22+, FFmpeg on `PATH`, `npx hyperframes doctor` to verify.

Install the agent skills once: `npx skills add heygen-com/hyperframes`. Key skills: `/hyperframes` (read first), `/hyperframes-cli`, `/hyperframes-registry` (ready-made blocks), `/media-use` (music, SFX, images, VO, colour grades), `/figma`, `/slideshow`, `/remotion-to-hyperframes`.

---

## 4. The config file: `maker.config.json`

This is the whole "fully customisable" idea. Every field has a default; the maker UI (section 12) only edits this file.

```json
{
  "meta": {
    "name": "Durga Puja 2026 - Image Clinic",
    "preset": "press-proof",
    "format": "vertical",
    "fps": 30,
    "durationSec": 20,
    "seed": 1107,
    "language": "en"
  },

  "brand": {
    "ground":  "#F4EFE4",
    "ink":     "#14110D",
    "inkMute": "#6B6355",
    "accent":  "#F26522",
    "accent2": "#2AA5A0",
    "gold":    "#C08A2E",
    "rule":    "#D8CFBC",
    "grain":   0.055,
    "logo":    "assets/nis-logo.png"
  },

  "type": {
    "display": { "family": "Bodoni Moda", "weight": 400, "tracking": "-0.02em" },
    "text":    { "family": "Archivo",     "weight": 500 },
    "mono":    { "family": "IBM Plex Mono", "weight": 500, "tracking": "0.18em", "case": "upper" },
    "minBodyPx": 34
  },

  "motion": {
    "energy": "balanced",
    "ease":   { "enter": "expo.out", "exit": "power2.in", "settle": "back.out(1.3)", "linear": "none" },
    "durations": { "micro": 0.15, "ui": 0.3, "scene": 0.5, "focal": 0.8 },
    "stagger": 0.07,
    "transition": "press-wipe",
    "cameraPush": 0.04,
    "audioReactive": "subtle"
  },

  "character": {
    "enabled": true,
    "id": "nilotpal",
    "outfit": "navy",
    "mood": "focused",
    "thoughtBubble": true
  },

  "audio": {
    "music": { "file": "assets/music/vol-12.mp3", "volume": 0.3, "fadeOut": 1.2 },
    "sfx":   { "density": "sparse", "volume": 0.7 },
    "voice": { "enabled": false, "engine": "kokoro", "voiceId": "af_heart", "musicDuck": 0.13 },
    "beatSync": { "source": "hyperframes-beats", "strongLocks": 2, "toleranceStrong": 0.15, "toleranceBeat": 0.10 }
  },

  "scenes": [
    { "id": "hook",   "type": "kinetic-title", "start": 0,   "duration": 3,
      "text": ["Every date", "has a design."], "sfx": "impactSoft_medium_001" },
    { "id": "reveal", "type": "poster-reveal", "start": 3,   "duration": 5,
      "media": "assets/durga1.jpg", "slug": "IMAGE CLINIC · 09.10.26 · 1080x1350" },
    { "id": "grid",   "type": "grid-sweep",    "start": 8,   "duration": 6,
      "media": ["assets/gill183.jpg","assets/gill196.jpg","assets/gill201.jpg"], "beatSnap": true },
    { "id": "stat",   "type": "stat-counter",  "start": 14,  "duration": 3,
      "value": 50, "label": "dates, one studio" },
    { "id": "cta",    "type": "cta-lockup",    "start": 17,  "duration": 3,
      "text": "Send the brief. We'll hit the date.", "contact": "+91 70039 96685" }
  ],

  "export": { "poster": "bestFrame", "bakePosterAsFrame0": true, "crf": 16, "codec": "h264" }
}
```

Format sizes: `landscape` 1920x1080, `vertical` 1080x1920, `square` 1080x1080. Set `data-width`/`data-height` on the root and the viewport meta to match.

### 4.1 Customisation axes (what a user can change)

| Axis | Values |
|---|---|
| Preset | `press-proof`, `cyber-loot`, `kinetic-mono`, `warm-grain`, `pixel-8bit`, `monsoon`, custom |
| Tone | `default`, `polished`, `yc-parody`, `chaotic`, `deadpan`, `cinematic`, `app-store` (from `/brag`) |
| Energy | `calm` (0.8 to 1.2 s focal), `balanced`, `punchy`, `chaotic` (scenes under 2 s) |
| Transition | `cut`, `flash-cut`, `zoom-cut`, `crossfade`, `press-wipe`, `slide`, `registration-wipe`, `pixel-wave` |
| Format | landscape, vertical, square |
| Accent | any of the logo colours or custom OKLCH |
| Character outfit | `navy`, `kurta`, `orange`, `teal` |
| Weather / sky | `clear`, `clouds`, `rain`; time of day 0 to 24 |
| Audio | music track, SFX density, voice on/off, beat sync on/off |

---

## 5. Scene library (the building blocks)

Each type is one HTML block + one GSAP function. Add new ones by following the same shape.

| Type | What it does | Notes |
|---|---|---|
| `kinetic-title` | Per-word or per-letter entrance | Hold the settled state long enough to read (section 7.3). |
| `poster-reveal` | A poster develops from grayscale to colour with a slug stamp | Mirrors the lightbox effect on the site. |
| `grid-sweep` | 3 to 6 cards arrive on the beat grid | Snap every other beat if cards contain text. |
| `stat-counter` | Number rolls up, label settles | Use a `{val}` object tween, formatted in `onUpdate`. |
| `calendar-flip` | A month strip steps to "today" and pins work under it | NIS brand: the calendar is the brief. |
| `n-mark-assemble` | The 8 N!S diamond blocks fly in and lock | Reuses the intro SVG from `rooftop.html`. |
| `quote` | One sentence, long hold | For `deadpan`. |
| `before-after` | Wipe between two images | Registration-mark wipe. |
| `device-demo` | Cursor moves, clicks, UI responds | Pair with `interface/click_*` SFX. |
| `rooftop-cutaway` | A frame of the animated rooftop scene with the thought bubble | Character consistency rules apply (section 9). |
| `cta-lockup` | Brand + line + contact bar | Contact bar is the site chrome from his posters. |

---

## 6. Brand presets (colours, type, rules)

### 6.1 Press Proof (NIS Graphics, default)

From `NIS_GRAPHICS_VISION.md`:

```
paper      #F4EFE4   cream stock
ink        #14110D   near-black
gold       #C08A2E   from the fare posters
vermilion  #B03A2E   accent, under 2% of surface
rule       #D8CFBC   hairlines
```

Type: Bodoni Moda (display), Archivo (text), IBM Plex Mono (dates, job numbers, formats).
Signature device: **the slug**, a small mono line in the corner of every image, like a proof sheet.

```
GILL TRAVELS · 12.03.25 · 1080x1080
```

Voice: short sentences, dates, quantities, formats. No adjectives about ourselves.
Brand line: *Every date has a design.* CTA: *Send the brief. We'll hit the date.* Retainer: *We run the calendar.*

### 6.2 N!S logo palette (from the SVG mark)

```
orange   #F26522    red      #E8232A    magenta #EC0A8B    purple #7B1E6E
teal     #2AA5A0    green    #45B97C    cyan    #7FD4DB    aqua   #8FD8DC
```

Use the orange as the accent. The six-colour strip (orange, red, magenta, purple, teal, green) is the panel underline on the rooftop site.

### 6.3 Rooftop sky states (from `rooftop.html`)

| State | skyA | skyB | Stars | Windows lit |
|---|---|---|---|---|
| night | `#0B0E1F` | `#1A1433` | 1 | 1 |
| dawn | `#2A2140` | `#C97A52` | .35 | .55 |
| morn | `#BFD3DD` | `#EFE7CE` | 0 | 0 |
| day | `#CFE0E6` | `#F2ECDA` | 0 | 0 |
| dusk | `#7A4E63` | `#E5895A` | .25 | .5 |

Time mapping used on the site: `<5` night, `<6.6` dawn, `<10` morn, `<16` day, `<18` dusk, else night.

### 6.4 Cyber Loot (IndiaDealHunts video)

```
ground #070A11   ink #F8FAFC   mute #94A3B8
emerald #10B981 (bright #34D399)   cyan #06B6D4   amber #F59E0B   rose #F43F5E
```
Fonts: Plus Jakarta Sans + JetBrains Mono. Glass cards: `rgba(14,18,30,.94)` with a 1px white 12% border.

### 6.5 Pixel 8-bit

`#12121C` ground, `#F4F0E4` ink, `#FFD23F` gold, `#FF3B3B` red, `#F26522` orange, `#7FD4DB` cyan. Pixelify Sans + Silkscreen. Hard 3px borders, offset shadows, scanlines.

### 6.6 Colour rules

- Build **roles, not swatches**: ground, surface, text, text-mute, action, focus, rule, and status colours.
- For new palettes use **OKLCH** and vary lightness while reducing chroma near white and black.
- Contrast minimums (WCAG AA): body text 4.5:1, large text 3:1, controls and icons 3:1. `npm run check` includes a contrast pass.
- Never rely on colour alone to carry meaning. Pair with text, shape or position.
- Dark mode is composed on its own, not an inversion of light.
- One strong colour owns a deliberate region. Do not sprinkle tiny accents.
- Vermilion stays under 2% of the surface in Press Proof.

---

## 7. Motion language (fluidity rules)

### 7.1 Easing tokens

| Token | GSAP | CSS | Use |
|---|---|---|---|
| `enter` | `expo.out` | `cubic-bezier(.16,1,.3,1)` | Confident arrivals |
| `exit` | `power2.in` | `cubic-bezier(.4,0,1,1)` | Leaving. **Exit faster than enter.** |
| `settle` | `back.out(1.3)` | n/a | Cards, stamps. Never by reflex. |
| `drift` | `sine.inOut` | `ease-in-out` | Ambient loops (garments, kite) |
| `linear` | `none` | `linear` | Radar sweeps, scrubs, tickers |

### 7.2 Duration scale

| Duration | Use |
|---|---|
| 0.10 to 0.15 s | Immediate feedback |
| 0.15 to 0.30 s | Routine state change |
| 0.30 to 0.50 s | Layout, overlay, view change |
| 0.50 to 0.80 s | One authored focal entrance |

Stagger 0.05 to 0.09 s between siblings, **capped** so the whole list lands within about 0.6 s.

### 7.3 Readability (from `/brag`)

- Fast in, then **hold**. Never fast in, then gone.
- Short label: about 0.8 s settled. A sentence: about 0.3 s per word.
- Text on beat grids: if beats are under about 0.6 s apart, reveal on **every other** beat.
- Hook decides everything: first 2 to 3 seconds.
- Shape: `Hook (2-3s) -> Reveal (2-4s) -> 2-3 highlights (5-12s) -> Punchline (2-4s)`. Total 15 to 25 s unless there is a reason.

### 7.4 Fluidity checklist

- Animate `transform` and `opacity`. Avoid animating `width`, `height`, `top`, `left`, margins.
- Overlap motion: start the next element at about 60 to 70% of the previous one's duration, not after it ends.
- Give everything a path: arc, not straight line, for anything that "travels".
- Use one **motion thesis** per video: a single focal sequence that belongs to this product. A generic fade-and-rise is not a thesis.
- Blur, filter, shadow and canvas work stay in small isolated regions.
- Apply `will-change` only during the animation.
- Keep content visible in the default state (no script, no hidden page).

### 7.5 Reduced motion (website)

Every web animation needs a `prefers-reduced-motion` path: fewer and gentler, not none. Keep feedback that confirms an action. The rooftop site already has a **Motion: Full / Calm / Still** switch.

### 7.6 Signature NIS motions

| Name | What happens |
|---|---|
| **Press wipe** | A paper-coloured plane sweeps with a vermilion edge and a few spray dots, like the pixel wave wipe on the site. |
| **Slug stamp** | The mono slug types in at the image corner as the image develops from grayscale. |
| **Registration marks** | Four crosshair corners draw in, then the content lands inside them. |
| **Diamond assemble** | The eight N!S blocks fly in with stagger 0.062 s and settle, then the wordmark rises. |
| **Calendar pin** | A month cell lights, a sheet pins to the board, the character walks to it. |

---

## 8. Design rules (what makes it look best)

1. **The work is the hero.** No stock photo hero. No abstract filler. At least one real piece of work on screen.
2. **Specific over generic.** Use real copy and real numbers. Banned: "streamline", "elevate", "supercharge", "unlock", "pixel-perfect artistry", "soulful visual journey".
3. **One idea per scene.**
4. **Aspect truth.** Show posters at their true ratio. No forced crops.
5. **Type scale.** House rule for 1080p video: body at least 34 px, labels at least 24 px, display as large as the layout allows. Mono labels are tracking `+0.14em` and upper case.
6. **Spacing is a grid.** Pick an 8 px base and stay on it.
7. **Texture is restrained.** Paper grain around 5% opacity, multiply blend. Remove it in pixel mode.
8. **Depth by light, not borders.** Rim light and soft shadow, not outlines on everything.
9. **No AI-startup gradient blobs.** No glowing abstract "intelligence" graphics.
10. **Forbidden on the NIS site:** percentage bars, mastery matrices, star ratings, invented clients, "Art Director", a 3D showreel without real renders. (From the vision doc.)

---

## 9. Character bible: Nilotpal (consistency rules)

The illustrated character must match the real portrait, in every scene, in video and on the site. Reference photo: `nis-graphics-frame\assets\nilotpal_portrait.jpg`.

### 9.1 Locked features

| Feature | Value |
|---|---|
| Hair | Short, dark, swept up at the front, slight tuft that sways |
| Face | Light stubble along the jaw, soft smile |
| Skin | `#C48B63` (token `--skin`) |
| Shirt (default) | Deep navy-indigo `#2A2250` (token `--shirt`) |
| Accessory 1 | Black watch with silver edge on the **left** wrist |
| Accessory 2 | Purple earphone cord `#9A63C8`, bud `#B07AE0`, hanging down the chest |
| Pants / shoes | Near-black `#14110D`, light sole line |
| Outlines | `.pl` stroke 2 px, `.pl-thin` 1.4 px, colour `#14110D` (light `#F6F1E6` at 48% at night) |

### 9.2 Allowed variations (via config)

`outfit`: `navy` (default), `kurta` `#EFE3C8` (festive), `orange` `#F26522`, `teal` `#2AA5A0`. **Never change** hair, stubble, watch or earphones between scenes.

### 9.3 Idle animation set

| Motion | Period | Seek-safe form |
|---|---|---|
| Blink | 4.8 s, closes at ~96% | `repeat: Math.ceil(total / 4.8)` |
| Breathe | 3.6 s, 1.5 px rise | same |
| Hair tuft sway | 4.2 s, `-3deg` to `5deg` | same, `yoyo: true` |
| Cord sway | 3.8 s, `-2.5deg` to `3deg` | same |
| Walk bob | 0.5 s while moving | only while `x` changes |

### 9.4 Thought bubble

A cream bubble (`#F6F1E6`, 1.1 px ink stroke) above the head, two trailing circles, mono text 8.4 px at stage scale. Text comes from pools by **section, time of day, weather, mode, outfit** (see `POOL` in `rooftop.html`). Rotate every 6.5 to 9 s. In video, set lines per scene explicitly in `maker.config.json` so they are deterministic.

### 9.5 The cat

Orange tabby with a red collar and gold tag, walks a 46 s cycle, tail flick every 3.1 s. Same colours every time.

### 9.6 Consistency test (run before render)

- [ ] Same navy shirt unless `outfit` says otherwise.
- [ ] Watch is on the same wrist in every frame.
- [ ] Earphone cord visible.
- [ ] Stubble present (even at night).
- [ ] Outline weight unchanged across scales.
- [ ] Skin tone identical in day, dusk and night (only rim light changes).

---

## 10. Audio rules

From `/brag` `audio.md`.

- Music bed volume **0.3 to 0.4**. Restrained tones **0.12 to 0.22**. Never above 0.5.
- SFX **0.55 to 0.85**. Softer for polished and deadpan.
- Voiceover on: music ducks to **0.12 to 0.15**, scene lengths follow the voice, not the other way round.
- Overlapping audio gets its own `data-track-index`. Example: music on 10, SFX from 11 up.
- Align SFX to the **start** of the animation, 0.0 to 0.1 s before the first visible frame.
- One tasteful music bed plus a few well-timed SFX beats silence. Fewer cues, better timing.
- Beat sync: lock 1 to 3 **strong** cues within +/-0.15 s, snap sequential events to consecutive beats within +/-0.10 s. Mark with `// beat-locked: 5.80s` and `// beat-grid: ...`. Readability beats the grid.
- Cue sources: bundled presets in `assets/music/cues/`, `analyze_music_cues.py` (Python via `uv`), or `npx hyperframes beats <composition>` (needs Hyperframes 0.6.99 or newer).
- Audio-reactive: pre-extract per-frame RMS and band energy, sample it inside the timeline. Subtle only (glow, depth, card presence). **No** waveform bars, equalizer, music-note graphics, strobing or heavy pulsing.
- Voice: `npx hyperframes tts "<text>" --voice af_heart --output assets/voiceover.wav` (Kokoro). `--list` shows voices.
- Licences: bundled SFX are CC0 (Kenney.nl). Bundled music is "Happy Beats / Business Moves" by ende.app, check their terms for your use.
- Do not use random "trending" music without a licence.

SFX picks by moment:

| Moment | Families |
|---|---|
| Cards appear | `casino/card-slide-*`, `card-place-*`, `interface/drop_*` |
| Big reveal | `impact/impactBell_heavy_000/003/004`, `impactSoft_medium_*` |
| Typing | `keyboard/keypress-001..032.wav`, randomised via the **seeded** rng |
| Click / toggle | `interface/click_*`, `ui/mouseclick1`, `switch*` |
| Success | `impactBell_heavy_*`, `casino/chips-collide-*` |
| Chaos | `interface/glitch_002/004`, `impactPunch_heavy_*`, `dice-throw-*` |

Read `skills/brag/assets/sfx/sfx-analysis.md` first; it flags high-frequency risk.

---

## 11. Recipe book (deterministic GSAP)

All snippets assume `const tl = gsap.timeline({ paused: true });` registered as in section 3.

### 11.1 Seeded random (replaces `Math.random`)

```js
function rng(seed) {            // mulberry32
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(CONFIG.meta.seed);
```

### 11.2 Split text into letters or words (no plugin)

```js
function split(el, mode = "chars") {
  const text = el.textContent; el.textContent = "";
  const parts = mode === "words" ? text.split(" ") : [...text];
  return parts.map((p, i) => {
    const s = document.createElement("span");
    s.style.display = "inline-block";
    s.textContent = p === " " ? "\u00A0" : p + (mode === "words" && i < parts.length - 1 ? "\u00A0" : "");
    el.appendChild(s); return s;
  });
}
```

### 11.3 Kinetic title

```js
const chars = split(document.querySelector("#hook-title"), "chars");
tl.fromTo(chars, { yPercent: 110, opacity: 0, rotate: 4 },
  { yPercent: 0, opacity: 1, rotate: 0, duration: 0.7, ease: "expo.out",
    stagger: { each: 0.03, from: "start" } }, 0.2);
// hold, then exit faster than enter
tl.to(chars, { yPercent: -60, opacity: 0, duration: 0.35, ease: "power2.in", stagger: 0.015 }, 2.5);
```

### 11.4 Mask reveal (poster develops)

```js
tl.fromTo("#poster", { clipPath: "inset(0 100% 0 0)", filter: "grayscale(1) contrast(1.05)" },
  { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "expo.out" }, 3.0);
tl.to("#poster", { filter: "grayscale(0) contrast(1)", duration: 1.2, ease: "power1.out" }, 3.5);
```

### 11.5 Slug stamp (typed)

```js
const slug = { n: 0 }, txt = "IMAGE CLINIC · 09.10.26 · 1080x1350";
tl.to(slug, { n: txt.length, duration: 0.9, ease: "none",
  onUpdate: () => { document.querySelector("#slug").textContent = txt.slice(0, Math.round(slug.n)); } }, 3.6);
```

### 11.6 Counter

```js
const c = { v: 0 };
tl.to(c, { v: 50, duration: 1.2, ease: "power3.out",
  onUpdate: () => { document.querySelector("#stat").textContent = Math.round(c.v); } }, 14.2);
```

### 11.7 Registration marks draw-in

```js
tl.fromTo(".reg-corner", { scale: 0.4, opacity: 0 },
  { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.6)", stagger: 0.06 }, 0.1);
```

### 11.8 Press wipe transition

```js
tl.fromTo("#wipe", { xPercent: -105 }, { xPercent: 0,   duration: 0.5, ease: "expo.inOut" }, T - 0.25);
tl.fromTo("#wipe", { xPercent: 0 },    { xPercent: 105, duration: 0.5, ease: "expo.inOut" }, T + 0.25);
```
The wipe element: full-frame paper colour, with a 6 px vermilion left edge.

### 11.9 Camera push (subtle, whole scene)

```js
tl.fromTo("#scene2 .stage", { scale: 1 }, { scale: 1 + CONFIG.motion.cameraPush, duration: 5, ease: "none" }, 3.5);
```

### 11.10 Shake (deterministic)

```js
function shake(target, at, amp = 8, n = 10, dur = 0.4) {
  for (let i = 0; i < n; i++) {
    tl.to(target, { x: (rand() - .5) * amp * 2, y: (rand() - .5) * amp * 2,
      duration: dur / n, ease: "none" }, at + (i * dur) / n);
  }
  tl.to(target, { x: 0, y: 0, duration: 0.05 }, at + dur);
}
```

### 11.11 Beat snap helper

```js
const BEATS = [/* seconds from analysis JSON */];
const snap = (t, tol = 0.1) => {
  let best = t, d = tol;
  for (const b of BEATS) { const dd = Math.abs(b - t); if (dd <= d) { best = b; d = dd; } }
  return best;
};
// beat-grid: card 1 at snap(8.8)
tl.fromTo("#card1", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.3)" }, snap(8.8));
```

### 11.12 Audio-reactive glow (pre-extracted data)

```js
// RMS[] pre-extracted at CONFIG.meta.fps, values 0..1
const proxy = { t: 0 };
tl.to(proxy, { t: CONFIG.meta.durationSec, duration: CONFIG.meta.durationSec, ease: "none",
  onUpdate: () => {
    const f = Math.min(RMS.length - 1, Math.floor(proxy.t * CONFIG.meta.fps));
    document.querySelector("#hero-glow").style.opacity = 0.35 + RMS[f] * 0.25;   // subtle
  } }, 0);
```

### 11.13 Character idle loops (seek-safe)

```js
const total = CONFIG.meta.durationSec;
tl.to(".eye", { scaleY: 0.08, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, 4.5)
  .to(".eye", { scaleY: 0.08, duration: 0.08, yoyo: true, repeat: 1 }, 9.3);        // place blinks at fixed times
tl.to(".bod", { y: -1.5, duration: 1.8, ease: "sine.inOut", yoyo: true,
                repeat: Math.ceil(total / 1.8) }, 0);                                  // breathing
tl.to(".cord", { rotation: 3, duration: 1.9, ease: "sine.inOut", yoyo: true,
                 repeat: Math.ceil(total / 1.9), transformOrigin: "50% 0%" }, 0);
```

### 11.14 Website layer: smooth scroll + scroll-linked scenes

```js
// Lenis + GSAP ScrollTrigger (pin versions; load from the CDN hosts your page allows)
const lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 3) });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

gsap.to("#skyline", { yPercent: -6, ease: "none",
  scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: 0.6 } });
```
Disable under `prefers-reduced-motion: reduce`.

---

## 12. The Maker app (UI spec)

A single local HTML tool (`hyper-edit-maker/index.html`) that edits `maker.config.json` live and shows a preview. No server needed.

### 12.1 Layout

```
+---------------------------------------------------------------+
|  Preview (16:9 / 9:16 / 1:1 switch)   |  Panels (tabs)        |
|  scrubbable, play/pause, loop scene   |  Brand | Type | Motion |
|                                       |  Character | Audio     |
|  Timeline strip: scenes as blocks,    |  Scenes | Export       |
|  beat ticks, SFX markers, drag to     |                        |
|  retime, double-click to edit         |  [Reset] [Save config] |
+---------------------------------------------------------------+
```

### 12.2 Panels and controls

| Panel | Controls |
|---|---|
| Brand | Preset picker, colour pickers for each role, OKLCH sliders, live contrast badge (AA / fail), grain slider, logo upload |
| Type | Display / text / mono family (Google Fonts list), weight, tracking, min body px, live specimen |
| Motion | Energy (calm to chaotic), ease curve picker with live curve preview for each token, duration scale, stagger, transition, camera push |
| Character | Outfit swatches, mood, thought-bubble on/off and line editor, weather, time-of-day dial, cat / kite / birds toggles |
| Audio | Music picker, volume, fade, SFX density, voice on/off + voice id, beat-sync with strong-lock count, waveform for timing only |
| Scenes | Add from the library (section 5), reorder, per-scene text / media / slug / transition / SFX |
| Export | Format, fps, duration, poster frame, CRF, "Write brief.md", "Write composition", "Copy render command" |

### 12.3 State and outputs

- State is one object = `maker.config.json`. Undo/redo stack of config snapshots.
- Persist to `localStorage` with `try/catch`, and render correctly when it is empty.
- Outputs: `maker.config.json`, `brief.md` (the section 13 template filled in), and a generated `composition/index.html`.
- Presets are JSON files in `presets/`. A preset is only a partial config merged over defaults.

### 12.4 Quality bars for the app itself

- Keyboard accessible. Visible focus rings. Contrast AA.
- Every control has a label. No colour-only state.
- Honour `prefers-reduced-motion` in its own UI.
- Preview must be the **same code** as the render (no separate "preview-only" animation path).

### 12.5 Proposed folder

```
hyper-edit-maker/
  index.html              maker UI
  maker.config.json       default config
  presets/                press-proof.json, cyber-loot.json, kinetic-mono.json, pixel-8bit.json, monsoon.json
  scenes/                 one file per scene type (HTML template + GSAP builder)
  scripts/build-composition.mjs   config -> composition/index.html
  scripts/analyze-beats.mjs       wraps `npx hyperframes beats`
  composition/            HyperFrames project (copy of brag-output/composition)
  assets/                 images, music, sfx (relative paths only)
  HYPER_EDIT_MAKER.md     this file
```

---

## 13. Composition brief template (fill from config)

```markdown
# Hyperframes Composition Brief: [Name]

## Objective
[One sentence.]

## Output
- Composition directory: composition/
- Rendered video: out/video.mp4
- Format: [landscape/vertical/square], [W]x[H], [fps] fps
- Duration: [s]

## Source Material
- Real work to show: [file paths]
- Copy that must appear verbatim: [lines]

## Creative Direction
- Preset / tone: [..]
- Angle: [one paragraph]
- Hook (first 2-3 s): [..]
- Punchline: [..]
- Avoid: generic SaaS language, abstract filler, unrelated redesign

## Visual Identity
- Tokens: [from config.brand, config.type]
- Character: [outfit, mood] (obey section 9)

## Storyboard
1. [scene] - [s] - [what is seen / read]

## Audio
- Role, arc, music file + volume, SFX density, voice on/off
- Beat sync: source, strong locks, tolerances
- Audio-reactive: none / subtle

## Gates
- npm run check passes with zero errors
- snapshots reviewed at [timestamps]
```

---

## 14. Quality gates (do not skip)

**Before render**

- [ ] `npm run check` has zero errors; warnings reviewed.
- [ ] Snapshots inspected at every scene start, at the focal moment, and at the last frame.
- [ ] Every text line holds long enough to read (section 7.3).
- [ ] No `Math.random`, `Date.now`, or network calls.
- [ ] No `repeat: -1`.
- [ ] All asset paths are relative and the files are inside `composition/assets/`.
- [ ] Character consistency test passed (9.6).
- [ ] Audio: levels in range, no shared track index on overlapping clips, music fades under the last logo.
- [ ] Duration within 15 to 25 s, or a reason is written down.
- [ ] Contrast AA on every text-on-image moment.

**After render**

- [ ] Watch once with sound, once muted. The muted version must still make sense.
- [ ] Pick a **best-frame** poster (not an arbitrary frame) and bake it as frame 0 so it is the idle thumbnail.
- [ ] Write share copy: one short line, one tag line, the contact.

**Website layer**

- [ ] Works with scripts disabled enough to read the content.
- [ ] Pauses offscreen. Stops under reduced motion.
- [ ] Heavy images compressed (`etutor.jpg` is about 14 MB: target under 500 KB).
- [ ] Tested at desktop and 390 px.

---

## 15. Repos, docs and sources

`verified` = I saw the link or fact in a source or in your files this session. `unverified` = well-known project, link not re-checked now; confirm before depending on it.

### Video engines and agent skills

| Name | Link | Status |
|---|---|---|
| HyperFrames (HeyGen) | https://github.com/heygen-com/hyperframes | verified |
| HyperFrames docs | https://hyperframes.heygen.com | verified |
| HyperFrames docs index for agents | https://hyperframes.heygen.com/llms.txt | verified (named in your `AGENTS.md`) |
| HeyGen developer page for HyperFrames | https://developers.heygen.com/hyperframes-overview | verified |
| `/brag` skill | https://github.com/latent-spaces/brag | verified (cloned in `brag-source`) |
| Vercel `skills` CLI | https://github.com/vercel-labs/skills | verified |
| hyperframes-generator (bulk restyle via Claude API, MIT) | https://github.com/PythonLuvr/hyperframes-generator | verified |
| Remotion | https://www.remotion.dev | verified |
| Motion Canvas | https://motioncanvas.io | unverified |
| Revideo | https://github.com/redotvideo/revideo | unverified |

### Animation libraries

| Name | Link | Status |
|---|---|---|
| GSAP | https://gsap.com | unverified |
| Lenis | https://lenis.darkroom.engineering | unverified |
| Motion | https://motion.dev | unverified |
| Anime.js | https://animejs.com | unverified |
| Lottie | https://lottiefiles.com | unverified |
| Rive | https://rive.app | unverified |
| Theatre.js | https://www.theatrejs.com | unverified |
| three.js | https://threejs.org | unverified |

### Assets

| Name | Link | Status |
|---|---|---|
| Kenney (CC0 SFX) | https://kenney.nl | verified (credited in `/brag`) |
| ende.app (music bed) | https://ende.app | verified (credited in `/brag`) |

### HyperFrames starter examples (from a 2026 write-up)

`npx hyperframes init my-video --example <name>` with: `warm-grain` (brand/lifestyle), `play-mode` (social/product launch), `swiss-grid` (enterprise/data), `kinetic-type` (title card/promo), `decision-tree` (explainer), `product-promo`, `nyt-graph` (data story), `vignelli` (vertical title). Use these as visual references for presets.

### Research notes (what the sources said)

- HyperFrames turns HTML, CSS, media and seekable animations into deterministic MP4. The engine uses Puppeteer (headless Chrome), seeks to each frame, screenshots it, and encodes with FFmpeg. It ships 20 agent skills. Cloud options include HeyGen-hosted, AWS Lambda and Cloud Run. (pyshine.com, developers.heygen.com)
- Licences and activity (one survey read from the GitHub API on 20 Sep 2026): HyperFrames Apache-2.0, about 51.8k stars, committed that day; Remotion about 59.8k stars; Motion Canvas and Revideo MIT; Theatre.js about 25 months since last commit. Remotion is described as free below a small team size and paid per seat above it. (capitalandcompute.net, remotion.dev compare page)
- Remotion vs Motion Canvas: Remotion uses a full DOM tree per frame, Motion Canvas uses a single canvas. Motion Canvas is truly open source; Remotion is source-available and requires a licence for company use above its free tier. (remotion.dev docs)
- 2026 animation landscape: GSAP and Motion are both free now; Anime.js v4 added spring physics; Lottie has the highest market share among detected animation libraries; code-first picks are GSAP for timelines and scroll, Motion for React UI. (youngju.dev, learnwithhasan.com, wmtips.com)
- Design and motion rules in sections 7, 8 and 6.6 come from your local `impeccable` skill (`animate.md`, `colorize.md`) and from `/brag` (`tones.md`, `audio.md`, `step-3-compose.md`).

Not verified: the exact current GSAP licence wording, Lottie/Lenis/Theatre.js/Rive licence details, and the unverified links above. I did not run any render in this session.

---

## 16. Agent prompt pack

Copy-paste these into Claude Code (inside `html-yt`).

**Make a new video from a config**
```
Read HYPER_EDIT_MAKER.md and hyper-edit-maker/maker.config.json.
Use /hyperframes. Build composition/index.html from the config, following sections 3, 7, 9 and 10.
Run `npm run check`, then snapshot at each scene start and the last frame, and fix what you see.
Render to out/video.mp4 and bake the best-frame poster as frame 0.
```

**Restyle an existing video**
```
Read HYPER_EDIT_MAKER.md. Keep the scenes and timings of brag-output/composition/index.html.
Swap only the brand tokens to the "press-proof" preset and the transitions to "press-wipe".
Do not touch the audio. Run check and snapshots.
```

**Add a scene type**
```
Add a scene type "calendar-flip" to hyper-edit-maker/scenes/. Follow section 5 and section 11.
It must be deterministic (seeded rng only), hold text per section 7.3, and pass `npm run check`.
```

**Port a Remotion scene**
```
Use /remotion-to-hyperframes to port dealflow-remotion/src/SevereTitanDrop.tsx into a HyperFrames scene,
then verify it frame by frame against the original render.
```

**Upgrade the rooftop site**
```
Read HYPER_EDIT_MAKER.md sections 7, 9 and 14. In nis-graphics-frame/rooftop.html:
add Lenis smooth scroll with a reduced-motion fallback, a sheet-pin animation when the character reaches the board,
and compress assets/etutor.jpg. Keep the character consistent with section 9.
```

---

## 17. Roadmap

1. **Now:** this file + one working preset (`press-proof`) rendered from the existing `brag-output/composition` template.
2. Build `build-composition.mjs` (config to HTML) and 5 scene types: `kinetic-title`, `poster-reveal`, `grid-sweep`, `stat-counter`, `cta-lockup`.
3. Build the Maker UI (section 12) with live preview and the contrast badge.
4. Add beat analysis wiring and subtle audio-reactive glow.
5. Move the character to a reusable SVG component, optionally to Rive for reactive states.
6. Bulk mode: one config plus a CSV of dates and posters produces the whole year's festival videos ("we run the calendar").

### Open decisions for you

- Keep Remotion for `dealflow-remotion`, or port everything to HyperFrames?
- Is the maker a **local tool only**, or a public page clients can use?
- Default format: vertical (reels) first, or landscape (YouTube) first?
