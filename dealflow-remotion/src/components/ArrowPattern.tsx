import React from "react";
import { interpolate } from "remotion";

export interface ArrowPatternProps {
  frame: number;
  fps: number;
}

export const ArrowPattern: React.FC<ArrowPatternProps> = ({ frame, fps }) => {
  const rows = 12;
  const cols = 22;

  // Wave progress traveling diagonally across screen
  const waveProgress = interpolate(frame, [0, 12], [0, cols + rows], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: "28px",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const manhattanDist = r + c;
            const distFromWave = Math.abs(waveProgress - manhattanDist);
            const isGreenWave = distFromWave < 2.5;

            // Staggered horizontal shift
            const shiftX = isGreenWave ? 6 : 0;
            const arrowColor = isGreenWave
              ? (r + c) % 2 === 0
                ? "#00C805"
                : "#CCFF00"
              : "#E2E8F0";

            const scale = isGreenWave ? 1.35 : 1.0;
            const strokeColor = isGreenWave ? "#0F172A" : "#94A3B8";

            return (
              <div
                key={`${r}-${c}`}
                style={{
                  transform: `translateX(${shiftX}px) scale(${scale})`,
                  transition: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M 5 12 L 17 12 M 12 7 L 17 12 L 12 17"
                    stroke={isGreenWave ? arrowColor : strokeColor}
                    strokeWidth={isGreenWave ? "3.5" : "2"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
