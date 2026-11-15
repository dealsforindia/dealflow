import React from 'react';
import { CharacterProps } from './types';

export const GeminiCharacter: React.FC<CharacterProps> = ({
  x,
  y,
  scale = 1,
  isSpeaking = false,
  emotion = 'happy',
  gesture = 'idle',
  frame,
  fps,
}) => {
  // Energetic fast bounce
  const bounce = Math.sin(frame / 3.5) * 6;
  const legCycle = Math.sin(frame / 3) * 8;
  const antennaSpin = (frame * 5) % 360;

  // Eye blink (every ~70 frames)
  const isBlinking = frame % 70 > 65;
  const mouthFrame = Math.floor(frame / 2.5) % 4;

  const isFainting = emotion === 'fainting';
  const rotation = isFainting ? 65 : 0;
  const posY = isFainting ? y + 80 : y + bounce;

  // Arm gestures
  let leftArmAngle = -12;
  let rightArmAngle = 12;
  if (gesture === 'flexing') {
    leftArmAngle = -75;
    rightArmAngle = 75;
  } else if (gesture === 'pointing') {
    rightArmAngle = -70 + Math.sin(frame / 2.5) * 15;
  } else if (gesture === 'jumping') {
    leftArmAngle = -85 + Math.sin(frame / 2) * 10;
    rightArmAngle = 85 - Math.sin(frame / 2) * 10;
  } else if (gesture === 'shrugging') {
    leftArmAngle = -50;
    rightArmAngle = 50;
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
      <svg width="230" height="340" viewBox="0 0 230 340" fill="none">
        {/* Ground Shadow */}
        <ellipse
          cx="115"
          cy="324"
          rx={isFainting ? "95" : "60"}
          ry="15"
          fill="rgba(0,0,0,0.35)"
        />

        {/* --- LEGS & NEON PURPLE SNEAKERS --- */}
        {/* Left Leg */}
        <g transform={`rotate(${gesture === 'jumping' ? -20 : legCycle}, 82, 255)`}>
          <rect x="74" y="245" width="18" height="55" rx="9" fill="#4C1D95" />
          {/* Sneaker */}
          <path
            d="M58 290 C58 278, 96 278, 102 286 L106 302 C106 306, 56 308, 54 302 Z"
            fill="#8B5CF6"
            stroke="#3B0764"
            strokeWidth="3"
          />
          <rect x="54" y="300" width="52" height="7" rx="3.5" fill="#38BDF8" />
        </g>

        {/* Right Leg */}
        <g transform={`rotate(${gesture === 'jumping' ? 20 : -legCycle}, 148, 255)`}>
          <rect x="138" y="245" width="18" height="55" rx="9" fill="#4C1D95" />
          {/* Sneaker */}
          <path
            d="M124 290 C124 278, 162 278, 168 286 L172 302 C172 306, 122 308, 120 302 Z"
            fill="#8B5CF6"
            stroke="#3B0764"
            strokeWidth="3"
          />
          <rect x="120" y="300" width="52" height="7" rx="3.5" fill="#38BDF8" />
        </g>

        {/* --- SPARKLE ANTENNA (Top of Head) --- */}
        <line x1="115" y1="80" x2="115" y2="40" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
        <g transform={`translate(115, 36) rotate(${antennaSpin})`}>
          {/* 4-Pointed Gemini Sparkle Star */}
          <path
            d="M 0 -22 C 3 -7, 7 -3, 22 0 C 7 3, 3 7, 0 22 C -3 7, -7 3, -22 0 C -7 -3, -3 -7, 0 -22 Z"
            fill="url(#sparkleGrad)"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
        </g>

        {/* --- LEFT ARM --- */}
        <g transform={`rotate(${leftArmAngle}, 48, 155)`}>
          <path
            d="M 52 155 Q 16 185 26 220"
            stroke="#6366F1"
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Glove */}
          <circle cx="26" cy="226" r="15" fill="#FFFFFF" />
          <circle cx="16" cy="224" r="8" fill="#E0E7FF" />
        </g>

        {/* --- BODY (Cosmic Blue-Purple Capsule) --- */}
        <rect
          x="44"
          y="82"
          width="142"
          height="172"
          rx="52"
          fill="url(#geminiGrad)"
          stroke="#312E81"
          strokeWidth="4"
        />

        {/* Multimodal Screen on Chest */}
        <rect
          x="66"
          y="162"
          width="98"
          height="66"
          rx="20"
          fill="#0F172A"
          stroke="#818CF8"
          strokeWidth="3"
        />
        {/* Animated Soundwave / Multimodal Rainbow Lines */}
        <g transform="translate(76, 175)">
          <rect x="6" y={14 - Math.sin(frame / 3) * 10} width="6" height={16 + Math.sin(frame / 3) * 16} rx="3" fill="#38BDF8" />
          <rect x="18" y={10 - Math.sin(frame / 2.5) * 12} width="6" height={22 + Math.sin(frame / 2.5) * 18} rx="3" fill="#818CF8" />
          <rect x="30" y={8 - Math.cos(frame / 3) * 14} width="6" height={26 + Math.cos(frame / 3) * 20} rx="3" fill="#C084FC" />
          <rect x="42" y={12 - Math.sin(frame / 4) * 12} width="6" height={20 + Math.sin(frame / 4) * 16} rx="3" fill="#F472B6" />
          <rect x="54" y={14 - Math.cos(frame / 2.8) * 8} width="6" height={16 + Math.cos(frame / 2.8) * 12} rx="3" fill="#FBBF24" />
          <rect x="66" y={16 - Math.sin(frame / 3.2) * 6} width="6" height={12 + Math.sin(frame / 3.2) * 10} rx="3" fill="#34D399" />
        </g>

        {/* --- HEAD / EYES --- */}
        {!isBlinking ? (
          <>
            {/* Left Big Sparkly Anime Eye */}
            <circle cx="84" cy="120" r="18" fill="#0F172A" stroke="#818CF8" strokeWidth="2" />
            <circle cx="84" cy="118" r="14" fill="#3B82F6" />
            <circle cx="80" cy="114" r="6" fill="#FFFFFF" />
            <circle cx="89" cy="122" r="3" fill="#A5B4FC" />

            {/* Right Big Sparkly Anime Eye */}
            <circle cx="146" cy="120" r="18" fill="#0F172A" stroke="#818CF8" strokeWidth="2" />
            <circle cx="146" cy="118" r="14" fill="#8B5CF6" />
            <circle cx="142" cy="114" r="6" fill="#FFFFFF" />
            <circle cx="151" cy="122" r="3" fill="#C084FC" />
          </>
        ) : (
          <>
            {/* Blinking curve */}
            <path d="M 72 120 Q 84 130 96 120" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 134 120 Q 146 130 158 120" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Cheerful Eyebrows */}
        <path d="M 72 96 Q 84 90 96 96" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M 134 96 Q 146 90 158 96" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* Animated Mouth */}
        {isSpeaking ? (
          mouthFrame === 0 ? (
            <ellipse cx="115" cy="144" rx="14" ry="11" fill="#BE185D" stroke="#F472B6" strokeWidth="2" />
          ) : mouthFrame === 1 ? (
            <path d="M 102 142 Q 115 158 128 142 Z" fill="#BE185D" stroke="#F472B6" strokeWidth="2" />
          ) : mouthFrame === 2 ? (
            <rect x="104" y="140" width="22" height="11" rx="5" fill="#BE185D" />
          ) : (
            <circle cx="115" cy="144" r="10" fill="#BE185D" />
          )
        ) : emotion === 'shocked' ? (
          <ellipse cx="115" cy="146" rx="12" ry="15" fill="#1E1B4B" stroke="#818CF8" strokeWidth="3" />
        ) : (
          /* Cheerful open smile */
          <path
            d="M 102 142 Q 115 154 128 142"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Pink Glow Cheeks */}
        <circle cx="64" cy="132" r="8" fill="rgba(244, 114, 182, 0.5)" />
        <circle cx="166" cy="132" r="8" fill="rgba(244, 114, 182, 0.5)" />

        {/* --- RIGHT ARM --- */}
        <g transform={`rotate(${rightArmAngle}, 182, 155)`}>
          <path
            d="M 178 155 Q 214 185 204 220"
            stroke="#6366F1"
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Glove */}
          <circle cx="204" cy="226" r="15" fill="#FFFFFF" />
          <circle cx="214" cy="224" r="8" fill="#E0E7FF" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="geminiGrad" x1="44" y1="82" x2="186" y2="254" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.4" stopColor="#4F46E5" />
            <stop offset="0.8" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#C026D3" />
          </linearGradient>
          <linearGradient id="sparkleGrad" x1="-20" y1="-20" x2="20" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#A855F7" />
            <stop offset="1" stopColor="#F472B6" />
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
          backgroundColor: '#4C1D95',
          color: '#E0E7FF',
          padding: '3px 14px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 800,
          letterSpacing: '0.5px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          border: '2px solid #818CF8',
          whiteSpace: 'nowrap',
        }}
      >
        GEMINI
      </div>
    </div>
  );
};
