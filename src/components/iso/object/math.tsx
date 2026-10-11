import type { ReactNode } from 'react';

// Math glyphs set in the KaTeX fonts the site already loads, so Δ, Σ, θ and
// variables match the formulas in the posts instead of the mono UI font.
// M = upright (operators, Greek capitals), MI = italic (variables).

export const M = ({ children }: { children: ReactNode }) => <span className="o-math">{children}</span>;
export const MI = ({ children }: { children: ReactNode }) => <span className="o-math o-math-i">{children}</span>;
/** SVG versions (inside <text>). */
export const TM = ({ children }: { children: ReactNode }) => <tspan className="o-math">{children}</tspan>;
export const TMI = ({ children }: { children: ReactNode }) => <tspan className="o-math o-math-i">{children}</tspan>;
