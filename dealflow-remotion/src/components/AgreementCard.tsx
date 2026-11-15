import React from "react";
import { FeatherLogo } from "./FeatherLogo";

export interface AgreementCardProps {
  title: string;
  subtitle?: string;
  category: "agreements" | "coverage" | "identity";
  buttonText?: string;
  rotation?: number;
  scale?: number;
  yOffset?: number;
  xOffset?: number;
  progressPercent?: number;
}

export const AgreementCard: React.FC<AgreementCardProps> = ({
  title,
  subtitle,
  category,
  buttonText = "Continue",
  rotation = 0,
  scale = 1,
  yOffset = 0,
  xOffset = 0,
  progressPercent = 80,
}) => {
  return (
    <div
      style={{
        width: "420px",
        minHeight: "580px",
        borderRadius: "32px",
        backgroundColor: "#FFFFFF",
        border: "3.5px solid #0F172A",
        boxShadow: "0 30px 60px -15px rgba(15, 23, 42, 0.35), 0 10px 20px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Black Top Header Section */}
      <div
        style={{
          backgroundColor: "#0F172A",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#CCFF00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FeatherLogo size={18} color="#0F172A" />
          </div>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              color: "#94A3B8",
            }}
          >
            Robinhood
          </span>
        </div>

        {/* Minimal pill badge */}
        <div
          style={{
            padding: "4px 10px",
            borderRadius: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            fontSize: "11px",
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
            color: "#CCFF00",
          }}
        >
          {category === "agreements" ? "Step 1 of 3" : category === "coverage" ? "Protection" : "KYC ID"}
        </div>
      </div>

      {/* White Content Section */}
      <div
        style={{
          flex: 1,
          padding: "28px 28px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div>
          {/* Main Title */}
          <h2
            style={{
              margin: "0 0 8px 0",
              fontSize: "24px",
              fontWeight: 800,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: "#0F172A",
              letterSpacing: "-0.5px",
              lineHeight: 1.25,
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                margin: "0 0 20px 0",
                fontSize: "13px",
                color: "#64748B",
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Category-Specific Body Graphics */}
          {category === "agreements" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
              {[
                "Customer Agreement & Disclosures",
                "Margin Risk & Cash Management",
                "Privacy Policy & Electronic Delivery",
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    backgroundColor: "#F8FAFC",
                    border: "1.5px solid #E2E8F0",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      backgroundColor: "#00C805",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M 2.5 6 L 5 8.5 L 9.5 3.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: "system-ui, sans-serif",
                      color: "#1E293B",
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}

              {/* Vector document preview lines */}
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ height: "6px", width: "90%", backgroundColor: "#E2E8F0", borderRadius: "3px" }} />
                <div style={{ height: "6px", width: "75%", backgroundColor: "#E2E8F0", borderRadius: "3px" }} />
                <div style={{ height: "6px", width: "60%", backgroundColor: "#E2E8F0", borderRadius: "3px" }} />
              </div>
            </div>
          )}

          {category === "coverage" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "10px" }}>
              {/* Large Shield Vector Graphic */}
              <div
                style={{
                  width: "90px",
                  height: "100px",
                  position: "relative",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="90" height="100" viewBox="0 0 90 100" fill="none">
                  <path
                    d="M 45 4 L 82 18 C 82 58, 65 84, 45 96 C 25 84, 8 58, 8 18 Z"
                    fill="#F0FDF4"
                    stroke="#0F172A"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M 45 16 L 72 26 C 72 56, 59 75, 45 84 C 31 75, 18 56, 18 26 Z"
                    fill="#CCFF00"
                    stroke="#0F172A"
                    strokeWidth="2.5"
                  />
                </svg>
                <div style={{ position: "absolute", top: "42px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#0F172A">
                    <path d="M 12 1 C 8.7 1 6 3.7 6 7 L 6 9 L 4 9 C 2.9 9 2 9.9 2 11 L 2 21 C 2 22.1 2.9 23 4 23 L 20 23 C 21.1 23 22 22.1 22 21 L 22 11 C 22 9.9 21.1 9 20 9 L 18 9 L 18 7 C 18 3.7 15.3 1 12 1 Z M 12 4 C 13.7 4 15 5.3 15 7 L 15 9 L 9 9 L 9 7 C 9 5.3 10.3 4 12 4 Z" />
                  </svg>
                </div>
              </div>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "SIPC Member protection up to $500,000",
                  "256-bit bank-grade TLS encryption",
                  "FDIC insured through partner banks",
                ].map((perk, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#00C805",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "#334155",
                        fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      {perk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {category === "identity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}>
              {/* ID Scan Mock Frame */}
              <div
                style={{
                  height: "140px",
                  borderRadius: "18px",
                  border: "2px dashed #94A3B8",
                  backgroundColor: "#F8FAFC",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  gap: "8px",
                }}
              >
                {/* Four Corner brackets */}
                <div style={{ position: "absolute", top: 8, left: 8, width: 14, height: 14, borderTop: "3px solid #00C805", borderLeft: "3px solid #00C805" }} />
                <div style={{ position: "absolute", top: 8, right: 8, width: 14, height: 14, borderTop: "3px solid #00C805", borderRight: "3px solid #00C805" }} />
                <div style={{ position: "absolute", bottom: 8, left: 8, width: 14, height: 14, borderBottom: "3px solid #00C805", borderLeft: "3px solid #00C805" }} />
                <div style={{ position: "absolute", bottom: 8, right: 8, width: 14, height: 14, borderBottom: "3px solid #00C805", borderRight: "3px solid #00C805" }} />

                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "#CCFF00",
                    border: "2px solid #0F172A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#0F172A">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M 4 20 C 4 16 7.5 13 12 13 C 16.5 13 20 16 20 20 Z" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0F172A",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  Scan Driver's License / Passport
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                    Verification
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#00C805" }}>
                    {progressPercent}% Complete
                  </span>
                </div>
                <div style={{ height: "8px", width: "100%", backgroundColor: "#E2E8F0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: "#00C805", borderRadius: "4px" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Black Pill Action Button */}
        <div
          style={{
            marginTop: "20px",
            height: "52px",
            borderRadius: "26px",
            backgroundColor: "#0F172A",
            border: "2px solid #0F172A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 16px rgba(15, 23, 42, 0.2)",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: 800,
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: "0.2px",
            }}
          >
            {buttonText}
          </span>
        </div>
      </div>
    </div>
  );
};
