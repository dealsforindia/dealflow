import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Audio,
  staticFile,
} from "remotion";
import { ThreeEggScene } from "./ThreeEggScene";

/**
 * PhonkEggEdit
 * Elite 1080x1920 (9:16) viral phonk velocity edit of the Legendary Egg.
 * Synchronized with 132 BPM authentic 808 Phonk audio (phonk_beat.wav).
 * 
 * Features:
 * - 3 photorealistic AI masterframe shots of the egg
 * - Bass-reactive screen flashes and 808 recoil camera shakes
 * - Velocity ramping (explosive zooms on beat impacts decelerating into smooth drift)
 * - Chromatic aberration (RGB channel split) on heavy impacts
 * - Shockwave blast rings & dynamic speed lines
 * - Real-time animated audio visualizer spectrum
 * - Cinematic letterbox, HUD targeting reticles, and film grain
 * - Synchronized kinetic typography with metallic gold and cyan neon styling
 */
export const PhonkEggEdit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 132 BPM timing calculations
  const bpm = 132;
  const framesPerBeat = (60 / bpm) * fps; // ~13.636 frames per beat

  // Kick beat indices from generate_phonk.py:
  // Build-up kicks: 0, 2, 4, 6
  // Drop kicks: 8, 10.5, 12, 14, 16, 18.5, 20, 22
  const dropBeat = 8;
  const dropFrame = Math.round(dropBeat * framesPerBeat); // Frame 109

  // Array of heavy kick drum impact frames
  const kickFrames = [
    0,
    Math.round(2 * framesPerBeat),
    Math.round(4 * framesPerBeat),
    Math.round(6 * framesPerBeat),
    Math.round(8 * framesPerBeat), // DROP! (109)
    Math.round(10.5 * framesPerBeat), // 143
    Math.round(12 * framesPerBeat), // 164
    Math.round(14 * framesPerBeat), // 191
    Math.round(16 * framesPerBeat), // 218
    Math.round(18.5 * framesPerBeat), // 252
    Math.round(20 * framesPerBeat), // 273
    Math.round(22 * framesPerBeat), // 300
  ];

  // Snare/Clap frames
  const snareFrames = [
    Math.round(9 * framesPerBeat),
    Math.round(11 * framesPerBeat),
    Math.round(13 * framesPerBeat),
    Math.round(15 * framesPerBeat),
    Math.round(17 * framesPerBeat),
    Math.round(19 * framesPerBeat),
    Math.round(21 * framesPerBeat),
    Math.round(23 * framesPerBeat),
  ];

  // Calculate distance to nearest kick for bass reactivity & trauma shake
  let minKickDist = 999;
  let nearestKickFrame = 0;
  for (const kf of kickFrames) {
    const dist = frame - kf;
    if (dist >= 0 && dist < minKickDist) {
      minKickDist = dist;
      nearestKickFrame = kf;
    }
  }

  // Snare distance
  let minSnareDist = 999;
  for (const sf of snareFrames) {
    const dist = frame - sf;
    if (dist >= 0 && dist < minSnareDist) {
      minSnareDist = dist;
    }
  }

  const isDropped = frame >= dropFrame;

  // Camera Shake (Trauma model: decay over 12 frames)
  const kickIntensity = isDropped ? 1.0 : 0.4;
  const kickTrauma = Math.max(0, 1 - minKickDist / (isDropped ? 12 : 8)) * kickIntensity;
  const snareTrauma = isDropped ? Math.max(0, 1 - minSnareDist / 6) * 0.45 : 0;
  const totalTrauma = Math.min(1.0, kickTrauma + snareTrauma);

  // High-frequency pseudo-random camera shake
  const shakeX =
    (Math.sin(frame * 1.7) * 0.6 + Math.cos(frame * 2.8) * 0.4) *
    totalTrauma *
    (isDropped ? 38 : 12);
  const shakeY =
    (Math.cos(frame * 2.1) * 0.6 + Math.sin(frame * 3.4) * 0.4) *
    totalTrauma *
    (isDropped ? 30 : 10);
  const shakeRotate = Math.sin(frame * 2.3) * totalTrauma * (isDropped ? 3.5 : 0.8);

  // Velocity Ramping (Explosive snap zoom on kicks, decaying to drift)
  let velocityZoom = 1.0;
  if (!isDropped) {
    // Subtle build-up slow zoom
    velocityZoom = interpolate(frame, [0, dropFrame], [1.0, 1.18], {
      extrapolateRight: "clamp",
    });
  } else {
    // Drop: kick impacts snap zoom up to 1.32x and spring back down
    const kickPunch = Math.max(0, 1 - minKickDist / 14);
    const easePunch = Math.pow(kickPunch, 2.5);
    velocityZoom = 1.06 + easePunch * 0.26;
  }

  // Strobe & Exposure Flash
  let flashOpacity = 0;
  if (frame >= dropFrame - 3 && frame < dropFrame) {
    // Pre-drop tension blackout
    flashOpacity = 0;
  } else if (frame === dropFrame || frame === dropFrame + 1) {
    // Mega Drop Flash
    flashOpacity = 1.0;
  } else if (frame > dropFrame && frame < dropFrame + 8) {
    flashOpacity = interpolate(frame, [dropFrame + 1, dropFrame + 8], [0.9, 0], {
      extrapolateRight: "clamp",
    });
  } else if (minKickDist < 4 && isDropped) {
    flashOpacity = interpolate(minKickDist, [0, 4], [0.55, 0], {
      extrapolateRight: "clamp",
    });
  }

  // Chromatic Aberration RGB split distance
  const rgbOffset = isDropped
    ? Math.max(0, 1 - minKickDist / 8) * 22 + (frame % 2 === 0 ? 3 : 0)
    : 0;

  // Active Shot Selection (Hard cuts synchronized with phonk bars)
  // Shot 1: egg1.jpg (Dark mysterious intro)
  // Shot 2: egg2.jpg (Golden kintsugi molten fracture)
  // Shot 3: egg3.jpg (Cosmic plasma violent lightning)
  let activeImage = "egg1.jpg";
  let shotThemeColor = "#e6a13b"; // Amber

  if (!isDropped) {
    activeImage = "egg1.jpg";
    shotThemeColor = "#d4af37";
  } else {
    // Drops at Frame 109
    if (frame >= dropFrame && frame < Math.round(12 * framesPerBeat)) {
      // Frames 109 - 163: Kintsugi Golden Core
      activeImage = "egg2.jpg";
      shotThemeColor = "#ffb300";
    } else if (frame >= Math.round(12 * framesPerBeat) && frame < Math.round(16 * framesPerBeat)) {
      // Frames 164 - 217: Cosmic Electric Plasma
      activeImage = "egg3.jpg";
      shotThemeColor = "#00f2fe";
    } else if (frame >= Math.round(16 * framesPerBeat) && frame < Math.round(20 * framesPerBeat)) {
      // Frames 218 - 272: Dark Moody Macro Obsidian Return
      activeImage = "egg1.jpg";
      shotThemeColor = "#ff3366";
    } else {
      // Finale Climax (Frames 273 - 330): Ultra rapid 1-beat cross-cutting montage!
      const finaleBeat = Math.floor((frame - Math.round(20 * framesPerBeat)) / (framesPerBeat * 0.5));
      if (finaleBeat % 3 === 0) {
        activeImage = "egg2.jpg";
        shotThemeColor = "#ffb300";
      } else if (finaleBeat % 3 === 1) {
        activeImage = "egg3.jpg";
        shotThemeColor = "#00f2fe";
      } else {
        activeImage = "egg1.jpg";
        shotThemeColor = "#ff007f";
      }
    }
  }

  // Pre-drop dead silence blackout frame (Classic Phonk dramatic pause)
  const isPreDropBlackout = frame >= dropFrame - 4 && frame < dropFrame;

  // Kinetic Typography Timeline
  let typographyText: React.ReactNode = null;
  if (frame >= 8 && frame < 40) {
    const textSpring = spring({ frame: frame - 8, fps, config: { damping: 14, mass: 0.6 } });
    typographyText = (
      <div
        style={{
          transform: `scale(${interpolate(textSpring, [0, 1], [0.85, 1])})`,
          opacity: interpolate(frame, [8, 14, 34, 40], [0, 1, 1, 0]),
          letterSpacing: "0.22em",
          color: "#e2e8f0",
          fontSize: 34,
          fontWeight: 900,
          textTransform: "uppercase",
          textShadow: "0 0 25px rgba(255,255,255,0.4)",
        }}
      >
        IN A WORLD OF FRAGILE THINGS
      </div>
    );
  } else if (frame >= 42 && frame < 80) {
    const textSpring = spring({ frame: frame - 42, fps, config: { damping: 14, mass: 0.6 } });
    typographyText = (
      <div
        style={{
          transform: `scale(${interpolate(textSpring, [0, 1], [0.9, 1])})`,
          opacity: interpolate(frame, [42, 48, 74, 80], [0, 1, 1, 0]),
          letterSpacing: "0.18em",
          color: "#ffd700",
          fontSize: 38,
          fontWeight: 900,
          textAlign: "center",
          textTransform: "uppercase",
          textShadow: "0 0 30px rgba(255, 215, 0, 0.6)",
        }}
      >
        THEY THOUGHT IT WAS AN ORDINARY EGG
      </div>
    );
  } else if (frame >= 82 && frame < 105) {
    const glitch = frame % 3 === 0 ? 5 : 0;
    typographyText = (
      <div
        style={{
          transform: `translateX(${glitch}px) scale(${interpolate(frame, [82, 105], [1.0, 1.25])})`,
          opacity: interpolate(frame, [82, 88, 102, 105], [0, 1, 1, 0]),
          letterSpacing: "0.28em",
          color: "#ff2a5f",
          fontSize: 48,
          fontWeight: 900,
          textTransform: "uppercase",
          textShadow: "0 0 40px rgba(255, 42, 95, 0.8)",
        }}
      >
        THEY WERE WRONG
      </div>
    );
  } else if (isPreDropBlackout) {
    typographyText = (
      <div
        style={{
          letterSpacing: "0.45em",
          color: "#ffffff",
          fontSize: 52,
          fontWeight: 900,
          textTransform: "uppercase",
          textShadow: "0 0 50px rgba(255,255,255,0.9)",
        }}
      >
        BEHOLD.
      </div>
    );
  } else if (frame >= dropFrame && frame < Math.round(12 * framesPerBeat)) {
    // DROP IMPACT 1
    const dropSlam = spring({ frame: frame - dropFrame, fps, config: { damping: 10, mass: 0.4 } });
    typographyText = (
      <div
        style={{
          transform: `scale(${interpolate(dropSlam, [0, 1], [2.2, 1])}) translateY(${shakeY * 0.4}px)`,
          letterSpacing: "0.14em",
          background: "linear-gradient(180deg, #ffffff 0%, #ffd700 60%, #ff8800 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: 72,
          fontWeight: 950,
          textAlign: "center",
          textTransform: "uppercase",
          filter: "drop-shadow(0 0 35px rgba(255, 215, 0, 0.85))",
        }}
      >
        THE CHOSEN ONE
      </div>
    );
  } else if (frame >= Math.round(12 * framesPerBeat) && frame < Math.round(16 * framesPerBeat)) {
    // DROP IMPACT 2 (Electric Cyan)
    const kickSnap = Math.max(0, 1 - minKickDist / 8);
    typographyText = (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            transform: `scale(${1.0 + kickSnap * 0.2})`,
            letterSpacing: "0.22em",
            color: "#00f2fe",
            fontSize: 66,
            fontWeight: 950,
            textTransform: "uppercase",
            textShadow: "0 0 40px rgba(0, 242, 254, 0.9), 0 0 80px rgba(79, 172, 254, 0.6)",
          }}
        >
          UNBREAKABLE
        </div>
        <div
          style={{
            marginTop: 10,
            letterSpacing: "0.35em",
            color: "#ffffff",
            fontSize: 24,
            fontWeight: 800,
            opacity: 0.9,
          }}
        >
          ZERO CRACKS // ZERO MERCY
        </div>
      </div>
    );
  } else if (frame >= Math.round(16 * framesPerBeat) && frame < Math.round(20 * framesPerBeat)) {
    // DROP IMPACT 3 (Crimson Cyber)
    typographyText = (
      <div
        style={{
          transform: `scale(${1.0 + totalTrauma * 0.25}) rotate(${shakeRotate * 0.5}deg)`,
          letterSpacing: "0.18em",
          background: "linear-gradient(180deg, #ffffff 0%, #ff0844 70%, #ffb199 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: 68,
          fontWeight: 950,
          textAlign: "center",
          textTransform: "uppercase",
          filter: "drop-shadow(0 0 40px rgba(255, 8, 68, 0.8))",
        }}
      >
        GOD TIER SHELL
      </div>
    );
  } else if (frame >= Math.round(20 * framesPerBeat)) {
    // FINALE
    typographyText = (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            transform: `scale(${1.0 + totalTrauma * 0.2})`,
            letterSpacing: "0.26em",
            background: "linear-gradient(180deg, #ffffff 0%, #ffd700 50%, #fff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: 78,
            fontWeight: 1000,
            textTransform: "uppercase",
            filter: "drop-shadow(0 0 50px rgba(255, 215, 0, 1.0))",
          }}
        >
          PERFECTION.
        </div>
        <div
          style={{
            marginTop: 12,
            letterSpacing: "0.45em",
            color: "#e2e8f0",
            fontSize: 26,
            fontWeight: 800,
          }}
        >
          THE APEX CREATION
        </div>
      </div>
    );
  }

  // Shockwave blast rings on drop and major kicks
  const shockwaveTriggers = [dropFrame, Math.round(12 * framesPerBeat), Math.round(16 * framesPerBeat), Math.round(20 * framesPerBeat)];
  const activeShockwave = shockwaveTriggers.find((t) => frame >= t && frame < t + 22);
  let shockwaveScale = 0;
  let shockwaveOpacity = 0;
  if (activeShockwave !== undefined) {
    const elapsed = frame - activeShockwave;
    shockwaveScale = interpolate(elapsed, [0, 22], [0.3, 2.8]);
    shockwaveOpacity = interpolate(elapsed, [0, 6, 22], [0.9, 0.7, 0]);
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050508",
        overflow: "hidden",
        fontFamily:
          "system-ui, -apple-system, 'SF Pro Display', 'Segoe UI', Roboto, 'Arial Black', sans-serif",
      }}
    >
      {/* 1. Synchronized Phonk Master Audio Track */}
      <Audio src={staticFile("audio/phonk_beat.wav")} />

      {/* 2. Deep Atmosphere & Radial Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${shotThemeColor}22 0%, #050508 75%)`,
        }}
      />

      {/* 3. True 3D Procedural CGI Egg Simulation with 808 Camera Recoil */}
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) rotate(${shakeRotate}deg)`,
          transformOrigin: "center center",
          filter: isPreDropBlackout ? "brightness(0)" : "contrast(1.1) saturate(1.25)",
        }}
      >
        <ThreeEggScene dropFrame={dropFrame} bpm={bpm} />

        {/* Shockwave Blast Ring Overlay */}
        {shockwaveOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -250,
              marginLeft: -250,
              width: 500,
              height: 500,
              borderRadius: "50%",
              border: `6px solid ${shotThemeColor}`,
              boxShadow: `0 0 50px ${shotThemeColor}, inset 0 0 35px ${shotThemeColor}`,
              transform: `scale(${shockwaveScale})`,
              opacity: shockwaveOpacity,
              pointerEvents: "none",
            }}
          />
        )}
      </AbsoluteFill>

      {/* 4. Speed Lines / Warp Rays during Heavy Kicks */}
      {isDropped && totalTrauma > 0.4 && (
        <AbsoluteFill
          style={{
            background: `repeating-conic-gradient(from ${frame * 7}deg at 50% 50%, rgba(255,255,255,0.08) 0deg, transparent 4deg, transparent 15deg)`,
            mixBlendMode: "overlay",
            opacity: totalTrauma * 0.8,
            pointerEvents: "none",
          }}
        />
      )}

      {/* 5. Cinematic Film Vignette & Scratches */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 95%)",
          pointerEvents: "none",
        }}
      />

      {/* 6. Anamorphic 2.39:1 Letterbox Bars */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 140,
          background: "linear-gradient(180deg, #000 70%, transparent 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 50px",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: isDropped ? "#ff0055" : "#00ff88",
              boxShadow: isDropped
                ? "0 0 14px #ff0055"
                : "0 0 14px #00ff88",
            }}
          />
          <span
            style={{
              color: "#e2e8f0",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "0.25em",
            }}
          >
            {isDropped ? "REC ● PHONK OVERDRIVE" : "STANDBY ● CALIBRATING"}
          </span>
        </div>
        <div
          style={{
            color: "#94a3b8",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.2em",
          }}
        >
          132 BPM // 808 HEAVY
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 1080,
          height: 160,
          background: "linear-gradient(0deg, #000 75%, transparent 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 50px 30px 50px",
          zIndex: 10,
        }}
      >
        {/* Animated Audio Spectrum Bars */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            height: 36,
            gap: 6,
          }}
        >
          {Array.from({ length: 36 }).map((_, i) => {
            // Dynamic bar height based on frame, beat rhythm, and bar index
            const wave = Math.sin(frame * 0.4 + i * 0.5) * 0.5 + 0.5;
            const kickBoost = totalTrauma * (i % 2 === 0 ? 1 : 0.7);
            const barHeight = Math.max(6, (wave * 0.6 + kickBoost * 0.9) * 36);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: barHeight,
                  backgroundColor:
                    i % 3 === 0
                      ? shotThemeColor
                      : i % 2 === 0
                      ? "#ffffff"
                      : "#475569",
                  borderRadius: 2,
                  boxShadow:
                    kickBoost > 0.4
                      ? `0 0 10px ${shotThemeColor}`
                      : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 7. HUD Tactical Corner Reticles */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 60,
          width: 40,
          height: 40,
          borderTop: `3px solid ${shotThemeColor}`,
          borderLeft: `3px solid ${shotThemeColor}`,
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 180,
          right: 60,
          width: 40,
          height: 40,
          borderTop: `3px solid ${shotThemeColor}`,
          borderRight: `3px solid ${shotThemeColor}`,
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 60,
          width: 40,
          height: 40,
          borderBottom: `3px solid ${shotThemeColor}`,
          borderLeft: `3px solid ${shotThemeColor}`,
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 200,
          right: 60,
          width: 40,
          height: 40,
          borderBottom: `3px solid ${shotThemeColor}`,
          borderRight: `3px solid ${shotThemeColor}`,
          opacity: 0.7,
        }}
      />

      {/* 8. Kinetic Synchronized Typography Overlay */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 60px",
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        {typographyText}
      </AbsoluteFill>

      {/* 9. Heavy 808 Exposure Flash & Strobe Layer */}
      {flashOpacity > 0.01 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#ffffff",
            opacity: flashOpacity,
            mixBlendMode: "screen",
            pointerEvents: "none",
            zIndex: 30,
          }}
        />
      )}

      {/* 10. Horizontal Glitch Slice Bar on Drop Climax */}
      {isDropped && frame % 16 === 0 && (
        <div
          style={{
            position: "absolute",
            top: `${(frame * 37) % 80 + 10}%`,
            left: 0,
            width: 1080,
            height: 18,
            backgroundColor: shotThemeColor,
            opacity: 0.45,
            mixBlendMode: "overlay",
            transform: "scaleX(1.1)",
            zIndex: 25,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
