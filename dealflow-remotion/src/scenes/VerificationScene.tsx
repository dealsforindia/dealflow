import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { PersonIcon } from "../components/PersonIcon";

export const VerificationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Helper for sequential icon entrance springs
  const getIconSpring = (startFrame: number) => {
    const f = Math.max(0, frame - startFrame);
    return spring({
      frame: f,
      fps,
      config: { damping: 13, stiffness: 90, mass: 0.8 },
    });
  };

  const p1Spring = getIconSpring(0);
  const p2Spring = getIconSpring(14);
  const p3Spring = getIconSpring(28);
  const p4Spring = getIconSpring(42);

  // Arrow drawing progresses
  const arrow1Progress = interpolate(frame, [10, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arrow2Progress = interpolate(frame, [24, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arrow3Progress = interpolate(frame, [38, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Camera subtle push-in across the sequence
  const cameraScale = interpolate(frame, [0, 94], [1.0, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit transition into Hourglass at frames 86 to 94
  const sceneOpacity = interpolate(frame, [86, 94], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const renderArrow = (progress: number) => {
    const dashoffset = 80 * (1 - progress);
    return (
      <div style={{ width: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="90" height="30" viewBox="0 0 90 30" fill="none">
          <line
            x1="5"
            y1="15"
            x2="75"
            y2="15"
            stroke="#7B61FF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="80"
            strokeDashoffset={dashoffset}
          />
          {progress > 0.6 && (
            <path
              d="M 68 8 L 78 15 L 68 22"
              stroke="#7B61FF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: sceneOpacity,
      }}
    >
      {/* Centered Row with Generous Spacing */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "36px",
          transform: `scale(${cameraScale * 1.35})`,
          padding: "0 40px",
        }}
      >
        {/* 1. Purple Person Portrait Icon */}
        <div
          style={{
            transform: `translateX(${interpolate(p1Spring, [0, 1], [-25, 0])}px) scale(${interpolate(
              p1Spring,
              [0, 1],
              [0.75, 1]
            )})`,
            opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          <PersonIcon variant="purplePortrait" size={140} color="#7B61FF" />
        </div>

        {/* Arrow 1 */}
        {renderArrow(arrow1Progress)}

        {/* 2. ID Card Icon */}
        <div
          style={{
            transform: `translateX(${interpolate(p2Spring, [0, 1], [-25, 0])}px) scale(${interpolate(
              p2Spring,
              [0, 1],
              [0.75, 1]
            )})`,
            opacity: interpolate(frame, [14, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <PersonIcon variant="idCard" size={130} color="#7B61FF" />
        </div>

        {/* Arrow 2 */}
        {renderArrow(arrow2Progress)}

        {/* 3. Document Icon */}
        <div
          style={{
            transform: `translateX(${interpolate(p3Spring, [0, 1], [-25, 0])}px) scale(${interpolate(
              p3Spring,
              [0, 1],
              [0.75, 1]
            )})`,
            opacity: interpolate(frame, [28, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <PersonIcon variant="document" size={120} color="#7B61FF" />
        </div>

        {/* Arrow 3 */}
        {renderArrow(arrow3Progress)}

        {/* 4. Device / Card Reader */}
        <div
          style={{
            transform: `translateX(${interpolate(p4Spring, [0, 1], [-25, 0])}px) scale(${interpolate(
              p4Spring,
              [0, 1],
              [0.75, 1]
            )})`,
            opacity: interpolate(frame, [42, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <PersonIcon variant="cardReader" size={120} color="#7B61FF" />
        </div>
      </div>
    </AbsoluteFill>
  );
};
