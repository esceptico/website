'use client';

import { useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { iso, type P3 } from '../iso';
import type { LabelPrim, Prim, RectPrim } from './prims';
import { FloorGrid, GlowDefs, PathShape, RectShape, SoftBox } from './render';

// Engine for isometric explainer figures.
//
//   <IsoDemo duration={10} scene={(t) => [box(...), rect(...), label(...)]} />
//   <IsoDemo params={[slider('tau', 'τ', 5, 60, 20)]} scene={(t, p) => ...} />
//
// The scene is a pure function of time. The engine owns everything else:
// projection, draw order, layout, playback and controls.
//
// Layout is solved in CSS px against the real container width: shapes
// scale, labels don't (HTML, 11px mono), so text stays readable on a phone
// and is never clipped. Gutter labels get an auto-sized left column.

const LAYER_ORDER = { floor: 0, surface: 1, object: 2, overlay: 3, label: 4 } as const;
const CHAR_W = 6.7; // JetBrains Mono 11px advance (+ letter-spacing)
const LINE_H = 15;
const PAD = 6;
const GUTTER_GAP = 20;
const COMPACT_BELOW = 560; // px: gutter labels become a legend above the figure
const INSET = 16; // plate inner padding for gutter labels

/** A knob the reader turns. Sliders are numeric; choices are segmented buttons. */
export type Param =
  | { kind: 'slider'; key: string; label: string; min: number; max: number; step?: number; value: number; format?: (v: number) => string; log?: boolean }
  | { kind: 'choice'; key: string; label: string; options: { value: number; label: string }[]; value: number };

export type Values = Record<string, number>;

export const slider = (
  key: string,
  label: string,
  min: number,
  max: number,
  value: number,
  o: { step?: number; format?: (v: number) => string; log?: boolean } = {},
): Param => ({ kind: 'slider', key, label, min, max, value, ...o });

export const choice = (key: string, label: string, options: { value: number; label: string }[], value: number): Param => ({
  kind: 'choice',
  key,
  label,
  options,
  value,
});

type Props = {
  /** Timeline length in scene units. Omit (or 0) for a static, knob-only figure. */
  duration?: number;
  scene: (t: number, p: Values) => Prim[];
  params?: Param[];
  secondsPerUnit?: number;
  /** Cap on the drawing's height in px; it's centred on a full-width plate. */
  maxHeight?: number;
  /** Cap on px per projected unit, so small scenes don't blow up. */
  maxScale?: number;
  /** Faint fading floor grid under the scene. Default true. */
  grid?: boolean;
  /** 'plate': framed figure with controls. 'bare': unframed art (covers, thumbnails). */
  variant?: 'plate' | 'bare';
  /** Render scene labels. Default true. */
  labels?: boolean;
  /** Loop the timeline forever (covers). */
  loop?: boolean;
  /** Freeze at this time instead of playing (thumbnails). */
  still?: number;
  caption?: ReactNode;
  /** Inside the plate, under the knobs: readouts or traces driven by the knob values. */
  footer?: (p: Values) => ReactNode;
  ariaLabel: string;
};

// ---------- geometry ----------

function rectCorners(r: RectPrim): P3[] {
  const [u0, u1] = r.u;
  const [v0, v1] = r.v;
  if (r.plane === 'z') return [[u0, v0, r.at], [u1, v1, r.at], [u0, v1, r.at], [u1, v0, r.at]];
  if (r.plane === 'x') return [[r.at, u0, v0], [r.at, u1, v1], [r.at, u0, v1], [r.at, u1, v0]];
  return [[u0, r.at, v0], [u1, r.at, v1], [u0, r.at, v1], [u1, r.at, v0]];
}

function primPoints(p: Prim): P3[] {
  switch (p.type) {
    case 'box': {
      const [x, y, z] = p.at;
      const [w, d, h] = p.size;
      return [[x, y, z], [x + w, y + d, z + h], [x, y + d, z], [x + w, y, z + h], [x, y, z + h], [x + w, y + d, z]];
    }
    case 'rect':
      return rectCorners(p);
    case 'path':
      return p.points;
    case 'label':
      return [p.at];
  }
}

function depth(p: Prim): number {
  const pts = primPoints(p);
  const c = pts.reduce((a, q) => [a[0] + q[0], a[1] + q[1], a[2] + q[2]] as P3, [0, 0, 0] as P3);
  return (c[0] + c[1] + c[2] * 0.01) / pts.length;
}

const labelSize = (l: LabelPrim) => ({
  w: Math.max(...l.lines.map((x) => x.text.length)) * CHAR_W + 2,
  h: l.lines.length * LINE_H,
});

/** Horizontal extent of a label box relative to its anchor point, in px. */
function labelSpan(l: LabelPrim): [number, number] {
  const { w } = labelSize(l);
  const dx = l.offset?.[0] ?? 0;
  if (l.anchor === 'end') return [dx - w, dx];
  if (l.anchor === 'middle') return [dx - w / 2, dx + w / 2];
  return [dx, dx + w];
}

type Layout = {
  s: number;
  ox: number;
  oy: number;
  width: number;
  height: number;
  gutter: number;
  compact: boolean;
  floor: { x0: number; x1: number; y0: number; y1: number };
};

function paramSamples(params: Param[]): Values[] {
  const base: Values = Object.fromEntries(params.map((p) => [p.key, p.value]));
  const out: Values[] = [base];
  for (const p of params) {
    const vals = p.kind === 'slider' ? [p.min, p.max] : p.options.map((o) => o.value);
    for (const v of vals) out.push({ ...base, [p.key]: v });
  }
  return out;
}

function solveLayout(
  scene: Props['scene'],
  duration: number,
  params: Param[],
  available: number,
  maxScale: number,
  maxHeight: number,
  bare = false,
): Layout {
  // Plates reserve room for labels/controls; bare art uses the box edge to edge.
  const reserve = bare ? 0 : 30;
  const padV = bare ? 2 : PAD * 3;
  const compact = available < COMPACT_BELOW;
  const shapes: [number, number][] = [];
  const labels: { u: [number, number]; l: LabelPrim }[] = [];
  const floor = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
  let gutter = 0;
  const steps = duration > 0 ? 12 : 0;
  const frames: [number, Values][] = [];
  for (const v of paramSamples(params)) for (let i = 0; i <= steps; i++) frames.push([steps ? (duration * i) / steps : 0, v]);
  for (const [ft, fv] of frames) {
    for (const p of scene(ft, fv)) {
      if (p.type === 'label') {
        if (!p.gutter) labels.push({ u: iso(p.at), l: p });
        else if (!compact) {
          gutter = Math.max(gutter, INSET + labelSize(p).w + GUTTER_GAP);
          labels.push({ u: iso(p.at), l: p });
        }
        continue;
      }
      for (const q of primPoints(p)) {
        shapes.push(iso(q));
        if (q[2] < 0.5) {
          floor.x0 = Math.min(floor.x0, q[0]);
          floor.x1 = Math.max(floor.x1, q[0]);
          floor.y0 = Math.min(floor.y0, q[1]);
          floor.y1 = Math.max(floor.y1, q[1]);
        }
      }
    }
  }

  const sceneLabels = labels.filter((x) => !x.l.gutter);
  const extentX = (s: number) => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const [x] of shapes) {
      lo = Math.min(lo, x * s);
      hi = Math.max(hi, x * s);
    }
    for (const { u, l } of sceneLabels) {
      const [a, b] = labelSpan(l);
      lo = Math.min(lo, u[0] * s + a);
      hi = Math.max(hi, u[0] * s + b);
    }
    return [lo, hi] as const;
  };

  // Largest scale whose content fits beside the gutter (width is monotonic in s).
  const room = Math.max(80, available - gutter - PAD * 2);
  let lo = 0.02;
  let hi = maxScale;
  const fits = (s: number) => {
    const [a, b] = extentX(s);
    return b - a <= room;
  };
  if (fits(hi)) lo = hi;
  else for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  // Also respect the height cap.
  let top0 = Infinity;
  let bottom0 = -Infinity;
  for (const [, y] of shapes) {
    top0 = Math.min(top0, y);
    bottom0 = Math.max(bottom0, y);
  }
  const s = Math.min(lo, (maxHeight - padV * 2 - reserve) / Math.max(1, bottom0 - top0));

  const [left, right] = extentX(s);
  let top = Infinity;
  let bottom = -Infinity;
  for (const [, y] of shapes) {
    top = Math.min(top, y * s);
    bottom = Math.max(bottom, y * s);
  }
  for (const { u, l } of labels) {
    const { h } = labelSize(l);
    const cy = u[1] * s + (l.offset?.[1] ?? 0);
    top = Math.min(top, cy - h / 2);
    bottom = Math.max(bottom, cy + h / 2);
  }

  // Full width: centre the drawing in the space right of the gutter.
  const width = available;
  const slack = Math.max(0, available - gutter - PAD * 2 - (right - left));
  const ox = gutter + PAD + slack / 2 - left;
  const oy = padV - top;
  return { s, ox, oy, width, height: bottom - top + padV * 2, gutter, compact, floor };
}

// ---------- playback ----------

// ---------- auto mode for knob figures ----------

/** Where each knob is at `time` seconds into auto mode, starting from `from`. */
function autoValue(p: Param, i: number, from: number, time: number): number {
  const period = 11 + i * 4; // slow, and staggered so combinations vary
  if (p.kind === 'choice') {
    const n = p.options.length;
    const start = Math.max(0, p.options.findIndex((o) => o.value === from));
    const k = (start + Math.floor(time / (period / n))) % n;
    return p.options[k]!.value;
  }
  const lo = p.log ? Math.log(p.min) : p.min;
  const hi = p.log ? Math.log(p.max) : p.max;
  const u0 = Math.min(1, Math.max(0, ((p.log ? Math.log(from) : from) - lo) / (hi - lo)));
  // u(t) = ½ − ½cos(ωt + φ), with φ chosen so u(0) = u0 and it starts rising.
  const phi = Math.acos(1 - 2 * u0);
  const u = 0.5 - 0.5 * Math.cos((2 * Math.PI * time) / period + phi);
  const raw = lo + u * (hi - lo);
  const v = p.log ? Math.exp(raw) : raw;
  return p.step ? Math.round(v / p.step) * p.step : v;
}

function useAutoKnobs(
  params: Param[],
  figureRef: React.RefObject<HTMLElement | null>,
  setValues: React.Dispatch<React.SetStateAction<Values>>,
  valuesRef: React.RefObject<Values>,
) {
  const reduce = useReducedMotion();
  const [auto, setAuto] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = figureRef.current;
    if (!el || params.length === 0) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [figureRef, params.length]);

  useEffect(() => {
    if (!auto || !visible || reduce || params.length === 0) return;
    const from = { ...valuesRef.current };
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const time = (now - t0) / 1000;
      setValues(Object.fromEntries(params.map((p, i) => [p.key, autoValue(p, i, from[p.key] ?? p.value, time)])));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto, visible, reduce, params, setValues, valuesRef]);

  return { auto: auto && !reduce, setAuto };
}

function usePlayback(duration: number, secondsPerUnit: number, loop = false) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tRef = useRef(0);
  const started = useRef(false);
  const resumeOnEnter = useRef(false);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Start the first time it's on screen; pause while off screen, resume after.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting) {
          if (!started.current) {
            started.current = true;
            if (reduce) setT(duration);
            else setPlaying(true);
          } else if (resumeOnEnter.current) {
            resumeOnEnter.current = false;
            setPlaying(true);
          }
        } else {
          setPlaying((p) => {
            if (p) resumeOnEnter.current = true;
            return false;
          });
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [duration, reduce]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let cur = tRef.current >= duration ? 0 : tRef.current;
    const tick = (now: number) => {
      const next = cur + (now - last) / 1000 / secondsPerUnit;
      cur = loop ? next % duration : Math.min(duration, next);
      last = now;
      setT(cur);
      if (loop || cur < duration) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration, secondsPerUnit, loop]);

  /** play ↔ pause; at the end it replays from 0. */
  const toggle = useCallback(() => {
    if (reduce) {
      setT(duration);
      return;
    }
    if (playing) {
      setPlaying(false);
      return;
    }
    if (tRef.current >= duration) {
      tRef.current = 0;
      setT(0);
    }
    setPlaying(true);
  }, [duration, playing, reduce]);

  const seek = useCallback(
    (next: number) => {
      setPlaying(false);
      resumeOnEnter.current = false;
      started.current = true; // the reader took control: never auto-start over it
      setT(Math.min(duration, Math.max(0, next)));
    },
    [duration],
  );

  return { ref, t, playing, toggle, seek };
}

function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(([e]) => e && setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// ---------- rendering ----------

function Shape({ p }: { p: Exclude<Prim, LabelPrim> }) {
  if (p.type === 'box') return <SoftBox p={p} />;
  if (p.type === 'rect') return <RectShape p={p} />;
  return <PathShape p={p} />;
}

/** Gutter labels share one column: keep them from overlapping (top-down). */
function gutterNudges(labels: LabelPrim[], layout: Layout): Map<string, number> {
  const out = new Map<string, number>();
  const items = labels
    .filter((l) => l.gutter)
    .map((l) => ({ l, cy: iso(l.at)[1] * layout.s + layout.oy + (l.offset?.[1] ?? 0), h: labelSize(l).h }))
    .sort((a, b) => a.cy - b.cy);
  let floor = -Infinity;
  for (const it of items) {
    const top = Math.max(it.cy - it.h / 2, floor);
    out.set(it.l.key, top + it.h / 2 - it.cy);
    floor = top + it.h + 8;
  }
  return out;
}

function Label({ p, layout, nudge = 0 }: { p: LabelPrim; layout: Layout; nudge?: number }) {
  const [ux, uy] = iso(p.at);
  const dx = p.offset?.[0] ?? 0;
  const dy = (p.offset?.[1] ?? 0) + nudge;
  const left = p.gutter ? INSET : ux * layout.s + layout.ox + dx;
  const tx = p.gutter || !p.anchor || p.anchor === 'start' ? '0' : p.anchor === 'middle' ? '-50%' : '-100%';
  return (
    <div
      className="iso-demo-label"
      style={{
        left,
        top: uy * layout.s + layout.oy + dy,
        transform: `translate(${tx}, -50%)`,
        textAlign: p.anchor === 'end' ? 'right' : p.anchor === 'middle' ? 'center' : 'left',
        opacity: p.opacity,
      }}
    >
      {p.lines.map((l, i) => (
        <span key={i} className={l.strong ? 'iso-demo-label-strong' : undefined}>
          {l.text}
        </span>
      ))}
    </div>
  );
}

const NO_PARAMS: Param[] = [];

export function IsoDemo({
  duration = 0,
  scene,
  params = NO_PARAMS,
  secondsPerUnit = 0.55,
  maxHeight = 420,
  maxScale = 2.4,
  grid = true,
  variant = 'plate',
  labels: showLabels = true,
  loop = false,
  still,
  caption,
  footer,
  ariaLabel,
}: Props) {
  const bare = variant === 'bare';
  const animated = duration > 0;
  const [boxRef, available] = useWidth<HTMLDivElement>(640);
  const layout = useMemo(
    () => solveLayout(scene, duration, params, available, maxScale, maxHeight, variant === 'bare'),
    [scene, duration, params, available, maxScale, maxHeight, variant],
  );
  const [values, setValues] = useState<Values>(() => Object.fromEntries(params.map((p) => [p.key, p.value])));
  const valuesRef = useRef<Values>(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);
  // Stable across server and client (useId differed inside MDX trees).
  const gridId = useMemo(() => {
    let h = 0;
    for (const ch of ariaLabel) h = (h * 31 + ch.charCodeAt(0)) | 0;
    return `isog${(h >>> 0).toString(36)}`;
  }, [ariaLabel]);
  const { ref, t: liveT, playing, toggle, seek } = usePlayback(animated && still === undefined ? duration : 1, secondsPerUnit, loop);
  const t = still ?? liveT;
  const knobs = useAutoKnobs(params, ref, setValues, valuesRef);
  /** Reader touched a knob: hand over control. */
  const setByHand = (key: string, v: number) => {
    knobs.setAuto(false);
    setValues((prev) => ({ ...prev, [key]: v }));
  };
  const trackRef = useRef<HTMLDivElement>(null);

  const all = scene(animated ? t : 0, values);
  const shapes = all
    .filter((p): p is Exclude<Prim, LabelPrim> => p.type !== 'label')
    .map((p, i) => ({ p, i, layer: LAYER_ORDER[p.layer ?? 'object'], d: depth(p) }))
    .sort((a, b) => a.layer - b.layer || a.d - b.d || a.i - b.i);
  const labels = showLabels ? all.filter((p): p is LabelPrim => p.type === 'label') : [];
  const sceneLabels = layout.compact ? labels.filter((l) => !l.gutter) : labels;
  const legend = layout.compact ? labels.filter((l) => l.gutter) : [];
  const nudges = gutterNudges(sceneLabels, layout);

  const { s, ox, oy, width, height } = layout;
  const viewBox = `${(-ox / s).toFixed(2)} ${(-oy / s).toFixed(2)} ${(width / s).toFixed(2)} ${(height / s).toFixed(2)}`;
  const done = animated && t >= duration;

  const seekFromPointer = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    seek(((clientX - r.left) / r.width) * duration);
  };

  // Knob figures are driven by hand only; the button is for timelines.
  const showButton = !bare && animated;
  const running = animated ? playing : knobs.auto;
  const onButton = animated ? toggle : () => knobs.setAuto((a) => !a);
  const icon = running ? (
    <path d="M5 3v10M11 3v10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ) : animated && done ? (
    <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ) : (
    <path d="M5 3l8 5-8 5z" fill="currentColor" />
  );

  return (
    <figure ref={ref} className={bare ? 'iso-scene iso-bare' : 'iso-scene iso-demo my-10'}>
      {/* Full-width plate: aligns with the text column on both edges. */}
      <div ref={boxRef} className={bare ? 'iso-bare-box' : 'iso-plate'}>
        {showButton && <button
          type="button"
          onClick={onButton}
          className="iso-plate-play"
          aria-label={running ? 'Pause' : animated && done ? 'Replay' : 'Play'}
          title={animated ? undefined : running ? 'auto · pause to take control' : 'auto mode'}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
            {icon}
          </svg>
        </button>}

        {legend.length > 0 && (
          <div className="iso-demo-legend" aria-hidden="true">
            {legend.map((l) => (
              <div key={l.key}>
                {l.lines.map((x, i) => (
                  <span key={i} className={x.strong ? 'iso-demo-label-strong' : undefined}>
                    {i > 0 ? ' · ' : ''}
                    {x.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="relative" style={{ height }}>
          <svg viewBox={viewBox} width={width} height={height} className="block overflow-visible" role="img" aria-label={ariaLabel}>
            <GlowDefs />
            {grid && <FloorGrid bounds={layout.floor} id={gridId} />}
            {shapes.map(({ p }) => (
              <Shape key={p.key} p={p} />
            ))}
          </svg>
          <div aria-hidden="true">
            {sceneLabels.map((p) => (
              <Label key={p.key} p={p} layout={layout} nudge={nudges.get(p.key)} />
            ))}
          </div>
        </div>

        {!bare && params.length > 0 && (
          <div className="iso-knobs">
            {params.map((p) =>
              p.kind === 'slider' ? (
                <label key={p.key} className="iso-knob">
                  <span className="iso-knob-label">
                    {p.label} = <b>{(p.format ?? ((v: number) => String(+v.toFixed(2))))(values[p.key] ?? p.value)}</b>
                  </span>
                  <input
                    type="range"
                    min={p.log ? Math.log(p.min) : p.min}
                    max={p.log ? Math.log(p.max) : p.max}
                    step={p.log ? 0.01 : p.step ?? (p.max - p.min) / 100}
                    value={p.log ? Math.log(values[p.key] ?? p.value) : values[p.key] ?? p.value}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      setByHand(p.key, p.log ? Math.exp(raw) : raw);
                    }}
                    aria-label={p.label}
                  />
                </label>
              ) : (
                <div key={p.key} className="iso-knob" role="radiogroup" aria-label={p.label}>
                  <span className="iso-knob-label">{p.label}</span>
                  <div className="iso-seg">
                    {p.options.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={(values[p.key] ?? p.value) === o.value}
                        className="iso-seg-btn"
                        onClick={() => setByHand(p.key, o.value)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {!bare && footer?.(values)}

        {/* Timeline = the plate's bottom edge. Drag / arrows / Home / End / space. */}
        {animated && !bare && <div
          ref={trackRef}
          className="iso-demo-track"
          role="slider"
          tabIndex={0}
          aria-label="Animation time"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={Number(t.toFixed(1))}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            seekFromPointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) seekFromPointer(e.clientX);
          }}
          onKeyDown={(e) => {
            const step = duration / 20;
            if (e.key === 'ArrowRight') seek(t + step);
            else if (e.key === 'ArrowLeft') seek(t - step);
            else if (e.key === 'Home') seek(0);
            else if (e.key === 'End') seek(duration);
            else if (e.key === ' ' || e.key === 'k') toggle();
            else return;
            e.preventDefault();
          }}
        >
          <div className="iso-demo-fill" style={{ transform: `scaleX(${t / duration})` }} />
        </div>}
      </div>

      {caption && <figcaption className="mt-3 font-mono text-[11px] leading-relaxed text-[var(--theme-text-muted)]">{caption}</figcaption>}
    </figure>
  );
}
