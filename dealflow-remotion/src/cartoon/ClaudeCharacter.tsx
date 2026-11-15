import React from 'react';
import { interpolate, spring } from 'remotion';
import { CharacterProps } from './types';

export const ClaudeCharacter: React.FC<CharacterProps> = ({
  x,
  y,
  scale = 1,
  isSpeaking = false,
  emotion = 'happy',
  gesture = 'idle',
  frame,
  fps,
}) => {
  // Idle breathing / bounce
  const breathe = Math.sin(frame / 6) * 4;
  const legCycle = Math.sin(frame / 4) * 6;

  // Eye blink (every ~80 frames)
  const isBlinking = frame % 80 > 74;

  // Mouth animation when speaking
  const mouthFrame = Math.floor(frame / 3) % 4;

  // Emotion adjustments
  const isFainting = emotion === 'fainting';
  const rotation = isFainting ? 80 : 0;
  const posY = isFainting ? y + 80 : y + breathe;

  // Arm gestures
  let leftArmAngle = -15;
  let rightArmAngle = 15;
  if (gesture === 'pointing') {
    rightArmAngle = -65 + Math.sin(frame / 3) * 10;
  } else if (gesture === 'shrugging') {
    leftArmAngle = -45;
    rightArmAngle = 45;
  } else if (gesture === 'jumping') {
    leftArmAngle = -80;
    rightArmAngle = 80;
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
      <svg width="220" height="320" viewBox="0 0 220 320" fill="none">
        {/* Ground Shadow */}
        <ellipse
          cx="110"
          cy="305"
          rx={isFainting ? "85" : "55"}
          ry="14"
          fill="rgba(0,0,0,0.35)"
        />

        {/* --- LEGS & SHOES --- */}
        {/* Left Leg */}
        <g transform={`rotate(${gesture === 'jumping' ? -15 : legCycle}, 80, 240)`}>
          <rect x="74" y="230" width="16" height="55" rx="8" fill="#B45309" />
          {/* Shoe */}
          <path
            d="M62 278 C62 268, 92 268, 98 274 L102 288 C102 292, 60 294, 58 288 Z"
            fill="#78350F"
          />
          <rect x="58" y="286" width="44" height="6" rx="3" fill="#FDE68A" />
        </g>

        {/* Right Leg */}
        <g transform={`rotate(${gesture === 'jumping' ? 15 : -legCycle}, 140, 240)`}>
          <rect x="130" y="230" width="16" height="55" rx="8" fill="#B45309" />
          {/* Shoe */}
          <path
            d="M118 278 C118 268, 148 268, 154 274 L158 288 C158 292, 116 294, 114 288 Z"
            fill="#78350F"
          />
          <rect x="114" y="286" width="44" height="6" rx="3" fill="#FDE68A" />
        </g>

        {/* --- LEFT ARM --- */}
        <g transform={`rotate(${leftArmAngle}, 45, 140)`}>
          <path
            d="M 50 140 Q 20 170 30 205"
            stroke="#D97706"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Glove */}
          <circle cx="30" cy="210" r="14" fill="#FFFFFF" />
          <circle cx="22" cy="208" r="7" fill="#F3F4F6" />
        </g>

        {/* --- BODY (Main Capsule) --- */}
        <rect
          x="42"
          y="70"
          width="136"
          height="170"
          rx="55"
          fill="url(#claudeGrad)"
          stroke="#92400E"
          strokeWidth="4"
        />

        {/* Belly Screen / Emblem */}
        <rect
          x="62"
          y="150"
          width="96"
          height="65"
          rx="20"
          fill="#FEF3C7"
          stroke="#D97706"
          strokeWidth="3"
        />
        {/* Claude Logo Star/Asterisk */}
        <text
          x="110"
          y="194"
          textAnchor="middle"
          fontSize="36"
          fontWeight="bold"
          fill="#B45309"
        >
          ✦
        </text>

        {/* Red Bowtie */}
        <path d="M 95 142 L 125 142 L 110 148 Z" fill="#DC2626" />
        <path d="M 95 154 L 125 154 L 110 148 Z" fill="#DC2626" />
        <circle cx="110" cy="148" r="5" fill="#991B1B" />

        {/* --- HEAD / FACE --- */}
        {/* Big Scholarly Glasses */}
        {/* Left Lens */}
        <circle
          cx="82"
          cy="112"
          r="22"
          fill="rgba(255, 255, 255, 0.85)"
          stroke="#78350F"
          strokeWidth="4"
        />
        {/* Right Lens */}
        <circle
          cx="138"
          cy="112"
          r="22"
          fill="rgba(255, 255, 255, 0.85)"
          stroke="#78350F"
          strokeWidth="4"
        />
        {/* Glasses Bridge */}
        <path d="M 104 112 Q 110 106 116 112" stroke="#78350F" strokeWidth="4" fill="none" />

        {/* Eyes (inside lenses) */}
        {emotion === 'fainting' ? (
          <>
            {/* Left Dizzy Spiral */}
            <g transform="translate(82, 112) scale(0.65)">
              <path
                d="M 0 0 Q 8 0 8 8 Q 8 16 -8 16 Q -20 16 -20 -4 Q -20 -20 4 -20 Q 24 -20 24 8"
                stroke="#78350F"
                strokeWidth="4.5"
                fill="none"
                strokeLinecap="round"
                transform={`rotate(${frame * 14})`}
              />
            </g>
            {/* Right Dizzy Spiral */}
            <g transform="translate(138, 112) scale(0.65)">
              <path
                d="M 0 0 Q 8 0 8 8 Q 8 16 -8 16 Q -20 16 -20 -4 Q -20 -20 4 -20 Q 24 -20 24 8"
                stroke="#78350F"
                strokeWidth="4.5"
                fill="none"
                strokeLinecap="round"
                transform={`rotate(${-frame * 14})`}
              />
            </g>
            {/* Floating cartoon stars orbiting above head */}
            {[0, 120, 240].map((deg, i) => {
              const starAngle = (frame * 5 + deg) * (Math.PI / 180);
              const starX = 110 + Math.cos(starAngle) * 45;
              const starY = 45 + Math.sin(starAngle) * 14;
              return (
                <text
                  key={i}
                  x={starX}
                  y={starY}
                  fontSize="18"
                  fill="#FBBF24"
                  textAnchor="middle"
                >
                  ⭐
                </text>
              );
            })}
          </>
        ) : !isBlinking ? (
          <>
            <circle cx="82" cy="112" r="9" fill="#1E293B" />
            <circle cx="85" cy="109" r="3" fill="#FFFFFF" />
            <circle cx="138" cy="112" r="9" fill="#1E293B" />
            <circle cx="141" cy="109" r="3" fill="#FFFFFF" />
          </>
        ) : (
          <>
            <line x1="72" y1="112" x2="92" y2="112" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
            <line x1="128" y1="112" x2="148" y2="112" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          </>
        )}

        {/* Eyebrows */}
        <path
          d={
            emotion === 'shocked'
              ? 'M 68 84 Q 82 72 96 84'
              : 'M 70 86 Q 82 82 94 88'
          }
          stroke="#78350F"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={
            emotion === 'shocked'
              ? 'M 124 84 Q 138 72 152 84'
              : 'M 126 88 Q 138 82 150 86'
          }
          stroke="#78350F"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Animated Mouth */}
        {isSpeaking ? (
          mouthFrame === 0 ? (
            <ellipse cx="110" cy="138" rx="12" ry="9" fill="#991B1B" />
          ) : mouthFrame === 1 ? (
            <path d="M 98 136 Q 110 148 122 136 Z" fill="#991B1B" />
          ) : mouthFrame === 2 ? (
            <rect x="100" y="134" width="20" height="10" rx="4" fill="#991B1B" />
          ) : (
            <circle cx="110" cy="138" r="8" fill="#991B1B" />
          )
        ) : emotion === 'shocked' ? (
          <circle cx="110" cy="138" r="12" fill="#78350F" />
        ) : (
          <path
            d="M 100 136 Q 110 144 120 136"
            stroke="#78350F"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Blush Cheeks */}
        <circle cx="62" cy="125" r="7" fill="rgba(244, 63, 94, 0.4)" />
        <circle cx="158" cy="125" r="7" fill="rgba(244, 63, 94, 0.4)" />

        {/* --- RIGHT ARM --- */}
        <g transform={`rotate(${rightArmAngle}, 175, 140)`}>
          <path
            d="M 170 140 Q 200 170 190 205"
            stroke="#D97706"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Glove */}
          <circle cx="190" cy="210" r="14" fill="#FFFFFF" />
          <circle cx="198" cy="208" r="7" fill="#F3F4F6" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="claudeGrad" x1="42" y1="70" x2="178" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="0.6" stopColor="#D97706" />
            <stop offset="1" stopColor="#B45309" />
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
          backgroundColor: '#B45309',
          color: '#FEF3C7',
          padding: '3px 14px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 800,
          letterSpacing: '0.5px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          border: '2px solid #FDE68A',
          whiteSpace: 'nowrap',
        }}
      >
        CLAUDE
      </div>
    </div>
  );
};
