import React from 'react';
import { interpolate } from 'remotion';

interface SweatDropProps {
  x: number;
  y: number;
  frame: number;
}

export const SweatDrop: React.FC<SweatDropProps> = ({ x, y, frame }) => {
  // Cycle every 25 frames
  const phase = (frame % 25) / 25;
  const dropY = interpolate(phase, [0, 1], [-20, 30]);
  const dropX = interpolate(phase, [0, 1], [0, 18]);
  const scale = interpolate(phase, [0, 0.4, 1], [0.4, 1.2, 0]);
  const opacity = interpolate(phase, [0, 0.8, 1], [1, 0.9, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x + dropX}px`,
        top: `${y + dropY}px`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        pointerEvents: 'none',
        zIndex: 14,
      }}
    >
      <svg width="30" height="42" viewBox="0 0 30 42" fill="none">
        {/* Cartoon Water Drop */}
        <path
          d="M 15 2 C 15 2, 2 20, 2 28 C 2 35, 8 40, 15 40 C 22 40, 28 35, 28 28 C 28 20, 15 2, 15 2 Z"
          fill="#38BDF8"
          stroke="#0284C7"
          strokeWidth="2.5"
        />
        {/* Shine */}
        <ellipse cx="10" cy="27" rx="3" ry="5" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );
};
