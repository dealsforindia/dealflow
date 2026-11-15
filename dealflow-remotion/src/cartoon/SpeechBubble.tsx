import React from 'react';
import { interpolate, spring } from 'remotion';
import { DialogueLine } from './types';

interface SpeechBubbleProps {
  dialogue: DialogueLine;
  frame: number;
  fps: number;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  dialogue,
  frame,
  fps,
}) => {
  const popSpring = spring({
    frame: frame - dialogue.startFrame,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.6 },
  });

  const scale = interpolate(popSpring, [0, 1], [0.2, 1]);
  const opacity = interpolate(popSpring, [0, 1], [0, 1]);

  // Position speech bubble based on speaker
  let defaultX = 960;
  let defaultY = 280;
  let themeColor = '#10B981';
  let speakerName = 'GPT';
  let badgeEmoji = '🤖';

  if (dialogue.speaker === 'claude') {
    defaultX = 460;
    defaultY = 270;
    themeColor = '#D97706';
    speakerName = 'CLAUDE';
    badgeEmoji = '✦';
  } else if (dialogue.speaker === 'gpt') {
    defaultX = 960;
    defaultY = 250;
    themeColor = '#10B981';
    speakerName = 'GPT';
    badgeEmoji = '⚡';
  } else if (dialogue.speaker === 'gemini') {
    defaultX = 1460;
    defaultY = 270;
    themeColor = '#8B5CF6';
    speakerName = 'GEMINI';
    badgeEmoji = '✨';
  } else if (dialogue.speaker === 'user') {
    defaultX = 960;
    defaultY = 210;
    themeColor = '#EF4444';
    speakerName = 'USER (DEVELOPER)';
    badgeEmoji = '👤';
  }

  const posX = dialogue.x ?? defaultX;
  const posY = dialogue.y ?? defaultY;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${posX}px`,
        top: `${posY}px`,
        transform: `translate(-50%, -100%) scale(${scale})`,
        transformOrigin: 'bottom center',
        opacity,
        zIndex: 10,
        maxWidth: '540px',
        filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))',
      }}
    >
      {/* Comic Speech Box */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '26px',
          padding: '18px 26px',
          border: `5px solid ${themeColor}`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Speaker Badge */}
        <div
          style={{
            alignSelf: 'flex-start',
            backgroundColor: themeColor,
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 900,
            padding: '4px 14px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.5px',
          }}
        >
          <span>{badgeEmoji}</span>
          <span>{speakerName}</span>
        </div>

        {/* Hindi (Devanagari) Text */}
        <div
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.35,
            fontFamily: '"Mukta", "Noto Sans Devanagari", sans-serif',
          }}
        >
          {dialogue.hindiText}
        </div>

        {/* Hinglish Translation / Subtitle */}
        <div
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#64748B',
            lineHeight: 1.3,
            fontStyle: 'italic',
          }}
        >
          "{dialogue.hinglishText}"
        </div>

        {/* Cartoon Speech Tail Triangle pointing down */}
        <div
          style={{
            position: 'absolute',
            bottom: '-22px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '18px solid transparent',
            borderRight: '18px solid transparent',
            borderTop: `22px solid ${themeColor}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '18px solid #FFFFFF',
          }}
        />
      </div>
    </div>
  );
};
