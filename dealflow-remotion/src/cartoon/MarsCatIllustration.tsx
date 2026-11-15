import React from 'react';
import { interpolate, spring } from 'remotion';

interface MarsCatProps {
  frame: number;
  fps: number;
}

export const MarsCatIllustration: React.FC<MarsCatProps> = ({ frame, fps }) => {
  const popSpring = spring({
    frame: frame - 2090,
    fps,
    config: { damping: 13, stiffness: 180, mass: 0.7 },
  });

  const scale = interpolate(popSpring, [0, 1], [0.1, 1]);
  const floatY = Math.sin(frame / 4) * 8;
  const rotation = Math.sin(frame / 6) * 3;

  return (
    <div
      style={{
        position: 'absolute',
        top: '190px',
        left: '50%',
        transform: `translateX(-50%) translateY(${floatY}px) scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: 15,
        filter: 'drop-shadow(0 20px 40px rgba(245, 158, 11, 0.45))',
      }}
    >
      {/* Cartoon Holographic Card */}
      <div
        style={{
          width: '560px',
          backgroundColor: '#1E1B4B',
          borderRadius: '28px',
          border: '5px solid #F59E0B',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 20px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Badge Header */}
        <div
          style={{
            backgroundColor: '#D97706',
            color: '#FEF3C7',
            padding: '4px 18px',
            borderRadius: '16px',
            fontSize: '15px',
            fontWeight: 900,
            letterSpacing: '1px',
            marginBottom: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          🚀 USER PROMPT RESULT: MARS CAT BIRYANI 4K 🍲
        </div>

        {/* SVG Drawing of Cat on Mars */}
        <svg width="520" height="290" viewBox="0 0 520 290" fill="none">
          {/* Space Sky */}
          <rect width="520" height="290" rx="18" fill="#090A0F" />

          {/* Stars */}
          {[
            { cx: 40, cy: 30, r: 2 },
            { cx: 120, cy: 50, r: 1.5 },
            { cx: 200, cy: 25, r: 2 },
            { cx: 320, cy: 40, r: 2.5 },
            { cx: 440, cy: 30, r: 1.8 },
            { cx: 480, cy: 75, r: 2 },
            { cx: 80, cy: 80, r: 1.5 },
          ].map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#FFFFFF" opacity="0.8" />
          ))}

          {/* Distant Earth Planet */}
          <circle cx="450" cy="55" r="26" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" />
          <path d="M 435 48 Q 448 42 455 52 Q 460 62 445 68 Z" fill="#10B981" />

          {/* Red Martian Hills */}
          <path
            d="M 0 200 Q 140 160 280 200 T 520 190 L 520 290 L 0 290 Z"
            fill="#B91C1C"
          />
          <path
            d="M 0 230 Q 180 190 360 235 T 520 220 L 520 290 L 0 290 Z"
            fill="#991B1B"
          />
          {/* Martian Craters */}
          <ellipse cx="110" cy="250" rx="35" ry="12" fill="#7F1D1D" />
          <ellipse cx="410" cy="245" rx="42" ry="14" fill="#7F1D1D" />

          {/* --- ASTRONAUT ORANGE CAT --- */}
          {/* Cat Tail with Suit */}
          <path
            d="M 200 205 Q 160 190 170 160"
            stroke="#EA580C"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cat Body (White Spacesuit) */}
          <ellipse cx="240" cy="195" rx="36" ry="42" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="3" />
          {/* NASA / ISRO Cartoon Patch on suit */}
          <circle cx="240" cy="188" r="8" fill="#2563EB" />
          <text x="240" y="191" textAnchor="middle" fontSize="6" fill="#FFFFFF" fontWeight="bold">AI</text>

          {/* Cat Back Paws on ground */}
          <ellipse cx="218" cy="226" rx="14" ry="8" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
          <ellipse cx="262" cy="226" rx="14" ry="8" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />

          {/* Astronaut Helmet Bubble (Clear Glass Sphere) */}
          <circle cx="240" cy="130" r="50" fill="rgba(147, 197, 253, 0.25)" stroke="#60A5FA" strokeWidth="4" />
          {/* Glass Glare */}
          <path
            d="M 210 100 Q 230 92 252 96"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cat Head (Inside Helmet) */}
          <circle cx="240" cy="134" r="32" fill="#FB923C" />
          {/* Cat Ears */}
          <polygon points="216,112 226,90 236,110" fill="#EA580C" />
          <polygon points="244,110 254,90 264,112" fill="#EA580C" />
          <polygon points="222,110 227,96 233,109" fill="#FDA4AF" />
          <polygon points="247,109 253,96 258,110" fill="#FDA4AF" />

          {/* Cat Face Features */}
          {/* Eyes (Happy Closed Curves) */}
          <path d="M 226 132 Q 232 126 238 132" stroke="#431407" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 242 132 Q 248 126 254 132" stroke="#431407" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Pink Nose & Cute Mouth */}
          <polygon points="240,137 236,134 244,134" fill="#F43F5E" />
          <path d="M 236 138 Q 240 143 244 138" stroke="#431407" strokeWidth="2.5" fill="none" />
          {/* Whiskers */}
          <line x1="218" y1="136" x2="204" y2="134" stroke="#431407" strokeWidth="2" />
          <line x1="218" y1="140" x2="204" y2="142" stroke="#431407" strokeWidth="2" />
          <line x1="262" y1="136" x2="276" y2="134" stroke="#431407" strokeWidth="2" />
          <line x1="262" y1="140" x2="276" y2="142" stroke="#431407" strokeWidth="2" />

          {/* --- THE STEAMING BIRYANI POT/PLATE --- */}
          {/* Biryani Handi / Platter */}
          <ellipse cx="325" cy="205" rx="55" ry="20" fill="#78350F" stroke="#F59E0B" strokeWidth="3" />
          {/* Rice Mound (Golden Saffron & Orange) */}
          <ellipse cx="325" cy="198" rx="48" ry="16" fill="#FBBF24" />
          {/* Rice Texture Specks */}
          <ellipse cx="310" cy="195" rx="8" ry="4" fill="#EA580C" />
          <ellipse cx="335" cy="197" rx="10" ry="5" fill="#DC2626" />
          <ellipse cx="322" cy="192" rx="7" ry="3.5" fill="#FEF08A" />

          {/* Chicken Leg Piece */}
          <g transform="translate(330, 185) rotate(-20)">
            <ellipse cx="14" cy="6" rx="16" ry="10" fill="#9A3412" />
            <path d="M 28 6 L 38 6" stroke="#FEF3C7" strokeWidth="5" strokeLinecap="round" />
            <circle cx="40" cy="4" r="3" fill="#FEF3C7" />
            <circle cx="40" cy="8" r="3" fill="#FEF3C7" />
          </g>

          {/* Boiled Egg Slice & Coriander Garnish */}
          <circle cx="304" cy="198" r="7" fill="#FEF08A" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="342" cy="200" r="3" fill="#16A34A" />
          <circle cx="316" cy="194" r="3" fill="#16A34A" />

          {/* Steam from Biryani */}
          <text x="312" y="172" fontSize="22" opacity="0.85">♨️</text>
          <text x="336" y="165" fontSize="20" opacity="0.85">♨️</text>

          {/* Cat Arm Holding Spoon */}
          <path
            d="M 264 190 Q 285 192 295 186"
            stroke="#F8FAFC"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          {/* Spoon */}
          <path d="M 295 186 L 310 182" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="312" cy="181" rx="5" ry="3.5" fill="#CBD5E1" />

          {/* Floating Hindi Thought Bubble from Cat */}
          <rect x="360" y="90" width="135" height="42" rx="14" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2.5" />
          <text x="427" y="116" textAnchor="middle" fontSize="15" fontWeight="900" fill="#9A3412">
            मियां! वाह बिरयानी! 😋
          </text>
        </svg>
      </div>
    </div>
  );
};
