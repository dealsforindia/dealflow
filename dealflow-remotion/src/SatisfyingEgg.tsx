import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  Sequence,
} from "remotion";

/**
 * SatisfyingEgg
 * High-end cinematic egg animation inspired by Pixar & Scandinavian 3D motion design.
 * Features:
 * - True squash & stretch physics with volume preservation
 * - Dynamic contact shadow and floor ambient occlusion
 * - Moving specular highlights that react to rotation
 * - Kintsugi golden crack emergence with weightless levitation
 * - Fully synchronized sound design (thud, wobble whoosh, golden chime)
 */
export const SatisfyingEgg: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ================= 1. DROP & BOUNCE PHYSICS (Frames 0 - 65) =================
  // Drop descent from top (Y: -500 to 0)
  const dropProgress = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 85, mass: 1.2 },
  });
  const dropY = interpolate(dropProgress, [0, 1], [-550, 0]);

  // Squash & Stretch Math (Preserves Egg Volume: scaleX * scaleY ~= 1.0)
  // Landing impact happens around frame 20-28
  const impactSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 7, stiffness: 180, mass: 0.8 },
  });

  // Elastic compression at impact, then spring back
  const squashX = interpolate(
    impactSpring,
    [0, 0.3, 0.6, 1],
    [1.0, 1.24, 0.9, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const squashY = interpolate(
    impactSpring,
    [0, 0.3, 0.6, 1],
    [1.0, 0.78, 1.12, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ================= 2. THE CURIOUS WOBBLE & SPIN (Frames 60 - 125) =================
  const wobble1 = Math.sin((frame - 60) * 0.18) * 14;
  const wobbleDecay = interpolate(frame, [60, 115], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eggRotation = wobble1 * wobbleDecay;

  // ================= 3. LEVITATION & GOLDEN KINTSUGI CRACK (Frames 125 - 200) =================
  const floatSpring = spring({
    frame: frame - 125,
    fps,
    config: { damping: 14, stiffness: 60, mass: 1.4 },
  });
  const floatY = interpolate(floatSpring, [0, 1], [0, -90]);

  // Gentle weightless hover wave while suspended
  const hoverWave = frame > 140 ? Math.sin((frame - 140) * 0.08) * 8 : 0;

  // Golden crack line expansion (Frames 135 - 175)
  const crackProgress = interpolate(frame, [135, 175], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const crackGlow = interpolate(frame, [145, 185], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shell top separation (Frames 155 - 195)
  const openSpring = spring({
    frame: frame - 150,
    fps,
    config: { damping: 12, stiffness: 75, mass: 0.9 },
  });
  const topShellY = interpolate(openSpring, [0, 1], [0, -48]);
  const topShellRotate = interpolate(openSpring, [0, 1], [0, -9]);

  // Golden inner yolk reveal
  const yolkScale = interpolate(openSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ================= 4. GENTLE LANDING & RESEAL (Frames 200 - 240) =================
  const closeSpring = spring({
    frame: frame - 200,
    fps,
    config: { damping: 13, stiffness: 90, mass: 1.1 },
  });
  const returnY = interpolate(closeSpring, [0, 1], [0, 90]);
  const resealGap = interpolate(closeSpring, [0, 1], [1, 0]);

  // Total Y position calculation
  const totalY = dropY + floatY + hoverWave + returnY;

  // ================= 5. CONTACT SHADOW DYNAMICS =================
  // Shadow expands & sharpens when close to floor; blurs & fades when egg floats
  const distanceFromFloor = Math.max(0, -totalY);
  const shadowWidth = interpolate(distanceFromFloor, [0, 500], [240 * squashX, 50], {
    extrapolateRight: "clamp",
  });
  const shadowHeight = interpolate(distanceFromFloor, [0, 500], [38 * squashY, 10], {
    extrapolateRight: "clamp",
  });
  const shadowOpacity = interpolate(distanceFromFloor, [0, 500], [0.45, 0.04], {
    extrapolateRight: "clamp",
  });
  const shadowBlur = interpolate(distanceFromFloor, [0, 500], [8, 38], {
    extrapolateRight: "clamp",
  });

  // Specular light highlight position shifts with rotation
  const specularOffsetX = interpolate(eggRotation, [-15, 15], [30, -30]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F3EEE7", // Warm, calming Scandinavian studio backdrop
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* ================= AUDIO CHOREOGRAPHY ================= */}
      {/* Soft ambient studio tone */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <Audio
          src={staticFile("audio/bgm.mp3")}
          volume={(f) =>
            interpolate(f, [0, 30, durationInFrames - 30, durationInFrames], [0, 0.22, 0.22, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>

      {/* Frame 18: Satisfying Landing Thud */}
      <Sequence from={18} durationInFrames={40}>
        <Audio src={staticFile("audio/thud.wav")} volume={0.65} />
      </Sequence>

      {/* Frame 65: Playful Wobble Whoosh */}
      <Sequence from={65} durationInFrames={35}>
        <Audio src={staticFile("audio/whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Frame 148: Golden Chime / Bling on crack reveal */}
      <Sequence from={148} durationInFrames={60}>
        <Audio src={staticFile("audio/bling.wav")} volume={0.7} />
      </Sequence>

      {/* Frame 208: Soft Click as shell settles */}
      <Sequence from={208} durationInFrames={30}>
        <Audio src={staticFile("audio/click.mp3")} volume={0.4} />
      </Sequence>

      {/* ================= STUDIO LIGHTING ENVIRONMENT ================= */}
      {/* Soft Overhead Keylight Glow */}
      <div
        style={{
          position: "absolute",
          width: "900px",
          height: "900px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.75) 0%, rgba(243, 238, 231, 0) 70%)",
          top: "10%",
          pointerEvents: "none",
        }}
      />

      {/* Floor Contact Shadow */}
      <div
        style={{
          position: "absolute",
          bottom: "340px",
          width: `${shadowWidth}px`,
          height: `${shadowHeight}px`,
          borderRadius: "50%",
          backgroundColor: "#2E241E",
          opacity: shadowOpacity,
          filter: `blur(${shadowBlur}px)`,
          transform: "translateY(18px)",
          transition: "none",
        }}
      />

      {/* ================= THE LIVING EGG CONTAINER ================= */}
      <div
        style={{
          position: "relative",
          transform: `translateY(${totalY}px) scaleX(${squashX}) scaleY(${squashY}) rotate(${eggRotation}deg)`,
          transformOrigin: "bottom center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="360"
          height="480"
          viewBox="0 0 360 480"
          fill="none"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Porcelain Eggshell Shading Gradient */}
            <radialGradient
              id="eggBodyGrad"
              cx="38%"
              cy="34%"
              r="62%"
              fx="32%"
              fy="28%"
            >
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="38%" stopColor="#FFF8F0" />
              <stop offset="72%" stopColor="#F5E8DA" />
              <stop offset="92%" stopColor="#E6D3C0" />
              <stop offset="100%" stopColor="#CCA88C" />
            </radialGradient>

            {/* Warm Ambient Rim Bounce Light */}
            <linearGradient id="rimLight" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 225, 195, 0.4)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>

            {/* Glowing Golden Yolk Core */}
            <radialGradient id="yolkGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="35%" stopColor="#FBBF24" />
              <stop offset="85%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>

            {/* Golden Kintsugi Seam Glow */}
            <filter id="goldenGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Golden Core Yolk (Appears when top lifts) */}
          {frame >= 140 && (
            <g transform={`translate(180, 245) scale(${yolkScale}) translate(-180, -245)`}>
              <circle
                cx="180"
                cy="245"
                r="64"
                fill="url(#yolkGrad)"
                filter="url(#goldenGlow)"
              />
              {/* Inner Golden Specular Sheen */}
              <ellipse
                cx="160"
                cy="225"
                rx="20"
                ry="12"
                fill="rgba(255, 255, 255, 0.75)"
                transform="rotate(-25 160 225)"
              />
            </g>
          )}

          {/* LOWER SHELL BODY (The Foundation) */}
          <path
            d="M 50 240 C 50 360, 110 440, 180 440 C 250 440, 310 360, 310 240 C 310 240, 240 242, 180 240 C 120 238, 50 240, 50 240 Z"
            fill="url(#eggBodyGrad)"
          />

          {/* LOWER SHELL RIM ACCENT */}
          <path
            d="M 50 240 C 50 360, 110 440, 180 440 C 250 440, 310 360, 310 240"
            stroke="url(#rimLight)"
            strokeWidth="3"
            fill="none"
          />

          {/* UPPER SHELL (Lifts up and tilts gracefully) */}
          <g
            transform={`translate(0, ${topShellY * resealGap}) rotate(${topShellRotate * resealGap}, 180, 240)`}
          >
            <path
              d="M 50 240 C 50 140, 105 40, 180 40 C 255 40, 310 140, 310 240 C 310 240, 240 238, 180 240 C 120 242, 50 240, 50 240 Z"
              fill="url(#eggBodyGrad)"
            />

            {/* Porcelain Specular Sheen (Curved Highlight) */}
            <ellipse
              cx={135 + specularOffsetX * 0.4}
              cy="125"
              rx="38"
              ry="75"
              fill="rgba(255, 255, 255, 0.55)"
              transform="rotate(-28 135 125)"
              filter="blur(5px)"
            />
          </g>

          {/* KINTSUGI GOLDEN CRACK SEAM (Grows & Glows at Frame 135) */}
          {crackProgress > 0 && (
            <g opacity={crackProgress}>
              <path
                d="M 55 240 Q 115 236 145 246 T 215 238 T 305 242"
                stroke="#F59E0B"
                strokeWidth={3 + crackGlow * 3}
                strokeLinecap="round"
                fill="none"
                filter="url(#goldenGlow)"
              />
              <path
                d="M 55 240 Q 115 236 145 246 T 215 238 T 305 242"
                stroke="#FFFBEB"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Floating Golden Sparks / Stardust (Frames 145 - 200) */}
          {frame >= 145 && frame <= 215 && (
            <g>
              {[...Array(8)].map((_, i) => {
                const sparkAngle = (i * 45 * Math.PI) / 180;
                const sparkDistance = interpolate(frame, [145, 195], [10, 85 + (i % 3) * 20]);
                const sparkOpacity = interpolate(frame, [145, 175, 210], [0, 1, 0]);
                const sparkX = 180 + Math.cos(sparkAngle) * sparkDistance;
                const sparkY = 240 + Math.sin(sparkAngle) * sparkDistance * 0.6;
                return (
                  <circle
                    key={i}
                    cx={sparkX}
                    cy={sparkY}
                    r={2 + (i % 2)}
                    fill="#FBBF24"
                    opacity={sparkOpacity}
                    filter="url(#goldenGlow)"
                  />
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Subtle Minimal Typography at Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 0.45, 0.45, 0]),
          letterSpacing: "4px",
          fontSize: "14px",
          fontWeight: 700,
          color: "#8C7D73",
          textTransform: "uppercase",
        }}
      >
        <span>K I N T S U G I</span>
        <span style={{ fontSize: "11px", letterSpacing: "2px", marginTop: "4px", opacity: 0.7 }}>
          THE LIVING FORM
        </span>
      </div>
    </AbsoluteFill>
  );
};
