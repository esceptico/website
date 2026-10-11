// Kernel for hand-built isometric objects.
//
// Approach adapted from iso-glow / iso-figure (MIT, April Zhu / Tolga Cohce):
// draw ordinary 2D shapes on a face through a plane matrix (TOP / FRONT /
// SIDE), boxes as one continuous side wall under a rounded top, detail from
// hairline texture rather than shading. Re-implemented here for React.
//
// World units are px-ish. +x runs down-right, +y down-left, +z up.

import type { ReactNode } from 'react';

export type V3 = readonly [number, number, number];
type V2 = [number, number];

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);

/** Projection without offset. */
export const D = (x: number, y: number, z: number): V2 => [(x - y) * C, (x + y) * S - z];

const f = (n: number) => +n.toFixed(2);

function hull(points: V2[]): V2[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const build = (list: V2[]) => {
    const h: V2[] = [];
    for (const q of list) {
      while (h.length >= 2 && cross(h[h.length - 2]!, h[h.length - 1]!, q) <= 0) h.pop();
      h.push(q);
    }
    return h;
  };
  return [...build(p).slice(0, -1), ...build([...p].reverse()).slice(0, -1)];
}

function roundedRing(x: number, y: number, w: number, d: number, r: number, seg = 6): V2[] {
  const rr = Math.max(0, Math.min(r, w / 2, d / 2));
  const out: V2[] = [];
  const corners: [number, number, number][] = [
    [x + w - rr, y + rr, -Math.PI / 2],
    [x + w - rr, y + d - rr, 0],
    [x + rr, y + d - rr, Math.PI / 2],
    [x + rr, y + rr, Math.PI],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
  }
  return out;
}

export type Kernel = ReturnType<typeof frame>;

/** Frame a figure around its extreme corners; returns the viewBox and face helpers. */
export function frame(extremes: V3[], pad = 18) {
  const pts = extremes.map((p) => D(...p));
  const minX = Math.min(...pts.map((p) => p[0])) - pad;
  const minY = Math.min(...pts.map((p) => p[1])) - pad;
  const maxX = Math.max(...pts.map((p) => p[0])) + pad;
  const maxY = Math.max(...pts.map((p) => p[1])) + pad;
  const P = (x: number, y: number, z: number): V2 => D(x, y, z);

  const plane = (o: V3, u: V3, v: V3) => {
    const [ox, oy] = P(...o);
    const [ux, uy] = D(...u);
    const [vx, vy] = D(...v);
    return `matrix(${f(ux)} ${f(uy)} ${f(vx)} ${f(vy)} ${f(ox)} ${f(oy)})`;
  };
  /** Top face at height z; local (u, v) = (x, y). */
  const TOP = (x: number, y: number, z: number) => plane([x, y, z], [1, 0, 0], [0, 1, 0]);
  /** Front face (y = const, faces lower-left); local u = +x, v = down. Origin = the face's top-left. */
  const FRONT = (x: number, y: number, z: number) => plane([x, y, z], [1, 0, 0], [0, 0, -1]);
  /** Side face (x = const, faces lower-right); local u = −y, v = down. */
  const SIDE = (x: number, y: number, z: number) => plane([x, y, z], [0, -1, 0], [0, 0, -1]);

  const poly = (ps: V2[]) => ps.map(([a, b]) => `${f(a)},${f(b)}`).join(' ');

  /** Rounded box: one continuous side wall + a rounded top. */
  const box = (x: number, y: number, z: number, w: number, d: number, h: number, r = 0, key?: string, cls = '') => {
    const ring = roundedRing(x, y, w, d, r);
    const wall = hull([...ring.map(([u, v]) => P(u, v, z)), ...ring.map(([u, v]) => P(u, v, z + h))]);
    const top = ring.map(([u, v]) => P(u, v, z + h));
    return (
      <g key={key} className={cls || undefined}>
        <polygon className="o-face" points={poly(wall)} />
        <polygon className="o-face o-top" points={poly(top)} />
      </g>
    );
  };

  /** Upright cylinder (knobs, wells): wall hull + elliptical top. */
  const cyl = (cx: number, cy: number, z: number, r: number, h: number, key?: string, topCls = 'o-face o-top') => {
    const ring: V2[] = Array.from({ length: 40 }, (_, i) => {
      const a = (i / 40) * Math.PI * 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
    const wall = hull([...ring.map(([u, v]) => P(u, v, z)), ...ring.map(([u, v]) => P(u, v, z + h))]);
    return (
      <g key={key}>
        <polygon className="o-face" points={poly(wall)} />
        <g transform={TOP(cx, cy, z + h)}>
          <circle className={topCls} r={r} />
        </g>
      </g>
    );
  };

  return { viewBox: `${f(minX)} ${f(minY)} ${f(maxX - minX)} ${f(maxY - minY)}`, P, D, plane, TOP, FRONT, SIDE, box, cyl, poly };
}

/** Parallel hairlines in face-local units (vents, ribs, grip). */
export function slits(a0: number, a1: number, step: number, b0: number, b1: number, vertical = true, cls = 'o-detail'): ReactNode {
  const out: ReactNode[] = [];
  for (let a = a0; a <= a1 + 1e-6; a += step) {
    out.push(
      vertical ? <line key={a} className={cls} x1={f(a)} y1={b0} x2={f(a)} y2={b1} /> : <line key={a} className={cls} x1={b0} y1={f(a)} x2={b1} y2={f(a)} />,
    );
  }
  return out;
}

/** A screw head in face-local units: recess circle with a slot. */
export function screw(x: number, y: number, key?: string, r = 3): ReactNode {
  return (
    <g key={key}>
      <circle className="o-face o-recess" cx={x} cy={y} r={r} />
      <line className="o-detail" x1={x - r * 0.6} y1={y} x2={x + r * 0.6} y2={y} />
    </g>
  );
}

/**
 * Glow filters, in user space over the figure's own viewBox plus a margin:
 * straight lines are never cropped (their bounding box can be zero-size), and
 * the offscreen buffer stays the size of the drawing rather than thousands of
 * px per filtered element. glow: accent lines; soft: a faint halo on lit
 * parts; bloom: blur only, for light behind glass.
 */
export function ObjectDefs({ id, viewBox }: { id: string; viewBox: string }) {
  const [x, y, w, h] = viewBox.split(' ').map(Number) as [number, number, number, number];
  const m = 24;
  const region = { filterUnits: 'userSpaceOnUse' as const, x: x - m, y: y - m, width: w + 2 * m, height: h + 2 * m };
  return (
    <defs>
      <filter id={`${id}-glow`} {...region}>
        <feGaussianBlur stdDeviation="2.6" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={`${id}-soft`} {...region}>
        <feGaussianBlur stdDeviation="1.6" result="b" />
        <feComponentTransfer in="b" result="f">
          <feFuncA type="linear" slope="0.6" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="f" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={`${id}-bloom`} {...region}>
        <feGaussianBlur stdDeviation="8" />
      </filter>
    </defs>
  );
}
