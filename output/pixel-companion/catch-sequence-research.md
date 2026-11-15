# Pixel companion catch scene — research and implementation notes

30 October 2026. Research only; no application files changed.

## What the supplied HTML actually implements

Inspected `C:/Users/Neel/.codex/attachments/131cbfd3-67e2-493f-8130-770ab411fa8d/Pasted text.txt` directly. It is a complete procedural emerald robot demo, not a standalone winged-ball model. It contains an LED face canvas, arms, headphone card, OrbitControls, expression controls and synthesized sound.

Reusable subset: lines 574–667 define `glassUniforms` and `emeraldGlassShaderMat`. The vertex shader provides view normal and view position; the fragment shader combines Fresnel-style rim response with emerald, gold and cyan directional highlights. This can shade a small sphere. Important limits: `gl_FragColor` uses alpha 1, so this is opaque glass-like shading rather than optical transmission/refraction. `uTime` is declared and updated but not actually consumed in the fragment shader. The input therefore does not supply a flying motion, wing geometry, catch trajectory or thrown-ball sequence.

Do not transplant the full-screen renderer, 2048-square LED face texture, whole robot shell, visor, hands, cards, OrbitControls, mood controls or autoplay-ish repeated servo chirps. For a small winged sphere, use a local scene/canvas with alpha and a single simple sphere, restrained highlights, two attached wing silhouettes, and explicit cleanup. Three ShaderMaterial is a WebGL-only custom GLSL material; built-in uniforms/attributes are supplied by Three: https://threejs.org/docs/pages/ShaderMaterial.html . A pixel-art ball is also viable, and fits the current companion without loading another renderer. This is an implementation choice, not a claim that either render style is already delivered.

## Root cause of apparent character movement

The current frame report registers extracted poses by head centre and foot baseline. That moves the body when the head deliberately turns or tilts. CSS also places different sheets in different shape boxes: base `543/724`, greeting `16/27`, emotions `4/9`; each image has different internal occupancy. Even a correct background-position value cannot preserve apparent body scale with those mismatched source transforms.

Recommended registration contract (our design decision):

1. Choose one logical source canvas for ALL clips, e.g. 320×540, one ground baseline and fixed pelvis/torso centre in that canvas.
2. Choose one global scale for the character; never normalize every frame to its own content bounds.
3. Store each cropped image's original untrimmed size and destination x/y. Keep those offsets when packing or displaying the frame. Phaser's first-party frame documentation describes exactly this distinction between source dimensions, rendering offsets and packed trim metadata: https://docs.phaser.io/api-documentation/class/textures-frame . This supports the data model; adding Phaser is unnecessary.
4. Register a stationary landmark below the neck (belt/strap crossing/pelvis), with feet baseline as a second constraint. Head and reaching hand remain free to move within the shared canvas. Reject body-scale drift instead of stretching a bad pose to match.
5. Ball and hand positions use the same logical scene coordinate system; do not measure them from changing visible sprite bounds.
6. Display the scene at one uniform scale. Reserve a fixed box before images decode; preload/decode all frames needed for the next clip before switching.

## Deterministic scene proposal

One scene controller and one accumulated visible-time clock, not independent overlapping timeouts/CSS animations:

| Visible scene time | State and action |
| --- | --- |
| 0–1s | `search`: head screen-right, hand near brow/hairline, anchored feet. |
| 1–4s | `track`: subtle head lift/outward attention; ball approaches from screen-right in a small wandering arc. |
| 4–8s | `reach`: arm extends toward screen-right; ball movement narrows into the palm. Define exact capture moment near 8s. |
| 8–10s | `bring-in`: ball attaches to a hand anchor; hands return to torso centre. Ball cannot keep flying independently after capture. |
| 10s onward | `hold`: character shows ball and waits for tap. Keep hover reactions subordinate so they do not break the held object. |
| Tap while held | `throw`: short anticipation then hand release; ball accelerates towards viewer (scale + translation), fades before covering controls; reveal real deal only once at release/completion. |
| After throw | Return to search/idle according to chosen replay policy, rather than immediately looping every effect. |
| No interaction | Start a separate inactivity duration only in hold; after a reasonable visible-time delay (proposed 8–12s), show disappointed/sad variant while retaining ball hand anchor. Do not randomly select sadness on hover. |

Early taps: choose an explicit policy. Recommend queue one tap during intro and perform throw once catch is complete; or let tap skip to hold, then second tap throws. Do not silently throw a ball that is not caught. Keyboard Enter/Space must behave like tap. Debounce throw until scene resets. Update prompt with actual phase, and keep unavailable real deals separate from ability to enjoy the character.

## Timing and visibility

`requestAnimationFrame` tracks display repaint; its timestamp must determine progression so 120Hz does not double scene speed. It is one-shot and must be rescheduled. Browsers usually pause it in background tabs: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame . Accumulate active delta only when both the document is visible and the scene intersects the viewport; reset the previous timestamp on resume so hidden time does not jump directly to catch/throw. Clamp a resumed delta rather than accumulating a multi-second frame.

Use document visibility events: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API and viewport visibility via IntersectionObserver: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API . Keep sprite-frame changes at authored frame timing, while ball trajectory can run smoothly on each animation frame. Avoid React state updates for every ball pixel; use a ref/style or a motion value, and set state only when phase/frame changes. Check the installed library version before importing APIs from current docs.

## Accessibility and sound

Reduced motion should show a static held-ball pose and let tap reveal the offer without a large approaching object or automatic scene travel. CSS media guidance: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion . Preserve user audio preference; no automatic sound for searching, wings, waiting or sadness. Optional catch/throw chime can play only following the user's enabled sound preference and browser activation. Sound failure never blocks the reveal.

## Verification checklist

- Compare every clip at actual phone and desktop size over both light/dark backgrounds; no fringe, crop rectangles, clipping, body-size jump or baseline shift.
- Check transitions search→track→reach→capture→hold→throw, not just standalone sheets.
- At capture, sphere centre meets palm; while held, sphere follows hand. At throw release, it detaches once.
- Test a tap at 0s, 5s, 10s and repeated rapid taps, keyboard, no offers, and image decode failure.
- Hide tab or scroll away at 7.5s, wait, then return: scene resumes at 7.5s without premature sadness.
- Verify no unmount timers/animation frames or WebGL resources survive; preserve real offer eligibility checks.
- Browser playback is necessary; build success alone cannot prove natural motion.
