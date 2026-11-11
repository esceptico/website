'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// A working copy of Tape's panel, without sound. The buffer here is one minute
// long (the app keeps up to 60) so the playhead visibly moves at real speed.
const TOTAL = 60;
const BARS = 90;
const W = 360;
const H = 72;
const AMBER = '#ffd60a';

// Fixed seed: the server and the browser must draw the same bars.
const PEAKS: number[] = (() => {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: BARS }, (_, i) => {
    const speech = Math.sin(i / 5) * Math.sin(i / 2.1);
    return speech > 0.08 ? 0.3 + 0.7 * rand() * (0.5 + speech) : 0.05 + 0.05 * rand();
  });
})();

const clock = (seconds: number) => {
  const t = Math.max(0, Math.floor(seconds));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

const length = (seconds: number) => {
  const t = Math.round(seconds);
  if (t < 60) return `${t} s`;
  return t % 60 === 0 ? `${t / 60} min` : `${Math.floor(t / 60)} min ${t % 60} s`;
};

type Mode = 'start' | 'end' | 'scrub';

export function TapeDemo() {
  const [start, setStart] = useState(40 / TOTAL);
  const [end, setEnd] = useState(1);
  const [pos, setPos] = useState(40);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  const mode = useRef<Mode | null>(null);
  const resume = useRef(false);
  const range = useRef({ start, end });
  useEffect(() => {
    range.current = { start, end };
  }, [start, end]);

  // The clock is read in the browser only, so the server render has no time in it.
  useEffect(() => setNow(new Date()), []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      let done = false;
      setPos((p) => {
        const next = p + dt;
        if (next >= range.current.end * TOTAL) {
          done = true;
          return range.current.start * TOTAL;
        }
        return next;
      });
      if (done) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const fraction = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
  };

  // While the pointer is down the edge follows it exactly: no easing.
  const apply = useCallback((f: number) => {
    const step = 1 / TOTAL;
    const { start: s, end: en } = range.current;
    if (mode.current === 'start') {
      const next = Math.min(Math.round(f * TOTAL) / TOTAL, en - step);
      setStart(next);
      setPlaying(false);
      setPos((p) => (p < next * TOTAL ? next * TOTAL : p));
    } else if (mode.current === 'end') {
      const next = Math.max(Math.round(f * TOTAL) / TOTAL, s + step);
      setEnd(next);
      setPlaying(false);
      setPos((p) => (p >= next * TOTAL ? s * TOTAL : p));
    } else if (mode.current === 'scrub') {
      setPos(Math.min(en, Math.max(s, f)) * TOTAL);
    }
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const f = fraction(e);
    const grab = 12 / e.currentTarget.getBoundingClientRect().width;
    if (Math.abs(f - start) <= grab || f < start) mode.current = 'start';
    else if (Math.abs(f - end) <= grab || f > end) mode.current = 'end';
    else {
      mode.current = 'scrub';
      resume.current = playing;
      setPlaying(false);
    }
    setHover(null);
    apply(f);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mode.current) apply(fraction(e));
    else if (e.pointerType === 'mouse') setHover(fraction(e));
  };

  const onPointerUp = () => {
    if (mode.current === 'scrub' && resume.current) setPlaying(true);
    mode.current = null;
    resume.current = false;
  };

  const save = () => {
    if (saved) return;
    setPlaying(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  const at = (f: number) =>
    now
      ? new Date(now.getTime() - (1 - f) * TOTAL * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      : '';

  const sx = start * W;
  const ex = end * W;
  const px = (pos / TOTAL) * W;
  const press = 'transition-transform duration-150 ease-out active:scale-[0.97]';

  return (
    <div
      className="w-full max-w-[400px] rounded-[14px] p-4 text-white select-none"
      style={{
        background: '#1e1e20',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 40px -18px rgba(0,0,0,0.45)',
        fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-[24px] font-semibold tracking-[-0.02em]">{length((end - start) * TOTAL)}</span>
        <span className="text-[12px] font-medium text-white/55">
          {now ? `${at(start)} – ${at(end)}` : ' '}
        </span>
      </div>

      <div
        role="group"
        aria-label="Recorded audio. Drag the edges to trim."
        className="relative mt-3.5 cursor-pointer"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ height: H }} preserveAspectRatio="none" aria-hidden="true">
          <rect x={sx} y={0} width={Math.max(2, ex - sx)} height={H} rx={8} fill={AMBER} opacity={0.14} />
          {PEAKS.map((peak, i) => {
            const x = i * (W / BARS) + 1;
            const h = Math.max(2, Math.min(1, peak) * (H - 16));
            const inside = x >= sx && x + 2 <= ex;
            const fill = !inside ? 'rgba(255,255,255,0.22)' : x < px ? AMBER : 'rgba(255,255,255,0.85)';
            return <rect key={i} x={x} y={(H - h) / 2} width={2} height={h} rx={1} fill={fill} />;
          })}
          <rect x={sx} y={0} width={4} height={H} rx={2} fill={AMBER} />
          <rect x={ex - 4} y={0} width={4} height={H} rx={2} fill={AMBER} />
          {px > sx + 4 && px < ex - 4 && <rect x={px - 1} y={4} width={2} height={H - 8} rx={1} fill="#fff" />}
          {hover !== null && <rect x={hover * W - 0.5} y={0} width={1} height={H} fill="rgba(255,255,255,0.35)" />}
        </svg>
        {hover !== null && now && (
          <span
            className="pointer-events-none absolute -top-4 -translate-x-1/2 rounded-full px-1.5 py-px text-[10px] font-semibold"
            style={{ left: `${Math.min(90, Math.max(10, hover * 100))}%`, background: 'rgba(60,60,64,0.95)' }}
          >
            {at(hover)}
          </span>
        )}
      </div>

      <div className="mt-3.5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause' : 'Play'}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 ${press}`}
        >
          <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
            {playing ? <path d="M1 0h3.5v14H1zM7.5 0H11v14H7.5z" /> : <path d="M1 0l11 7-11 7z" />}
          </svg>
        </button>
        <span className="text-[12px] font-medium text-white/55">
          {clock(pos - start * TOTAL)} / {clock(Math.round((end - start) * TOTAL))}
        </span>
        <button
          type="button"
          onClick={save}
          className={`relative ml-auto h-9 rounded-full px-4 text-[13px] font-semibold text-black hover:brightness-105 ${press}`}
          style={{ background: AMBER }}
        >
          <span
            className="block transition-[opacity,filter] duration-200 ease-out"
            style={{ opacity: saved ? 0 : 1, filter: saved ? 'blur(2px)' : 'none' }}
          >
            Save
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center transition-[opacity,filter] duration-200 ease-out"
            style={{ opacity: saved ? 1 : 0, filter: saved ? 'none' : 'blur(2px)' }}
            aria-hidden={!saved}
          >
            Saved
          </span>
        </button>
      </div>
    </div>
  );
}
