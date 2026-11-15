import React from "react";
import { FeatherLogo } from "./FeatherLogo";

export interface PhoneProps {
  variant?: "isometric" | "profile" | "blackCard";
  frame?: number;
  fps?: number;
  style?: React.CSSProperties;
}

export const Phone: React.FC<PhoneProps> = ({
  variant = "isometric",
  frame = 0,
  fps = 30,
  style,
}) => {
  if (variant === "blackCard") {
    return (
      <div
        style={{
          width: "480px",
          height: "300px",
          borderRadius: "28px",
          backgroundColor: "#0F172A",
          border: "3.5px solid #1E293B",
          boxShadow: "0 35px 70px -15px rgba(0, 0, 0, 0.45), 0 10px 20px rgba(0, 0, 0, 0.2)",
          position: "relative",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#FFFFFF",
          overflow: "hidden",
          ...style,
        }}
      >
        {/* Subtle metallic reflection beam */}
        <div
          style={{
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Top Header with Chip & NFC */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Gold EMV Chip */}
            <div
              style={{
                width: "50px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "#F59E0B",
                border: "2px solid #D97706",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: "2px",
                padding: "4px",
                boxShadow: "inset 0 1px 3px rgba(255,255,255,0.4)",
              }}
            >
              <div style={{ borderRight: "1.5px solid #B45309", borderBottom: "1.5px solid #B45309" }} />
              <div style={{ borderBottom: "1.5px solid #B45309" }} />
              <div style={{ borderRight: "1.5px solid #B45309" }} />
              <div />
            </div>

            {/* Contactless waves */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M 8.5 7.5 C 10.7 9.7 10.7 14.3 8.5 16.5" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 12.5 4.5 C 16.5 8.5 16.5 15.5 12.5 19.5" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "#CCFF00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FeatherLogo size={26} color="#0F172A" />
          </div>
        </div>

        {/* Card Number & Holder info */}
        <div style={{ zIndex: 1 }}>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "24px",
              letterSpacing: "4px",
              fontWeight: 700,
              color: "#F8FAFC",
              marginBottom: "16px",
            }}
          >
            •••• •••• •••• 8842
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px" }}>
                Cardholder
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", color: "#E2E8F0" }}>
                ALEX MORGAN
              </div>
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#CCFF00",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Robinhood Gold
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "profile") {
    // Vertical green smartphone with simple form/profile interface
    return (
      <div
        style={{
          width: "340px",
          height: "620px",
          borderRadius: "44px",
          backgroundColor: "#F0FDF4",
          border: "4px solid #0F172A",
          boxShadow: "0 30px 60px -15px rgba(0, 200, 5, 0.3), 0 10px 25px rgba(0, 0, 0, 0.15)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          ...style,
        }}
      >
        {/* Dynamic Island / Notch */}
        <div
          style={{
            width: "120px",
            height: "24px",
            borderRadius: "12px",
            backgroundColor: "#0F172A",
            alignSelf: "center",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
          }}
        >
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1E293B" }} />
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#00C805" }} />
        </div>

        {/* Profile Card Interface */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: "32px",
            border: "2px solid #E2E8F0",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Avatar with verified badge */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "84px",
                height: "84px",
                borderRadius: "50%",
                backgroundColor: "#CCFF00",
                border: "3px solid #0F172A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="#0F172A">
                <circle cx="12" cy="8" r="4.5" />
                <path d="M 4 20 C 4 15.5 8 13 12 13 C 16 13 20 15.5 20 20 Z" />
              </svg>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: "#00C805",
                border: "2px solid #FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M 2.5 6 L 5 8.5 L 9.5 3.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>
              Alex Morgan
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Active Investor • Verified</div>
          </div>

          {/* Form input rows */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            {[
              { label: "Account Status", val: "Tier 1 Verified", color: "#00C805" },
              { label: "Instant Buying Power", val: "$10,000.00", color: "#0F172A" },
              { label: "Cash APY Rate", val: "5.00%", color: "#00C805" },
            ].map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  backgroundColor: "#F8FAFC",
                  border: "1.5px solid #E2E8F0",
                }}
              >
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: "13px", color: row.color, fontWeight: 700 }}>{row.val}</span>
              </div>
            ))}
          </div>

          {/* Active Status Pill */}
          <div
            style={{
              marginTop: "auto",
              width: "100%",
              height: "44px",
              borderRadius: "22px",
              backgroundColor: "#CCFF00",
              border: "2px solid #0F172A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "13px",
              color: "#0F172A",
            }}
          >
            ✓ All Systems Active
          </div>
        </div>
      </div>
    );
  }

  // Default: Isometric Gray Phone with Vibrant Green Screen Section
  return (
    <div
      style={{
        width: "360px",
        height: "640px",
        borderRadius: "48px",
        backgroundColor: "#E2E8F0",
        border: "5px solid #0F172A",
        boxShadow: "0 35px 70px -15px rgba(15, 23, 42, 0.4), 0 12px 24px rgba(0, 0, 0, 0.15)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        ...style,
      }}
    >
      {/* Notch */}
      <div
        style={{
          width: "130px",
          height: "22px",
          borderRadius: "11px",
          backgroundColor: "#0F172A",
          alignSelf: "center",
          marginBottom: "16px",
        }}
      />

      {/* Screen: Vibrant Green Content */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#00C805",
          borderRadius: "34px",
          border: "2px solid #0F172A",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#0F172A",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#0F172A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FeatherLogo size={16} color="#CCFF00" />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Investing
            </span>
          </div>

          <div style={{ fontSize: "32px", fontWeight: 900, fontFamily: "'Inter', sans-serif", letterSpacing: "-1px" }}>
            $48,250.00
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", opacity: 0.85, marginTop: "4px" }}>
            ↗ +$3,840.50 (8.65%) Today
          </div>
        </div>

        {/* Dynamic Vector Stock Chart Wave */}
        <div style={{ height: "140px", width: "100%", position: "relative" }}>
          <svg width="100%" height="100%" viewBox="0 0 280 120" fill="none">
            <path
              d="M 10 100 Q 60 85 90 60 T 170 45 T 230 20 T 270 12"
              stroke="#0F172A"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Pulsing endpoint dot */}
            <circle cx="270" cy="12" r="6" fill="#CCFF00" stroke="#0F172A" strokeWidth="3" />
          </svg>
        </div>

        {/* Bottom Trade Bar */}
        <div
          style={{
            height: "46px",
            borderRadius: "23px",
            backgroundColor: "#0F172A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#CCFF00",
            fontWeight: 800,
            fontSize: "14px",
            letterSpacing: "0.3px",
          }}
        >
          Trade Now
        </div>
      </div>
    </div>
  );
};
