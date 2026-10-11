// Isometric primitive kit. One projection, one stroke, one light direction
// (top-left): top face lightest, +y face (screen-left) mid, +x face darkest.
// World units: x runs screen down-right, y runs screen down-left, z is up.

import type { SVGProps } from 'react';

export type P3 = readonly [number, number, number];

export const UNIT = 14;
const COS30 = Math.cos(Math.PI / 6);

export function iso([x, y, z]: P3): [number, number] {
  return [(x - y) * COS30 * UNIT, ((x + y) * 0.5 - z) * UNIT];
}

export function pts(ps: readonly P3[]): string {
  return ps.map((p) => iso(p).map((n) => n.toFixed(2)).join(',')).join(' ');
}

export function pathD(ps: readonly P3[]): string {
  return ps.map((p, i) => `${i ? 'L' : 'M'}${iso(p).map((n) => n.toFixed(2)).join(' ')}`).join('');
}

/** viewBox string covering the given points plus padding (in px). */
export function viewBoxFor(ps: readonly P3[], pad = 8): string {
  const xy = ps.map(iso);
  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  return `${minX.toFixed(1)} ${minY.toFixed(1)} ${(Math.max(...xs) - minX + pad).toFixed(1)} ${(Math.max(...ys) - minY + pad).toFixed(1)}`;
}

type BoxProps = { at: P3; size: P3 } & Omit<SVGProps<SVGGElement>, 'ref'>;

export function IsoBox({ at: [x, y, z], size: [w, d, h], className, ...rest }: BoxProps) {
  const x1 = x + w;
  const y1 = y + d;
  const z1 = z + h;
  return (
    <g className={`iso ${className ?? ''}`} {...rest}>
      <polygon className="iso-left" points={pts([[x, y1, z], [x1, y1, z], [x1, y1, z1], [x, y1, z1]])} />
      <polygon className="iso-right" points={pts([[x1, y, z], [x1, y1, z], [x1, y1, z1], [x1, y, z1]])} />
      <polygon className="iso-top" points={pts([[x, y, z1], [x1, y, z1], [x1, y1, z1], [x, y1, z1]])} />
    </g>
  );
}

/** Box outline only (visible silhouette + inner edges), for highlight overlays. */
export function boxOutline([x, y, z]: P3, [w, d, h]: P3): string {
  const x1 = x + w;
  const y1 = y + d;
  const z1 = z + h;
  return (
    pathD([[x, y, z1], [x1, y, z1], [x1, y, z], [x1, y1, z], [x, y1, z], [x, y1, z1], [x, y, z1]]) +
    pathD([[x, y1, z1], [x1, y1, z1], [x1, y, z1]]) +
    pathD([[x1, y1, z1], [x1, y1, z]])
  );
}

/** Rectangle lying in the plane y = const (a face pointing screen-left). */
export function rectY(y: number, x0: number, x1: number, z0: number, z1: number): string {
  return pts([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]);
}

/** Rectangle lying in the plane z = const (a floor/top surface). */
export function rectZ(z: number, x0: number, x1: number, y0: number, y1: number): string {
  return pts([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);
}

/** Rectangle lying in the plane x = const (a face pointing screen-right). */
export function rectX(x: number, y0: number, y1: number, z0: number, z1: number): string {
  return pts([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]);
}
