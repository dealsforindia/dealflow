import React from 'react';
import { interpolate, spring } from 'remotion';

interface ComicBurstProps {
  text: string;
  subtext?: string;
  x: number;
  y: number;
  startFrame: number;
  frame: number;
  fps: number;
  bgColor?: string;
  textColor?: string;
}

export const ComicBurst: React.FC<ComicBurstProps> = ({
  text,
  subtext,
  x,
  y,
  startFrame,
  frame,
  fps,
  bgColor = '#EF4444',
  textColor = '#FFFFFF',
}) => {
  const popSpring = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 10, stiffness: 220, mass: 0.5 },
  });

  const scale = interpolate(popSpring, [0, 1], [0.1, 1]);
  const rotation = Math.sin((frame - startFrame) / 3) * 6 - 4;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: 18,
        filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.6))',
      }}
    >
      {/* Cartoon Multi-Point Star Burst SVG */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="340" height="180" viewBox="0 0 340 180" fill="none">
          {/* Jagged Explosion Star */}
          <polygon
            points="
              170,10 200,45 250,20 255,60 310,50 290,95 335,115 285,135 305,170 250,155
              235,175 190,160 170,178 140,158 100,175 90,150 40,165 55,130 10,115 50,90
              30,50 85,60 90,20 140,45
            "
            fill={bgColor}
            stroke="#FFFFFF"
            strokeWidth="5"
          />
        </svg>

        {/* Text inside burst */}
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: textColor,
              textShadow: '0 3px 0 #000, 0 0 10px rgba(0,0,0,0.5)',
              letterSpacing: '1px',
              fontFamily: '"Impact", "Arial Black", sans-serif',
            }}
          >
            {text}
          </div>
          {subtext && (
            <div
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#FEF08A',
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: '2px 10px',
                borderRadius: '8px',
                marginTop: '4px',
              }}
            >
              {subtext}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
