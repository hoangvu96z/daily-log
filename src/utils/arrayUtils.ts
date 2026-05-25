/**
 * arrayUtils.ts — Array utility functions
 */

export function mostFrequent<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  const freq = new Map<T, number>();
  arr.forEach(v => freq.set(v, (freq.get(v) ?? 0) + 1));
  let best: T = arr[0]; let max = 0;
  freq.forEach((count, key) => { if (count > max) { max = count; best = key; } });
  return best;
}
