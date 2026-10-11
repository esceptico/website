import { iso, pathD, rectX, rectY, rectZ, type P3 } from '../iso';
import type { BoxPrim, PathPrim, RectPrim } from './prims';

// Renderer for engine primitives.
//
// Boxes are rounded in plan (corner radius in world units) and shaded per
// side segment by its normal, lit from the top-left: +y faces (screen-left)
// are lit, +x faces (screen-right) are in shade, corners blend between them.
// Each box casts a soft contact shadow on whatever it stands on.

type V2 = [number, number];

function roundedOutline(x: number, y: number, w: number, d: number, r: number, seg = 5): V2[] {
  const rr = Math.max(0, Math.min(r, w / 2, d / 2));
  const out: V2[] = [];
  const corners: [number, number, number][] = [
    [x + w - rr, y + rr, -Math.PI / 2],
    [x + w - rr, y + d - rr, 0],
    [x + rr, y + d - rr, Math.PI / 2],
    [x + rr, y + rr, Math.PI],
  ];
  for (const [cx, cy, a0] of corners) {
    if (rr === 0) {
      out.push([cx, cy]);
      continue;
    }
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
  }
  return out;
}

const pt = (p: P3) => iso(p).map((n) => n.toFixed(2)).join(',');
const poly = (ps: P3[]) => ps.map(pt).join(' ');

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
  const lower = build(p);
  const upper = build([...p].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** Lit (+y) → shade (+x) blend for a side whose outward normal is n. */
function sideFill(nx: number, ny: number): string {
  const a = Math.atan2(ny, nx); // 0 = +x (shade), π/2 = +y (lit)
  const lit = Math.round(Math.min(1, Math.max(0, a / (Math.PI / 2))) * 100);
  return `color-mix(in oklab, var(--iso-lit) ${lit}%, var(--iso-shade))`;
}

export function SoftBox({ p }: { p: BoxPrim }) {
  const [x, y, z] = p.at;
  const [w, d, h] = p.size;
  const r = p.radius ?? Math.min(0.18, w * 0.2, d * 0.2);
  const ring = roundedOutline(x, y, w, d, r);
  const cx = x + w / 2;
  const cy = y + d / 2;

  const sides: { pts: string; fill: string }[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!;
    const b = ring[(i + 1) % ring.length]!;
    let nx = b[1] - a[1];
    let ny = -(b[0] - a[0]);
    const mx = (a[0] + b[0]) / 2 - cx;
    const my = (a[1] + b[1]) / 2 - cy;
    if (nx * mx + ny * my < 0) {
      nx = -nx;
      ny = -ny;
    }
    if (nx + ny <= 1e-6) continue; // faces away from the viewer
    sides.push({
      pts: poly([[a[0], a[1], z], [b[0], b[1], z], [b[0], b[1], z + h], [a[0], a[1], z + h]]),
      fill: sideFill(nx, ny),
    });
  }

  const top = poly(ring.map(([u, v]) => [u, v, z + h] as P3));
  const silhouette = hull([...ring.map(([u, v]) => iso([u, v, z])), ...ring.map(([u, v]) => iso([u, v, z + h]))]);
  const silPts = silhouette.map(([a, b]) => `${a.toFixed(2)},${b.toFixed(2)}`).join(' ');
  const shadow = poly(roundedOutline(x + 0.22, y + 0.22, w, d, r).map(([u, v]) => [u, v, z] as P3));
  const glow = p.glow ?? p.highlight;
  // light pooled on the surface under an emissive box, spilling past its footprint
  const pool = glow ? poly(roundedOutline(x - 0.7, y - 0.7, w + 1.4, d + 1.4, r + 0.7).map(([u, v]) => [u, v, z] as P3)) : null;

  const m = p.inset ?? 0;
  const inner = m > 0 ? poly(roundedOutline(x + m, y + m, w - 2 * m, d - 2 * m, Math.max(0.05, r * 0.6)).map(([u, v]) => [u, v, z + h] as P3)) : null;
  const screws =
    p.screws && m > 0
      ? ([
          [x + m / 2, y + m / 2],
          [x + w - m / 2, y + m / 2],
          [x + w - m / 2, y + d - m / 2],
          [x + m / 2, y + d - m / 2],
        ] as V2[]).map(([u, v]) => iso([u, v, z + h]))
      : [];

  return (
    <g className={`eb${p.highlight ? ' eb-hi' : ''}`} style={p.opacity === undefined ? undefined : { opacity: p.opacity }}>
      {pool && <polygon className="eb-pool" points={pool} filter="url(#iso-f-pool)" />}
      {p.shadow !== false && <polygon className="eb-shadow" points={shadow} filter="url(#iso-f-shadow)" />}
      {glow && <polygon className="eb-bloom" points={silPts} filter="url(#iso-f-bloom)" />}
      {sides.map((s, i) => (
        <polygon key={i} points={s.pts} style={{ fill: s.fill, stroke: s.fill }} className="eb-side" />
      ))}
      <polygon className="eb-top" points={top} />
      {inner && <polygon className="eb-inset" points={inner} />}
      {screws.map(([cx2, cy2], i) => (
        <circle key={i} className="eb-screw" cx={cx2} cy={cy2} r={1.5} />
      ))}
      <polygon className="eb-edge" points={silPts} />
    </g>
  );
}

const RECT_CLASS: Record<RectPrim['variant'], string> = {
  dashed: 'er-dashed',
  detail: 'er-detail',
  ink: 'er-ink',
  'fill-strong': 'er-strong',
  'accent-fill': 'er-accent',
};

export function RectShape({ p }: { p: RectPrim }) {
  const [u0, u1] = p.u;
  const [v0, v1] = p.v;
  const points =
    p.plane === 'z' ? rectZ(p.at, u0, u1, v0, v1) : p.plane === 'x' ? rectX(p.at, u0, u1, v0, v1) : rectY(p.at, u0, u1, v0, v1);
  return <polygon className={RECT_CLASS[p.variant]} points={points} style={p.opacity === undefined ? undefined : { opacity: p.opacity }} />;
}

const PATH_CLASS: Record<PathPrim['variant'], string> = {
  accent: 'ep-accent',
  'accent-soft': 'ep-accent ep-soft',
  dashed: 'ep-dashed',
  ink: 'ep-ink',
};

export function PathShape({ p }: { p: PathPrim }) {
  const d = pathD(p.points);
  const glow = p.glow ?? p.variant === 'accent';
  const style = p.opacity === undefined ? undefined : { opacity: p.opacity };
  const dash = p.progress === undefined ? undefined : `${p.progress} 1`;
  return (
    <>
      {glow && <path className="ep-bloom" filter="url(#iso-f-line)" d={d} pathLength={dash ? 1 : undefined} strokeDasharray={dash} style={style} />}
      <path
      className={PATH_CLASS[p.variant]}
      d={d}
      pathLength={dash ? 1 : undefined}
      strokeDasharray={dash}
      style={style}
    />
    </>
  );
}

/** Faint floor grid under the scene's footprint, fading out at the edges. */
export function FloorGrid({ bounds, id }: { bounds: { x0: number; x1: number; y0: number; y1: number }; id: string }) {
  const step = 1;
  const pad = 3;
  const x0 = Math.floor(bounds.x0 - pad);
  const x1 = Math.ceil(bounds.x1 + pad);
  const y0 = Math.floor(bounds.y0 - pad);
  const y1 = Math.ceil(bounds.y1 + pad);
  const lines: string[] = [];
  for (let x = x0; x <= x1; x += step) lines.push(pathD([[x, y0, 0], [x, y1, 0]]));
  for (let y = y0; y <= y1; y += step) lines.push(pathD([[x0, y, 0], [x1, y, 0]]));
  const [cx, cy] = iso([(x0 + x1) / 2, (y0 + y1) / 2, 0]);
  const [ax] = iso([x1, y0, 0]);
  const [bx] = iso([x0, y1, 0]);
  const rx = (ax - bx) / 2;
  return (
    <>
      <defs>
        <radialGradient id={`${id}-fade`} cx={cx} cy={cy} r={rx * 0.62} gradientUnits="userSpaceOnUse">
          <stop offset="0.55" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={cx - rx * 2} y={cy - rx * 2} width={rx * 4} height={rx * 4}>
          <rect x={cx - rx * 2} y={cy - rx * 2} width={rx * 4} height={rx * 4} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <path className="e-grid" d={lines.join('')} mask={`url(#${id}-mask)`} />
    </>
  );
}

/**
 * Blur filters. (CSS `filter: blur()` on SVG shapes is
 * cropped to the shape's bounding box, which cut glows into hard rectangles.)
 * Identical in every svg, so duplicate ids across figures are harmless.
 */
export function GlowDefs() {
  // Regions are as tight as the blur allows: every filtered shape gets an
  // offscreen buffer of this size, so oversized regions cost real paint time.
  // Lines use the svg's own viewport plus a margin instead (a vertical or flat
  // line has a zero-size bounding box, which would crop the glow to nothing).
  const shape = { x: '-40%', y: '-40%', width: '180%', height: '180%' };
  const line = { x: '-10%', y: '-10%', width: '120%', height: '120%' };
  return (
    <defs>
      <filter id="iso-f-bloom" {...shape}>
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter id="iso-f-pool" {...shape}>
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <filter id="iso-f-line" filterUnits="userSpaceOnUse" {...line}>
        <feGaussianBlur stdDeviation="3.5" />
      </filter>
      <filter id="iso-f-shadow" {...shape}>
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
    </defs>
  );
}
