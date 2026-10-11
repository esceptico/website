'use client';

import { IsoDemo } from './engine/IsoDemo';
import { arcZ, arrowZ, box, path, type Prim } from './engine/prims';
import { ease, lerp } from './engine/timeline';
import type { P3 } from './iso';

// Post covers: one living scene per post, drawn by the same engine as the
// figures. Each is the post's mechanism reduced to a few objects, with one
// emissive (glowing) accent. Covers are stills (a frame of the scene at
// `still`): they introduce the post, they shouldn't compete with reading it.

const TAU = Math.PI * 2;
/** 0 → 1 → 0 over the loop, eased (for breathing motions). */
const breathe = (t: number, period: number) => 0.5 - 0.5 * Math.cos((TAU * t) / period);

const plate = (key: string, at: P3, w: number, d: number, h = 0.32) =>
  box(key, at, [w, d, h], { layer: 'floor', radius: 0.45, inset: 0.35, screws: true });

type Cover = { alt: string; duration: number; still: number; scene: (t: number) => Prim[] };

const COVERS: Record<string, Cover> = {
  // Four dimension pairs turning at their own frequencies (fast → slow).
  rope: {
    alt: 'Four dials turning at different speeds',
    duration: 24,
    still: 3,
    scene: (t) => {
      const out: Prim[] = [];
      const speeds = [1.1, 0.42, 0.16, 0.06];
      speeds.forEach((w, i) => {
        const y0 = i * 4.6;
        const c: P3 = [2, y0 + 2, 0.33];
        out.push(plate(`p${i}`, [0, y0, 0], 4, 4));
        out.push(path(`d${i}`, arcZ(c, 1.35), 'dashed', { layer: 'surface' }));
        out.push(...arrowZ(`a${i}`, c, 1.35, 0.3 + t * w, i === 0 ? 'accent' : 'ink', { layer: 'surface' }));
      });
      return out;
    },
  },

  // The soft gate breathing as τ changes; the on-policy token glows.
  sapo: {
    alt: 'Bars shaped like a soft gate that widens and narrows',
    duration: 8,
    still: 2,
    scene: (t) => {
      const tau = lerp(9, 34, breathe(t, 8));
      const out: Prim[] = [plate('p', [0, 0, 0], 13.4, 3.4)];
      for (let i = 0; i < 13; i++) {
        const r = 0.55 + (i * 0.9) / 12;
        const s = 1 / (1 + Math.exp(-tau * (r - 1)));
        const w = 4 * s * (1 - s);
        out.push(box(`b${i}`, [0.7 + i * 0.95, 1.4, 0.32], [0.6, 0.6, Math.max(0.06, 2.6 * w)], { highlight: i === 6 }));
      }
      return out;
    },
  },

  // The margin between chosen and rejected opening and closing.
  dpo: {
    alt: 'A glowing pillar rising while a faded one sinks',
    duration: 7,
    still: 3.5,
    scene: (t) => {
      const k = ease.inOut(breathe(t, 7));
      return [
        plate('p', [0, 0, 0], 7.6, 4.2),
        box('chosen', [1.2, 1.4, 0.32], [1.4, 1.4, lerp(2.2, 3.6, k)], { highlight: true, inset: 0.25 }),
        box('rejected', [4.9, 1.4, 0.32], [1.4, 1.4, lerp(1.6, 0.6, k)], { opacity: 0.55 }),
      ];
    },
  },

  // An activation gliding along v from the novice cluster to the expert one.
  steering: {
    alt: 'A glowing cube gliding from one cluster to another along an arrow',
    duration: 7,
    still: 3.5,
    scene: (t) => {
      const out: Prim[] = [plate('p', [0, 0, 0], 13, 7)];
      const jitter: [number, number][] = [[0, 0], [-0.9, 0.6], [0.8, -0.6], [-0.3, -1.1], [1, 0.8], [-1, -0.5]];
      jitter.forEach(([dx, dy], i) => {
        out.push(box(`n${i}`, [3 + dx - 0.25, 3.5 + dy - 0.25, 0.32], [0.5, 0.5, 0.5], { opacity: 0.5 }));
        out.push(box(`e${i}`, [10 - dx - 0.25, 3.5 - dy - 0.25, 0.32], [0.5, 0.5, 0.5]));
      });
      out.push(...arrowZ('v', [3, 3.5, 0.33], 7, 0, 'accent', { layer: 'surface', glow: false }));
      const x = lerp(3, 10, ease.inOut(breathe(t, 7)));
      out.push(box('a', [x - 0.35, 5.6, 0.32], [0.7, 0.7, 0.7], { highlight: true }));
      return out;
    },
  },

  // A loose piece lifting off and settling onto the ordered stack.
  ntrp: {
    alt: 'Scattered cubes and a stack; one cube lifts and settles on top',
    duration: 6,
    still: 5.5,
    scene: (t) => {
      const out: Prim[] = [plate('p', [0, 0, 0], 12, 6)];
      const loose: [number, number, number][] = [[1, 1, 0.8], [2.6, 3.6, 0.6], [1.3, 4.4, 0.7]];
      loose.forEach(([x, y, s], i) => out.push(box(`l${i}`, [x, y, 0.32], [s, s, s], { opacity: 0.55 })));
      for (let i = 0; i < 3; i++) out.push(box(`s${i}`, [7, 1.5, 0.32 + i * 0.75], [3, 3, 0.5], { shadow: i === 0 }));
      // the moving piece: rises from the floor, arcs over, lands as the top slab
      const p = ease.inOut(Math.min(1, t / 4.2));
      const from: P3 = [3.4, 1.4, 0.32];
      const to: P3 = [7, 1.5, 0.32 + 3 * 0.75];
      const size = lerp(0.6, 3, p);
      const at: P3 = [lerp(from[0], to[0], p), lerp(from[1], to[1], p), lerp(from[2], to[2], p) + Math.sin(Math.PI * p) * 2.2];
      out.push(box('top', at, [size, size, lerp(0.6, 0.5, p)], { highlight: true, inset: p > 0.9 ? 0.3 : 0 }));
      return out;
    },
  },
};

export const hasCover = (slug: string) => slug in COVERS;

export function PostCover({ slug, height = 240, thumb = false }: { slug: string; height?: number; thumb?: boolean }) {
  const cover = COVERS[slug];
  if (!cover) return null;
  return (
    <IsoDemo
      scene={cover.scene}
      duration={cover.duration}
      secondsPerUnit={1}
      still={cover.still}
      variant="bare"
      labels={false}
      grid={!thumb}
      maxHeight={height}
      maxScale={thumb ? 4 : 2.2}
      ariaLabel={cover.alt}
    />
  );
}
