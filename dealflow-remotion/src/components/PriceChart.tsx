import React from "react";
import { interpolate } from "remotion";

export interface PriceChartProps {
  frame: number;
  fps: number;
  width?: number;
  height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  frame,
  fps,
  width = 900,
  height = 420,
}) => {
  // Line draw animation: 0 to 1 over first 40 frames
  const drawProgress = interpolate(frame, [0, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pathLength = 1200;
  const strokeDashoffset = pathLength * (1 - drawProgress);

  // Active price counter interpolation
  const currentPrice = interpolate(frame, [0, 50], [168.2, 188.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }).toFixed(2);

  // Coordinate point on line for endpoint pulse
  const endPointX = 100 + drawProgress * 700;
  // Calculate approximate Y on curve
  const endPointY = interpolate(drawProgress, [0, 0.3, 0.6, 0.85, 1], [300, 260, 290, 160, 130]);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "'Inter', monospace, sans-serif",
      }}
    >
      {/* Technical Header Readout */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2 }}>
        <div>
          <div style={{ fontSize: "13px", color: "#64748B", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Real-time Execution Pipeline
          </div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "#CCFF00", letterSpacing: "-0.5px" }}>
            ${currentPrice}{" "}
            <span style={{ fontSize: "16px", color: "#00C805", fontWeight: 700 }}>
              +11.9%
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              backgroundColor: "rgba(0, 200, 5, 0.15)",
              border: "1.5px solid #00C805",
              color: "#CCFF00",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            ● Live Market
          </div>
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <svg
        width={width}
        height={height * 0.75}
        viewBox={`0 0 ${width} 320`}
        fill="none"
        style={{ position: "absolute", bottom: 0, left: 0 }}
      >
        {/* Horizontal Technical Guidelines */}
        {/* Limit Price line (Top) */}
        <line
          x1="80"
          y1="80"
          x2="840"
          y2="80"
          stroke="#475569"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        {/* Stock Price line (Middle) */}
        <line
          x1="80"
          y1="160"
          x2="840"
          y2="160"
          stroke="#334155"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {/* Stop Price line (Bottom) */}
        <line
          x1="80"
          y1="260"
          x2="840"
          y2="260"
          stroke="#475569"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />

        {/* Technical Threshold Labels */}
        <text x="850" y="84" fill="#94A3B8" fontSize="12" fontWeight="700" fontFamily="sans-serif">
          Limit price: $195.00
        </text>
        <text x="850" y="164" fill="#00C805" fontSize="12" fontWeight="700" fontFamily="sans-serif">
          Stock price: $188.25
        </text>
        <text x="850" y="264" fill="#EF4444" fontSize="12" fontWeight="700" fontFamily="sans-serif">
          Stop price: $165.00
        </text>

        {/* Main Neon Green Trajectory Line */}
        <path
          d="M 100 300 
             C 220 280, 260 220, 360 250 
             C 460 280, 520 180, 620 170 
             C 700 160, 740 140, 800 130"
          stroke="#CCFF00"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
        />

        {/* Active endpoint node with radar ping */}
        {drawProgress > 0.05 && (
          <g>
            <circle cx={endPointX} cy={endPointY} r="6" fill="#00C805" stroke="#0F172A" strokeWidth="2" />
            <circle
              cx={endPointX}
              cy={endPointY}
              r={12 + Math.sin(frame * 0.25) * 4}
              fill="none"
              stroke="#CCFF00"
              strokeWidth="2"
              opacity="0.6"
            />
          </g>
        )}

        {/* Technical connector dots and vertical markers */}
        <circle cx="360" cy="250" r="3" fill="#64748B" />
        <line x1="360" y1="250" x2="360" y2="310" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
        <text x="345" y="318" fill="#64748B" fontSize="10">Crypto Price</text>

        <circle cx="620" cy="170" r="3" fill="#64748B" />
        <line x1="620" y1="170" x2="620" y2="310" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
        <text x="605" y="318" fill="#64748B" fontSize="10">Stop Price</text>
      </svg>
    </div>
  );
};
