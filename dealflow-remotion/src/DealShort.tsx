import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Audio,
  staticFile,
  Sequence,
} from "remotion";
import { DealShortProps, STORE_THEMES } from "./types";

export const DealShort: React.FC<DealShortProps> = ({
  title,
  brand,
  salePrice,
  mrp,
  discountPct,
  store,
  worthScore,
  imageUrl,
  handle,
  verifiedAt,
  affiliateUrl,
  qrCodeDataUrl,
  audioBgm,
  audioVoice,
  enableAudio = true,
  themeName,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Determine Store Theme
  const rawStore = (themeName || store || "").toLowerCase();
  const themeKey = rawStore.includes("flipkart")
    ? "flipkart"
    : rawStore.includes("myntra")
    ? "myntra"
    : rawStore.includes("ajio")
    ? "ajio"
    : rawStore.includes("swiggy") || rawStore.includes("instamart")
    ? "swiggy"
    : rawStore.includes("blinkit")
    ? "blinkit"
    : rawStore.includes("amazon")
    ? "amazon"
    : "default";
  const theme = STORE_THEMES[themeKey] || STORE_THEMES.default;

  // Progress Bar (0% -> 100%)
  const progress = (frame / durationInFrames) * 100;

  // Ambient Breathing Glow
  const glowScale = 1 + Math.sin(frame / 15) * 0.12;

  // Scene 1: Radar Intro Entrance (Frames 0 - 60)
  const introOpacity = interpolate(frame, [0, 15, 45, 60], [0, 1, 1, 0]);
  const introScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Scene 2: Main Deal Card Slide Up (Frame 45 onwards)
  const cardSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const cardTranslateY = interpolate(cardSpring, [0, 1], [300, 0]);
  const cardOpacity = interpolate(frame, [45, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Product Image Float & 3D Tilt
  const imgFloatY = Math.sin(frame / 18) * 10;
  const imgScale = spring({
    frame: frame - 55,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  // Discount Fire Badge Pop
  const badgeSpring = spring({
    frame: frame - 70,
    fps,
    config: { damping: 9, stiffness: 140 },
  });

  // Price Countdown (from MRP down to Sale Price)
  const priceProgress = interpolate(frame, [85, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentPrice = Math.round(
    mrp - (mrp - salePrice) * (1 - Math.pow(1 - priceProgress, 3))
  );

  // Strikethrough line progress
  const strikeProgress = interpolate(frame, [85, 120], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene 3: Final Call To Action Pulse (Frame 330 onwards)
  const ctaScale =
    1 + (frame > 330 ? Math.sin((frame - 330) / 8) * 0.05 : 0);

  // QR Code spring entrance (Frame 300 onwards)
  const qrSpring = spring({
    frame: frame - 300,
    fps,
    config: { damping: 11, stiffness: 120 },
  });
  const qrOpacity = interpolate(frame, [300, 315], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const savings = mrp - salePrice;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#080c16",
        backgroundImage: theme.bgGradient,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Dynamic Store Theme Glow Spheres */}
      <div
        style={{
          position: "absolute",
          top: "-5%",
          left: "20%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: theme.primary,
          filter: "blur(140px)",
          opacity: 0.22 * glowScale,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: theme.secondary || "#4f46e5",
          filter: "blur(150px)",
          opacity: 0.18,
          pointerEvents: "none",
        }}
      />

      {/* Top Header Progress Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 12,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent || "#38bdf8"})`,
            boxShadow: `0 0 15px ${theme.primary}`,
          }}
        />
      </div>

      {/* Top Stream Radar Telemetry Bar */}
      <div
        style={{
          marginTop: 40,
          width: "90%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px",
          borderRadius: 24,
          background: "rgba(15, 23, 42, 0.75)",
          border: `1px solid rgba(255, 255, 255, 0.12)`,
          backdropFilter: "blur(16px)",
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#10b981",
              boxShadow: "0 0 12px #10b981",
              transform: `scale(${1 + Math.sin(frame / 6) * 0.25})`,
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: "#e2e8f0",
              textTransform: "uppercase",
            }}
          >
            LIVE 27-STREAM DEALS RADAR
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 16px",
            borderRadius: 12,
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#34d399",
              fontFamily: "monospace",
            }}
          >
            0% FAKE DEALS
          </span>
        </div>
      </div>

      {/* Scene 1: Initial Hook Overlay (Frames 0 - 60) */}
      {frame < 60 && (
        <div
          style={{
            position: "absolute",
            top: 260,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: introOpacity,
            transform: `scale(${introScale})`,
            zIndex: 35,
          }}
        >
          <div
            style={{
              padding: "14px 36px",
              borderRadius: 30,
              background: theme.badgeBg,
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "0.05em",
              boxShadow: `0 10px 30px ${theme.primary}55`,
              marginBottom: 20,
              textTransform: "uppercase",
            }}
          >
            ⚡ {theme.tagText}
          </div>
          <h1
            style={{
              fontSize: 66,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.15,
              textShadow: "0 10px 30px rgba(0,0,0,0.8)",
            }}
          >
            INSANE LOOT DROP ALERT!
          </h1>
        </div>
      )}

      {/* Scene 2: Main Deal Card (Slide In from Frame 45) */}
      <div
        style={{
          width: "90%",
          flex: 1,
          marginTop: 35,
          marginBottom: 220,
          borderRadius: 36,
          background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 12, 22, 0.98) 100%)",
          border: `1.5px solid ${theme.primary}44`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px ${theme.primary}22`,
          backdropFilter: "blur(24px)",
          padding: 34,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 30,
          transform: `translateY(${cardTranslateY}px)`,
          opacity: cardOpacity,
        }}
      >
        {/* Deal Meta Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: theme.accent || "#38bdf8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {store.toUpperCase()} VERIFIED • {brand.toUpperCase()}
            </span>
          </div>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 12,
              background: `${theme.primary}22`,
              border: `1px solid ${theme.primary}55`,
              color: theme.primary,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            WORTH {worthScore}/100
          </div>
        </div>

        {/* Product Image Frame */}
        <div
          style={{
            width: "100%",
            height: 680,
            borderRadius: 28,
            backgroundColor: "#ffffff",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.06)",
            transform: `scale(${imgScale}) translateY(${imgFloatY}px)`,
          }}
        >
          <Img
            src={imageUrl}
            style={{
              width: "88%",
              height: "88%",
              objectFit: "contain",
            }}
          />

          {/* Crimson Discount Pop Badge */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: theme.badgeBg,
              borderRadius: 20,
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: `0 10px 25px ${theme.primary}88`,
              transform: `scale(${badgeSpring})`,
            }}
          >
            <span style={{ fontSize: 26 }}>🔥</span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "0.02em",
              }}
            >
              {discountPct}% OFF LOOT
            </span>
          </div>
        </div>

        {/* Product Title */}
        <h2
          style={{
            fontSize: 40,
            fontWeight: 800,
            lineHeight: 1.25,
            marginTop: 30,
            marginBottom: 20,
            color: "#ffffff",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </h2>

        {/* Price Row: Animated Countdown + Strikethrough MRP */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 900,
              fontFamily: "monospace",
              color: "#10b981",
              textShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
            }}
          >
            ₹{currentPrice.toLocaleString("en-IN")}
          </div>

          <div
            style={{
              position: "relative",
              fontSize: 44,
              fontWeight: 700,
              fontFamily: "monospace",
              color: "#64748b",
            }}
          >
            M.R.P. ₹{mrp.toLocaleString("en-IN")}
            {/* Animated Strikethrough Line */}
            <div
              style={{
                position: "absolute",
                top: "55%",
                left: -4,
                width: `${strikeProgress + 8}%`,
                height: 5,
                backgroundColor: "#ef4444",
                borderRadius: 4,
              }}
            />
          </div>
        </div>

        {/* Savings Callout Pill */}
        <div
          style={{
            alignSelf: "flex-start",
            padding: "10px 22px",
            borderRadius: 16,
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 24 }}>🎉</span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#34d399",
              letterSpacing: "0.02em",
            }}
          >
            YOU SAVE ₹{savings.toLocaleString("en-IN")} (VERIFIED DROP)
          </span>
        </div>
      </div>

      {/* Floating Dynamic QR Code Card (Frames 300 - 450) */}
      {frame >= 300 && qrCodeDataUrl && (
        <div
          style={{
            position: "absolute",
            top: 180,
            right: 50,
            zIndex: 60,
            transform: `scale(${qrSpring})`,
            opacity: qrOpacity,
            background: "rgba(15, 23, 42, 0.95)",
            padding: 18,
            borderRadius: 24,
            border: `2px solid ${theme.primary}`,
            boxShadow: `0 15px 35px rgba(0,0,0,0.8), 0 0 25px ${theme.primary}66`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Img
            src={qrCodeDataUrl}
            style={{
              width: 140,
              height: 140,
              borderRadius: 12,
              backgroundColor: "#ffffff",
              padding: 6,
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            SCAN TO BUY
          </span>
        </div>
      )}

      {/* Bottom Sticky Action Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          width: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          zIndex: 50,
          transform: `scale(${ctaScale})`,
        }}
      >
        {/* Pulsing CTA Button */}
        <div
          style={{
            width: "100%",
            height: 104,
            borderRadius: 30,
            background: theme.badgeBg,
            boxShadow: `0 15px 35px -5px ${theme.primary}88, 0 0 25px ${theme.primary}44`,
            border: "2px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 38 }}>⚡</span>
          <span
            style={{
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: "0.04em",
              color: "#ffffff",
              textTransform: "uppercase",
            }}
          >
            GRAB THIS LOOT DEAL NOW
          </span>
        </div>

        {/* Telegram & Web Pill */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#94a3b8",
            letterSpacing: "0.04em",
          }}
        >
          Join:{" "}
          <span style={{ color: "#ffffff", fontWeight: 800 }}>
            {handle}
          </span>{" "}
          • Visit:{" "}
          <span style={{ color: theme.primary, fontWeight: 800 }}>
            indiadealhunts.in
          </span>
        </div>
      </div>

      {/* Audio Layer: BGM, Voiceover & SFX */}
      {enableAudio && (
        <>
          {/* Background Music (Smooth loop, side-chained under voiceover) */}
          <Audio
            src={audioBgm || staticFile("audio/bgm.mp3")}
            volume={(f) =>
              interpolate(f, [0, 30, 410, 450], [0, 0.22, 0.22, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />

          {/* Neural Voiceover */}
          <Sequence from={15}>
            <Audio
              src={audioVoice || staticFile("audio/voice.mp3")}
              volume={1.0}
            />
          </Sequence>

          {/* SFX: Slide Whoosh when Deal Card enters at frame 45 */}
          <Sequence from={45}>
            <Audio src={staticFile("audio/whoosh.mp3")} volume={0.6} />
          </Sequence>

          {/* SFX: Pop when discount badge pops at frame 70 */}
          <Sequence from={70}>
            <Audio src={staticFile("audio/pop.mp3")} volume={0.7} />
          </Sequence>

          {/* SFX: Click when CTA pulses at frame 330 */}
          <Sequence from={330}>
            <Audio src={staticFile("audio/click.mp3")} volume={0.6} />
          </Sequence>
        </>
      )}
    </div>
  );
};
