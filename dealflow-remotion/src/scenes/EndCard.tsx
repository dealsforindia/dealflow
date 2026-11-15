import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { FeatherLogo } from "../components/FeatherLogo";

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Clean, subtle entrance
  // Opacity 0 -> 1 over 8 frames
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Scale 0.96 -> 1.0 with subtle ease
  const scaleSpring = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 90,
      mass: 0.8,
    },
  });
  const scale = interpolate(scaleSpring, [0, 1], [0.96, 1.0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#CCFF00",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Centered Brand Mark & Wordmark */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "28px",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        {/* Robinhood Feather Mark in Matte Black */}
        <div
          style={{
            width: "160px",
            height: "160px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FeatherLogo size={160} color="#000000" />
        </div>

        {/* Wordmark: Robinhood */}
        <h1
          style={{
            margin: 0,
            padding: 0,
            fontSize: "84px",
            fontWeight: 800,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            letterSpacing: "-2.5px",
            color: "#000000",
            lineHeight: 1,
          }}
        >
          Robinhood
        </h1>
      </div>
    </AbsoluteFill>
  );
};
