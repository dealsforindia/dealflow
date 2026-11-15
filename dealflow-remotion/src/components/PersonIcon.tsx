import React from "react";

export interface PersonIconProps {
  variant?: "greenFigure" | "purplePortrait" | "idCard" | "document" | "cardReader";
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PersonIcon: React.FC<PersonIconProps> = ({
  variant = "greenFigure",
  size = 140,
  color,
  style,
}) => {
  if (variant === "purplePortrait") {
    // Scene 6: Simplified purple human portrait icon
    const purple = color || "#7B61FF";
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: "#F5F3FF",
          border: `3.5px solid ${purple}`,
          boxShadow: "0 14px 28px rgba(123, 97, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="20" r="10" fill={purple} stroke="#0F172A" strokeWidth="2.5" />
          <path
            d="M 12 50 C 12 38, 20 34, 30 34 C 40 34, 48 38, 48 50 Z"
            fill={purple}
            stroke="#0F172A"
            strokeWidth="2.5"
          />
        </svg>
      </div>
    );
  }

  if (variant === "idCard") {
    // Scene 6: ID Card icon
    const purple = color || "#7B61FF";
    return (
      <div
        style={{
          width: `${size * 1.25}px`,
          height: `${size * 0.85}px`,
          borderRadius: "20px",
          backgroundColor: "#FFFFFF",
          border: `3.5px solid ${purple}`,
          boxShadow: "0 14px 28px rgba(123, 97, 255, 0.2)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          ...style,
        }}
      >
        {/* Photo avatar box */}
        <div
          style={{
            width: `${size * 0.4}px`,
            height: `${size * 0.5}px`,
            borderRadius: "10px",
            backgroundColor: "#EDE9FE",
            border: `2px solid ${purple}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={purple}>
            <circle cx="12" cy="8" r="4" />
            <path d="M 5 20 C 5 16 8 14 12 14 C 16 14 19 16 19 20 Z" />
          </svg>
        </div>

        {/* Card info lines */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ height: "6px", width: "80%", backgroundColor: purple, borderRadius: "3px" }} />
          <div style={{ height: "4px", width: "60%", backgroundColor: "#CBD5E1", borderRadius: "2px" }} />
          <div style={{ height: "4px", width: "40%", backgroundColor: "#CBD5E1", borderRadius: "2px" }} />
          <div
            style={{
              marginTop: "4px",
              width: "22px",
              height: "16px",
              borderRadius: "4px",
              backgroundColor: "#CCFF00",
              border: "1.5px solid #0F172A",
            }}
          />
        </div>
      </div>
    );
  }

  if (variant === "document") {
    // Scene 6: Legal agreement document with stamp seal
    const purple = color || "#7B61FF";
    return (
      <div
        style={{
          width: `${size * 0.85}px`,
          height: `${size * 1.15}px`,
          borderRadius: "18px",
          backgroundColor: "#FFFFFF",
          border: `3.5px solid ${purple}`,
          boxShadow: "0 14px 28px rgba(123, 97, 255, 0.2)",
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...style,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ height: "6px", width: "70%", backgroundColor: purple, borderRadius: "3px" }} />
          <div style={{ height: "4px", width: "90%", backgroundColor: "#CBD5E1", borderRadius: "2px" }} />
          <div style={{ height: "4px", width: "85%", backgroundColor: "#CBD5E1", borderRadius: "2px" }} />
          <div style={{ height: "4px", width: "65%", backgroundColor: "#CBD5E1", borderRadius: "2px" }} />
        </div>

        {/* Seal badge stamp */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#CCFF00",
              border: `2px solid #0F172A`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
              <path d="M 2.5 6 L 5 8.5 L 9.5 3.5" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "cardReader") {
    // Scene 6: Card reader / Biometric device
    const purple = color || "#7B61FF";
    return (
      <div
        style={{
          width: `${size * 0.9}px`,
          height: `${size * 1.15}px`,
          borderRadius: "22px",
          backgroundColor: "#FFFFFF",
          border: `3.5px solid ${purple}`,
          boxShadow: "0 14px 28px rgba(123, 97, 255, 0.2)",
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          ...style,
        }}
      >
        {/* Terminal Screen */}
        <div
          style={{
            width: "100%",
            height: "46px",
            borderRadius: "10px",
            backgroundColor: "#EDE9FE",
            border: `2px solid ${purple}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "22px", height: "14px", borderRadius: "3px", backgroundColor: "#00C805" }} />
        </div>

        {/* Keypad dots */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "6px",
            width: "80%",
            padding: "8px 0",
          }}
        >
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#CBD5E1",
                margin: "auto",
              }}
            />
          ))}
        </div>

        {/* Card slot at bottom */}
        <div style={{ width: "70%", height: "4px", backgroundColor: "#0F172A", borderRadius: "2px" }} />
      </div>
    );
  }

  // Scene 4: Green human/customer figure on a circular platform with speech cloud
  return (
    <div
      style={{
        position: "relative",
        width: `${size * 1.8}px`,
        height: `${size * 2.4}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        ...style,
      }}
    >
      {/* Speech / Cloud Bubble above head */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          right: "-10px",
          padding: "12px 22px",
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          border: "3.5px solid #0F172A",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.18)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 5,
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
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M 2.5 6 L 5 8.5 L 9.5 3.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>
          Identity Approved
        </span>
      </div>

      {/* Geometric Customer Vector */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
          marginBottom: "16px",
        }}
      >
        {/* Head with stylish vector glasses */}
        <div
          style={{
            width: "74px",
            height: "74px",
            borderRadius: "50%",
            backgroundColor: "#00C805",
            border: "4px solid #0F172A",
            marginBottom: "8px",
            boxShadow: "0 6px 14px rgba(0, 200, 5, 0.35)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Glasses */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <div style={{ width: "20px", height: "14px", borderRadius: "4px", border: "3px solid #0F172A", backgroundColor: "#CCFF00" }} />
            <div style={{ width: "6px", height: "3px", backgroundColor: "#0F172A" }} />
            <div style={{ width: "20px", height: "14px", borderRadius: "4px", border: "3px solid #0F172A", backgroundColor: "#CCFF00" }} />
          </div>
        </div>

        {/* Torso / geometric block */}
        <div
          style={{
            width: "106px",
            height: "120px",
            borderRadius: "24px 24px 12px 12px",
            backgroundColor: "#CCFF00",
            border: "4px solid #0F172A",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Subtle tie or collar line */}
          <div style={{ width: "8px", height: "48px", backgroundColor: "#0F172A", borderRadius: "4px" }} />
        </div>

        {/* Legs / geometric columns */}
        <div style={{ display: "flex", gap: "14px", marginTop: "-4px" }}>
          <div
            style={{
              width: "26px",
              height: "76px",
              backgroundColor: "#00C805",
              border: "4px solid #0F172A",
              borderRadius: "0 0 14px 14px",
            }}
          />
          <div
            style={{
              width: "26px",
              height: "76px",
              backgroundColor: "#00C805",
              border: "4px solid #0F172A",
              borderRadius: "0 0 14px 14px",
            }}
          />
        </div>
      </div>

      {/* Isometric circular mint pedestal/platform */}
      <div
        style={{
          width: `${size * 1.7}px`,
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#A7F3D0",
          border: "4.5px solid #0F172A",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.25)",
        }}
      />
    </div>
  );
};
