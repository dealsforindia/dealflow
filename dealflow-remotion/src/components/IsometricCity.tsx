import React from "react";
import { FeatherLogo } from "./FeatherLogo";

export interface IsometricCityProps {
  parallaxBg: number;
  parallaxFg: number;
  frame: number;
}

export const IsometricCity: React.FC<IsometricCityProps> = ({
  parallaxBg,
  parallaxFg,
  frame,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: "#E8F5E9",
      }}
    >
      {/* Pastel Mint/Sky Gradient with floating soft geometric clouds */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        fill="none"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="65%" stopColor="#DCFCE7" />
            <stop offset="100%" stopColor="#BBF7D0" />
          </linearGradient>

          <linearGradient id="towerGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>

          <linearGradient id="towerGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          <linearGradient id="towerGrad3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect width="1920" height="1080" fill="url(#skyGrad)" />

        {/* Soft floating stylized clouds in distance */}
        <g transform={`translate(${parallaxBg * 0.4}, 0)`}>
          <rect x="180" y="90" width="140" height="28" rx="14" fill="#FFFFFF" opacity="0.75" />
          <rect x="220" y="75" width="80" height="28" rx="14" fill="#FFFFFF" opacity="0.8" />

          <rect x="980" y="140" width="180" height="32" rx="16" fill="#FFFFFF" opacity="0.75" />
          <rect x="1030" y="125" width="100" height="32" rx="16" fill="#FFFFFF" opacity="0.8" />

          <rect x="1560" y="110" width="160" height="28" rx="14" fill="#FFFFFF" opacity="0.7" />
        </g>

        {/* Distant Futuristic Green Skyscrapers (Layer 1 - Slow Parallax) */}
        <g transform={`translate(${parallaxBg}, 0)`}>
          {/* Spire Tower Left */}
          <rect x="120" y="320" width="110" height="480" rx="16" fill="url(#towerGrad1)" stroke="#0F172A" strokeWidth="3" />
          <line x1="175" y1="230" x2="175" y2="320" stroke="#0F172A" strokeWidth="4" />
          <circle cx="175" cy="225" r="7" fill="#CCFF00" stroke="#0F172A" strokeWidth="2.5" />
          {/* Windows */}
          {[...Array(6)].map((_, i) => (
            <rect key={i} x="140" y={350 + i * 45} width="70" height="24" rx="6" fill="#FFFFFF" opacity="0.65" />
          ))}

          {/* Stepped Terraced Highrise Center-Left */}
          <rect x="280" y="260" width="150" height="540" rx="20" fill="url(#towerGrad2)" stroke="#0F172A" strokeWidth="3.5" />
          <rect x="315" y="210" width="80" height="50" rx="12" fill="#A7F3D0" stroke="#0F172A" strokeWidth="3" />
          {/* Rooftop garden */}
          <circle cx="340" cy="205" r="14" fill="#00C805" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="370" cy="205" r="12" fill="#00C805" stroke="#0F172A" strokeWidth="2.5" />

          {/* Curved Bio-Tower Center-Right */}
          <path
            d="M 1240 800 L 1240 280 C 1240 220, 1380 220, 1380 280 L 1380 800 Z"
            fill="url(#towerGrad3)"
            stroke="#0F172A"
            strokeWidth="3.5"
          />
          {/* Vertical Solar Band */}
          <line x1="1310" y1="240" x2="1310" y2="780" stroke="#0F172A" strokeWidth="3" strokeDasharray="8 8" />

          {/* Far Right Futuristic Skyscraper */}
          <rect x="1520" y="300" width="130" height="500" rx="18" fill="url(#towerGrad1)" stroke="#0F172A" strokeWidth="3.5" />
          <polygon points="1520,300 1585,210 1650,300" fill="#CCFF00" stroke="#0F172A" strokeWidth="3" />
          <circle cx="1585" cy="200" r="8" fill="#00C805" stroke="#0F172A" strokeWidth="2.5" />
        </g>

        {/* Midground Architecture & Skyways (Layer 2) */}
        <g transform={`translate(${parallaxBg * 1.5}, 0)`}>
          {/* Midground Building Left */}
          <rect x="480" y="420" width="140" height="380" rx="18" fill="#A7F3D0" stroke="#0F172A" strokeWidth="3.5" />
          <rect x="500" y="445" width="100" height="30" rx="8" fill="#FFFFFF" opacity="0.8" />
          <rect x="500" y="495" width="100" height="30" rx="8" fill="#FFFFFF" opacity="0.8" />

          {/* Skyway Bridge linking buildings */}
          <path
            d="M 620 540 C 740 520, 880 520, 1000 540"
            stroke="#0F172A"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 620 540 C 740 520, 880 520, 1000 540"
            stroke="#CCFF00"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Midground Building Right */}
          <rect x="1000" y="380" width="160" height="420" rx="20" fill="#86EFAC" stroke="#0F172A" strokeWidth="3.5" />
          <circle cx="1080" cy="360" r="22" fill="#00C805" stroke="#0F172A" strokeWidth="3" />
        </g>

        {/* Rolling Mint Green Plaza Ground & Hills */}
        <g transform={`translate(${parallaxFg * 0.5}, 0)`}>
          {/* Back Hill */}
          <path
            d="M -100 780 C 400 710, 1100 720, 2020 770 L 2020 1120 L -100 1120 Z"
            fill="#86EFAC"
            stroke="#0F172A"
            strokeWidth="4"
          />
          {/* Main Foreground Rolling Ground */}
          <path
            d="M -100 840 C 350 780, 850 820, 1400 790 C 1750 770, 1950 810, 2020 830 L 2020 1120 L -100 1120 Z"
            fill="#6EE7B7"
            stroke="#0F172A"
            strokeWidth="4.5"
          />
        </g>

        {/* Vector Stylized Conifer & Lollipop Trees */}
        <g transform={`translate(${parallaxFg * 0.7}, 0)`}>
          {/* Tree 1 Left */}
          <rect x="220" y="810" width="10" height="40" fill="#0F172A" rx="4" />
          <circle cx="225" cy="795" r="28" fill="#00C805" stroke="#0F172A" strokeWidth="3" />
          <circle cx="225" cy="785" r="20" fill="#CCFF00" stroke="#0F172A" strokeWidth="2.5" />

          {/* Tree 2 Mid */}
          <rect x="680" y="840" width="12" height="45" fill="#0F172A" rx="4" />
          <polygon points="686,760 650,840 722,840" fill="#00C805" stroke="#0F172A" strokeWidth="3" />
          <polygon points="686,740 655,800 717,800" fill="#34D399" stroke="#0F172A" strokeWidth="2.5" />

          {/* Tree 3 Right */}
          <rect x="1680" y="820" width="12" height="44" fill="#0F172A" rx="4" />
          <circle cx="1686" cy="800" r="32" fill="#00C805" stroke="#0F172A" strokeWidth="3" />
          <circle cx="1686" cy="788" r="22" fill="#86EFAC" stroke="#0F172A" strokeWidth="2.5" />
        </g>

        {/* Small Illustrated Vector People Walking (Foreground Parallax) */}
        <g transform={`translate(${parallaxFg}, 0)`}>
          {/* Person 1 (Walking Right) */}
          <g transform="translate(380, 850)">
            <circle cx="12" cy="6" r="6" fill="#0F172A" />
            <rect x="7" y="14" width="10" height="18" rx="4" fill="#00C805" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="9" y1="32" x2="6" y2="46" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="15" y1="32" x2="18" y2="46" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Person 2 (Walking Left) */}
          <g transform="translate(1420, 860)">
            <circle cx="12" cy="6" r="6" fill="#0F172A" />
            <rect x="7" y="14" width="10" height="18" rx="4" fill="#CCFF00" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="9" y1="32" x2="12" y2="46" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="15" y1="32" x2="15" y2="46" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Person 3 (Standing with phone) */}
          <g transform="translate(1560, 845)">
            <circle cx="12" cy="6" r="6" fill="#0F172A" />
            <rect x="7" y="14" width="10" height="18" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="9" y1="32" x2="9" y2="46" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="15" y1="32" x2="15" y2="46" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            {/* Phone */}
            <rect x="18" y="18" width="4" height="7" rx="1" fill="#00C805" />
          </g>
        </g>
      </svg>
    </div>
  );
};
