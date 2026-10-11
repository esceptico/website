'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { IsoObject } from './object/IsoObject';
import { ObjectDefs, frame } from './object/kernel';
import { M, MI, TMI } from './object/math';
import { FIG, r2, usePress } from './object/parts';
import { useClicks } from './object/sound';

// Fig · SAPO vs PPO on one bench.
//
// The same 13 tokens sit at fixed importance ratios r along a ruler, in two
// lanes. Each token's column is its gradient weight w.r.t. r (advantage
// sign chosen by the lever):
//   PPO  (back lane)   d/dr min(r·Â, clip(r, 1±ε)·Â)/Â → 1 inside the trust
//                      region, 0 past the clipped edge (dead, no gradient)
//   SAPO (front lane)  d/dr σ(τ(r−1))·4/τ = 4σ(1−σ) → 1 at r = 1, decaying
//                      smoothly, never zero
// SAPO uses its own temperature per advantage sign (τ_pos for Â > 0, τ_neg
// for Â < 0, τ_neg > τ_pos so negative tokens fade faster); the lever picks
// the sign and so which τ applies. Defaults are the paper's 1.0 / 1.05.
// Tokens that still get gradient glow; dead ones go dark.

const RATIOS = [0.55, 0.64, 0.72, 0.8, 0.87, 0.94, 1, 1.06, 1.13, 1.2, 1.28, 1.37, 1.46];
const R0 = 0.5;
const R1 = 1.5;
const TAU = { min: 0.5, max: 60, pos: 1, neg: 1.05 };
const EPS = { min: 0.05, max: 0.4, init: 0.2 };

// Bench (world units)
//   plate         0   0   0   560 300   8
//   ruler        40 210   8   420  26   6
//   lanes        40  40 / 125   420  70  6   (ppo at the back, sapo in front)
//   panel       480  50   8    60 180  22   (τ, ε knobs; Â lever)
const X0 = 50;
const X1 = 450;
const rx = (r: number) => X0 + ((r - R0) / (R1 - R0)) * (X1 - X0);
const LANES = [
  { id: 'ppo', y: 40, label: 'ppo · clip' },
  { id: 'sapo', y: 125, label: 'sapo · soft gate' },
] as const;
const LANE_D = 70;
const LANE_Z = 14;
const H = 92;
const RULER = { y: 212, d: 26 };
// Knobs are short (KH) and spaced so a knob never covers the printed label of
// the knob behind it: in this projection a part of height h hides the deck up
// to 2h behind it.
const PANEL = { x: 482, y: 24, w: 58, d: 262, h: 22 };
const KNOBS = { tauPos: { v: 26 }, tauNeg: { v: 92 }, eps: { v: 158 } };
const KR = 13;
const KH = 6;
const LEVER = { v: 232 };
type KnobKey = keyof typeof KNOBS;

const K = frame([
  [0, 300, 0],
  [560, 0, 8],
  [560, 300, 0],
  [X0, LANES[0].y, LANE_Z + H + 30],
  [X1, LANES[0].y, LANE_Z + H + 30],
  [PANEL.x, PANEL.y, 60],
]);

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const ppoW = (r: number, eps: number, adv: number) => (adv > 0 ? (r <= 1 + eps ? 1 : 0) : r >= 1 - eps ? 1 : 0);
const sapoW = (r: number, tau: number) => {
  const s = sigmoid(tau * (r - 1));
  return 4 * s * (1 - s);
};
const logT = (v: number, lo: number, hi: number) => (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo));
const fromLogT = (t: number, lo: number, hi: number) => Math.exp(Math.log(lo) + Math.min(1, Math.max(0, t)) * (Math.log(hi) - Math.log(lo)));
const linT = (v: number, lo: number, hi: number) => (v - lo) / (hi - lo);
const fromLinT = (t: number, lo: number, hi: number) => lo + Math.min(1, Math.max(0, t)) * (hi - lo);
const knobAngle = (t: number) => ((-225 + t * 270) * Math.PI) / 180;
/** τ detents: 0.05 steps below 10, whole numbers above. */
const snapTau = (v: number) => {
  const c = Math.min(TAU.max, Math.max(TAU.min, v));
  return c < 10 ? Math.round(c * 20) / 20 : Math.round(c);
};
const fmtTau = (v: number) => (v < 10 ? v.toFixed(2) : String(v).padStart(4, FIG));

export function SapoBench() {
  const sound = useClicks();
  const [tauPos, setTauPos] = useState(TAU.pos);
  const [tauNeg, setTauNeg] = useState(TAU.neg);
  const [eps, setEps] = useState(EPS.init);
  const [adv, setAdv] = useState(1);
  const [hover, setHover] = useState<number | null>(null);
  const vals = useRef({ tauPos, tauNeg, eps, adv });
  const press = usePress(sound.arm);

  // detented setters (a click per step); the ref is updated in the setter so
  // fast key repeats compound
  const setTauD = useCallback(
    (which: 'tauPos' | 'tauNeg', v: number) => {
      const next = snapTau(v);
      if (next === vals.current[which]) return;
      sound.detent();
      vals.current[which] = next;
      (which === 'tauPos' ? setTauPos : setTauNeg)(next);
    },
    [sound],
  );
  const setEpsD = useCallback(
    (v: number) => {
      const next = Math.round(Math.min(EPS.max, Math.max(EPS.min, v)) * 100) / 100;
      if (next === vals.current.eps) return;
      sound.detent();
      vals.current.eps = next;
      setEps(next);
    },
    [sound],
  );
  const flip = useCallback(() => {
    sound.arm();
    sound.thunk();
    vals.current.adv = -vals.current.adv;
    setAdv(vals.current.adv);
  }, [sound]);

  // knob drag: right/up turns clockwise
  const drag = useRef<{ key: KnobKey; x: number; y: number; t: number } | null>(null);
  const onKnobDown = (key: KnobKey) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    sound.arm();
    press.setPressed(key);
    const t = key === 'eps' ? linT(vals.current.eps, EPS.min, EPS.max) : logT(vals.current[key], TAU.min, TAU.max);
    drag.current = { key, x: e.clientX, y: e.clientY, t };
  };
  const onKnobMove = (e: React.PointerEvent) => {
    const g = drag.current;
    if (!g) return;
    const t = g.t + (e.clientX - g.x - (e.clientY - g.y)) / 220;
    if (g.key === 'eps') setEpsD(fromLinT(t, EPS.min, EPS.max));
    else setTauD(g.key, fromLogT(t, TAU.min, TAU.max));
  };
  const onKnobUp = () => {
    drag.current = null;
    press.setPressed(null);
  };

  const onKey = (e: React.KeyboardEvent) => {
    sound.arm();
    const v = vals.current;
    const which = v.adv > 0 ? 'tauPos' : 'tauNeg';
    // 24 presses cover the log range; always move at least one detent
    const stepTau = (dir: 1 | -1) => {
      let t = logT(v[which], TAU.min, TAU.max) + dir / 24;
      for (let k = 0; k < 40 && snapTau(fromLogT(t, TAU.min, TAU.max)) === v[which]; k++) t += dir / 160;
      setTauD(which, fromLogT(t, TAU.min, TAU.max));
    };
    if (e.key === 'ArrowRight') stepTau(1);
    else if (e.key === 'ArrowLeft') stepTau(-1);
    else if (e.key === 'ArrowUp') setEpsD(v.eps + 0.01);
    else if (e.key === 'ArrowDown') setEpsD(v.eps - 0.01);
    else if (e.key === 'a' || e.key === 'A') flip();
    else return;
    e.preventDefault();
  };

  // ---- derived ----
  const ppo = RATIOS.map((r) => ppoW(r, eps, adv));
  const tau = adv > 0 ? tauPos : tauNeg;
  const sapo = RATIOS.map((r) => sapoW(r, tau));
  const dead = ppo.filter((w) => w === 0).length;
  const lowest = Math.min(...sapo);
  const edge = adv > 0 ? 1 + eps : 1 - eps;

  const { TOP, SIDE, box, cyl } = K;
  const id = 'sapo';
  const glow = `url(#${id}-glow)`;
  const soft = `url(#${id}-soft)`;

  const curve = (w: (r: number) => number, laneY: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 160; i++) {
      const r = R0 + ((R1 - R0) * i) / 160;
      const [x, y] = K.P(rx(r), laneY + LANE_D / 2, LANE_Z + H * w(r));
      pts.push(`${i ? 'L' : 'M'}${r2(x)} ${r2(y)}`);
    }
    return pts.join('');
  };

  const column = (lane: 'ppo' | 'sapo', i: number, w: number) => {
    const laneY = LANES[lane === 'ppo' ? 0 : 1].y;
    const x = rx(RATIOS[i]!) - 7;
    const y = laneY + LANE_D / 2 - 7;
    const live = w > 0.02;
    const h = Math.max(1.2, H * w);
    return (
      <g
        key={`${lane}${i}`}
        className={`o-col${live ? ' is-live' : ' is-dead'}${hover === i ? ' is-hover' : ''}`}
        style={live ? { ['--w' as string]: String(w) } : undefined}
        onPointerEnter={() => setHover(i)}
        onPointerLeave={() => setHover(null)}
      >
        {box(x, y, LANE_Z, 14, 14, h, 2)}
        {live && (
          <g transform={TOP(x, y, LANE_Z + h)}>
            <rect className="o-col-cap" filter={soft} x={1.5} y={1.5} width={11} height={11} rx={1.5} style={{ opacity: 0.25 + 0.75 * w }} />
          </g>
        )}
      </g>
    );
  };

  const knob = (key: KnobKey, t: number, label: ReactNode, value: string, active = true) => {
    const cx = PANEL.x + PANEL.w / 2;
    const cy = PANEL.y + KNOBS[key].v;
    const a = knobAngle(t);
    const z = PANEL.h + 8;
    return (
      <g key={key} style={{ opacity: active ? 1 : 0.45 }}>
        <g transform={TOP(PANEL.x, PANEL.y, z)}>
          {Array.from({ length: 13 }, (_, j) => {
            const aj = knobAngle(j / 12);
            return (
              <line
                key={j}
                className="o-detail"
                x1={r2(PANEL.w / 2 + (KR + 3) * Math.cos(aj))}
                y1={r2(KNOBS[key].v + (KR + 3) * Math.sin(aj))}
                x2={r2(PANEL.w / 2 + (KR + 6) * Math.cos(aj))}
                y2={r2(KNOBS[key].v + (KR + 6) * Math.sin(aj))}
              />
            );
          })}
          <text className={active ? 'o-label o-label-hi' : 'o-label'} x={PANEL.w / 2} y={KNOBS[key].v + KR + 18} textAnchor="middle" fontSize={7.5}>
            {label} {value}
          </text>
        </g>
        <g className="o-knob" onPointerDown={onKnobDown(key)} onPointerMove={onKnobMove} onPointerUp={onKnobUp} onPointerCancel={onKnobUp}>
          <g transform={press.sink(key)} className="o-sink">
            {cyl(cx, cy, z, KR, KH)}
            <g transform={TOP(cx, cy, z + KH)}>
              {Array.from({ length: 20 }, (_, j) => {
                const aj = (j / 20) * Math.PI * 2 + a;
                return <line key={j} className="o-detail" x1={r2((KR - 3) * Math.cos(aj))} y1={r2((KR - 3) * Math.sin(aj))} x2={r2((KR - 0.4) * Math.cos(aj))} y2={r2((KR - 0.4) * Math.sin(aj))} />;
              })}
              <line className={active ? 'o-accent-line' : 'o-ink-hi'} filter={active ? glow : undefined} x1={0} y1={0} x2={r2((KR - 4) * Math.cos(a))} y2={r2((KR - 4) * Math.sin(a))} />
            </g>
          </g>
        </g>
      </g>
    );
  };

  const hovered = hover !== null ? { r: RATIOS[hover]!, p: ppo[hover]!, s: sapo[hover]! } : null;

  return (
    <div>
      <IsoObject
        fig="fig · sapo vs ppo"
        title={
          <>
            gradient weight per token · <MI>Â</MI> {adv > 0 ? '> 0' : '< 0'}
          </>
        }
        viewBox={K.viewBox}
        ariaLabel="Isometric bench comparing PPO clipping and SAPO soft gating. Thirteen tokens sit at fixed importance ratios; each column's height is the token's gradient weight. Drag the tau and epsilon knobs or use the arrow keys, and flip the advantage lever with A."
        hint={
          hovered ? (
            <>
              token at <MI>r</MI> = {hovered.r.toFixed(2)} · ppo weight {hovered.p.toFixed(0)} · sapo weight {hovered.s.toFixed(2)}
            </>
          ) : (
            <>
              drag knobs · ← → <M>τ</M> · ↑ ↓ <M>ε</M> · a flips <M>Â</M>
            </>
          )
        }
        readout={
          <>
            <span className="o-slot">ppo {String(dead).padStart(2, FIG)}/13 zero-grad</span>
            <span className="o-sep">·</span>
            <span className="o-slot">sapo lowest {lowest.toFixed(2)}</span>
          </>
        }
        svgProps={
          {
            tabIndex: 0,
            onKeyDown: onKey,
            onPointerUp: () => press.setPressed(null),
            role: 'group',
            'aria-roledescription': 'interactive figure',
          } as React.SVGProps<SVGSVGElement>
        }
        caption={
          <>
            the same 13 tokens in both lanes, placed by their importance ratio <MI>r</MI> = π<sub>θ</sub>/π<sub>old</sub>; column height is the gradient weight, lit while the token
            still learns. ppo is all-or-nothing: past the clipped edge (1+<MI>ε</MI> for <MI>Â</MI> &gt; 0, 1−<MI>ε</MI> for <MI>Â</MI> &lt; 0) a token gets zero gradient.
            sapo&apos;s gate 4σ(<MI>τ</MI>(<MI>r</MI>−1))(1−σ) is 1 on-policy and fades smoothly instead of falling off a cliff; larger <MI>τ</MI> fades faster. it uses <MI>τ</MI>
            <sub>pos</sub> for <MI>Â</MI> &gt; 0 and a larger <MI>τ</MI>
            <sub>neg</sub> for <MI>Â</MI> &lt; 0, so the lever also switches knobs. the knobs start at the paper&apos;s 1.0 and 1.05, where the gate is gentle across this range;
            turn <MI>τ</MI> up to watch it narrow.
          </>
        }
      >
        <ObjectDefs id={id} viewBox={K.viewBox} />

        {/* plate */}
        {box(0, 0, 0, 560, 300, 8, 14)}
        <g transform={TOP(0, 0, 8)}>
          <rect className="o-detail" x={9} y={9} width={542} height={282} rx={10} />
        </g>

        {/* lanes: ppo (back), then sapo (front) */}
        {LANES.map((lane, li) => {
          const w = li === 0 ? ppo : sapo;
          return (
            <g key={lane.id}>
              {box(X0 - 20, lane.y, 8, X1 - X0 + 40, LANE_D, LANE_Z - 8, 6)}
              <g transform={TOP(X0 - 20, lane.y, LANE_Z)}>
                <rect className="o-face o-recess" x={4} y={4} width={X1 - X0 + 32} height={LANE_D - 8} rx={4} />
                <line className="o-detail" x1={rx(1) - X0 + 20} y1={6} x2={rx(1) - X0 + 20} y2={LANE_D - 6} />
                <text className="o-label o-label-hi" x={10} y={LANE_D - 8} fontSize={8}>
                  {lane.label}
                </text>
              </g>
              {/* ppo's clipped edge, a gate across the back lane */}
              {li === 0 && (
                <g transform={SIDE(rx(edge), lane.y + LANE_D - 4, LANE_Z + H + 14)}>
                  <rect className="o-gate" x={0} y={0} width={LANE_D - 8} height={H + 14} />
                </g>
              )}
              {RATIOS.map((_, i) => column(lane.id, i, w[i]!))}
              <path
                className={li === 0 ? 'o-curve' : 'o-curve is-hot'}
                filter={li === 1 ? soft : undefined}
                d={curve(li === 0 ? (r) => ppoW(r, eps, adv) : (r) => sapoW(r, tau), lane.y)}
              />
            </g>
          );
        })}
        {/* label on the gate */}
        {(() => {
          const [x, y] = K.P(rx(edge), LANES[0].y + 4, LANE_Z + H + 20);
          return (
            <text className="o-label o-label-hi" x={r2(x)} y={r2(y)} textAnchor="middle" fontSize={8}>
              1{adv > 0 ? '+' : '−'}
              <TMI>ε</TMI> clip
            </text>
          );
        })()}

        {/* ruler: the importance ratio */}
        {box(X0 - 20, RULER.y, 8, X1 - X0 + 40, RULER.d, 6, 4)}
        <g transform={TOP(X0 - 20, RULER.y, 14)}>
          {Array.from({ length: 11 }, (_, j) => {
            const r = R0 + j * 0.1;
            const x = rx(r) - X0 + 20;
            const major = j % 5 === 0;
            return (
              <g key={j}>
                <line className={major ? 'o-ink-hi o-thin' : 'o-detail'} x1={r2(x)} y1={2} x2={r2(x)} y2={major ? 10 : 7} />
                {major && (
                  <text className="o-label o-label-hi" x={r2(x)} y={21} textAnchor="middle" fontSize={8}>
                    {r.toFixed(1)}
                  </text>
                )}
              </g>
            );
          })}
          <rect className="o-led is-hot" filter={soft} x={rx(1) - X0 + 20 - 1} y={1} width={2} height={11} />
          <text className="o-label" x={r2(rx(1.25) - X0 + 20)} y={20} textAnchor="middle" fontSize={8}>
            <TMI>r</TMI> = π
            <tspan fontSize={6} dy={2}>
              θ
            </tspan>
            <tspan dy={-2}>/π</tspan>
            <tspan fontSize={6} dy={2}>
              old
            </tspan>
          </text>
          {/* the clip edge, on the ruler */}
          <path className="o-accent-fill" filter={soft} d={`M${r2(rx(edge) - X0 + 20)} 1 l-3 -5 h6 Z`} />
        </g>

        {/* control panel */}
        {box(PANEL.x, PANEL.y, 8, PANEL.w, PANEL.d, PANEL.h, 6)}
        <g transform={TOP(PANEL.x, PANEL.y, PANEL.h + 8)}>
          <rect className="o-detail" x={5} y={5} width={PANEL.w - 10} height={PANEL.d - 10} rx={4} />
        </g>
        {knob(
          'tauPos',
          logT(tauPos, TAU.min, TAU.max),
          <>
            <TMI>τ</TMI>
            <tspan fontSize={5.5}>pos</tspan>
          </>,
          fmtTau(tauPos),
          adv > 0,
        )}
        {knob(
          'tauNeg',
          logT(tauNeg, TAU.min, TAU.max),
          <>
            <TMI>τ</TMI>
            <tspan fontSize={5.5}>neg</tspan>
          </>,
          fmtTau(tauNeg),
          adv < 0,
        )}
        {knob('eps', linT(eps, EPS.min, EPS.max), <TMI>ε</TMI>, eps.toFixed(2))}

        {/* advantage lever */}
        <g transform={TOP(PANEL.x, PANEL.y, PANEL.h + 8)}>
          <rect className="o-face o-recess" x={PANEL.w / 2 - 4} y={LEVER.v - 14} width={8} height={28} rx={4} />
          <text className="o-label" x={PANEL.w / 2 + 9} y={LEVER.v - 8} fontSize={7}>
            +
          </text>
          <text className="o-label" x={PANEL.w / 2 + 9} y={LEVER.v + 12} fontSize={7}>
            −
          </text>
          <text className="o-label o-label-hi" x={PANEL.w / 2} y={LEVER.v + 26} textAnchor="middle" fontSize={8}>
            <TMI>Â</TMI>
          </text>
        </g>
        <g className="o-press" {...press.bind('lever', flip)}>
          <g transform={press.sink('lever')} className="o-sink">
            {cyl(PANEL.x + PANEL.w / 2, PANEL.y + LEVER.v + (adv > 0 ? -8 : 8), PANEL.h + 8, 4, 10)}
            <g transform={TOP(PANEL.x + PANEL.w / 2, PANEL.y + LEVER.v + (adv > 0 ? -8 : 8), PANEL.h + 18)}>
              <circle className="o-accent-fill" filter={glow} r={3} />
            </g>
          </g>
        </g>
      </IsoObject>
    </div>
  );
}
