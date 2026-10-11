'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { IsoObject } from './object/IsoObject';
import { ObjectDefs, frame } from './object/kernel';
import { M, MI, TM, TMI } from './object/math';
import { arc, r2 } from './object/parts';
import { useClicks } from './object/sound';

// Fig · RoPE as a rotary encoder.
//
// Four dials are the four dimension pairs of a head_dim = 8 query/key
// (θ = 10,000, f_i = θ^(−2i/d) = 1, 0.1, 0.01, 0.001). The knob sets the
// distance Δ between q and k in tokens. On each dial the notch is q and the
// pointer is k, turned by Δ·f_i; the lit wedge is that angle.
//
// For a q and k with the same content, the score is proportional to
// Σ_i cos(Δ·f_i): 4 at Δ = 0, and only Δ enters (not the absolute
// positions). The traces under the device plot each pair's cos over Δ:
// fast pairs alias into noise within a few tokens, slow pairs stay smooth.

const PAIRS = 4;
const THETA = 10_000;
const D_HEAD = 8;
const FREQ = Array.from({ length: PAIRS }, (_, i) => THETA ** (-(2 * i) / D_HEAD));
const D_MAX = 256;
const Q = -Math.PI / 2;
const SEG = 8;

// boxes            x    y    z    w    d    h
// plate            0    0    0  470  280    8
// chassis         30   36    8  410  200   56   → deck z = 64
const CH = { x: 30, y: 36, w: 410, d: 200, z: 8, h: 56 };
const DECK = CH.z + CH.h;
const FRONT_Y = CH.y + CH.d;
const DIALS = [0, 1, 2, 3].map((i) => ({ u: 52 + i * 72, v: 92 }));
const KNOB = { u: 358, v: 104, r: 25 };

const K = frame([
  [0, 280, 0],
  [470, 0, 8],
  [470, 280, 0],
  [CH.x, CH.y, DECK + 20],
  [CH.x + KNOB.u, CH.y + KNOB.v, DECK + 18],
]);

// knob travel: log-like so small distances get room, but Δ is always an integer
const toT = (d: number) => Math.log1p(d) / Math.log1p(D_MAX);
const fromT = (t: number) => Math.round(Math.expm1(Math.min(1, Math.max(0, t)) * Math.log1p(D_MAX)));
const knobAngle = (d: number) => ((-225 + toT(d) * 270) * Math.PI) / 180;
const fmtF = (f: number) => (f >= 0.1 ? f.toFixed(1) : f.toPrecision(1));
const signed2 = (v: number) => `${v < 0 ? '−' : ' '}${Math.abs(v).toFixed(2)}`;

/** cos(x·f) over x ∈ [0, D_MAX] as a small sparkline, marker at Δ. */
function Trace({ f, delta, hot }: { f: number; delta: number; hot: boolean }) {
  const W = 160;
  const H = 30;
  const n = 512;
  const pts: string[] = [];
  for (let k = 0; k <= n; k++) {
    const x = (k / n) * D_MAX;
    pts.push(`${k ? 'L' : 'M'}${r2((k / n) * W)} ${r2(H / 2 - Math.cos(x * f) * (H / 2 - 2))}`);
  }
  const mx = r2((delta / D_MAX) * W);
  const my = r2(H / 2 - Math.cos(delta * f) * (H / 2 - 2));
  return (
    <div className="o-trace-wrap" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} className="o-trace" preserveAspectRatio="none">
        <line className="o-trace-axis" x1={0} y1={H / 2} x2={W} y2={H / 2} />
        <path className={hot ? 'o-trace-line is-hot' : 'o-trace-line'} d={pts.join('')} />
        <line className="o-trace-mark" x1={mx} y1={0} x2={mx} y2={H} />
      </svg>
      <span className="o-trace-dot" style={{ left: `${r2((mx / W) * 100)}%`, top: `${r2((my / H) * 100)}%` }} />
    </div>
  );
}

export function RopeDevice() {
  const sound = useClicks();
  const [delta, setDelta] = useState(4);
  const [hover, setHover] = useState<number | null>(null);
  const deltaRef = useRef(delta);

  const set = useCallback(
    (d: number) => {
      const next = Math.min(D_MAX, Math.max(0, Math.round(d)));
      if (next !== deltaRef.current) sound.detent();
      deltaRef.current = next;
      setDelta(next);
    },
    [sound],
  );

  const drag = useRef<{ x: number; y: number; t: number } | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const onKnobDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    sound.arm();
    setGrabbing(true);
    drag.current = { x: e.clientX, y: e.clientY, t: toT(deltaRef.current) };
  };
  const onKnobMove = (e: React.PointerEvent) => {
    const g = drag.current;
    if (g) set(fromT(g.t + (e.clientX - g.x - (e.clientY - g.y)) / 260));
  };
  const onKnobUp = () => {
    drag.current = null;
    setGrabbing(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    sound.arm();
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') set(deltaRef.current + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') set(deltaRef.current - step);
    else if (e.key === 'Home') set(0);
    else if (e.key === 'End') set(D_MAX);
    else return;
    e.preventDefault();
  };

  const rel = FREQ.map((f) => delta * f);
  const cos = rel.map((r) => Math.cos(r));
  const score = cos.reduce((a, b) => a + b, 0);
  const ka = knobAngle(delta);

  const { TOP, FRONT, SIDE, box, cyl } = K;
  const id = 'rope';
  const glow = `url(#${id}-glow)`;
  const soft = `url(#${id}-soft)`;
  const bloom = `url(#${id}-bloom)`;

  const dials: ReactNode[] = DIALS.map(({ u, v }, i) => {
    const r = rel[i]!;
    const wrapped = Math.atan2(Math.sin(r), Math.cos(r));
    const k = Q - r;
    const live = hover === null || hover === i;
    return (
      <g key={i} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
        <g transform={TOP(CH.x, CH.y, DECK)}>
          <circle className="o-face o-recess" cx={u} cy={v} r={27} />
          {Array.from({ length: 24 }, (_, j) => {
            const a = (j / 24) * Math.PI * 2;
            const r0 = j % 6 === 0 ? 28.5 : 30;
            return <line key={j} className="o-detail" x1={r2(u + r0 * Math.cos(a))} y1={r2(v + r0 * Math.sin(a))} x2={r2(u + 32.5 * Math.cos(a))} y2={r2(v + 32.5 * Math.sin(a))} />;
          })}
          {Math.abs(wrapped) > 0.01 && <path className="o-wedge" filter={soft} d={arc(u, v, 23, Q - wrapped, Q)} style={{ opacity: live ? 1 : 0.3 }} />}
          <path className="o-accent-fill" filter={soft} d={`M${u} ${v - 34.5} L${u - 3} ${v - 39.5} L${u + 3} ${v - 39.5} Z`} />
          <text className="o-label o-label-hi" x={u + 7} y={v - 36} fontSize={8}>
            <TMI>q</TMI>
          </text>
          <text className={hover === i ? 'o-label o-label-hi' : 'o-label'} x={u} y={v + 46} textAnchor="middle" fontSize={8.5}>
            p{i} · <TMI>f</TMI> {fmtF(FREQ[i]!)}
          </text>
        </g>
        {cyl(CH.x + u, CH.y + v, DECK, 17, 9)}
        <g transform={TOP(CH.x + u, CH.y + v, DECK + 9)}>
          <circle className="o-detail" r={12.5} />
          <line className="o-ink-hi" x1={0} y1={0} x2={r2(14.5 * Math.cos(k))} y2={r2(14.5 * Math.sin(k))} />
          <circle className="o-face o-recess" r={2.4} />
        </g>
      </g>
    );
  });

  return (
    <IsoObject
      fig="fig · rope"
      title={
        <>
          rotary encoder · <MI>d</MI> = 8 · <MI>θ</MI> = 10k
        </>
      }
      viewBox={K.viewBox}
      ariaLabel="Rotary encoder for RoPE. Four dials are the dimension pairs; the knob sets the distance Delta between query and key. Use the arrow keys (shift for steps of ten), Home and End, or drag the knob."
      hint={<>drag the knob · ← → ±1 · shift ±10 · home / end</>}
      readout={
        <>
          <span className="o-slot">
            <M>Δ</M> {String(delta).padStart(3, ' ')}
          </span>
          <span className="o-sep"> · </span>
          <span className="o-slot">
            <M>Σ</M> cos {signed2(score)}
          </span>
        </>
      }
      extra={
        <div className="o-traces">
          {FREQ.map((f, i) => (
            <div key={i} className={`o-trace-row${hover === i ? ' is-hover' : ''}`} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <span className="o-trace-label">
                p{i} · <MI>f</MI> {fmtF(f)}
              </span>
              <Trace f={f} delta={delta} hot={hover === null || hover === i} />
              <span className="o-trace-val">{signed2(cos[i]!)}</span>
            </div>
          ))}
          <div className="o-trace-axislabel">
            <span>
              cos(<M>Δ</M>·<MI>f</MI>)
            </span>
            <span>
              <M>Δ</M> = 0 → 256
            </span>
          </div>
        </div>
      }
      svgProps={{ tabIndex: 0, onKeyDown: onKey, role: 'group', 'aria-roledescription': 'interactive figure' } as React.SVGProps<SVGSVGElement>}
      caption={
        <>
          each dial is one dimension pair. the notch is <MI>q</MI> and the pointer is <MI>k</MI>, turned by <M>Δ</M>·<MI>f</MI>, where <MI>f</MI> = <MI>θ</MI>
          <sup>−2i/d</sup> (1, 0.1, 0.01, 0.001 for <MI>d</MI> = 8). for a query and key with the same content, the score is proportional to <M>Σ</M> cos(<M>Δ</M>·<MI>f</MI>): 4 at <M>Δ</M> = 0, and it depends only on the distance, not on where the two tokens sit. the traces show how the pairs split the work: p0 turns into noise after a few tokens, so it only tells nearby positions apart; p3 is still close to 1 at <M>Δ</M> = 256.
        </>
      }
    >
      <ObjectDefs id={id} viewBox={K.viewBox} />

      {box(0, 0, 0, 470, 280, 8, 14)}
      <g transform={TOP(0, 0, 8)}>
        <rect className="o-detail" x={9} y={9} width={452} height={262} rx={10} />
      </g>

      {box(CH.x, CH.y, CH.z, CH.w, CH.d, CH.h, 8)}
      <g transform={TOP(CH.x, CH.y, DECK)}>
        <rect className="o-detail" x={8} y={8} width={CH.w - 16} height={CH.d - 16} rx={6} />
        <line className="o-detail" x1={304} y1={20} x2={304} y2={CH.d - 20} />
      </g>

      {/* front: lit display + one cos meter per pair */}
      <g transform={FRONT(CH.x, FRONT_Y, DECK)}>
        <rect className="o-face o-recess" x={14} y={9} width={176} height={38} rx={5} />
        <rect className="o-halo is-hot" filter={bloom} x={18} y={13} width={168} height={30} rx={4} />
        <rect className="o-glass is-hot" filter={soft} x={18} y={13} width={168} height={30} rx={4} />
        <g filter={soft}>
          <text className="o-scr" x={26} y={33} fontSize={14}>
            <TM>Δ</TM> {String(delta).padStart(3, '0')}
          </text>
          <text className="o-scr" x={100} y={33} fontSize={10}>
            <TM>Σ</TM> cos {signed2(score)}
          </text>
        </g>
        {cos.map((c, i) => {
          const n = Math.round(((c + 1) / 2) * SEG);
          const dim = hover !== null && hover !== i;
          return (
            <g key={i} transform={`translate(${212 + i * 28} 0)`} style={{ opacity: dim ? 0.35 : 1 }}>
              {Array.from({ length: SEG }, (_, j) => (
                <rect key={j} className={`o-led${SEG - j <= n ? ' is-hot' : ''}`} x={0} y={8 + j * 4.4} width={16} height={3.2} rx={0.8} />
              ))}
              <text className="o-label" x={8} y={51.5} textAnchor="middle" fontSize={6}>
                p{i}
              </text>
            </g>
          );
        })}
      </g>
      <g transform={SIDE(CH.x + CH.w, FRONT_Y, DECK)}>
        {Array.from({ length: 22 }, (_, j) => (
          <line key={j} className="o-detail" x1={40 + j * 5} y1={14} x2={40 + j * 5} y2={42} />
        ))}
      </g>

      {dials}

      {/* Δ knob with its printed scale */}
      <g transform={TOP(CH.x, CH.y, DECK)}>
        {[0, 1, 4, 16, 64, 256].map((d) => {
          const a = knobAngle(d);
          const r0 = KNOB.r + 6;
          return (
            <g key={d}>
              <line className="o-detail" x1={r2(KNOB.u + r0 * Math.cos(a))} y1={r2(KNOB.v + r0 * Math.sin(a))} x2={r2(KNOB.u + (r0 + 5) * Math.cos(a))} y2={r2(KNOB.v + (r0 + 5) * Math.sin(a))} />
              <text className="o-label" x={r2(KNOB.u + (r0 + 13) * Math.cos(a))} y={r2(KNOB.v + (r0 + 13) * Math.sin(a) + 3)} textAnchor="middle" fontSize={7}>
                {d}
              </text>
            </g>
          );
        })}
        {delta > 0 && <path className="o-wedge" filter={soft} d={arc(KNOB.u, KNOB.v, KNOB.r + 3.5, knobAngle(0), ka)} />}
        <text className="o-label o-label-hi" x={KNOB.u} y={KNOB.v + KNOB.r + 19} textAnchor="middle" fontSize={7}>
          <TM>Δ</TM> tokens
        </text>
      </g>
      <g className="o-knob" onPointerDown={onKnobDown} onPointerMove={onKnobMove} onPointerUp={onKnobUp} onPointerCancel={onKnobUp}>
        <g transform={grabbing ? 'translate(0 2)' : undefined} className="o-sink">
          {cyl(CH.x + KNOB.u, CH.y + KNOB.v, DECK, KNOB.r, 16)}
          <g transform={TOP(CH.x + KNOB.u, CH.y + KNOB.v, DECK + 16)}>
            {Array.from({ length: 28 }, (_, j) => {
              const a = (j / 28) * Math.PI * 2 + ka;
              return <line key={j} className="o-detail" x1={r2((KNOB.r - 4) * Math.cos(a))} y1={r2((KNOB.r - 4) * Math.sin(a))} x2={r2((KNOB.r - 0.5) * Math.cos(a))} y2={r2((KNOB.r - 0.5) * Math.sin(a))} />;
            })}
            <circle className="o-detail" r={KNOB.r - 7} />
            <line className="o-accent-line" filter={glow} x1={0} y1={0} x2={r2((KNOB.r - 9) * Math.cos(ka))} y2={r2((KNOB.r - 9) * Math.sin(ka))} />
          </g>
        </g>
      </g>
    </IsoObject>
  );
}
