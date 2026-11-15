function calculateChartData(points, chartLeft = 25, chartRight = 515, chartTop = 25, chartBottom = 175) {
  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  const values = points.map(p => p.price);
  const rawLow = Math.min(...values);
  const rawHigh = Math.max(...values);

  let yMin;
  let yMax;

  if (rawHigh === rawLow) {
    const spread = Math.max(Math.round(rawLow * 0.15), 100);
    yMin = Math.max(0, rawLow - spread);
    yMax = rawLow + spread;
  } else {
    const spread = (rawHigh - rawLow) * 0.15;
    yMin = Math.max(0, Math.floor(rawLow - spread));
    yMax = Math.ceil(rawHigh + spread);
  }

  const start = points[0]?.time || 0;
  const end = points[points.length - 1]?.time || start;
  const timeSpan = end - start;

  const mapped = points.map((p, idx) => {
    let x;
    if (timeSpan <= 0) {
      x = chartLeft + (idx / Math.max(points.length - 1, 1)) * chartWidth;
    } else {
      x = chartLeft + ((p.time - start) / timeSpan) * chartWidth;
    }
    const y = chartTop + ((yMax - p.price) / (yMax - yMin || 1)) * chartHeight;
    return { ...p, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  return { mapped, yMin, yMax, rawLow, rawHigh, start, end, timeSpan };
}

// Flat line test (same as user's screenshot: 4 points all at 3298)
const flatTest = [
  { time: 1791400000000, price: 3298 },
  { time: 1791420000000, price: 3298 },
  { time: 1791440000000, price: 3298 },
  { time: 1791460000000, price: 3298 },
];

const res = calculateChartData(flatTest);
console.log("Flat line mapped points:", res.mapped);
console.log("yMin:", res.yMin, "yMax:", res.yMax);
console.log("All Y coordinates are centered:", res.mapped.map(p => p.y));
