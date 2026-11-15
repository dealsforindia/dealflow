import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { FeatherLogo } from "../components/FeatherLogo";
import { FloatingParticles } from "../components/FloatingParticles";

export const FinanceIconsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Green Isometric Bar-Chart Island (frames 0 to 75)
  // Phase 2: Blue Isometric Financial Platform (frames 65 to 125)
  // Phase 3: Horizontal Stock / Crypto Ticker Ribbon (frames 105 to 156)

  // Phase 1 Animations:
  const phase1Scale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.8 },
  });
  const phase1Opacity = interpolate(frame, [0, 12, 60, 75], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phase1FloatY = Math.sin(frame * 0.08) * 8;
  const phase1ExitX = interpolate(frame, [60, 75], [0, -120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2 Animations (starts at frame 65):
  const frameP2 = Math.max(0, frame - 65);
  const phase2Scale = spring({
    frame: frameP2,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.8 },
  });
  const phase2Opacity = interpolate(frame, [65, 78, 115, 130], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phase2FloatY = Math.sin(frameP2 * 0.08) * 8;
  const phase2EnterX = interpolate(frame, [65, 80], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 3 Horizontal Ticker (frames 105 to 156):
  const frameP3 = Math.max(0, frame - 105);
  const tickerOpacity = interpolate(frame, [105, 115, 150, 156], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tickerTranslateX = interpolate(frameP3, [0, 51], [250, -420], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Orbiting tokens for Phase 1 (tightly framing the 640x480 island)
  const phase1Particles = [
    { x: 120, y: 180, size: 32, color: "#CCFF00", shape: "coin" as const, speed: 1.2 },
    { x: 480, y: 120, size: 28, color: "#FFD028", shape: "coin" as const, speed: 0.9 },
    { x: 150, y: 320, size: 22, color: "#FF6584", shape: "star" as const, speed: 1.5 },
    { x: 500, y: 300, size: 24, color: "#7B61FF", shape: "star" as const, speed: 1.1 },
    { x: 300, y: 60, size: 26, color: "#00E506", shape: "coin" as const, speed: 1.0 },
  ];

  // Orbiting tokens for Phase 2 (tightly framing the 680x480 platform)
  const phase2Particles = [
    { x: 140, y: 190, size: 34, color: "#00C805", shape: "coin" as const, speed: 1.1 },
    { x: 510, y: 160, size: 30, color: "#CCFF00", shape: "coin" as const, speed: 0.8 },
    { x: 180, y: 340, size: 22, color: "#FFD028", shape: "star" as const, speed: 1.3 },
    { x: 490, y: 320, size: 26, color: "#FF6584", shape: "coin" as const, speed: 1.0 },
    { x: 340, y: 80, size: 28, color: "#38BDF8", shape: "star" as const, speed: 1.2 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#08090C",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Subtle Dark Ambient Grid Pattern for technical fintech isolation */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* ========================================================= */}
      {/* 1. GREEN MINIATURE FINANCIAL BAR-CHART ISLAND (Phase 1)    */}
      {/* ========================================================= */}
      {phase1Opacity > 0 && (
        <div
          style={{
            position: "absolute",
            width: "640px",
            height: "480px",
            transform: `translate(${phase1ExitX}px, ${phase1FloatY}px) scale(${0.85 + 0.15 * phase1Scale})`,
            opacity: phase1Opacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Floating Orbiting Coins & Gems */}
          <FloatingParticles particles={phase1Particles} frame={frame} baseOpacity={0.9} />

          {/* SVG Isometric Financial Island */}
          <svg width="640" height="480" viewBox="0 0 640 480" fill="none">
            {/* Ground Shadow */}
            <ellipse cx="320" cy="380" rx="200" ry="60" fill="rgba(0, 200, 5, 0.15)" filter="blur(18px)" />

            {/* Isometric Hexagonal Green Pedestal Base */}
            {/* Top surface */}
            <polygon
              points="320,280 470,330 320,380 170,330"
              fill="#00C805"
              stroke="#0F172A"
              strokeWidth="4"
            />
            {/* Left face */}
            <polygon
              points="170,330 320,380 320,420 170,370"
              fill="#009E04"
              stroke="#0F172A"
              strokeWidth="4"
            />
            {/* Right face */}
            <polygon
              points="320,380 470,330 470,370 320,420"
              fill="#007A03"
              stroke="#0F172A"
              strokeWidth="4"
            />

            {/* Rising Isometric Bar Chart Towers */}
            {/* Bar 1 (Short Left) */}
            <g transform="translate(210, 240)">
              {/* Top */}
              <polygon points="30,0 60,10 30,20 0,10" fill="#CCFF00" stroke="#0F172A" strokeWidth="3" />
              {/* Left */}
              <polygon points="0,10 30,20 30,70 0,60" fill="#00C805" stroke="#0F172A" strokeWidth="3" />
              {/* Right */}
              <polygon points="30,20 60,10 60,60 30,70" fill="#009E04" stroke="#0F172A" strokeWidth="3" />
            </g>

            {/* Bar 2 (Medium Center-Left) */}
            <g transform="translate(260, 180)">
              {/* Top */}
              <polygon points="35,0 70,12 35,24 0,12" fill="#CCFF00" stroke="#0F172A" strokeWidth="3" />
              {/* Left */}
              <polygon points="0,12 35,24 35,120 0,108" fill="#00C805" stroke="#0F172A" strokeWidth="3" />
              {/* Right */}
              <polygon points="35,24 70,12 70,108 35,120" fill="#009E04" stroke="#0F172A" strokeWidth="3" />
            </g>

            {/* Bar 3 (Tall Center-Right - Flagship) */}
            <g transform="translate(325, 120)">
              {/* Top */}
              <polygon points="40,0 80,14 40,28 0,14" fill="#CCFF00" stroke="#0F172A" strokeWidth="3.5" />
              {/* Left */}
              <polygon points="0,14 40,28 40,190 0,176" fill="#00E506" stroke="#0F172A" strokeWidth="3.5" />
              {/* Right */}
              <polygon points="40,28 80,14 80,176 40,190" fill="#009E04" stroke="#0F172A" strokeWidth="3.5" />
              {/* Top Neon Marker */}
              <circle cx="40" cy="14" r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
            </g>

            {/* Bar 4 (Steepest Right) */}
            <g transform="translate(390, 80)">
              {/* Top */}
              <polygon points="35,0 70,12 35,24 0,12" fill="#CCFF00" stroke="#0F172A" strokeWidth="3" />
              {/* Left */}
              <polygon points="0,12 35,24 35,240 0,228" fill="#00C805" stroke="#0F172A" strokeWidth="3" />
              {/* Right */}
              <polygon points="35,24 70,12 70,228 35,240" fill="#009E04" stroke="#0F172A" strokeWidth="3" />
            </g>

            {/* Ascending Curved Growth Arrow */}
            <path
              d="M 220 280 Q 300 240 370 140 T 440 60"
              stroke="#CCFF00"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <polygon points="440,60 425,75 448,82" fill="#CCFF00" stroke="#0F172A" strokeWidth="2" />
          </svg>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BLUE ISOMETRIC FINANCIAL MONEY PLATFORM (Phase 2)       */}
      {/* ========================================================= */}
      {phase2Opacity > 0 && (
        <div
          style={{
            position: "absolute",
            width: "680px",
            height: "480px",
            transform: `translate(${phase2EnterX}px, ${phase2FloatY}px) scale(${0.85 + 0.15 * phase2Scale})`,
            opacity: phase2Opacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FloatingParticles particles={phase2Particles} frame={frameP2} baseOpacity={0.9} />

          {/* SVG Blue Isometric Platform with Stacked Cash, Cards & Diamond */}
          <svg width="680" height="480" viewBox="0 0 680 480" fill="none">
            {/* Ground Glow Shadow */}
            <ellipse cx="340" cy="380" rx="210" ry="60" fill="rgba(2, 132, 199, 0.25)" filter="blur(20px)" />

            {/* Isometric Cyan / Blue Platform Base */}
            {/* Top */}
            <polygon points="340,280 500,330 340,380 180,330" fill="#0284C7" stroke="#0F172A" strokeWidth="4" />
            {/* Left */}
            <polygon points="180,330 340,380 340,410 180,360" fill="#0369A1" stroke="#0F172A" strokeWidth="4" />
            {/* Right */}
            <polygon points="340,380 500,330 500,360 340,410" fill="#075985" stroke="#0F172A" strokeWidth="4" />

            {/* Stacked 3D Isometric Banknotes on Platform */}
            {/* Note Stack 1 */}
            <g transform="translate(230, 250)">
              <polygon points="50,0 110,20 60,38 0,18" fill="#86EFAC" stroke="#0F172A" strokeWidth="3" />
              <polygon points="0,18 60,38 60,46 0,26" fill="#4ADE80" stroke="#0F172A" strokeWidth="3" />
              <polygon points="60,38 110,20 110,28 60,46" fill="#22C55E" stroke="#0F172A" strokeWidth="3" />
              {/* Dollar sign on note */}
              <circle cx="55" cy="19" r="6" fill="#00C805" />
            </g>

            {/* Note Stack 2 (Layered higher) */}
            <g transform="translate(240, 230)">
              <polygon points="50,0 110,20 60,38 0,18" fill="#A7F3D0" stroke="#0F172A" strokeWidth="3" />
              <polygon points="0,18 60,38 60,46 0,26" fill="#6EE7B7" stroke="#0F172A" strokeWidth="3" />
              <polygon points="60,38 110,20 110,28 60,46" fill="#34D399" stroke="#0F172A" strokeWidth="3" />
            </g>

            {/* Tilted Isometric Credit Card */}
            <g transform="translate(330, 180) rotate(-15)">
              <rect x="0" y="0" width="120" height="74" rx="12" fill="#1E293B" stroke="#0F172A" strokeWidth="3.5" />
              <rect x="0" y="16" width="120" height="14" fill="#0F172A" />
              <rect x="14" y="42" width="22" height="16" rx="4" fill="#F59E0B" />
              <circle cx="95" cy="50" r="10" fill="#EF4444" opacity="0.85" />
              <circle cx="106" cy="50" r="10" fill="#F59E0B" opacity="0.85" />
            </g>

            {/* Faceted Sparkling Diamond / Gemstone */}
            <g transform="translate(380, 220)">
              <polygon points="35,0 70,25 35,65 0,25" fill="#38BDF8" stroke="#0F172A" strokeWidth="3" />
              <polygon points="35,0 35,65 0,25" fill="#7DD3FC" />
              <polygon points="35,0 70,25 35,25" fill="#BAE6FD" />
              <line x1="0" y1="25" x2="70" y2="25" stroke="#0F172A" strokeWidth="2.5" />
            </g>
          </svg>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. HORIZONTAL STOCK / CRYPTO TICKER TREATMENT (Phase 3)    */}
      {/* ========================================================= */}
      {tickerOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "160px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: tickerOpacity,
            zIndex: 20,
          }}
        >
          {/* Neon Glow Ribbon Background */}
          <div
            style={{
              width: "100%",
              height: "76px",
              backgroundColor: "#0F172A",
              borderTop: "2px solid #1E293B",
              borderBottom: "2px solid #1E293B",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              position: "relative",
            }}
          >
            {/* Scrolling Ticker Track */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "60px",
                whiteSpace: "nowrap",
                transform: `translateX(${tickerTranslateX}px)`,
                fontFamily: "'Inter', monospace, system-ui",
                fontSize: "22px",
                fontWeight: 800,
                color: "#CCFF00",
              }}
            >
              {[
                { name: "Example Inc.", sym: "EXMP", change: "↗ $0.82 (+7.65%)" },
                { name: "Example Crypto", sym: "EXCR", change: "↗ $42,180.50 (+12.4%)" },
                { name: "Robinhood Index", sym: "HOOD", change: "↗ $1,245.80 (+5.12%)" },
                { name: "Tech Growth ETF", sym: "TGRO", change: "↗ $312.40 (+9.80%)" },
                { name: "High Yield Cash", sym: "CASH", change: "↗ 5.00% APY" },
                { name: "Example Inc.", sym: "EXMP", change: "↗ $0.82 (+7.65%)" },
                { name: "Example Crypto", sym: "EXCR", change: "↗ $42,180.50 (+12.4%)" },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ color: "#F8FAFC", fontWeight: 700 }}>{item.name}</span>
                  <span
                    style={{
                      fontSize: "13px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(204, 255, 0, 0.15)",
                      color: "#CCFF00",
                      fontWeight: 800,
                    }}
                  >
                    {item.sym}
                  </span>
                  <span style={{ color: "#00E506" }}>{item.change}</span>
                  <span style={{ color: "#334155", margin: "0 10px" }}>•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
