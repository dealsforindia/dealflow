import React from 'react';

interface SpeedLinesProps {
  frame: number;
  color?: string;
  intensity?: number;
}

export const SpeedLines: React.FC<SpeedLinesProps> = ({
  frame,
  color = '#EF4444',
  intensity = 1,
}) => {
  const lineCount = 36;
  const radiusInner = 380;
  const radiusOuter = 1100;
  const cx = 960;
  const cy = 540;

  return (
    <svg
      width="1920"
      height="1080"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 6,
        mixBlendMode: 'screen',
      }}
    >
      {Array.from({ length: lineCount }).map((_, i) => {
        const baseAngle = (i / lineCount) * 2 * Math.PI;
        // Jitter angle per frame for high-speed anime feel
        const jitter = Math.sin(frame * 0.8 + i * 3) * 0.04;
        const angle = baseAngle + jitter;
        const rIn = radiusInner + (Math.sin(frame * 1.2 + i * 2) * 50);

        const x1 = cx + Math.cos(angle) * rIn;
        const y1 = cy + Math.sin(angle) * rIn;
        const x2 = cx + Math.cos(angle) * radiusOuter;
        const y2 = cy + Math.sin(angle) * radiusOuter;

        const strokeW = 4 + (Math.sin(frame * 2 + i) + 1) * 6 * intensity;
        const opacity = (0.3 + (Math.sin(frame + i * 4) + 1) * 0.35) * intensity;

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};
