'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HackerTextEffect.module.css';

interface HackerTextEffectProps {
  texts: readonly string[];
  className?: string;
  cycleDelay?: number; // ms the settled text stays before morphing to the next
}

// Lowercase + a few thin symbols: reads as "text resolving", not line noise.
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz_-/\\<>+=*';
const FRAME_MS = 42; // one glyph change
const STAGGER_MS = 28; // left-to-right wave
const MIN_FRAMES = 2;
const MAX_FRAMES = 5;

type Cell = { ch: string; settled: boolean };

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? '_';
const settledCells = (text: string): Cell[] => text.split('').map((ch) => ({ ch, settled: true }));

/**
 * Morphs between texts: a wave runs left to right, each position flickers
 * through a few glyphs and resolves into the next text. Positions that
 * already match stay put; the line grows or shrinks one cell at a time.
 * Unresolved glyphs render muted so the settled text always reads first.
 */
const HackerTextEffect: React.FC<HackerTextEffectProps> = ({ texts, className = '', cycleDelay = 4000 }) => {
  const [cells, setCells] = useState<Cell[]>(() => settledCells(texts[0] ?? ''));
  const [index, setIndex] = useState(0);
  const shownRef = useRef(texts[0] ?? '');

  useEffect(() => {
    const target = texts[index] ?? texts[0] ?? '';
    const from = shownRef.current;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleNext = () => {
      if (texts.length < 2) return;
      timer = setTimeout(() => setIndex((i) => (i + 1) % texts.length), cycleDelay + (Math.random() - 0.5) * 800);
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (from === target || reduce) {
      shownRef.current = target;
      setCells(settledCells(target));
      scheduleNext();
      return () => clearTimeout(timer);
    }

    const len = Math.max(from.length, target.length);
    const plan = Array.from({ length: len }, (_, i) => {
      const a = from[i] ?? '';
      const b = target[i] ?? '';
      const frames = a === b ? 0 : MIN_FRAMES + Math.floor(Math.random() * (MAX_FRAMES - MIN_FRAMES + 1));
      const start = i * STAGGER_MS;
      return { a, b, start, end: start + frames * FRAME_MS };
    });
    const total = Math.max(...plan.map((p) => p.end));
    const t0 = performance.now();
    let lastFrame = -1;

    const tick = (now: number) => {
      const t = now - t0;
      const frame = Math.floor(t / FRAME_MS);
      if (frame !== lastFrame) {
        lastFrame = frame;
        const next: Cell[] = [];
        for (const p of plan) {
          if (t >= p.end) {
            if (p.b) next.push({ ch: p.b, settled: true });
          } else if (t < p.start) {
            if (p.a) next.push({ ch: p.a, settled: true });
          } else {
            next.push({ ch: p.b === ' ' && p.a === ' ' ? ' ' : randomGlyph(), settled: false });
          }
        }
        setCells(next);
      }
      if (t < total) {
        raf = requestAnimationFrame(tick);
      } else {
        shownRef.current = target;
        setCells(settledCells(target));
        scheduleNext();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [index, texts, cycleDelay]);

  return (
    <span className={`inline-block font-jetbrains-mono whitespace-pre select-none ${styles.hackerText} ${className}`}>
      {cells.map((c, i) => (
        <span key={i} className={c.settled ? undefined : styles.glyph}>
          {c.ch}
        </span>
      ))}
    </span>
  );
};

export default HackerTextEffect;
