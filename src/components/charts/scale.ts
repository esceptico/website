// Tiny scale helpers for the chart components (no dependencies).

/** Round, evenly spaced ticks covering [lo, hi] (about `count` of them). */
export function niceTicks(lo: number, hi: number, count = 5): number[] {
  const span = hi - lo;
  if (!(span > 0)) return [lo];
  const raw = span / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const first = Math.ceil(lo / step - 1e-9) * step;
  const out: number[] = [];
  for (let v = first; v <= hi + step * 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}

/** Shortest decimal form that tells adjacent ticks apart. */
export function tickFormat(ticks: number[]): (v: number) => string {
  const step = ticks.length > 1 ? Math.abs(ticks[1]! - ticks[0]!) : 1;
  const digits = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return (v) => v.toFixed(digits);
}

/** Linear map from a domain onto a pixel range. */
export const linear = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

/** Round to 0.1px so server and client markup match. */
export const px = (v: number) => Math.round(v * 10) / 10;
