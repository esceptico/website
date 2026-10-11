'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { linear, niceTicks, px, tickFormat } from './scale';
import './charts.css';

// Line chart drawn like a technical figure: a framed plate, hairline axes
// with outward ticks, a dotted grid, square markers. Hover or touch snaps a
// crosshair to the nearest point and reads its value out in the plate head.
// An optional `mark` draws one labelled vertical line (e.g. the layer the
// post uses).
//
//   <LineChart title="probe accuracy by layer" y={[...]} xLabel="layer" yLabel="accuracy" />

type Props = {
  title: string;
  /** right side of the plate head when nothing is hovered (e.g. the model) */
  meta?: string;
  y: number[];
  x?: number[];
  xLabel: string;
  yLabel: string;
  yDomain?: [number, number];
  yTicks?: number[];
  xTicks?: number[];
  mark?: { x: number; label: string };
  height?: number;
  digits?: number;
};

const M = { l: 46, r: 16, t: 24, b: 40 };

export function LineChart({ title, meta, y, x = y.map((_, i) => i), xLabel, yLabel, yDomain, yTicks, xTicks, mark, height = 260, digits = 3 }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [y0, y1] = yDomain ?? [Math.min(...y), Math.max(...y)];
  const x0 = Math.min(...x);
  const x1 = Math.max(...x);
  const iw = Math.max(10, w - M.l - M.r);
  const ih = height - M.t - M.b;
  const sx = linear(x0, x1, M.l, M.l + iw);
  const sy = linear(y0, y1, M.t + ih, M.t);
  const yt = yTicks ?? niceTicks(y0, y1, 5);
  const xt = xTicks ?? niceTicks(x0, x1, 6);
  const fy = tickFormat(yt);
  const d = x.map((xv, i) => `${i ? 'L' : 'M'}${px(sx(xv))} ${px(sy(y[i]!))}`).join('');

  const snap = (e: React.PointerEvent<SVGSVGElement>) => {
    const left = e.currentTarget.getBoundingClientRect().left;
    const at = e.clientX - left;
    let best = 0;
    x.forEach((xv, i) => {
      if (Math.abs(sx(xv) - at) < Math.abs(sx(x[best]!) - at)) best = i;
    });
    setHover(best);
  };

  return (
    <figure className="figure-plate ch-plate">
      <div className="plate-head">
        <span>fig · {title}</span>
        <span className="ch-readout" aria-live="polite">
          {hover !== null ? `${xLabel} ${x[hover]} · ${y[hover]!.toFixed(digits)}` : (meta ?? '')}
        </span>
      </div>
      <div ref={box} className="ch-box">
        <svg width={w} height={height} className="ch-svg" onPointerMove={snap} onPointerDown={snap} onPointerLeave={() => setHover(null)} role="img" aria-label={`${title}: ${yLabel} by ${xLabel}`}>
          {yt.map((t) => (
            <g key={t}>
              <line className="ch-grid" x1={M.l} x2={M.l + iw} y1={px(sy(t))} y2={px(sy(t))} />
              <line className="ch-axis" x1={M.l - 5} x2={M.l} y1={px(sy(t))} y2={px(sy(t))} />
              <text className="ch-tick" x={M.l - 9} y={px(sy(t)) + 3.5} textAnchor="end">
                {fy(t)}
              </text>
            </g>
          ))}
          {xt.map((t) => (
            <g key={t}>
              <line className="ch-axis" x1={px(sx(t))} x2={px(sx(t))} y1={M.t + ih} y2={M.t + ih + 5} />
              <text className="ch-tick" x={px(sx(t))} y={M.t + ih + 17} textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          <line className="ch-axis" x1={M.l} x2={M.l} y1={M.t - 6} y2={M.t + ih} />
          <line className="ch-axis" x1={M.l} x2={M.l + iw + 6} y1={M.t + ih} y2={M.t + ih} />
          <text className="ch-label" x={M.l + iw} y={height - 6} textAnchor="end">
            {xLabel} →
          </text>
          <text className="ch-label" x={8} y={M.t - 10}>
            ↑ {yLabel}
          </text>

          {mark && (
            <g className="ch-mark">
              <line x1={px(sx(mark.x))} x2={px(sx(mark.x))} y1={M.t} y2={M.t + ih} />
              <text x={px(sx(mark.x)) + 6} y={M.t + ih - 8}>
                {mark.label}
              </text>
            </g>
          )}

          <path className="ch-line" d={d} />
          {x.map((xv, i) => (
            <rect key={i} className={`ch-pt${hover === i ? ' is-on' : ''}${mark?.x === xv ? ' is-mark' : ''}`} x={px(sx(xv)) - 2.5} y={px(sy(y[i]!)) - 2.5} width={5} height={5} />
          ))}

          {hover !== null && (
            <g className="ch-cross" aria-hidden="true">
              <line x1={px(sx(x[hover]!))} x2={px(sx(x[hover]!))} y1={M.t} y2={M.t + ih} />
              <line x1={M.l} x2={M.l + iw} y1={px(sy(y[hover]!))} y2={px(sy(y[hover]!))} />
            </g>
          )}
        </svg>
      </div>
      {/* the numbers, for screen readers */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>{xLabel}</th>
            <th>{yLabel}</th>
          </tr>
        </thead>
        <tbody>
          {x.map((xv, i) => (
            <tr key={i}>
              <td>{xv}</td>
              <td>{y[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
