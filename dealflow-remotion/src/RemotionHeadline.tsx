import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const WORDS = [
  'Intros',
  'Demos',
  'Launches',
  'Changelogs',
  'Tutorials',
  'And more',
];

const SLOT_HEIGHT = 86; // Height of each text line in pixels

export const RemotionHeadline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- 1. Checkbox Tick Pop & Draw ---
  const checkPopSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.6 },
  });

  const checkDrawSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.5 },
  });

  // --- 2. Word Slot Machine Rolling Physics ---
  // 5 discrete transitions between 6 words
  const stepStartFrames = [24, 52, 80, 108, 136];
  
  // Sum spring offsets for each step
  const totalOffsetSteps = stepStartFrames.reduce((acc, startFrame) => {
    const s = spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 13, stiffness: 140, mass: 0.75 },
    });
    return acc + s;
  }, 0);

  const currentSlotY = totalOffsetSteps * SLOT_HEIGHT;

  // --- 3. Step Back to 80% Scale & Rest ---
  const stepBackStartFrame = 168; // Triggered after "And more" settles comfortably
  const stepBackSpring = spring({
    frame: frame - stepBackStartFrame,
    fps,
    config: { damping: 15, stiffness: 110, mass: 0.9 },
  });

  const overallScale = interpolate(stepBackSpring, [0, 1], [1, 0.8]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#090a0f',
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.09) 0%, rgba(9, 10, 15, 0) 65%)',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}
    >
      {/* Whole line wrapper that steps back to 80% */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          transform: `scale(${overallScale})`,
          transformOrigin: 'center center',
          userSelect: 'none',
        }}
      >
        {/* Left: "Create your own" */}
        <span
          style={{
            fontSize: '62px',
            fontWeight: 700,
            color: '#f8fafc',
            letterSpacing: '-0.03em',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
        >
          Create your own
        </span>

        {/* Center: Checkbox with ticked mark */}
        <div
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            border: '2px solid rgba(125, 211, 252, 0.7)',
            boxShadow:
              '0 0 30px rgba(14, 165, 233, 0.45), 0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${interpolate(checkPopSpring, [0, 1], [0.3, 1])})`,
            opacity: interpolate(checkPopSpring, [0, 1], [0, 1]),
            flexShrink: 0,
          }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline
              points="20 6 9 17 4 12"
              strokeDasharray={26}
              strokeDashoffset={interpolate(checkDrawSpring, [0, 1], [26, 0])}
            />
          </svg>
        </div>

        {/* Right: Slot container that rolls up out of the slot */}
        <div
          style={{
            height: `${SLOT_HEIGHT}px`,
            overflow: 'hidden',
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'flex-start',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              transform: `translateY(-${currentSlotY}px)`,
            }}
          >
            {WORDS.map((word, idx) => {
              const isLast = idx === WORDS.length - 1;
              return (
                <div
                  key={word}
                  style={{
                    height: `${SLOT_HEIGHT}px`,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '62px',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: isLast ? '#38bdf8' : '#f1f5f9',
                    textShadow: isLast
                      ? '0 0 25px rgba(56, 189, 248, 0.5)'
                      : '0 2px 10px rgba(0, 0, 0, 0.4)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {word}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
