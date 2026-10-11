import type { P3 } from '../iso';

// Scene primitives. A scene is `(t) => Prim[]`; the renderer sorts by
// layer, then by depth (x + y + z of the primitive's centre), so authors
// never think about draw order.

// floor: ground marks · surface: flat details on top of floor objects ·
// object: anything with height (depth-sorted) · overlay/label: always on top
export type Layer = 'floor' | 'surface' | 'object' | 'overlay' | 'label';

type Base = { key: string; layer?: Layer; opacity?: number };

/** Solid box (three lit faces). `highlight` adds the accent outline. */
export type BoxPrim = Base & {
  type: 'box';
  at: P3;
  size: P3;
  highlight?: boolean;
  /** Plan corner radius (world units). Defaults to a small soft round. */
  radius?: number;
  /** Contact shadow on whatever the box stands on. Default true. */
  shadow?: boolean;
  /** Emissive: bloom + accent light pooled on the surface below. Defaults to `highlight`. */
  glow?: boolean;
  /** Inner panel on the top face, inset by this many world units. */
  inset?: number;
  /** Small screws in the top face's corners (pairs with `inset`). */
  screws?: boolean;
};

/**
 * Axis-aligned rectangle in a plane:
 *   plane 'z' at z: u = [x0, x1], v = [y0, y1]   (floor / tops)
 *   plane 'x' at x: u = [y0, y1], v = [z0, z1]   (walls facing screen-right)
 *   plane 'y' at y: u = [x0, x1], v = [z0, z1]   (walls facing screen-left)
 */
export type RectPrim = Base & {
  type: 'rect';
  plane: 'x' | 'y' | 'z';
  at: number;
  u: readonly [number, number];
  v: readonly [number, number];
  variant: 'dashed' | 'detail' | 'ink' | 'fill-strong' | 'accent-fill';
};

/** Polyline; `progress` (0..1) draws only the first part of it. */
export type PathPrim = Base & {
  type: 'path';
  points: P3[];
  variant: 'dashed' | 'ink' | 'accent' | 'accent-soft';
  progress?: number;
  /** Accent paths glow by default; set false to turn it off. */
  glow?: boolean;
};

/**
 * Text. `at` places it in the scene (unprojected, so it stays readable);
 * `gutter: true` pins it to the left label column at the height of `at`.
 */
export type LabelPrim = Base & {
  type: 'label';
  at: P3;
  lines: { text: string; strong?: boolean }[];
  anchor?: 'start' | 'middle' | 'end';
  gutter?: boolean;
  /** Nudge in CSS px after projection (labels are HTML, fixed 11px). */
  offset?: readonly [number, number];
};

export type Prim = BoxPrim | RectPrim | PathPrim | LabelPrim;

export const box = (key: string, at: P3, size: P3, o: Partial<BoxPrim> = {}): BoxPrim => ({ type: 'box', key, at, size, layer: 'object', ...o });

export const rect = (
  key: string,
  plane: RectPrim['plane'],
  at: number,
  u: RectPrim['u'],
  v: RectPrim['v'],
  variant: RectPrim['variant'],
  o: Partial<RectPrim> = {},
): RectPrim => ({ type: 'rect', key, plane, at, u, v, variant, layer: plane === 'z' && variant === 'dashed' ? 'floor' : 'object', ...o });

export const path = (key: string, points: P3[], variant: PathPrim['variant'], o: Partial<PathPrim> = {}): PathPrim => ({
  type: 'path',
  key,
  points,
  variant,
  layer: 'floor',
  ...o,
});

export const label = (key: string, at: P3, lines: LabelPrim['lines'], o: Partial<LabelPrim> = {}): LabelPrim => ({
  type: 'label',
  key,
  at,
  lines,
  layer: 'label',
  ...o,
});

/** Points of a circle (or arc from a0 to a1) lying in the plane z = c[2]. */
export function arcZ(c: P3, r: number, a0 = 0, a1 = Math.PI * 2, n = 48): P3[] {
  const steps = Math.max(2, Math.ceil((n * Math.abs(a1 - a0)) / (Math.PI * 2)));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / steps;
    return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), c[2]] as P3;
  });
}

/** An arrow in the plane z = c[2] from `c` at angle `a`, as two paths (shaft + head). */
export function arrowZ(key: string, c: P3, len: number, a: number, variant: PathPrim['variant'], o: Partial<PathPrim> = {}): PathPrim[] {
  const tip: P3 = [c[0] + len * Math.cos(a), c[1] + len * Math.sin(a), c[2]];
  const h = len * 0.18;
  const wing = (s: number): P3 => [tip[0] - h * Math.cos(a + s), tip[1] - h * Math.sin(a + s), c[2]];
  return [
    path(`${key}-shaft`, [c, tip], variant, o),
    path(`${key}-head`, [wing(0.45), tip, wing(-0.45)], variant, o),
  ];
}
