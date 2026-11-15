import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from "remotion";
import { IsometricCity } from "../components/IsometricCity";
import { FeatherLogo } from "../components/FeatherLogo";
import { FloatingParticles } from "../components/FloatingParticles";

export const CityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle Parallax motions
  const parallaxBg = -frame * 0.4;
  const parallaxFg = -frame * 1.2;

  // Camera gradual push toward coin:
  // 0 - 60 (0 - 2s): gentle push 1.0 -> 1.15
  // 60 - 120 (2 - 4s): accelerated push 1.15 -> 2.6
  const cameraScale =
    frame < 60
      ? interpolate(frame, [0, 60], [1.0, 1.15], { extrapolateRight: "clamp" })
      : interpolate(frame, [60, 120], [1.15, 2.6], { extrapolateRight: "clamp" });

  // Center coin gentle floating bob
  const coinBobY = Math.sin(frame * 0.08) * 8;
  const coinTilt = Math.sin(frame * 0.05) * 4;

  // Dark transition overlay starting around frame 105 to frame 120
  const darkTransition = interpolate(frame, [105, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Coin gleam reflection angle
  const gleamOffset = interpolate(frame, [0, 120], [-100, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Mote particles around coin
  const particles = [
    { x: 860, y: 460, size: 8, color: "#CCFF00", delay: 0 },
    { x: 1060, y: 440, size: 10, color: "#00C805", delay: 5 },
    { x: 880, y: 580, size: 6, color: "#FFD028", delay: 8 },
    { x: 1040, y: 590, size: 8, color: "#CCFF00", delay: 12 },
    { x: 960, y: 380, size: 10, color: "#FFFFFF", delay: 15 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#E8F5E9", overflow: "hidden" }}>
      {/* City Parallax World Container with Camera Scale */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${cameraScale})`,
          transformOrigin: "960px 520px",
        }}
      >
        <IsometricCity parallaxBg={parallaxBg} parallaxFg={parallaxFg} frame={frame} />

        {/* Ambient floating motes around the center */}
        <FloatingParticles particles={particles} frame={frame} baseOpacity={0.8} />

        {/* Large Green Robinhood Coin / Token in Center Foreground */}
        <div
          style={{
            position: "absolute",
            left: "960px",
            top: "520px",
            transform: `translate(-50%, -50%) translateY(${coinBobY}px) rotate(${coinTilt}deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Coin Outer Shadow */}
          <div
            style={{
              position: "absolute",
              width: "300px",
              height: "70px",
              borderRadius: "50%",
              backgroundColor: "rgba(15, 23, 42, 0.25)",
              bottom: "-60px",
              filter: "blur(12px)",
              transform: "scaleY(0.4)",
            }}
          />

          {/* Coin Rim & 3D Layering */}
          <div
            style={{
              width: "310px",
              height: "310px",
              borderRadius: "50%",
              backgroundColor: "#009E04",
              border: "5px solid #0F172A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 25px 50px -10px rgba(0, 200, 5, 0.45), 0 10px 20px rgba(15, 23, 42, 0.2)",
              position: "relative",
            }}
          >
            {/* Coin Front Face */}
            <div
              style={{
                width: "284px",
                height: "284px",
                borderRadius: "50%",
                backgroundColor: "#00C805",
                border: "3.5px solid #CCFF00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Inner concentric ring */}
              <div
                style={{
                  position: "absolute",
                  width: "250px",
                  height: "250px",
                  borderRadius: "50%",
                  border: "2px dashed rgba(204, 255, 0, 0.5)",
                }}
              />

              {/* Specular Gleam Sweep across coin face */}
              <div
                style={{
                  position: "absolute",
                  top: "-50%",
                  left: `${gleamOffset}%`,
                  width: "60px",
                  height: "200%",
                  backgroundColor: "rgba(255, 255, 255, 0.35)",
                  transform: "rotate(30deg)",
                  filter: "blur(8px)",
                  pointerEvents: "none",
                }}
              />

              {/* The Iconic Robinhood Black Feather Mark */}
              <FeatherLogo size={175} color="#0F172A" />
            </div>
          </div>
        </div>
      </div>

      {/* Clean Dark Fade / Iris Transition into Scene 2 */}
      {darkTransition > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#08090C",
            opacity: darkTransition,
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
