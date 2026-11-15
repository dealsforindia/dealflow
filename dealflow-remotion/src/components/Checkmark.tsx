import React from "react";
import { spring, interpolate } from "remotion";

interface CheckmarkProps {
  frame: number;
  fps: number;
  size?: number;
  color?: string;
  bgColor?: string;
  showParticles?: boolean;
}

export const Checkmark: React.FC<CheckmarkProps> = ({
  frame,
  fps,
  size = 180,
  color = "#FFFFFF",
  bgColor = "#00C805",
  showParticles = true,
}) => {
  // Elastic spring entrance for the main badge
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 10,
      mass: 0.8,
      stiffness: 120,
    },
  });

  // Animated path drawing for the checkmark tick
  const checkProgress = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strokeDashoffset = 100 - checkProgress * 100;

  // 12 radial burst particles
  const particleAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const particleColors = [
    "#FFD028",
    "#00C805",
    "#CCFF00",
    "#FF7A00",
    "#00E506",
    "#FFD028",
    "#CCFF00",
    "#00C805",
    "#FFD028",
    "#FF7A00",
    "#CCFF00",
    "#00E506",
  ];

  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Radial particle burst */}
      {showParticles &&
        particleAngles.map((angle, idx) => {
          const particleDist = interpolate(frame, [8, 46], [size * 0.55, size * 1.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const particleScale = interpolate(frame, [8, 16, 38, 50], [0, 1.4, 1.0, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const rad = (angle * Math.PI) / 180;
          const px = Math.cos(rad) * particleDist;
          const py = Math.sin(rad) * particleDist;

          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                width: `${idx % 2 === 0 ? 14 : 9}px`,
                height: `${idx % 2 === 0 ? 14 : 9}px`,
                borderRadius: "50%",
                backgroundColor: particleColors[idx],
                transform: `translate(${px}px, ${py}px) scale(${particleScale})`,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                pointerEvents: "none",
              }}
            />
          );
        })}

      {/* Main green circle badge with subtle drop shadow and dark rim */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: bgColor,
          border: "4px solid #0F172A",
          boxShadow: "0 20px 40px -10px rgba(0, 200, 5, 0.4), 0 10px 20px rgba(15, 23, 42, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale})`,
        }}
      >
        <svg
          width={size * 0.58}
          height={size * 0.58}
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 12 26 L 22 36 L 38 16"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="100"
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
      </div>
    </div>
  );
};
