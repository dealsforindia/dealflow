import React from 'react';
import { interpolate } from 'remotion';

interface StudioBackgroundProps {
  frame: number;
  mood: 'neutral' | 'alert' | 'success';
}

export const StudioBackground: React.FC<StudioBackgroundProps> = ({
  frame,
  mood = 'neutral',
}) => {
  // Soft ambient spotlight colors based on mood
  let ambientColor = 'rgba(56, 189, 248, 0.06)'; // Neutral cyan
  let floorTint = '#0F172A';

  if (mood === 'alert') {
    ambientColor = 'rgba(239, 68, 68, 0.12)';
    floorTint = '#1A0B10';
  } else if (mood === 'success') {
    ambientColor = 'rgba(16, 185, 129, 0.1)';
    floorTint = '#091A14';
  }

  // Floating ambient light drift
  const lightDrift = Math.sin(frame / 60) * 40;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#090B10',
        overflow: 'hidden',
      }}
    >
      {/* 1. Deep Wall Gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '75%',
          background:
            'radial-gradient(ellipse 90% 60% at 50% 30%, #171E2E 0%, #090B10 100%)',
        }}
      />

      {/* 2. Soft Character Spotlights (Clean Ambient Halos) */}
      {/* Claude Spotlight (Left) */}
      <div
        style={{
          position: 'absolute',
          left: '480px',
          top: '520px',
          width: '420px',
          height: '420px',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* GPT Spotlight (Center) */}
      <div
        style={{
          position: 'absolute',
          left: '960px',
          top: '520px',
          width: '460px',
          height: '460px',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Gemini Spotlight (Right) */}
      <div
        style={{
          position: 'absolute',
          left: '1440px',
          top: '520px',
          width: '440px',
          height: '440px',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* 3. Dynamic Mood Ambient Light Layer */}
      <div
        style={{
          position: 'absolute',
          top: '200px',
          left: `calc(50% + ${lightDrift}px)`,
          transform: 'translateX(-50%)',
          width: '1200px',
          height: '500px',
          background: `radial-gradient(ellipse, ${ambientColor} 0%, transparent 70%)`,
          transition: 'background 0.5s ease',
          pointerEvents: 'none',
        }}
      />

      {/* 4. Elegant Minimalist Studio Floor */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '240px',
          backgroundColor: floorTint,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 -20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Soft Floor Reflection Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
          }}
        />

        {/* Subtle Matte Floor Grid Lines (Very faint and clean) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '160px 100%',
          }}
        />
      </div>

      {/* 5. Minimal Sleek Floating Coffee Table */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '150px',
          transform: 'translateX(-50%)',
          width: '420px',
          height: '44px',
          backgroundColor: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: '22px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow:
            '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 32px',
          zIndex: 1,
        }}
      >
        {/* Minimalist Tea Cup with Gentle Rising Steam */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: '3px 3px 10px 10px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            }}
          >
            {/* Chai fill */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '70%',
                backgroundColor: '#D97706',
              }}
            />
          </div>
          {/* Subtle Steam Ribbon */}
          <svg width="12" height="24" viewBox="0 0 12 24" style={{ marginTop: '-14px', opacity: 0.6 }}>
            <path
              d={`M 6 22 Q ${6 + Math.sin(frame / 6) * 4} 12 6 2`}
              stroke="#E2E8F0"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Minimalist Tech Snack / Glowing Macaron Pill */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '22px',
              height: '14px',
              borderRadius: '7px',
              backgroundColor: '#F59E0B',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
            }}
          />
          <div
            style={{
              width: '22px',
              height: '14px',
              borderRadius: '7px',
              backgroundColor: '#10B981',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
            }}
          />
          <div
            style={{
              width: '22px',
              height: '14px',
              borderRadius: '7px',
              backgroundColor: '#8B5CF6',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
