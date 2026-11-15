import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { PriceChart } from "../components/PriceChart";

export const TradingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Part 1: Technical Price Chart (frames 0 to 75)
  const chartOpacity = interpolate(frame, [0, 10, 68, 78], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chartTranslateY = interpolate(frame, [65, 78], [0, -60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Part 2: Pink Wallet / Tray Illustration (frames 70 to 146)
  const walletFrame = Math.max(0, frame - 70);
  const walletSpring = spring({
    frame: walletFrame,
    fps,
    config: { damping: 13, stiffness: 85, mass: 0.9 },
  });
  const walletScale = interpolate(walletSpring, [0, 1], [0.8, 1]);
  const walletOpacity = interpolate(frame, [70, 78, 138, 146], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered popping coins and gems coming out of the pink wallet
  const poppingObjects = [
    { delay: 3, x: -140, peakY: -260, rot: -35, color: "#FFD028", label: "$" },
    { delay: 6, x: -70, peakY: -320, rot: 15, color: "#00C805", label: "₹" },
    { delay: 9, x: 20, peakY: -350, rot: -10, color: "#CCFF00", label: "₿" },
    { delay: 12, x: 100, peakY: -310, rot: 30, color: "#FF7A00", label: "$" },
    { delay: 8, x: -210, peakY: -210, rot: -50, color: "#7B61FF", label: "★" },
    { delay: 14, x: 190, peakY: -230, rot: 45, color: "#38BDF8", label: "◆" },
    { delay: 16, x: -20, peakY: -280, rot: 20, color: "#FFD028", label: "$" },
    { delay: 18, x: 60, peakY: -260, rot: -15, color: "#00E506", label: "★" },
  ];

  // Transition into Scene 6 White background at the end
  const whiteTransition = interpolate(frame, [138, 146], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07080A",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background Subtle Technical Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(204, 255, 0, 0.04) 0%, transparent 70%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 80px 80px, 80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* PART 1: TECHNICAL TRADING & PRICE GRAPHICS */}
      {chartOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            opacity: chartOpacity,
            transform: `translateY(${chartTranslateY}px)`,
          }}
        >
          <PriceChart frame={frame} fps={fps} width={1000} height={460} />
        </div>
      )}

      {/* PART 2: PINK WALLET / TRAY WITH POPPING COINS */}
      {walletOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            opacity: walletOpacity,
            transform: `scale(${walletScale * 1.35})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Popping Objects (Coins, Diamonds, Tokens) */}
          <div style={{ position: "relative", width: "400px", height: "0px", zIndex: 10 }}>
            {poppingObjects.map((obj, i) => {
              const objFrame = Math.max(0, walletFrame - obj.delay);
              // Rise with spring / parabolic gravity
              const popProgress = interpolate(objFrame, [0, 14, 28, 45], [0, 1, 0.85, 0.8], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const currentY = popProgress * obj.peakY;
              const currentRot = interpolate(objFrame, [0, 25], [0, obj.rot], {
                extrapolateRight: "clamp",
              });
              const currentScale = interpolate(objFrame, [0, 8, 45], [0, 1.15, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: "200px",
                    top: "0px",
                    transform: `translate(${obj.x}px, ${currentY}px) scale(${currentScale}) rotate(${currentRot}deg)`,
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: obj.color,
                    border: "3px solid #0F172A",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "22px",
                    color: "#0F172A",
                  }}
                >
                  {obj.label}
                </div>
              );
            })}
          </div>

          {/* SVG Pink Wallet / Tray Illustration */}
          <svg width="520" height="360" viewBox="0 0 520 360" fill="none">
            {/* Ground glow shadow */}
            <ellipse cx="260" cy="280" rx="190" ry="50" fill="rgba(255, 101, 132, 0.25)" filter="blur(16px)" />

            {/* Isometric Pink Tray Base */}
            {/* Top tray basin */}
            <polygon
              points="260,160 440,210 260,260 80,210"
              fill="#FF6584"
              stroke="#0F172A"
              strokeWidth="5"
            />
            {/* Inner basin cavity */}
            <polygon
              points="260,175 415,215 260,250 105,215"
              fill="#F43F5E"
              stroke="#0F172A"
              strokeWidth="3"
            />
            {/* Front Left Lip */}
            <polygon
              points="80,210 260,260 260,300 80,250"
              fill="#E11D48"
              stroke="#0F172A"
              strokeWidth="5"
            />
            {/* Front Right Lip */}
            <polygon
              points="260,260 440,210 440,250 260,300"
              fill="#BE123C"
              stroke="#0F172A"
              strokeWidth="5"
            />

            {/* Neon Green Cash Slot Line in Tray */}
            <line
              x1="220"
              y1="210"
              x2="300"
              y2="210"
              stroke="#CCFF00"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Clean White Transition into Scene 6 */}
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
