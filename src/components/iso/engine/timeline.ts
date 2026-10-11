import type { P3 } from '../iso';

// Time helpers for scene(t) functions. All pure; t is in scene units.

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const lerp3 = (a: P3, b: P3, p: number): P3 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];

export type Ease = (p: number) => number;
export const ease = {
  linear: (p: number) => p,
  in: (p: number) => p * p,
  out: (p: number) => 1 - (1 - p) * (1 - p),
  inOut: (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2),
} satisfies Record<string, Ease>;

/** 0 before `start`, 1 after `start + dur`, eased in between. */
export const progress = (t: number, start: number, dur: number, e: Ease = ease.linear) =>
  dur <= 0 ? (t >= start ? 1 : 0) : e(clamp01((t - start) / dur));

/** A pulse that rises instantly at `start` and fades out over `dur`. */
export const flash = (t: number, start: number, dur: number) => (t < start ? 0 : 1 - clamp01((t - start) / dur));

/** Position along keyframes [{t, p}], easing each segment. Holds the ends. */
export function track(t: number, frames: readonly { t: number; p: P3; ease?: Ease }[]): P3 {
  const first = frames[0];
  if (!first) return [0, 0, 0];
  if (t <= first.t) return first.p;
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1]!;
    const b = frames[i]!;
    if (t <= b.t) return lerp3(a.p, b.p, (b.ease ?? ease.inOut)(clamp01((t - a.t) / (b.t - a.t))));
  }
  return frames[frames.length - 1]!.p;
}
