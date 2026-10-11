'use client';

import { useMemo, useRef } from 'react';

// Tiny synthesized mechanical sounds for iso objects: no files, no network.
// Silent until `arm()` is called from a user gesture (browsers require it,
// and nothing should make noise that the reader didn't start).

type Ctx = { ctx: AudioContext; out: GainNode };

function burst({ ctx, out }: Ctx, at: number, opts: { dur: number; freq: number; q: number; gain: number }) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * opts.dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = opts.freq;
  bp.Q.value = opts.q;
  const g = ctx.createGain();
  g.gain.value = opts.gain;
  src.connect(bp).connect(g).connect(out);
  src.start(at);
}

export function useClicks() {
  const ref = useRef<Ctx | null>(null);
  return useMemo(() => {
    const play = (fn: (c: Ctx, now: number) => void) => {
      const c = ref.current;
      if (!c) return;
      try {
        fn(c, c.ctx.currentTime);
      } catch {
        // audio is a nicety; never let it break the figure
      }
    };
    return {
      /** Call from a pointer/key handler: enables sound for this figure. */
      arm() {
        if (ref.current) {
          if (ref.current.ctx.state === 'suspended') void ref.current.ctx.resume();
          return;
        }
        try {
          const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AC();
          const out = ctx.createGain();
          out.gain.value = 0.5;
          out.connect(ctx.destination);
          ref.current = { ctx, out };
        } catch {
          ref.current = null;
        }
      },
      /** Knob detent: short, dry tick. */
      detent: () => play((c, t) => burst(c, t, { dur: 0.012, freq: 3200, q: 4, gain: 0.35 })),
      /** Button / cap press. */
      tap: () => play((c, t) => burst(c, t, { dur: 0.02, freq: 1800, q: 2, gain: 0.4 })),
      /** Screw backing out: a little ratchet. */
      screw: () =>
        play((c, t) => {
          for (let i = 0; i < 5; i++) burst(c, t + i * 0.055, { dur: 0.01, freq: 2600 + i * 120, q: 6, gain: 0.25 });
        }),
      /** Shell seating back down. */
      thunk: () => play((c, t) => burst(c, t + 0.9, { dur: 0.08, freq: 260, q: 1.2, gain: 0.9 })),
    };
  }, []);
}
