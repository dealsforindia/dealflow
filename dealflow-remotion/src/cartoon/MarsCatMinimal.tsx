import React from 'react';
import { interpolate, spring } from 'remotion';

interface MarsCatMinimalProps {
  frame: number;
  fps: number;
}

export const MarsCatMinimal: React.FC<MarsCatMinimalProps> = ({ frame, fps }) => {
  const popSpring = spring({
    frame: frame - 2090,
    fps,
    config: { damping: 18, stiffness: 140, mass: 0.8 },
  });

  const scale = interpolate(popSpring, [0, 1], [0.3, 1]);
  const opacity = interpolate(popSpring, [0, 1], [0, 1]);
  const floatY = Math.sin(frame / 40) * 6;

  return (
    <div
      style={{
        position: 'absolute',
        top: '120px',
        left: '50%',
        transform: `translateX(-50%) translateY(${floatY}px) scale(${scale})`,
        transformOrigin: 'center center',
        opacity,
        zIndex: 20,
        filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.7))',
      }}
    >
      <div
        style={{
          width: '580px',
          backgroundColor: '#0F172A',
          borderRadius: '28px',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.15)',
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Sleek Minimal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🚀</span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#FBBF24',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              GENERATED IMAGE PREVIEW
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              color: '#94A3B8',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
            Resolution: 4K UHD
          </span>
        </div>

        {/* Vector Canvas Illustration */}
        <div
          style={{
            width: '100%',
            height: '270px',
            borderRadius: '18px',
            overflow: 'hidden',
            backgroundColor: '#05070D',
            position: 'relative',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 540 270" fill="none">
            {/* Deep Space Background */}
            <rect width="540" height="270" fill="#090C15" />

            {/* Stars */}
            {[
              { cx: 50, cy: 30, r: 1.5 },
              { cx: 140, cy: 60, r: 1.2 },
              { cx: 240, cy: 35, r: 2 },
              { cx: 360, cy: 45, r: 1.5 },
              { cx: 480, cy: 25, r: 2 },
              { cx: 430, cy: 80, r: 1.2 },
            ].map((s, i) => (
              <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#FFFFFF" opacity="0.6" />
            ))}

            {/* Planet Earth in Sky */}
            <circle cx="450" cy="50" r="22" fill="#0284C7" opacity="0.8" />
            <path d="M 438 45 Q 448 40 454 48 Q 458 56 446 62 Z" fill="#10B981" opacity="0.9" />

            {/* Smooth Mars Dunes */}
            <path
              d="M 0 180 Q 140 150 280 180 T 540 170 L 540 270 L 0 270 Z"
              fill="#991B1B"
            />
            <path
              d="M 0 210 Q 180 180 360 215 T 540 200 L 540 270 L 0 270 Z"
              fill="#7F1D1D"
            />

            {/* --- CAT ASTRONAUT --- */}
            {/* Spacesuit Body */}
            <ellipse cx="230" cy="190" rx="36" ry="40" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
            {/* ISRO / NASA Emblem */}
            <circle cx="230" cy="184" r="7" fill="#2563EB" />
            <text x="230" y="187" textAnchor="middle" fontSize="6" fill="#FFFFFF" fontWeight="bold">AI</text>

            {/* Paws */}
            <ellipse cx="210" cy="220" rx="12" ry="7" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            <ellipse cx="250" cy="220" rx="12" ry="7" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />

            {/* Astronaut Glass Sphere Helmet */}
            <circle cx="230" cy="126" r="48" fill="rgba(147, 197, 253, 0.2)" stroke="#93C5FD" strokeWidth="3" />
            <path d="M 205 98 Q 222 92 242 96" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="4" strokeLinecap="round" fill="none" />

            {/* Cat Head */}
            <circle cx="230" cy="130" r="30" fill="#FB923C" />
            <polygon points="208,110 218,88 226,108" fill="#EA580C" />
            <polygon points="234,108 242,88 252,110" fill="#EA580C" />
            <polygon points="214,108 219,94 224,107" fill="#FDA4AF" />
            <polygon points="236,107 241,94 246,108" fill="#FDA4AF" />

            {/* Cat Smiling Face */}
            <path d="M 218 128 Q 223 124 228 128" stroke="#431407" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 232 128 Q 237 124 242 128" stroke="#431407" strokeWidth="3" strokeLinecap="round" fill="none" />
            <polygon points="230,133 226,130 234,130" fill="#F43F5E" />
            <path d="M 226 134 Q 230 138 234 134" stroke="#431407" strokeWidth="2" fill="none" />

            {/* --- HYDERABADI DUM BIRYANI PLATTER --- */}
            <ellipse cx="325" cy="195" rx="55" ry="18" fill="#78350F" stroke="#B45309" strokeWidth="2" />
            <ellipse cx="325" cy="189" rx="48" ry="14" fill="#FBBF24" />
            <ellipse cx="312" cy="186" rx="8" ry="3.5" fill="#EA580C" />
            <ellipse cx="334" cy="188" rx="9" ry="4" fill="#DC2626" />
            {/* Boiled Egg */}
            <circle cx="304" cy="188" r="6" fill="#FEF08A" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Chicken Drumstick */}
            <g transform="translate(330, 178) rotate(-15)">
              <ellipse cx="12" cy="5" rx="14" ry="8" fill="#9A3412" />
              <path d="M 24 5 L 34 5" stroke="#FEF3C7" strokeWidth="4" strokeLinecap="round" />
            </g>
            {/* Gentle Steam */}
            <text x="316" y="166" fontSize="18" opacity="0.8">♨️</text>
          </svg>
        </div>

        {/* Caption */}
        <div
          style={{
            fontSize: '13px',
            color: '#CBD5E1',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          Prompt: "Realistic orange cat enjoying authentic Hyderabadi Dum Biryani on Mars."
        </div>
      </div>
    </div>
  );
};
