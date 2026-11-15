# Igloo Inc. (`igloo.inc`) — Master WebGL, Shader, 3D, Interaction & Audio Case Study (Verified Master Revision)

A complete technical blueprint and reverse-engineering case study of the **Igloo Inc.** interactive WebGL experience. It combines:
1. **The official engineering case study by Abeto** (Awwwards, Sep 25, 2024),
2. **A frame-by-frame review and audio spectrum analysis of a 73-second screen recording** of the live site (captured Nov 1, 2026; `1920×1052`, `60 fps`), and
3. **Concrete GLSL shader, Three.js, physics, and Web Audio API implementation architectures** for building or reconstructing the experience.

---

## How to Read the Confidence Tags

Every claim in this document carries one of four tags so reconstruction is never mistaken for fact:

| Tag | Meaning |
| :--- | :--- |
| **`[CONFIRMED]`** | Stated directly in Abeto's official engineering case study or on the Awwwards award pages. |
| **`[OBSERVED]`** | Seen or measured directly in the Nov 1, 2026 screen recording (frames sampled every 2 s with zoomed checks at key moments; audio analyzed for RMS level and spectral roll-off). |
| **`[INFERRED]`** | A reasonable engineering reconstruction or suggested GLSL / Three.js / Web Audio implementation. Not confirmed by either source; treat as a practical build recipe rather than documented studio fact. |
| **`[UNVERIFIED]`** | Claimed in earlier drafts or third-party listings, or too subtle to confirm or rule out at recording resolution/bandwidth. |

**Version Note:** Only two differences between the live capture and the 2024 launch build are known: the copyright year (`© 2026` vs. `© 2024`) and the updated Manifesto mission text. Timestamps below (`m:ss`) refer to the 73-second recording.

---

## 1. Core Tech Stack & Studio Architecture

### Credits & Recognition
* **Studios:** **Abeto** (technical-art and WebGL studio) built the site in collaboration with **Bureaux**, who proposed the project. `[CONFIRMED]`
* **Division of Work:** Bureaux supplied moodboards, some of their own renders and 3D assets, a general content outline, and the music and sound effects. Abeto produced the concepts, UI design, code, and implemented the audio. `[CONFIRMED]`
* **Awards:** *Site of the Year* and *Developer Site of the Year* at the 2024 Awwwards. `[CONFIRMED]`
* **People:** A Webby entry credits "Vicente V" as engineer, and Awwwards lists Vicente Lucendo under Abeto. His specific role as project lead is not stated in either source. `[UNVERIFIED]`
* **Brief & Structure:** The landing page promotes the portfolio companies with scrollable, user-friendly navigation. Because it has just three sections (the igloo, the portfolio projects, and the links footer), the primary creative and engineering challenge was keeping the scroll engaging through rich interactivity. `[CONFIRMED]`

### Programming, 3D & Design Stack
* **Frontend & 3D Programming:** **Three.js**, **`three-mesh-bvh`** (spelled `"three-mesh-bhv"` in the original article) for accelerated spatial raycasting, **Svelte**, **GSAP**, **Vite**, and **vanilla JavaScript**. `[CONFIRMED]`
* **3D & Textures:** **Houdini** and **Blender** are confirmed for 3D and textures. `[CONFIRMED]`
* **UI Design:** **Figma**, **Photoshop**, and **Affinity Photo**. `[CONFIRMED]`
* **Sound Production:** **DaVinci Resolve**. `[CONFIRMED]`

### Custom Studio Tooling & Production Process
* **Live Browser Tooling:** Abeto uses custom internal tools that hot-reload and update shaders, textures, and models live in the browser so art and code are developed simultaneously and frame-time performance is measured continuously (including on low-end devices). `[CONFIRMED]`
* **Previs Workflow:** Grey-box mockups and sketches come first, followed by untextured "previs" animations for complex transitions (such as the camera journey to the footer particles). `[CONFIRMED]`
* **Custom Engineering Solutions Named by Abeto:**
  1. A **VDB-to-browser volume exporter** with custom compression,
  2. An **expansive fluid simulation**,
  3. **Custom geometry exporters**,
  4. **Custom texture-loading strategies**, and
  5. **Shader compilation** both at start-up and in the background. `[CONFIRMED]`
* **Role of Houdini in Custom Pipelines:** The official case study confirms Houdini for "3D and textures" `[CONFIRMED]`, but does not explicitly name the DCC tool used to author the VDB files, the procedural ice-crystal growth algorithm, or the fluid simulation. That the VDB volumes and procedural ice-crystal growth were authored in Houdini is highly plausible (since OpenVDB is Houdini's native volume format and procedural crystal growth fits SOP/VEX workflows), while the interactive particle fluid behavior runs in real time on the GPU. `[INFERRED]`

### UI Rendered in WebGL (SDF Font Pipeline)
* **Why WebGL UI:** Abeto decided during development to implement the UI in WebGL, primarily for two text effects: `[CONFIRMED]`
  1. **Glitches** are simple shaders with negligible performance cost in WebGL, whereas HTML/CSS glitches require heavy DOM clipping and masking. `[CONFIRMED]`
  2. **Text scrambles** are achieved by adjusting the UV offset of the **Signed Distance Field (SDF)** font texture, avoiding the layout/style recalculations that happen every time DOM text changes. `[CONFIRMED]`
* **Scope of WebGL UI:** Whether literally 100% of UI elements (every button, wordmark, and footer label) are drawn in WebGL rather than DOM is not explicitly stated in the article. Treat "100% WebGL UI" as `[INFERRED]`.
* **Client-Side Routing (SPA Synchronization):** Clicking an ice block changes the browser address bar without a page reload (`igloo.inc` → `igloo.inc/portfolio/pudgy-penguins` at `~0:29` and `igloo.inc/portfolio/overpass` at `~0:42`), and closing the modal returns the URL to `igloo.inc`. `[OBSERVED]` Synchronizing the HTML5 History API (`history.pushState` / `replaceState`) with the 3D scene state is the standard mechanism. `[INFERRED]`
* **Cursor:** The native OS cursor is preserved (standard arrow pointer/hand only; no lagging custom DOM follower). `[OBSERVED]`

### Audio Engine Overview
* **Integration:** Bureaux supplied the music and SFX, and Abeto implemented them to match the movement of the particles. `[CONFIRMED]`
* **Browser API:** Driving the audio via the **Web Audio API** (`AudioContext`, `GainNode`, `BiquadFilterNode`, `StereoPannerNode`) tied to scroll, hover, and particle velocity uniforms is the standard web architecture. `[INFERRED]`

---

## 2. Global UI, Persistent HUD & Micro-Interactions

* **Browser Title:** `Igloo Inc.` `[OBSERVED]`
* **Top-Left `IGLOO` Wordmark:**
  * Pinned across every scene in white rounded letterforms. It glows noticeably brighter over the dark modal backgrounds (`0:30`, `0:44`). `[OBSERVED]`
  * Whether a subtle frosted snow texture is masked inside the letters cannot be confirmed at recording resolution. `[UNVERIFIED]`
* **Top-Left Copyright & Top-Right Manifesto Blocks (`0:00–0:20`, and again from `~0:59`):**
  * **Top-Left Text:** Reads `// Copyright © 2026` / `Igloo, Inc. All Rights Reserved.` `[OBSERVED]`
  * **Top-Right Text:** Reads `///// Manifesto` followed by: *"Our mission is to build the next generation of consumer brands at the intersection of Community, AI, and crypto."* `[OBSERVED]`
  * **2024 Launch Mission Text:** An earlier mission statement (*"create the largest onchain community, driving the consumer crypto revolution"*) appears on Awwwards' 2024 award page. `[CONFIRMED]`
  * **Scramble Behavior:** Both blocks use the SDF scramble/decode text effect: they decode in after the preloader reveal (`0:10`), scramble locally when hovered (`0:12`), disappear as the scene transition fog arrives (`~0:21`), and decode back in when the igloo scene returns (`~0:59–1:00`). `[OBSERVED]`
* **Bottom-Left Scroll Prompt (`Scroll down to discover.`):**
  * Visible after a fresh load (`0:00–0:16`); it scrambles out and disappears at about `0:17` as scrolling begins. `[OBSERVED]`
  * **Post-Loop Behavior:** It **does not** return after completing the infinite-scroll loop; in the `1:00–1:12` footage, only `Sound: On` remains in the bottom-left corner. `[OBSERVED]`
* **Bottom-Left Sound Toggle (`Sound: On`):**
  * Displays a small speaker icon with a single small wave arc to the left of `Sound: On`. `[OBSERVED]` (Multiple radiating wave arcs are `[UNVERIFIED]`).
  * It stays at `Sound: On` for the entire 73-second recording, is never toggled off, and remains visible across every scene and modal. `[OBSERVED]`
  * A smooth `~300 ms` master-volume ramp (`GainNode.gain.linearRampToValueAtTime`) on click is a sensible implementation detail. `[INFERRED]`

---

## 3. Scene-by-Scene Breakdown: Facts, Observations & Shader Recipes

### Scene A: Preloader & Real-Time Wireframe Intro (`0:04 – 0:10`)

#### Verified Facts & Observations
* **Why It Exists:** Opening straight on a quiet outdoor snow scene might not feel future-forward enough for a tech/crypto parent brand, so Abeto created a tech-flavored intro rendered in real time, in-engine, using code and custom shaders. This keeps file sizes small, maintains one consistent visual style, allows instant edits without re-rendering video, and flows directly into the interactive scene while shaders compile in the background. `[CONFIRMED]`
* **Recording Context:** The video begins on the already-loaded site (`0:00–0:04`). The page is reloaded at `~0:04`, triggering the intro from the start. `[OBSERVED]`
* **ASCII Preloader (`~0:04.5–0:06`):** On a flat neutral-grey screen, a tiny monospace string of cycling ASCII characters composed of `=`, `+`, and `-` (e.g., `=+==--==++`) animates in the exact center of the viewport. No numeric percentage counter and no progress bar appear when sampled every `0.2 s`. `[OBSERVED]`
* **Wireframe + Plexus Cage (`~0:06–0:08`):** The igloo materializes first as a wireframe showing its individual brick outlines and small brick-ID numbers, surrounded by a wide triangulated network (plexus constellation cage) of thin white lines and glowing vertex dots stretching across the terrain. `[OBSERVED]`
* **Noise-Edged Snow Reveal (`~0:08–0:10`):** An irregular, noise-edged bright white patch expands radially outward from the igloo. Inside the boundary, the scene renders fully textured snow and rock; outside the boundary, it remains wireframe. By `0:10`, the full scene is rendered. `[OBSERVED]`
* **Audio:** The recording is near-silent during the preloader (`~0:04–0:07`), with audio entering around the reveal (`~0:08`). `[OBSERVED]`

#### Engineering & Shader Recipe `[INFERRED]`
```glsl
// [INFERRED] Radial Noise-Perturbed Wireframe-to-PBR Reveal Fragment Logic
float dist = length(vWorldPosition - uIglooCenter);
float n = snoise(vWorldPosition * uNoiseScale + vec3(0.0, uTime * 0.2, 0.0));
float noisyDist = dist + n * uNoiseAmplitude;

// 0.0 = textured interior, 1.0 = wireframe exterior
float edgeWidth = 1.5;
float revealMask = smoothstep(uRevealRadius - edgeWidth, uRevealRadius, noisyDist);
float emissiveRim = smoothstep(uRevealRadius - edgeWidth, uRevealRadius - edgeWidth * 0.5, noisyDist)
                  * (1.0 - smoothstep(uRevealRadius - edgeWidth * 0.5, uRevealRadius, noisyDist));

vec4 finalColor = mix(pbrSnowColor, wireframeColor, revealMask);
finalColor.rgb += vec3(1.0) * emissiveRim * uGlowIntensity;
```

---

### Scene B: The Interactive Igloo & Arctic Terrain (`0:00 – 0:20`, `0:59 – 1:12`)

#### Verified Facts & Observations
* **Environment:** Wind-swept snow ridges, dark protruding rocks on the slopes, layered misty mountain silhouettes in the distance, and light blowing snow particles. `[OBSERVED]`
* **Camera Motion:** The camera framing drifts slowly over the opening seconds (`0:00 → 0:04`), consistent with a damped mouse-parallax camera rig. `[INFERRED]`
* **Unverified Environment Details:** A continuous smoke plume rising from the top of the dome and a concave trodden snow path inside the entrance arch could not be clearly confirmed from the footage. `[UNVERIFIED]`
* **Igloo Construction:** The dome is assembled from individual snow-brick meshes (roughly 80 bricks, supported by visual inspection and the highest observed brick ID of 74), with chamfered outer edges that catch the light and a bright glowing white interior core that shines through the gaps and illuminates the undersides of lifted bricks. `[OBSERVED]`
* **Hover Physics & Raycasting:**
  * The `three-mesh-bvh` library is used for fast raycasting against the 3D meshes. `[CONFIRMED]`
  * Hovering lifts the brick under the cursor along with a cluster of neighboring bricks outward, tilts them slightly, and exposes the glowing core. Lifted bricks settle back into place more slowly than they pop out, allowing the cursor to leave a trailing wave of raised bricks. `[OBSERVED]`
  * **Entrance-Arch Bricks:** Frame `0:10` and `1:07` show the entrance tunnel arch bricks visibly displaced when hovered (no zero-displacement lock). `[OBSERVED]`
* **Brick HUD Overlay (Single Consistent Behavior):**
  * Whenever bricks are lifted, small white square node dots, integer brick IDs, and thin white polylines connecting adjacent lifted bricks are drawn over them. `[OBSERVED]`
  * **Active on Both Initial Load and Post-Loop:** This overlay appears on the very first interaction right after the intro (`0:10`, showing IDs such as 51, 60, 64, 65) and again after the infinite scroll loop (`1:00–1:11`, where readable IDs across frames include 8, 11, 15, 17, 19, 31, 35, 40, 48, 52, 56, 61, 64, 65, and 74). `[OBSERVED]`
  * **Numbering Order:** The observed IDs confirm that brick numbers increase from the lower rings toward the crown of the dome, and a maximum observed ID of 74 aligns closely with the ~80 total brick estimate. `[OBSERVED]`

#### Engineering & Physics Recipe `[INFERRED]`
* **Materials:** PBR snow material using packed-snow Normal and Roughness maps, a baked curvature map to highlight chamfered brick edges, baked dark Ambient Occlusion on the inner socket walls so lifted bricks look thick, and a world-space Y-distance skirt blend where the bottom bricks meet the terrain. `[INFERRED]`
* **BVH Neighborhood Falloff & Frame-Rate Independent Damping:**
```javascript
// [INFERRED] Per-brick displacement target and frame-rate independent spring update
for (const brick of iglooBricks) {
  const d = brick.restCenter.distanceTo(raycastHitPoint);
  const weight = d < clusterRadius ? Math.pow(1.0 - d / clusterRadius, 2.0) : 0.0;
  brick.targetOffset = weight * maxDisplacement; // e.g., 0.35 world units

  // Frame-rate independent exponential damping: 1 - exp(-k * dt)
  // Fast pop-out (kOut ≈ 12.0, ~0.25s) vs. slow return (kIn ≈ 3.5, ~0.8s)
  const k = brick.targetOffset > brick.currentOffset ? 12.0 : 3.5;
  const alpha = 1.0 - Math.exp(-k * deltaTime);
  brick.currentOffset += (brick.targetOffset - brick.currentOffset) * alpha;

  brick.position.copy(brick.restPosition).addScaledVector(brick.restNormal, brick.currentOffset);
}
```

---

### Scene C: Transition & Procedural Ice Blocks (`0:20 – 0:28`, `0:35 – 0:42`)

#### Verified Facts & Observations
* **Mountain → Ice Block Transition (`~0:20–0:22`):**
  * Abeto notes that the scene transition mixes chromatic aberration, tech displacement, and a frost effect. `[CONFIRMED]`
  * In the recording, the camera pulls back through a dense fog bank accompanied by horizontal RGB-glitch bands while the igloo shrinks into the distance (`~0:21`). `[OBSERVED]`
* **Ice-Block Environment:**
  * Each ice block floats in a pale, cloudy-grey void. Large out-of-focus technical text drifts horizontally in the background (`DATA`, `PRE LOAD OFF / 2`, `002 NON FUNGIBLE TOKEN`, `01 DEFI`, `00.001.22`). `[OBSERVED]`
  * Vertical "updraft" snow particles could not be confirmed in the footage. `[UNVERIFIED]`
* **Procedural Ice Blocks:**
  * **Why Custom Crystal Growth:** Each portfolio project is an object encased in ice. Originally the team planned to reuse a single ice block mesh, but scrolling past identical blocks looked too repetitive, so each project was given a unique crystal. Because more portfolio projects could be added in the future, Abeto wrote a custom algorithm that mimics ice-crystal growth inside a container (a cube, cylinder, etc.). `[CONFIRMED]` (Authored in Houdini is `[INFERRED]`).
  * **Block 01 — Pudgy Penguins (`~0:21–0:35`):** A smooth, pale-grey penguin figure with dark eyes encased inside a faceted crystal, overlaid with a faint triangulated mesh. `[OBSERVED]` (A circular stone base and cyan beak/flipper subsurface highlights were not visible: `[UNVERIFIED]`).
  * **Block 02 — Overpass (`~0:37–0:43`):** A grey-blue, chamfered badge with a recessed "IP" mark inside a distinct faceted crystal. `[OBSERVED]` (An iridescent purple/orange/cyan bevel was not visible outside transition fringes: `[UNVERIFIED]`).
  * **Interactive Rotation:** Each block slowly shifts orientation as the cursor moves across it. `[OBSERVED]`
* **Wireframe Cage & Live Telemetry HUD:**
  * Thin plexus wireframe lines with vertex dots and a faint dot grid surround each block. `[OBSERVED]`
  * Three tracked HUD callouts accompany each block, with text that scrambles in through random cipher strings (e.g., `KJUXBKPRLEH.` / `JITWAJDLKZ667-A…`) before settling: `[OBSERVED]`
    * **Top-Left:** `PORTFOLIO_CO_01 / PUDGY PENGUINS` or `PORTFOLIO_CO_02 / OVERPASS`, connected to a wireframe vertex by an animated leader line. `[OBSERVED]`
    * **Top-Right (TEMP):** A two-line numeric readout where the first value is positive, the second line carries a +/- sign, and both lines drift steadily over time rather than jittering randomly. `[OBSERVED]`
      * Measured Pudgy Penguins TEMP progression (`0:22–0:28`): `35.14 / +01.75` → `35.23 / +01.79` → `35.30 / +01.83` → `35.37 / +01.87` → `35.44 / +01.91`. `[OBSERVED]`
      * Measured Overpass TEMP progression (`0:38–0:42`): `29.66 / -01.30` → `29.49 / -01.39`. `[OBSERVED]`
    * **Bottom-Right:** A date stamp (`D 01.02.2020` for Pudgy Penguins; `D 06.01.2023` for Overpass) positioned above `CLICK TO EXPLORE`. `[OBSERVED]`

#### Engineering & Refractive Ice Shader Recipe `[INFERRED]`
Screen-Space Refraction (`WebGLRenderTarget`): Render the inner object (Penguin or Overpass badge) and background fog to an off-screen `THREE.WebGLRenderTarget`, then render the outer crystal mesh using normal-perturbed screen-space UVs with per-channel RGB dispersion, a Schlick Fresnel rim, and a baked curvature/edge-wear map:

```glsl
// [INFERRED] Refractive Ice Fragment Shader
vec2 screenUV = gl_FragCoord.xy / uResolution;
vec2 refractOffset = vViewNormal.xy * uRefractionStrength;

// Chromatic dispersion across R, G, B channels
float r = texture2D(uSceneRT, screenUV + refractOffset * 1.03).r;
float g = texture2D(uSceneRT, screenUV + refractOffset * 1.00).g;
float b = texture2D(uSceneRT, screenUV + refractOffset * 0.97).b;
vec3 refractedColor = vec3(r, g, b);

// Fresnel rim + chalky edge wear from baked curvature map
float fresnel = pow(1.0 - max(dot(vViewDir, vViewNormal), 0.0), 3.0);
float edgeWear = texture2D(uCurvatureMap, vUv).r;

vec3 finalIce = mix(refractedColor, uIceTint, 0.25)
              + vec3(0.85, 0.95, 1.0) * fresnel * 0.6
              + vec3(1.0) * edgeWear * 0.35;
```

---

### Scene D: Freeze Transition & Summary Modals (`0:28 – 0:35`, `0:42 – 0:47`)

#### Verified Facts & Observations
* **Opening a Modal ("Freeze In", `~0:29` and `~0:42`):**
  * Clicking an ice block surrounds the crystal with a blue/cyan RGB-fringed halo while the screen darkens from the outer edges inward to a dark slate-navy over `~0.7 s`, followed by the modal text decoding in. `[OBSERVED]`
  * The browser URL updates to `/portfolio/pudgy-penguins` (`~0:29`) or `/portfolio/overpass` (`~0:42`). `[OBSERVED]`
* **Closing a Modal ("Thaw Out", `~0:34` and `~0:46`):**
  * Clicking Close dissolves the dark modal overlay through an irregular, noise-masked pattern with strong red/cyan RGB fringing, returning to the floating ice-block scene. `[OBSERVED]`
* **Modal Layout:**
  * Dark slate-navy background with the 3D ice block still faintly visible behind the text (no jagged ice border framing the monitor edges). `[OBSERVED]`
  * Monospace body paragraphs sit beneath the `///// Summary` heading. `[OBSERVED]`
  * The top-right close button displays the word Close framed by four corner targeting brackets (`┌ ┐ └ ┘`), rather than inline `[ Close ]` text brackets. `[OBSERVED]`
* **WebGL SDF Text Effects:**
  * **Wave Decode on Open:** Paragraphs initialize as scrambled cipher text and resolve from top to bottom over roughly one second (`0:30`, `0:43`). `[OBSERVED]`
  * **Interactive Cursor Brush Scramble:** Moving the cursor over the body text replaces characters within a local radius around the pointer with random glyphs, which resolve back into English shortly after the cursor moves away (`0:32`, `0:45`). `[OBSERVED]` As confirmed by Abeto, this is achieved by offsetting the SDF font texture UVs in the shader. `[CONFIRMED]`
* **`/// Discover` Footer:**
  * The Overpass modal displays `/// Discover` at the bottom with a corner-bracketed `X ↗` external link button (`0:44`). `[OBSERVED]`
  * The Pudgy Penguins modal's visible text area ends with a faded bottom line and no visible Discover section (`0:34`). Because its summary text is longer, the section may sit below the scroll fold, so whether it is dynamically omitted or below the fold is `[UNVERIFIED]`.

#### Engineering & SDF Scramble Shader Recipe `[INFERRED]`
```glsl
// [INFERRED] SDF Font Atlas UV Offset Scramble (Vertex/Fragment Concept)
// Each glyph quad carries attributes: aCharIndex, aGlyphCenterUV, aRandomSeed
float cursorDist = distance(uMouseScreenPos, aGlyphCenterUV);
float brushInfluence = smoothstep(uBrushRadius, 0.0, cursorDist);

// Combine wave-decode progress on modal open with live cursor-brush proximity
float scrambleFactor = max(1.0 - smoothstep(aGlyphOrder, aGlyphOrder + 0.15, uDecodeProgress), brushInfluence);

// Quantize time so scrambled characters cycle at ~20 Hz
float timeStep = floor(uTime * 20.0);
float glyphOffset = scrambleFactor > 0.01
    ? floor(hash(aRandomSeed + timeStep) * uTotalAtlasGlyphs)
    : 0.0;

vec2 atlasUV = getAtlasUV(mod(aCharIndex + glyphOffset, uTotalAtlasGlyphs), uv);
float sdfDist = texture2D(uSdfFontAtlas, atlasUV).r;
float alpha = smoothstep(0.5 - fwidth(sdfDist), 0.5 + fwidth(sdfDist), sdfDist);
```

---

### Scene E: Portal Rings & the Volumetric Particle Dais (`0:47 – 0:59`)

#### Verified Facts & Observations
* **Ring Portal (`~0:47–0:51`):**
  * After closing the Overpass modal and scrolling down, the camera descends past the Overpass block into cloud, revealing carved grey ring segments floating in the sky. Concentric segmented sections counter-rotate into alignment to form a complete ring (`0:48–0:49`). `[OBSERVED]`
  * At `0:50`, the ring is viewed face-on: a glassy outer ring with a bright white glowing inner ring and a burst of white particles in the center. `[OBSERVED]`
* **Camera Arc (`0:50–0:54`):**
  * From the face-on top-down view (`0:50`), the camera drops through a high 3/4 angle over the circular dais (`0:52`) and settles into a near eye-level horizontal view (`0:54–0:58`). `[OBSERVED]`
* **Dais Environment (`~0:52–0:58`):**
  * A stepped circular platform made of concentric rings separated by glowing white circular grooves, with a matching glowing white circular ring hovering overhead (`0:56–0:58`). `[OBSERVED]`
  * The surroundings fade into a misty cyclorama horizon where small drifting text blocks remain faintly visible in the upper fog (`0:54–0:57`). `[OBSERVED]` (The exact words in the dais fog are too small/blurred to read in the capture: `[UNVERIFIED]`).
  * An anisotropic "vinyl record" brushed normal map causing the radial floor highlight is `[INFERRED]`.
* **Volumetric Particle Figure & Custom VDB Pipeline:**
  * **Visual Appearance:** A 3D figure composed of thousands of small points that appear dark slate/grey at rest and turn bright glowing white where particles move rapidly (`0:54`, `0:57`). `[OBSERVED]`
  * **Confirmed Shader & Pipeline Rules:** Abeto confirms that:
    1. Particle color changes dynamically based on particle speed, and the volume glows when changing shape. `[CONFIRMED]`
    2. Because traditional game-dev 2D volume-slice textures are too heavy for web downloads, Abeto built a custom exporter that converts OpenVDB data into a browser-friendly format and added a custom compression step yielding a file smaller than a typical website image. `[CONFIRMED]`
    3. The particles morph into different 3D models depending on the selected external link in the footer. `[CONFIRMED]` (In the recording, only LinkedIn is ever selected, showing a rounded penguin-like figure; hoodie/beanie details are `[UNVERIFIED]`, and the shape-morph transition itself is not demonstrated in the video `[OBSERVED]`).
  * **Interactive Mouse Vortex:** Sweeping the cursor through the particle figure stretches and whips the cloud into a tall, swirling tornado/vortex column (`0:54–0:57`), after which the particles smoothly recover their resting volumetric shape. `[OBSERVED]`
* **Footer Navigation on the Floor:**
  * Floor labels `Medium`, `LinkedIn`, and `X / Twitter` sit along the front arc of the platform. The active center item (`LinkedIn`) is framed by four corner brackets (`┌ ┐ └ ┘`), and thin left/right arrow glyphs sit at the mid-screen left and right edges. `[OBSERVED]` (A Copyright label on the outer dais track was not visible: `[UNVERIFIED]`).
* **Infinite Scroll Loop (`~0:57–1:00`):**
  * Scrolling past the dais pitches the camera upward toward the glowing overhead ring (`0:57`), a prismatic rainbow-shard flare sweeps across the floor (`0:58`), and the mountain scene returns. `[OBSERVED]`
  * The igloo reassembles from loose bricks scattered close around and just above the dome (`0:58.8`), pulling inward into their sockets while the Manifesto and Copyright blocks decode back in (`0:59–1:00`). `[OBSERVED]`

#### Engineering & GPU FBO Particle Vortex Recipe `[INFERRED]`
* **Binary VDB Point Unpacking:** Quantize active VDB voxel coordinates into `Uint8Array` (x, y, z, density) tuples (4 bytes/particle) compressed with Brotli/Gzip (`~150–250 KB` for 65k–100k particles), then unpack into a `Float32Array` position texture for GPU ping-pong FBO simulation. `[INFERRED]`
* **Ping-Pong FBO Velocity & Position Simulation:**
```glsl
// [INFERRED] GPU Velocity FBO Update Shader (Curl Noise + Mouse Vortex + Spring Return)
vec3 pos = texture2D(uPosTex, vUv).xyz;
vec3 vel = texture2D(uVelTex, vUv).xyz;
vec3 targetPos = mix(texture2D(uVdbTargetA, vUv).xyz, texture2D(uVdbTargetB, vUv).xyz, uMorphProgress);

// 1. Spring attraction back to VDB volumetric target
vec3 toTarget = targetPos - pos;
vel += toTarget * uSpringStiffness * uDeltaTime;

// 2. Mouse vortex (tangential swirl + upward lift + curl noise turbulence)
vec3 toMouse = pos - uMouseWorldPos;
float mouseDist = length(toMouse.xz);
float vortexMask = smoothstep(uVortexRadius, 0.0, mouseDist);
vec3 tangent = normalize(vec3(-toMouse.z, 0.35, toMouse.x));
vel += (tangent * uMouseSpeed * 8.0 + curlNoise(pos * 1.5 + uTime * 0.4) * 2.5) * vortexMask * uDeltaTime;

// 3. Frame-rate independent velocity damping
vel *= exp(-uDamping * uDeltaTime);
```

* **Speed-Reactive Particle Color:**
```glsl
// [INFERRED] Particle Fragment Color by Speed & Morph Glow
float speed = length(vVelocity);
float speedFactor = smoothstep(0.1, 3.5, speed);
vec3 color = mix(vec3(0.22, 0.25, 0.28), vec3(1.0, 1.0, 1.0), speedFactor);
color += vec3(0.8, 0.95, 1.0) * uMorphGlowPulse;
```

---

## 4. Sound Design & Interactive Audio

### Confirmed Studio Facts `[CONFIRMED]`
* Music and sound effects were created by Bureaux and implemented by Abeto to match the movement of the particles, making the particle interaction "playful and satisfying." `[CONFIRMED]`
* Sound production was done in DaVinci Resolve. `[CONFIRMED]`

### Observed Audio Metrics from the Recording (Mono Level & Spectrum Analysis) `[OBSERVED]`
* **Preloader Silence (`~0:04–0:07`):** The recording is essentially silent while the preloader runs; audio enters with the snow reveal around `~0:08`. `[OBSERVED]`
* **RMS Level Envelope Across Scenes:**
  * The loudest continuous stretches are the igloo brick-hover sections: `≈ -26 dB RMS` around `0:10`, and `≈ -24 to -27 dB RMS` from `1:00` to `1:12`. `[OBSERVED]`
  * The ice-block and modal scenes are roughly 6–10 dB quieter (`≈ -33 to -35 dB RMS`). `[OBSERVED]`
* **Transition Level Bumps:** Distinct transient level bumps of roughly 5–6 dB occur at `0:28` (Pudgy modal freeze), `0:42` (Overpass modal freeze), `0:48` (portal ring alignment), and `0:58` (loop transition / igloo re-assembly). `[OBSERVED]`
* **Spectral Roll-Off Profile:**
  * The recorded audio is heavily bass-dominated throughout: for most of the clip, 95% of spectral energy sits below `~450 Hz`. `[OBSERVED]`
  * **Dais Entrance Spectral Peak (`0:52`):** The brightest moment in the entire recording occurs specifically in the `0:52` window (as the camera drops into the particle dais), where the 95% spectral roll-off jumps to `≈ 4.7 kHz` before dropping back to `≈ 1.05 kHz` at `0:54` and `≈ 0.5 kHz` at `0:56`. `[OBSERVED]` (Interpreting that `0:52` high-frequency spike as a chime/shimmer layer is `[INFERRED]`).
* **Modal Low-Pass Filter Check:** A `~600 Hz` master low-pass filter during modals cannot be confirmed or ruled out from the capture (95% roll-off stays around 390–440 Hz both before and during the modal), as the baseline signal or recording capture itself is already band-limited. `[UNVERIFIED]`

### Suggested Web Audio API Implementation Architecture `[INFERRED]`
The following audio bus design reproduces all observed level bumps, hover dynamics, and particle-speed reactivity:
* **Continuous Ambient Bed:** Stereo high-altitude wind loop layered with a slow, reverberant sci-fi synth pad. `[INFERRED]`
* **Igloo Brick Hover SFX:** Short low-end stone/snow thud layered with a crisp HUD tick, triggered on brick raycast entry with randomized playbackRate (`0.85–1.15`) and `StereoPannerNode.pan` mapped to normalized cursor X (`-0.6 to +0.6`). `[INFERRED]`
* **SDF Text Decode Flutter:** Soft, rapid high-frequency data-tick loop active while `uDecodeProgress` or cursor-brush scramble is active. `[INFERRED]`
* **Transition Impacts (`0:28`, `0:42`, `0:48`, `0:58`):** Crystalline ice-crack / sub-bass impact hits on modal freeze/thaw, stone grinding into a sub-bass braaam on the portal ring, and a reverse riser into a multi-brick slam on loop reset (producing the observed `+5 to +6 dB` transient bumps). `[INFERRED]`
* **Particle Vortex Reactive Synth (`0:51–0:57`):** A high-frequency shimmer burst on dais entry (`0:52`) paired with a continuous granular/noise loop routed through a `BiquadFilterNode` (bandpass) and `GainNode` whose cutoff frequency and gain are modulated every frame by the average GPU particle velocity uniform. `[INFERRED]`

---

## 5. Implementation Checklist & Build Order

Numeric coordinates, timings, and filter values below are `[INFERRED]` engineering baselines to tune during development.

* **Phase 0 — Tooling & Performance Budget `[CONFIRMED approach]`:**
  * Set up a live-reload browser debug workflow for shaders, textures, and models; block out camera paths with grey-box previs first; enforce a strict frame-time budget tested on low-end devices; plan custom binary geometry exporters, progressive texture loading, and startup/background shader compilation (`renderer.compileAsync`).
* **Phase 1 — Svelte + Vite + Three.js Base & Scroll Rig:**
  * Initialize Svelte + Vite + Three.js with `three-mesh-bvh`, post-processing (bloom, chromatic aberration, tech displacement, frost wipe), and a GSAP-driven camera path through the three sections (Igloo at $Y = 0 \to$ Block 1 at $Y = -20 \to$ Block 2 at $Y = -40 \to$ Portal Ring at $Y = -55 \to$ Particle Dais at $Y = -70$) that wraps seamlessly back to $Y = 0$.
* **Phase 2 — WebGL SDF Text & Glitch Layer:**
  * Generate SDF/MSDF font atlases (troika-three-text or custom instanced SDF quads). Implement initial decode, modal wave decode, cursor-brush scramble, and glitch bands purely via shader UV offsets and displacement.
* **Phase 3 — Igloo Dome & BVH Raycast Physics:**
  * Import the ~80-brick fractured .glb igloo (indexed 1..~80 from bottom rows to crown), attach MeshBVH, implement radial cluster falloff, frame-rate independent asymmetric damping (`1 - Math.exp(-k * dt)`), and the single-state dynamic wireframe/dot/ID/polyline HUD overlay whenever bricks are lifted.
* **Phase 4 — Procedural Ice Blocks & Freeze/Thaw Transitions:**
  * Generate unique faceted crystal meshes per portfolio item using a container crystal-growth algorithm (e.g., in Houdini `[INFERRED]`), build the `WebGLRenderTarget` screen-space refractive dispersion shader, attach the 3-callout telemetry HUD (with steadily drifting TEMP values), and wire up the edge-in darkening freeze / noise-masked thaw transitions plus HTML5 History API routing (`/portfolio/<slug>`).
* **Phase 5 — Custom VDB Volume Exporter & GPU Particle Vortex:**
  * Build the compressed VDB-to-browser binary point exporter, set up the GPU ping-pong FBO simulation (spring target attraction + cursor vortex swirl + curl noise), shade particles by instantaneous velocity with a morph glow pulse, and wire up the floor link selector (Medium, LinkedIn, X / Twitter).
* **Phase 6 — Real-Time Wireframe Intro & Infinite Loop Reset:**
  * Implement the centered cycling ASCII preloader (`=+==--==++`), the triangulated plexus terrain cage, the radial Simplex-noise snow reveal shader, and the end-of-scroll loop transition (upward pitch into overhead ring $\to$ rainbow prism flare $\to$ near-dome brick re-assembly).
* **Phase 7 — Reactive Web Audio Integration & Profiling:**
  * Connect scroll speed, brick hover events, transition triggers, and particle velocity to the Web Audio API bus, then profile draw calls and VRAM across desktop and mobile GPUs.

---

## 6. Verification Changelog & Revision History

### Verified against the Nov 1, 2026 Screen Recording (1:13, 60 fps):
* **Copyright Year:** Updated to `// Copyright © 2026` (top-left).
* **Preloader (`0:04–0:06`):** Corrected from a dual numeric counter/progress bar to a centered cycling ASCII string of `=`, `+`, and `-` (`=+==--==++`).
* **Brick HUD Overlay (`0:10` & `1:00–1:11`):** Corrected from a "two-state" behavior to a single consistent behavior. Brick IDs, node dots, and connecting lines appear on initial hover (`0:10`: IDs 51, 60, 64, 65) as well as post-loop (`1:00–1:11`: readable IDs 8, 11, 15, 17, 19, 31, 35, 40, 48, 52, 56, 61, 64, 65, 74), confirming upward numbering toward the crown and ~80 total bricks.
* **Entrance Arch Bricks (`0:10`, `1:07`):** Removed the "zero displacement" claim; arch bricks visibly lift when hovered.
* **Sound Toggle & Scroll Prompt:** Confirmed `Sound: On` displays a single small wave arc and remains On for the entire recording; confirmed `Scroll down to discover.` hides at `~0:17` and does not return after the `0:59` loop.
* **Mountain → Ice Block Transition (`0:20–0:22`):** Described accurately as a camera pull-back through dense fog with horizontal RGB-glitch bands.
* **Telemetry TEMP Values:** Replaced non-existent pairs with exact measured steady-drift sequences (`35.14 / +01.75` $\to$ `35.44 / +01.91` for Pudgy Penguins; `29.66 / -01.30` $\to$ `29.49 / -01.39` for Overpass).
* **Modal Styling & URL Timing:** Noted dark slate-navy background, corner-bracketed Close button (`┌ ┐ └ ┘`), Pudgy URL change at `~0:29`, edge-in darkening on open, and irregular noise-masked RGB dissolve on close.
* **Loop Re-Assembly (`0:58.8`):** Noted bricks reassemble from close around and just above the dome rather than high in the sky.
* **Audio Analysis (`0:00–1:13`):** Narrowed the 4.7 kHz 95% spectral roll-off peak strictly to the `0:52` window (1.05 kHz at `0:54`, 0.5 kHz at `0:56`), added the 5–6 dB transition level bumps (`0:28`, `0:42`, `0:48`, `0:58`), and tagged the chime layer interpretation as `[INFERRED]`.

### Verified against Abeto's Official Case Study (Awwwards, Sep 25, 2024):
* **Division of Work:** Credited Abeto with concepts, UI design, code, and audio implementation; credited Bureaux with moodboards, 3D assets/renders, content outline, and music/SFX production.
* **Houdini Scope:** Kept Houdini `[CONFIRMED]` strictly for "3D and textures", and consistently tagged its use for VDB authoring and procedural ice-crystal growth as `[INFERRED]`.
* **Spring Math:** Replaced frame-rate dependent per-frame lerp constants with frame-rate independent exponential damping (`1 - Math.exp(-k * dt)`).

