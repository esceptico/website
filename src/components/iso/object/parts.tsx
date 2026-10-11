'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Shared behaviour for hand-built iso objects: number formatting that never
// jumps, geometry helpers, visibility, and the teardown mechanism (screws
// that back out one by one, then a shell that lifts).

/** Round computed coordinates so server and client markup match exactly. */
export const r2 = (v: number) => Math.round(v * 100) / 100;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (p: number) => p * p * (3 - 2 * p);

/** Figure space: same width as a digit. */
export const FIG = ' ';
/** Fixed-width signed number: "−0.65" / " 3.48". */
export const signed = (v: number, digits = 2) => `${v < 0 ? '−' : v > 0 ? '+' : FIG}${Math.abs(v).toFixed(digits)}`;

export function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.08));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return `${i ? 'L' : 'M'}${r2(cx + r * Math.cos(a))} ${r2(cy + r * Math.sin(a))}`;
  }).join('');
}

export function hullOf(points: [number, number][]): [number, number][] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const build = (list: [number, number][]) => {
    const h: [number, number][] = [];
    for (const q of list) {
      while (h.length >= 2 && cross(h[h.length - 2]!, h[h.length - 1]!, q) <= 0) h.pop();
      h.push(q);
    }
    return h;
  };
  return [...build(p).slice(0, -1), ...build([...p].reverse()).slice(0, -1)];
}

export function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/** setTimeout pool that is cleared on unmount (or on demand). */
export function useTimers() {
  const pool = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((ms: number, fn: () => void) => {
    pool.current.push(setTimeout(fn, ms));
  }, []);
  const clear = useCallback(() => {
    pool.current.forEach(clearTimeout);
    pool.current = [];
  }, []);
  useEffect(() => clear, [clear]);
  return { later, clear };
}

type Sounds = { screw: () => void; thunk: () => void };

/**
 * Teardown: `n` screws (0 in → 1 out) and a shell lift (0 seated → 1 off).
 * Screws back out one at a time; the shell lifts on its own once all are
 * out; closing lowers the shell, then drives the screws back in.
 */
export function useTeardown(n: number, sound: Sounds) {
  const [screws, setScrews] = useState<number[]>(() => Array(n).fill(0));
  const [lift, setLift] = useState(0);
  const cur = useRef({ screws: Array(n).fill(0) as number[], lift: 0 });
  const target = useRef({ screws: Array(n).fill(0) as number[], lift: 0 });
  const closing = useRef(false);
  const raf = useRef(0);
  const { later } = useTimers();

  const run = useCallback(() => {
    if (raf.current) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const c = cur.current;
      const t = target.current;
      let moving = false;
      c.screws = c.screws.map((v, i) => {
        const goal = t.screws[i]!;
        if (v === goal) return v;
        moving = true;
        return goal > v ? Math.min(goal, v + dt / 0.5) : Math.max(goal, v - dt / 0.5);
      });
      if (c.lift !== t.lift) {
        moving = true;
        c.lift = t.lift > c.lift ? Math.min(t.lift, c.lift + dt / 1.1) : Math.max(t.lift, c.lift - dt / 1.1);
      }
      setScrews([...c.screws]);
      setLift(c.lift);
      if (moving) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      raf.current = 0;
      // settled: chain the next step of the sequence
      if (!closing.current && c.screws.every((s) => s >= 1) && t.lift === 0) {
        target.current.lift = 1;
        run();
      } else if (closing.current && c.lift === 0) {
        closing.current = false;
        for (let i = 0; i < n; i++)
          later(i * 170, () => {
            target.current.screws[i] = 0;
            sound.screw();
            run();
          });
      }
    };
    raf.current = requestAnimationFrame(tick);
  }, [later, n, sound]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const unscrew = useCallback(
    (i: number, quiet = false) => {
      if (target.current.screws[i] === 1 || target.current.lift > 0) return;
      if (!quiet) sound.screw();
      target.current.screws[i] = 1;
      run();
    },
    [run, sound],
  );
  const open = useCallback(
    (quiet = false, stagger = 170) => {
      for (let i = 0; i < n; i++) later(i * stagger, () => unscrew(i, quiet));
    },
    [later, n, unscrew],
  );
  const close = useCallback(
    (quiet = false) => {
      const t = target.current;
      if (t.lift === 0 && t.screws.every((s) => s === 0)) return;
      closing.current = true;
      if (!quiet) sound.thunk();
      t.lift = 0;
      // screws that were out with the shell still seated: drive them back too
      if (cur.current.lift === 0) {
        closing.current = false;
        for (let i = 0; i < n; i++)
          later(i * 170, () => {
            target.current.screws[i] = 0;
            if (!quiet) sound.screw();
            run();
          });
      }
      run();
    },
    [later, n, run, sound],
  );
  const toggle = useCallback(() => {
    const t = target.current;
    if (t.lift > 0 || t.screws.some((s) => s > 0)) close();
    else open();
  }, [close, open]);

  const isOpen = lift > 0.5 || screws.some((s) => s > 0.5);
  return { screws, lift, isOpen, unscrew, open, close, toggle };
}

/** Pressed-part state: parts sink while held. */
export function usePress(onFirstTouch: () => void) {
  const [pressed, setPressed] = useState<string | null>(null);
  const bind = (key: string, onRelease?: () => void) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.stopPropagation();
      onFirstTouch();
      setPressed(key);
    },
    onPointerUp: () => {
      setPressed(null);
      onRelease?.();
    },
    onPointerLeave: () => setPressed((p) => (p === key ? null : p)),
  });
  const sink = (key: string, px = 2.5) => (pressed === key ? `translate(0 ${px})` : undefined);
  return { pressed, setPressed, bind, sink };
}
