export function historyRange(points: Array<[number, number]>, days: number, now = Date.now()) {
  const cutoff = days ? now - days * 86400000 : -Infinity;
  // Never substitute another period when the requested range is empty.
  return points.filter(([time]) => time >= cutoff && time <= now + 60000);
}
