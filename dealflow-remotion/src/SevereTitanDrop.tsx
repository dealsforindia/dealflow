import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Audio,
  staticFile,
} from "remotion";
import { DealShortProps, DEFAULT_DEAL_PROPS, STORE_THEMES } from "./types";

/**
 * SevereTitanDrop
 * State-of-the-art 1080x1920 (9:16) cinematic loot drop motion design.
 * Features:
 * - Obsidian tactical cyber grid background with ambient dust particles
 * - Severe HUD emergency price-exploit intro with camera vibration
 * - Multi-layer 3D frosted glassmorphic card with specular light sweep
 * - Violent neon-crimson laser price slash + golden spring burst
 * - Live ticking countdown & real-time stock meter
 * - Frame-accurate SFX sound design with auto-ducked ambient music
 */
export const SevereTitanDrop: React.FC<DealShortProps> = ({
  title = DEFAULT_DEAL_PROPS.title,
  brand = DEFAULT_DEAL_PROPS.brand,
  salePrice = DEFAULT_DEAL_PROPS.salePrice,
  mrp = DEFAULT_DEAL_PROPS.mrp,
  discountPct = DEFAULT_DEAL_PROPS.discountPct,
  store = DEFAULT_DEAL_PROPS.store,
  worthScore = DEFAULT_DEAL_PROPS.worthScore,
  imageUrl = DEFAULT_DEAL_PROPS.imageUrl,
  handle = "@dealsforindia",
  verifiedAt = "VERIFIED BY 24,000+ HUNTERS",
  enableAudio = true,
  themeName = "amazon",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Color Palette & Store Identity
  const rawStore = (themeName || store || "amazon").toLowerCase();
  const isFlipkart = rawStore.includes("flipkart");
  const isMyntra = rawStore.includes("myntra");
  const accentColor = isFlipkart ? "#2874F0" : isMyntra ? "#FF3F6C" : "#FF9900";
  const accentGlow = isFlipkart
    ? "rgba(40, 116, 240, 0.45)"
    : isMyntra
    ? "rgba(255, 63, 108, 0.45)"
    : "rgba(255, 153, 0, 0.45)";

  // Camera Shake on Initial Alert Hit (Frames 36 - 48)
  const isAlertHit = frame >= 36 && frame <= 48;
  const shakeX = isAlertHit ? Math.sin(frame * 12) * 8 : 0;
  const shakeY = isAlertHit ? Math.cos(frame * 10) * 8 : 0;

  // Master Cinematic Slow Drift
  const masterScale = interpolate(frame, [0, durationInFrames], [1.0, 1.04], {
    extrapolateRight: "clamp",
  });

  // --- Phase 1: Severe HUD Alert (Frames 0 to 55) ---
  const alertOpacity = interpolate(frame, [0, 10, 42, 54], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const alertSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.6 },
  });
  const radarRotation = frame * 3.5;

  // --- Phase 2: 3D Frosted Glass Card Entrance (Frame 42 onwards) ---
  const cardSpring = spring({
    frame: frame - 42,
    fps,
    config: { damping: 14, stiffness: 130, mass: 0.9 },
  });
  const cardY = interpolate(cardSpring, [0, 1], [600, 0]);
  const cardOpacity = interpolate(frame, [42, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Interactive 3D Perspective Tilt (Organic Gyro Hover)
  const hoverTiltX = Math.sin(frame / 22) * 3.5;
  const hoverTiltY = Math.cos(frame / 26) * 4.5;

  // Specular Light Sweep (Frame 65 to 110)
  const lightSweepX = interpolate(frame, [65, 110], [-200, 1200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Phase 3: Product Image Floating Physics ---
  const productHoverY = Math.sin(frame / 16) * 10;
  const productShadowScale = interpolate(productHoverY, [-10, 10], [0.85, 1.15]);
  const productSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 13, stiffness: 150 },
  });

  // --- Phase 4: The Violent Price Slash (Frame 95 onwards) ---
  const slashWidth = interpolate(frame, [95, 110], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const priceBurstSpring = spring({
    frame: frame - 110,
    fps,
    config: { damping: 11, stiffness: 220, mass: 0.8 },
  });
  const priceScale = interpolate(priceBurstSpring, [0, 1], [1.7, 1.0]);

  // Savings Math
  const savings = mrp - salePrice;

  // --- Phase 5: Urgency Elements (Countdown & Stock Bar) ---
  const stockProgress = interpolate(frame, [80, 160], [100, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dynamic Seconds for Countdown
  const fakeSeconds = Math.max(0, 59 - Math.floor((frame / fps) % 60));
  const fakeSecondsStr = fakeSeconds < 10 ? `0${fakeSeconds}` : `${fakeSeconds}`;

  // --- Phase 6: Call To Action Button (Frame 330 onwards) ---
  const ctaSpring = spring({
    frame: frame - 330,
    fps,
    config: { damping: 13, stiffness: 180 },
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.7, 1.0]);
  const ctaGlowPulse = 1 + Math.sin(frame / 8) * 0.15;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#06070B",
        transform: `scale(${masterScale}) translate(${shakeX}px, ${shakeY}px)`,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif',
        overflow: "hidden",
        color: "#FFFFFF",
      }}
    >
      {/* ================= AUDIO DESIGN ================= */}
      {enableAudio && (
        <>
          {/* Ambient Background Music */}
          <Audio
            src={staticFile("audio/bgm.mp3")}
            volume={(f) =>
              interpolate(f, [0, 30, durationInFrames - 30, durationInFrames], [0, 0.45, 0.45, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
          {/* Frame 5: Siren Alarm Ping */}
          {frame >= 5 && frame <= 40 && (
            <Audio src={staticFile("audio/siren.wav")} volume={0.65} startFrom={0} />
          )}
          {/* Frame 42: Card Slam Whoosh */}
          {frame >= 42 && frame <= 70 && (
            <Audio src={staticFile("audio/whoosh.mp3")} volume={0.8} />
          )}
          {/* Frame 48: Heavy Impact Thud */}
          {frame >= 48 && frame <= 75 && (
            <Audio src={staticFile("audio/thud.wav")} volume={0.7} />
          )}
          {/* Frame 98: Laser Slash */}
          {frame >= 98 && frame <= 125 && (
            <Audio src={staticFile("audio/laser.wav")} volume={0.85} />
          )}
          {/* Frame 112: Golden Price Bling */}
          {frame >= 112 && frame <= 145 && (
            <Audio src={staticFile("audio/bling.wav")} volume={0.9} />
          )}
          {/* Frame 335: Final CTA Pop */}
          {frame >= 335 && frame <= 365 && (
            <Audio src={staticFile("audio/pop.mp3")} volume={0.75} />
          )}
        </>
      )}

      {/* ================= ATMOSPHERIC CYBER BACKGROUND ================= */}
      {/* Radial Deep Lighting Core */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 32%, ${accentGlow} 0%, rgba(6, 8, 14, 0.95) 65%, #050609 100%)`,
        }}
      />

      {/* Cyber Grid Texture Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `0px ${frame * 0.5}px`,
          opacity: 0.65,
        }}
      />

      {/* Ambient Floating Dust Embers */}
      {[...Array(14)].map((_, i) => {
        const emberX = ((i * 79 + 33) % width);
        const emberSpeed = 1.2 + (i % 3) * 0.6;
        const emberY = (height - ((frame * emberSpeed + i * 140) % height));
        const emberSize = 2 + (i % 4) * 1.5;
        const emberOpacity = 0.2 + (Math.sin(frame / 12 + i) + 1) * 0.25;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${emberX}px`,
              top: `${emberY}px`,
              width: `${emberSize}px`,
              height: `${emberSize}px`,
              borderRadius: "50%",
              backgroundColor: i % 2 === 0 ? accentColor : "#FFFFFF",
              boxShadow: `0 0 10px ${accentColor}`,
              opacity: emberOpacity,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* ================= PHASE 1: TACTICAL HUD ALERT (0 - 55 FRAMES) ================= */}
      {frame <= 55 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: alertOpacity,
            transform: `scale(${alertSpring})`,
            zIndex: 50,
          }}
        >
          {/* Rotating Cyber Reticle */}
          <div
            style={{
              width: "240px",
              height: "240px",
              borderRadius: "50%",
              border: `2px dashed ${accentColor}`,
              transform: `rotate(${radarRotation}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 35px ${accentGlow}`,
            }}
          >
            <div
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            />
          </div>

          <div
            style={{
              marginTop: "32px",
              padding: "10px 28px",
              borderRadius: "999px",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              border: "1.5px solid #EF4444",
              color: "#FCA5A5",
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "4px",
              textTransform: "uppercase",
              boxShadow: "0 0 25px rgba(239, 68, 68, 0.4)",
            }}
          >
            ⚠️ EXPLOIT DETECTED // 80% DROP
          </div>

          <h2
            style={{
              marginTop: "16px",
              fontSize: "44px",
              fontWeight: 900,
              letterSpacing: "-1px",
              textAlign: "center",
              background: "linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            UNAUTHORIZED PRICE COLLAPSE
          </h2>
        </div>
      )}

      {/* ================= TOP BRAND WATERMARK & PROGRESS BAR ================= */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "50px",
          right: "50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#10B981",
              boxShadow: "0 0 14px #10B981",
            }}
          />
          <span
            style={{
              fontSize: "22px",
              fontWeight: 900,
              letterSpacing: "2px",
              color: "#F8FAFC",
            }}
          >
            DEALFLOW <span style={{ color: accentColor }}>LIVE</span>
          </span>
        </div>

        <div
          style={{
            padding: "8px 18px",
            borderRadius: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "1px",
            color: "#CBD5E1",
          }}
        >
          {verifiedAt}
        </div>
      </div>

      {/* Top Video Story Progress Bar */}
      <div
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          right: "0px",
          height: "6px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(frame / durationInFrames) * 100}%`,
            background: `linear-gradient(90deg, ${accentColor}, #10B981)`,
            boxShadow: `0 0 12px ${accentColor}`,
          }}
        />
      </div>

      {/* ================= MAIN 3D FROSTED TITAN CARD CONTAINER ================= */}
      <div
        style={{
          position: "absolute",
          top: "140px",
          left: "50px",
          right: "50px",
          bottom: "190px",
          transform: `translateY(${cardY}px) perspective(1200px) rotateX(${hoverTiltX}deg) rotateY(${hoverTiltY}deg)`,
          opacity: cardOpacity,
          borderRadius: "36px",
          background: "linear-gradient(165deg, rgba(24, 29, 42, 0.82) 0%, rgba(11, 14, 22, 0.94) 100%)",
          backdropFilter: "blur(32px) saturate(180%)",
          border: "1.5px solid rgba(255, 255, 255, 0.14)",
          boxShadow: `0 35px 70px rgba(0, 0, 0, 0.7), 0 0 60px ${accentGlow}`,
          display: "flex",
          flexDirection: "column",
          padding: "44px 40px",
          overflow: "hidden",
          zIndex: 30,
        }}
      >
        {/* Specular Light Streak (Sweeps across card) */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: `${lightSweepX}px`,
            width: "80px",
            height: "2000px",
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent)",
            transform: "rotate(28deg)",
            pointerEvents: "none",
          }}
        />

        {/* Card Header Store Badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "10px 22px",
              borderRadius: "14px",
              background: `linear-gradient(135deg, ${accentColor} 0%, rgba(200, 100, 0, 0.8) 100%)`,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: `0 8px 20px ${accentGlow}`,
            }}
          >
            <span style={{ fontSize: "16px" }}>⚡</span>
            <span
              style={{
                fontSize: "17px",
                fontWeight: 900,
                letterSpacing: "1.5px",
                color: "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              {store.toUpperCase()} OFFICIAL LOOT
            </span>
          </div>

          {/* Worth Score Ring Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 18px",
              borderRadius: "14px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
            }}
          >
            <span style={{ color: "#34D399", fontSize: "16px", fontWeight: 900 }}>
              ★ {worthScore}/100
            </span>
            <span style={{ color: "#94A3B8", fontSize: "14px", fontWeight: 700 }}>
              WORTH SCORE
            </span>
          </div>
        </div>

        {/* Product Showcase Stage */}
        <div
          style={{
            marginTop: "30px",
            height: "520px",
            borderRadius: "28px",
            background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.45) 80%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Floating Product Shadow */}
          <div
            style={{
              position: "absolute",
              bottom: "45px",
              width: "280px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              filter: "blur(14px)",
              transform: `scale(${productShadowScale})`,
            }}
          />

          {/* High-Res Product Image */}
          <div
            style={{
              transform: `translateY(${productHoverY}px) scale(${productSpring})`,
              transition: "none",
              zIndex: 10,
            }}
          >
            <Img
              src={imageUrl}
              style={{
                maxHeight: "420px",
                maxWidth: "420px",
                objectFit: "contain",
                filter: "drop-shadow(0 25px 35px rgba(0, 0, 0, 0.65))",
              }}
            />
          </div>

          {/* Discount Floating Pill */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              padding: "10px 20px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              boxShadow: "0 10px 25px rgba(239, 68, 68, 0.5)",
              color: "#FFFFFF",
              fontSize: "22px",
              fontWeight: 900,
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🔥</span>
            <span>{discountPct}% OFF</span>
          </div>
        </div>

        {/* Brand & Product Title */}
        <div style={{ marginTop: "28px" }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "2.5px",
              color: accentColor,
              textTransform: "uppercase",
            }}
          >
            {brand}
          </div>
          <h1
            style={{
              marginTop: "6px",
              fontSize: "36px",
              fontWeight: 900,
              lineHeight: 1.25,
              color: "#F8FAFC",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h1>
        </div>

        {/* ================= THE SEVERE PRICE REVEAL ================= */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "16px", color: "#94A3B8", fontWeight: 700 }}>
                ORIGINAL MRP
              </span>
              {/* Crossed Out MRP with Laser */}
              <div style={{ position: "relative", display: "inline-block" }}>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#64748B",
                  }}
                >
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
                {/* Laser Strike */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "0px",
                    height: "4px",
                    width: `${slashWidth}%`,
                    backgroundColor: "#EF4444",
                    boxShadow: "0 0 12px #EF4444",
                    transform: "rotate(-12deg)",
                  }}
                />
              </div>
            </div>

            {/* Exploded Loot Sale Price */}
            <div
              style={{
                marginTop: "4px",
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
                transform: `scale(${priceScale})`,
                transformOrigin: "left bottom",
              }}
            >
              <span
                style={{
                  fontSize: "64px",
                  fontWeight: 900,
                  letterSpacing: "-2px",
                  color: "#FFFFFF",
                  textShadow: `0 0 35px ${accentGlow}`,
                }}
              >
                ₹{salePrice.toLocaleString("en-IN")}
              </span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#34D399",
                  padding: "4px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(16, 185, 129, 0.16)",
                }}
              >
                SAVE ₹{savings.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Live Inventory Bar & Timer */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#F59E0B",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "6px",
              }}
            >
              <span>⏰</span>
              <span>EXPIRES: 00:14:{fakeSecondsStr}</span>
            </div>

            <div
              style={{
                marginTop: "10px",
                width: "220px",
                height: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${stockProgress}%`,
                  background: "linear-gradient(90deg, #EF4444, #F59E0B)",
                  borderRadius: "999px",
                  boxShadow: "0 0 10px rgba(239, 68, 68, 0.7)",
                }}
              />
            </div>
            <div
              style={{
                marginTop: "6px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#EF4444",
              }}
            >
              ONLY 3 UNITS REMAINING
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM HIGH-IMPACT CALL TO ACTION ================= */}
      <div
        style={{
          position: "absolute",
          bottom: "36px",
          left: "50px",
          right: "50px",
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 40,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "26px",
            background: `linear-gradient(135deg, ${accentColor} 0%, #D97706 100%)`,
            boxShadow: `0 15px 35px ${accentGlow}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            transform: `scale(${ctaScale * ctaGlowPulse})`,
            border: "1.5px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "0.5px",
                color: "#FFFFFF",
              }}
            >
              TAP LINK IN BIO TO GRAB LOOT ⚡
            </div>
            <div
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              TELEGRAM CHANNEL: <span style={{ color: "#FFFFFF", fontWeight: 900 }}>{handle}</span>
            </div>
          </div>

          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
              fontSize: "28px",
            }}
          >
            👉
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
