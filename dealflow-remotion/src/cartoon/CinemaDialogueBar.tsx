import React from 'react';
import { interpolate, spring } from 'remotion';
import { DialogueLine } from './types';

interface CinemaDialogueBarProps {
  dialogue: DialogueLine;
  frame: number;
  fps: number;
}

export const CinemaDialogueBar: React.FC<CinemaDialogueBarProps> = ({
  dialogue,
  frame,
  fps,
}) => {
  // Smooth spring entry on dialogue line start
  const enterSpring = spring({
    frame: frame - dialogue.startFrame,
    fps,
    config: { damping: 16, stiffness: 140, mass: 0.7 },
  });

  const opacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const translateY = interpolate(enterSpring, [0, 1], [15, 0]);

  // Speaker styling
  let accentColor = '#10B981';
  let speakerName = 'GPT';
  let speakerInitial = 'G';

  if (dialogue.speaker === 'claude') {
    accentColor = '#D97706';
    speakerName = 'Claude';
    speakerInitial = 'C';
  } else if (dialogue.speaker === 'gemini') {
    accentColor = '#8B5CF6';
    speakerName = 'Gemini';
    speakerInitial = 'G';
  } else if (dialogue.speaker === 'user') {
    accentColor = '#F43F5E';
    speakerName = 'Developer';
    speakerInitial = 'U';
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '36px',
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        zIndex: 30,
        maxWidth: '880px',
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      {/* Floating Glassmorphic Cinema Subtitle Card */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'rgba(11, 15, 25, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          padding: '20px 32px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow:
            '0 24px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          position: 'relative',
        }}
      >
        {/* Subtle Brand Accent Bar at top edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '32px',
            right: '32px',
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
          }}
        />

        {/* Speaker Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: accentColor,
            }}
          >
            {speakerName}
          </span>
        </div>

        {/* Primary Hindi Text (Devanagari) */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#F8FAFC',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Mukta", sans-serif',
          }}
        >
          {dialogue.hindiText}
        </div>

        {/* Secondary English Subtitle */}
        <div
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: '#94A3B8',
            lineHeight: 1.4,
            letterSpacing: '0.01em',
          }}
        >
          {dialogue.hinglishText}
        </div>
      </div>
    </div>
  );
};
