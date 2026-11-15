import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from "remotion";
import { Hourglass } from "../components/Hourglass";

export const HourglassScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera zooms close into the hourglass so it dominates the frame
  const cameraScale = interpolate(frame, [0, 141], [1.08, 1.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Entrance opacity
  const sceneOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F8FAFC",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: sceneOpacity,
      }}
    >
      {/* Subtle radial focus vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(241,245,249,0.8) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Dominant Hourglass Component Container with Camera Push */}
      <div
        style={{
          transform: `scale(${cameraScale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Hourglass frame={frame} fps={fps} size={620} />
      </div>
    </AbsoluteFill>
  );
};
