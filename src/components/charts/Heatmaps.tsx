'use client';

import { useState } from 'react';
import './charts.css';

// One or more heatmaps on a single plate with shared axes. One hue (the
// accent) whose strength is the value; exact zeros are hatched, so "nothing
// left" reads differently from "a little". Hover or keyboard focus on a cell
// lights its row and column labels and reads the value out in the plate head.
//
//   <Heatmaps title="semantic preservation" x={[...]} y={[...]} maps={[{ label, z }]} />

type Map = { label: string; z: number[][] };
type Props = {
  title: string;
  maps: Map[];
  x: (string | number)[];
  y: (string | number)[];
  xLabel: string;
  yLabel: string;
  /** what a cell's value means; shown in the plate head when idle */
  valueLabel: string;
  /** values are fractions shown as percentages (default) */
  percent?: boolean;
};

export function Heatmaps({ title, maps, x, y, xLabel, yLabel, valueLabel, percent = true }: Props) {
  const [hover, setHover] = useState<{ m: number; r: number; c: number } | null>(null);


  const fmt = (v: number) => (percent ? `${Math.round(v * 100)}` : String(v));
  const unit = percent ? '%' : '';
  const h = hover ? maps[hover.m]!.z[hover.r]![hover.c]! : null;

  return (
    <figure className="figure-plate ch-plate">
      <div className="plate-head">
        <span>fig · {title}</span>
        <span className="ch-readout" aria-live="polite">
          {hover && h !== null ? `${maps[hover.m]!.label} · ${yLabel} ${y[hover.r]} · ${xLabel} ${x[hover.c]} → ${fmt(h)}${unit}` : valueLabel}
        </span>
      </div>

      <div className="ch-heat-maps">
        {maps.map((m, mi) => (
          <div key={m.label} onPointerLeave={() => setHover(null)}>
            <div className="ch-heat-title">{m.label}</div>
            <div className="ch-heat-grid" style={{ gridTemplateColumns: `2.2rem repeat(${x.length}, minmax(0, 1fr))` }} role="grid" aria-label={`${title}, ${m.label}`}>
              {m.z.map((row, ri) => (
                <div key={ri} role="row" style={{ display: 'contents' }}>
                  <span role="rowheader" className={`ch-heat-y${hover?.m === mi && hover.r === ri ? ' is-on' : ''}`}>
                    {y[ri]}
                  </span>
                  {row.map((v, ci) => (
                    <button
                      key={ci}
                      type="button"
                      role="gridcell"
                      className={`ch-cell${v === 0 ? ' is-zero' : ''}${v > 0.55 ? ' is-strong' : ''}${hover?.m === mi && hover.r === ri && hover.c === ci ? ' is-on' : ''}`}
                      style={{ ['--v' as string]: String(v) }}
                      onPointerEnter={() => setHover({ m: mi, r: ri, c: ci })}
                      onFocus={() => setHover({ m: mi, r: ri, c: ci })}
                      onBlur={() => setHover(null)}
                      aria-label={`${yLabel} ${y[ri]}, ${xLabel} ${x[ci]}: ${fmt(v)}${unit}`}
                    >
                      {fmt(v)}
                    </button>
                  ))}
                </div>
              ))}
              <span aria-hidden="true" />
              {x.map((t, ci) => (
                <span key={String(t)} aria-hidden="true" className={`ch-heat-x${hover?.m === mi && hover.c === ci ? ' is-on' : ''}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="ch-foot">
        <span>
          ↓ {yLabel} · {xLabel} →
        </span>
        <span className="ch-legend" aria-hidden="true">
          <i className="ch-swatch is-zero" /> 0{unit}
          <i className="ch-swatch" style={{ ['--v' as string]: '0.33' }} />
          <i className="ch-swatch" style={{ ['--v' as string]: '0.67' }} />
          <i className="ch-swatch" style={{ ['--v' as string]: '1' }} /> {percent ? '100%' : 'max'}
        </span>
      </div>
    </figure>
  );
}
