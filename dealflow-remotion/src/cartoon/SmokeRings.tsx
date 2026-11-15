import React from 'react';
import { interpolate } from 'remotion';

interface SmokeRingsProps {
  x: number;
  y: number;
  startFrame: number;
  frame: number;
}

export const SmokeRings: React.FC<SmokeRingsProps> = ({
  x,
  y,
  startFrame,
  frame,
}) => {
  const elapsed = frame - startFrame;
  if (elapsed < 0 || elapsed > 45) return null;

  const progress = elapsed / 45;
  const radius = interpolate(progress, [0, 1], [15, 120]);
  const opacity = interpolate(progress, [0, 0.7, 1], [0.9, 0.6, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 12,
        opacity,
      }}
    >
      <svg width="260" height="140" viewBox="0 0 260 140" fill="none">
        {/* Left Smoke Cloud Puff */}
        <circle
          cx={130 - radius * 0.9}
          cy={70 - radius * 0.2}
          r={radius * 0.35}
          fill="#E2E8F0"
          stroke="#94A3B8"
          strokeWidth="3"
        />
        {/* Right Smoke Cloud Puff */}
        <circle
          cx={130 + radius * 0.9}
          cy={70 - radius * 0.2}
          r={radius * 0.35}
          fill="#E2E8F0"
          stroke="#94A3B8"
          strokeWidth="3"
        />
        {/* Center Dust Ring */}
        <ellipse
          cx="130"
          cy="75"
          rx={radius}
          ry={radius * 0.35}
          stroke="#CBD5E1"
          strokeWidth="5"
          fill="none"
          strokeDasharray="16 10"
        />
      </svg>
    </div>
  );
};
