import { memo, useMemo } from 'react';
import { SCORE_THRESHOLDS } from '../../../lib/constants';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = { sm: 32, md: 48, lg: 80 } as const;
const STROKE_MAP = { sm: 3.5, md: 4.5, lg: 7 } as const;
const FONT_MAP = { sm: 9, md: 12, lg: 20 } as const;

function getScoreColor(score: number): string {
  if (score === 0) return '#52536A';
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return '#10b981';
  if (score >= SCORE_THRESHOLDS.GOOD) return '#f59e0b';
  if (score >= SCORE_THRESHOLDS.AVERAGE) return '#f97316';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score === 0) return 'Unrated';
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (score >= SCORE_THRESHOLDS.GOOD) return 'Good';
  if (score >= SCORE_THRESHOLDS.AVERAGE) return 'Average';
  return 'Low';
}

export const ScoreRing = memo(function ScoreRing({
  score,
  size = 'md',
  className,
}: ScoreRingProps) {
  const px = SIZE_MAP[size];
  const stroke = STROKE_MAP[size];
  const fontSize = FONT_MAP[size];

  const { color, r, dashArray } = useMemo(() => {
    const c = getScoreColor(score);
    const radius = (px - stroke - 2) / 2;
    const circumference = 2 * Math.PI * radius;
    return {
      color: c,
      r: radius,
      circ: circumference,
      dashArray: `${(score / 100) * circumference} ${circumference}`,
    };
  }, [score, px, stroke]);

  return (
    <div
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`AI score: ${score} — ${getScoreLabel(score)}`}
      className={`relative flex-shrink-0 ${className ?? ''}`}
      style={{ width: px, height: px }}
    >
      <svg width={px} height={px} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color}90)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          style={{
            fontSize,
            color,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            fontWeight: 700,
          }}
        >
          {score === 0 ? '?' : score}
        </span>
      </div>
    </div>
  );
});

export { getScoreColor, getScoreLabel };
