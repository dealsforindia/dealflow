import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { AgreementCard } from "../components/AgreementCard";

export const AgreementCardsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered spring entrances for the 3 cards sliding diagonally into composition
  const card1Spring = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: { damping: 14, stiffness: 85, mass: 0.9 },
  });

  const card2Spring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 85, mass: 0.9 },
  });

  const card3Spring = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 14, stiffness: 85, mass: 0.9 },
  });

  // Diagonal slide-in coordinates:
  // Card 1 enters from bottom-left
  const card1X = interpolate(card1Spring, [0, 1], [-260, 0]);
  const card1Y = interpolate(card1Spring, [0, 1], [300, 30]);

  // Card 2 enters from bottom center
  const card2X = interpolate(card2Spring, [0, 1], [0, 0]);
  const card2Y = interpolate(card2Spring, [0, 1], [350, -10]);

  // Card 3 enters from bottom-right
  const card3X = interpolate(card3Spring, [0, 1], [260, 0]);
  const card3Y = interpolate(card3Spring, [0, 1], [320, 20]);

  // Subtle camera pan sweeping across the group from left to right (frame 0 to 121)
  const cameraPanX = interpolate(frame, [0, 121], [60, -90], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cameraScale = interpolate(frame, [0, 121], [1.02, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Rapid white fade-out at the very end (frame 110 to 121) to prepare for Scene 4
  const whiteTransition = interpolate(frame, [112, 121], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
      {/* Dynamic diagonal stripe texture for neon visual energy */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.03) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Floating UI Cards Container with Camera Pan & Scale */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "50px",
          transform: `translateX(${cameraPanX}px) scale(${cameraScale})`,
          width: "1600px",
        }}
      >
        {/* CARD 1 (Left): "Review agreements" */}
        <div style={{ zIndex: 1 }}>
          <AgreementCard
            title="Review agreements"
            subtitle="Please read and accept the terms of the customer agreement."
            category="agreements"
            buttonText="Agree & Continue"
            rotation={-6.5}
            scale={0.96}
            xOffset={card1X}
            yOffset={card1Y}
          />
        </div>

        {/* CARD 2 (Center Hero): "We've got you covered" */}
        <div style={{ zIndex: 3 }}>
          <AgreementCard
            title="We've got you covered"
            subtitle="Your assets and data are protected with industry-leading coverage."
            category="coverage"
            buttonText="Confirm Coverage"
            rotation={1.8}
            scale={1.06}
            xOffset={card2X}
            yOffset={card2Y}
          />
        </div>

        {/* CARD 3 (Right): "Help us verify your identity" */}
        <div style={{ zIndex: 2 }}>
          <AgreementCard
            title="Help us verify your identity"
            subtitle="Government regulations require us to verify your profile identity."
            category="identity"
            buttonText="Scan Photo ID"
            rotation={7.2}
            scale={0.97}
            progressPercent={85}
            xOffset={card3X}
            yOffset={card3Y}
          />
        </div>
      </div>

      {/* Flash wipe into Scene 4 */}
      {whiteTransition > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#FFFFFF",
            opacity: whiteTransition,
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
