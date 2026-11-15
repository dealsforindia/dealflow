import React from 'react';

interface PriceSparklineProps {
  /** Array of [timestamp_seconds, price] tuples */
  history?: Array<[number, number]>;
  currentPrice: number;
  /** Width of the SVG viewBox */
  width?: number;
  /** Height of the SVG viewBox */
  height?: number;
}

function buildSparklinePath(
  points: { x: number; y: number }[],
  vw: number,
  vh: number
): { linePath: string; areaPath: string } {
  if (points.length < 2) {
    const x0 = 0, x1 = vw;
    const y = vh / 2;
    return {
      linePath: `M${x0},${y} L${x1},${y}`,
      areaPath: `M${x0},${y} L${x1},${y} L${x1},${vh} L${x0},${vh} Z`,
    };
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  const PAD_TOP = 4, PAD_BOTTOM = 4;

  const normalize = (p: { x: number; y: number }) => ({
    x: ((p.x - xMin) / xRange) * vw,
    // higher price → lower y on chart (normal orientation)
    y: PAD_TOP + (1 - (p.y - yMin) / yRange) * (vh - PAD_TOP - PAD_BOTTOM),
  });

  const norm = points.map(normalize);

  const linePath = norm
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    linePath +
    ` L${norm[norm.length - 1].x.toFixed(1)},${vh} L${norm[0].x.toFixed(1)},${vh} Z`;

  return { linePath, areaPath };
}

export const PriceSparkline: React.FC<PriceSparklineProps> = ({
  history,
  currentPrice,
  width = 160,
  height = 36,
}) => {
  const points: { x: number; y: number }[] = React.useMemo(() => {
    if (!history || history.length === 0) return [];
    return history.map(([ts, price]) => ({ x: ts, y: price }));
  }, [history]);

  const { linePath, areaPath } = buildSparklinePath(points, width, height);

  // Calculate 30-day average
  const avg = React.useMemo(() => {
    if (!history || history.length === 0) return null;
    const now = Date.now() / 1000;
    const cutoff = now - 30 * 86400;
    const recent = history.filter(([ts]) => ts >= cutoff);
    if (recent.length === 0) return null;
    return recent.reduce((sum, [, p]) => sum + p, 0) / recent.length;
  }, [history]);

  const pctBelowAvg = avg && currentPrice < avg
    ? Math.round(((avg - currentPrice) / avg) * 100)
    : null;

  const spotPoint = points.length >= 2
    ? (() => {
        const last = points[points.length - 1];
        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        const xMin = Math.min(...xs), xMax = Math.max(...xs);
        const yMin = Math.min(...ys), yMax = Math.max(...ys);
        const xRange = xMax - xMin || 1;
        const yRange = yMax - yMin || 1;
        const PAD_TOP = 4, PAD_BOTTOM = 4;
        return {
          x: ((last.x - xMin) / xRange) * width,
          y: PAD_TOP + (1 - (last.y - yMin) / yRange) * (height - PAD_TOP - PAD_BOTTOM),
        };
      })()
    : null;

  const gradId = `spark-grad-${Math.random().toString(36).slice(2, 8)}`;

  if (points.length < 2) return <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Insufficient price history</span>;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        aria-hidden="true"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Trend line */}
        <path
          d={linePath}
          fill="none"
          stroke="#D97706"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 30-day average reference line */}
        {avg && points.length >= 2 && (() => {
          const ys = points.map((p) => p.y);
          const yMin = Math.min(...ys), yMax = Math.max(...ys);
          const yRange = yMax - yMin || 1;
          const PAD_TOP = 4, PAD_BOTTOM = 4;
          const avgY = PAD_TOP + (1 - (avg - yMin) / yRange) * (height - PAD_TOP - PAD_BOTTOM);
          return (
            <line
              x1={0} y1={avgY} x2={width} y2={avgY}
              stroke="#363B47"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          );
        })()}

        {/* Current price spot marker */}
        {spotPoint && (
          <circle cx={spotPoint.x} cy={spotPoint.y} r="2.5" fill="#D97706" />
        )}
      </svg>

      {pctBelowAvg !== null && pctBelowAvg > 0 && (
        <div style={{
          marginTop: '4px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#10B981',
          fontWeight: 600,
        }}>
          ↓ {pctBelowAvg}% below 30d avg
        </div>
      )}
    </div>
  );
};
