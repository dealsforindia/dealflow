import React from "react";
import { interpolate } from "remotion";

export interface HourglassProps {
  frame: number;
  fps: number;
  size?: number;
}

export const Hourglass: React.FC<HourglassProps> = ({
  frame,
  fps,
  size = 560,
}) => {
  // Number of falling sphere particles
  const totalBalls = 24;

  // Green curved arcs subtle swaying / breathing motion
  const arcBreath = Math.sin(frame * 0.08) * 6;
  const arcScale = 1 + Math.sin(frame * 0.06) * 0.02;

  // Staggered ball simulation
  // Top chamber has initial coordinates, falls through waist (y: 280), accumulates in bottom pyramid
  const balls = Array.from({ length: totalBalls }).map((_, i) => {
    // Stagger start time of each ball
    const startFrame = i * 4;
    const progress = interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Initial position in top bulb (pyramid arrangement)
    const topRow = Math.floor(i / 6);
    const topCol = i % 6;
    const initialX = 230 + topCol * 18 - topRow * 8;
    const initialY = 140 + topRow * 22;

    // Resting position in bottom bulb (pyramid accumulation)
    const botRow = Math.floor(i / 5);
    const botCol = i % 5;
    const finalX = 235 + botCol * 18 - botRow * 6;
    const finalY = 440 - botRow * 18;

    // Staggered gravity path: Top -> Funnel down neck (x: 280, y: 280) -> Final bottom
    let curX: number;
    let curY: number;

    if (progress === 0) {
      curX = initialX;
      curY = initialY;
    } else if (progress < 0.4) {
      // Funneling into neck
      const neckP = progress / 0.4;
      curX = interpolate(neckP, [0, 1], [initialX, 280]);
      curY = interpolate(neckP, [0, 1], [initialY, 280]);
    } else {
      // Accelerating drop to bottom and settling
      const dropP = (progress - 0.4) / 0.6;
      // Parabolic fall acceleration
      const dropEase = Math.pow(dropP, 1.8);
      curX = interpolate(dropEase, [0, 1], [280, finalX]);
      curY = interpolate(dropEase, [0, 1], [280, finalY]);
    }

    const color = i % 3 === 0 ? "#FF7A00" : i % 3 === 1 ? "#FFB800" : "#F59E0B";

    return {
      id: i,
      x: curX,
      y: curY,
      color,
      progress,
    };
  });

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
      {/* Surrounding Vibrant Green Framing Arcs (Left and Right) */}
      <svg
        width={size * 1.5}
        height={size * 1.2}
        viewBox="0 0 800 600"
        fill="none"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${arcScale})`,
          pointerEvents: "none",
        }}
      >
        {/* Left Curved Arc */}
        <path
          d={`M ${160 + arcBreath} 100 C ${60 - arcBreath} 280, ${60 - arcBreath} 340, ${160 + arcBreath} 500`}
          stroke="#00C805"
          strokeWidth="38"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d={`M ${160 + arcBreath} 100 C ${60 - arcBreath} 280, ${60 - arcBreath} 340, ${160 + arcBreath} 500`}
          stroke="#CCFF00"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Right Curved Arc */}
        <path
          d={`M ${640 - arcBreath} 100 C ${740 + arcBreath} 280, ${740 + arcBreath} 340, ${640 - arcBreath} 500`}
          stroke="#00C805"
          strokeWidth="38"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d={`M ${640 - arcBreath} 100 C ${740 + arcBreath} 280, ${740 + arcBreath} 340, ${640 - arcBreath} 500`}
          stroke="#CCFF00"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </svg>

      {/* Main Hourglass Glass Vector Body */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 560 560"
        fill="none"
        style={{ position: "relative", zIndex: 2 }}
      >
        <defs>
          {/* Subtle glass reflection gradient */}
          <linearGradient id="glassGloss" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#E2E8F0" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Top and Bottom Hourglass Caps */}
        <rect
          x="150"
          y="50"
          width="260"
          height="24"
          rx="12"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="4"
        />
        <rect
          x="150"
          y="486"
          width="260"
          height="24"
          rx="12"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="4"
        />

        {/* Outer Hourglass Glass Outline & Fill */}
        <path
          d="M 180 74 
             L 380 74 
             C 380 180, 310 240, 290 280 
             C 310 320, 380 380, 380 486 
             L 180 486 
             C 180 380, 250 320, 270 280 
             C 250 240, 180 180, 180 74 Z"
          fill="url(#glassGloss)"
          stroke="#0F172A"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Vertical Falling Stream Laser in Waist */}
        <line
          x1="280"
          y1="270"
          x2="280"
          y2="360"
          stroke="#FF7A00"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Orange and Yellow Spherical Balls */}
        {balls.map((b) => (
          <circle
            key={b.id}
            cx={b.x}
            cy={b.y}
            r="8.5"
            fill={b.color}
            stroke="#0F172A"
            strokeWidth="2.2"
          />
        ))}

        {/* Glass Sheen Highlights */}
        <path
          d="M 200 100 C 200 160, 240 210, 260 250"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M 200 460 C 200 400, 240 350, 260 310"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};
