import React from 'react';
import { CharacterProps } from './types';

export const GptCharacter: React.FC<CharacterProps> = ({
  x,
  y,
  scale = 1,
  isSpeaking = false,
  emotion = 'happy',
  gesture = 'idle',
  frame,
  fps,
}) => {
  // Idle bounce
  const bounce = Math.sin(frame / 5) * 5;
  const legCycle = Math.sin(frame / 3.5) * 7;

  // Mouth animation when speaking
  const mouthFrame = Math.floor(frame / 3) % 4;

  const isFainting = emotion === 'fainting';
  const rotation = isFainting ? -75 : 0;
  const posY = isFainting ? y + 80 : y + bounce;

  // Arm gestures
  let leftArmAngle = -10;
  let rightArmAngle = 10;
  if (gesture === 'flexing') {
    leftArmAngle = -70 + Math.sin(frame / 4) * 10;
    rightArmAngle = 70 - Math.sin(frame / 4) * 10;
  } else if (gesture === 'pointing') {
    leftArmAngle = -60 + Math.sin(frame / 3) * 12;
  } else if (gesture === 'typing') {
    leftArmAngle = -40 + Math.sin(frame / 2) * 15;
    rightArmAngle = 40 - Math.sin(frame / 2) * 15;
  } else if (gesture === 'jumping') {
    leftArmAngle = -85;
    rightArmAngle = 85;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${posY}px`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.45))',
      }}
    >
      <svg width="230" height="330" viewBox="0 0 230 330" fill="none">
        {/* Ground Shadow */}
        <ellipse
          cx="115"
          cy="312"
          rx={isFainting ? "90" : "58"}
          ry="15"
          fill="rgba(0,0,0,0.35)"
        />

        {/* --- LEGS & HIGH-TOP SNEAKERS --- */}
        {/* Left Leg */}
        <g transform={`rotate(${gesture === 'jumping' ? -18 : legCycle}, 82, 245)`}>
          <rect x="74" y="235" width="18" height="55" rx="9" fill="#047857" />
          {/* Sneaker */}
          <path
            d="M58 280 C58 268, 96 268, 102 276 L106 292 C106 296, 56 298, 54 292 Z"
            fill="#10B981"
            stroke="#064E3B"
            strokeWidth="3"
          />
          <rect x="54" y="290" width="52" height="7" rx="3.5" fill="#FFFFFF" />
          {/* Sneaker Stripe */}
          <path d="M 68 282 L 92 282" stroke="#FFFFFF" strokeWidth="3" />
        </g>

        {/* Right Leg */}
        <g transform={`rotate(${gesture === 'jumping' ? 18 : -legCycle}, 148, 245)`}>
          <rect x="138" y="235" width="18" height="55" rx="9" fill="#047857" />
          {/* Sneaker */}
          <path
            d="M124 280 C124 268, 162 268, 168 276 L172 292 C172 296, 122 298, 120 292 Z"
            fill="#10B981"
            stroke="#064E3B"
            strokeWidth="3"
          />
          <rect x="120" y="290" width="52" height="7" rx="3.5" fill="#FFFFFF" />
          {/* Sneaker Stripe */}
          <path d="M 134 282 L 158 282" stroke="#FFFFFF" strokeWidth="3" />
        </g>

        {/* --- HEADPHONES BAND --- */}
        <path
          d="M 52 105 C 52 50, 178 50, 178 105"
          stroke="#1F2937"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* --- LEFT ARM --- */}
        <g transform={`rotate(${leftArmAngle}, 48, 145)`}>
          <path
            d="M 52 145 Q 18 175 28 210"
            stroke="#10B981"
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Glove */}
          <circle cx="28" cy="216" r="15" fill="#FFFFFF" />
          <circle cx="18" cy="214" r="8" fill="#E5E7EB" />
        </g>

        {/* --- BODY (Chunky Tech Robot) --- */}
        <rect
          x="44"
          y="72"
          width="142"
          height="172"
          rx="52"
          fill="url(#gptGrad)"
          stroke="#065F46"
          strokeWidth="4"
        />

        {/* Chest Display */}
        <rect
          x="66"
          y="152"
          width="98"
          height="66"
          rx="20"
          fill="#064E3B"
          stroke="#34D399"
          strokeWidth="3"
        />
        {/* OpenAI Flower Swirl Icon */}
        <g transform="translate(115, 185) scale(0.9)">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <path
              key={deg}
              d="M 0 -15 C 8 -15, 12 -8, 10 0 C 8 8, 0 10, 0 0 Z"
              fill="#A7F3D0"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="5" fill="#10B981" />
        </g>

        {/* --- HEADPHONE EARCUPS --- */}
        <rect x="36" y="94" width="16" height="32" rx="8" fill="#1F2937" stroke="#34D399" strokeWidth="2" />
        <rect x="178" y="94" width="16" height="32" rx="8" fill="#1F2937" stroke="#34D399" strokeWidth="2" />

        {/* --- COOL BLACK SHADES / SUNGLASSES --- */}
        <path
          d="M 64 100 L 108 100 L 102 122 L 72 122 Z"
          fill="#111827"
          stroke="#374151"
          strokeWidth="3"
        />
        <path
          d="M 122 100 L 166 100 L 158 122 L 128 122 Z"
          fill="#111827"
          stroke="#374151"
          strokeWidth="3"
        />
        <line x1="108" y1="105" x2="122" y2="105" stroke="#111827" strokeWidth="4" />
        {/* Glare Reflection in Sunglasses */}
        <polygon points="70,103 82,103 76,119 66,119" fill="rgba(255, 255, 255, 0.45)" />
        <polygon points="128,103 140,103 134,119 124,119" fill="rgba(255, 255, 255, 0.45)" />

        {/* Smug / Animated Mouth */}
        {isSpeaking ? (
          mouthFrame === 0 ? (
            <ellipse cx="115" cy="136" rx="14" ry="10" fill="#064E3B" stroke="#34D399" strokeWidth="2" />
          ) : mouthFrame === 1 ? (
            <path d="M 102 134 Q 115 148 128 134 Z" fill="#064E3B" stroke="#34D399" strokeWidth="2" />
          ) : mouthFrame === 2 ? (
            <rect x="104" y="132" width="22" height="10" rx="4" fill="#064E3B" />
          ) : (
            <circle cx="115" cy="136" r="9" fill="#064E3B" />
          )
        ) : emotion === 'shocked' ? (
          <circle cx="115" cy="136" r="14" fill="#064E3B" stroke="#34D399" strokeWidth="3" />
        ) : (
          /* Smug smirk */
          <path
            d="M 102 134 Q 116 142 128 132"
            stroke="#064E3B"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* --- RIGHT ARM --- */}
        <g transform={`rotate(${rightArmAngle}, 182, 145)`}>
          <path
            d="M 178 145 Q 212 175 202 210"
            stroke="#10B981"
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Glove */}
          <circle cx="202" cy="216" r="15" fill="#FFFFFF" />
          <circle cx="212" cy="214" r="8" fill="#E5E7EB" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="gptGrad" x1="44" y1="72" x2="186" y2="244" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34D399" />
            <stop offset="0.5" stopColor="#10B981" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>

      {/* Name Tag */}
      <div
        style={{
          position: 'absolute',
          bottom: '-18px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#047857',
          color: '#A7F3D0',
          padding: '3px 14px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 800,
          letterSpacing: '0.5px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          border: '2px solid #34D399',
          whiteSpace: 'nowrap',
        }}
      >
        GPT
      </div>
    </div>
  );
};
