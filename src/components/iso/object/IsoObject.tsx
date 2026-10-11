'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './polish.css';

// Shell for hand-built isometric objects: the site's full-width plate, a
// figure label, the drawing, and a footer with the hint and a live readout
// (fixed-width slots, so nothing jumps while values change).
//
// Full view: the same plate opens full-screen above the page (portalled to
// <body>, so it sits over the header). A placeholder keeps the article's
// layout where it was. Esc or the button closes it.

type Props = {
  fig: ReactNode;
  title: ReactNode;
  viewBox: string;
  ariaLabel: string;
  hint: ReactNode;
  readout: ReactNode;
  lit?: boolean;
  auto?: { running: boolean; toggle: () => void };
  caption?: ReactNode;
  /** Content between the drawing and the footer (e.g. a printout strip). */
  extra?: ReactNode;
  svgProps?: React.SVGProps<SVGSVGElement>;
  children: ReactNode;
};

function ExpandIcon({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
      {open ? (
        <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function IsoObject({ fig, title, viewBox, ariaLabel, hint, readout, lit = true, auto, caption, extra, svgProps, children }: Props) {
  const [full, setFull] = useState(false);
  const [placeholder, setPlaceholder] = useState(0);
  const plateRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!full && plateRef.current) setPlaceholder(plateRef.current.offsetHeight);
  }, [full]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [full]);

  const plate = (
    <div ref={full ? undefined : plateRef} className={`iso-plate iso-obj-plate${full ? ' is-full' : ''}`} role={full ? 'dialog' : undefined} aria-modal={full || undefined} aria-label={full ? ariaLabel : undefined}>
      <div className="iso-obj-head">
        <span className="iso-obj-fig">{fig}</span>
        <span className="iso-obj-title">{title}</span>
        <button type="button" className="iso-obj-expand" onClick={() => setFull((f) => !f)} aria-label={full ? 'Exit full view' : 'Full view'} title={full ? 'exit full view · esc' : 'full view'}>
          <ExpandIcon open={full} />
        </button>
      </div>
      <div className={`iso-obj-stage${lit ? ' is-lit' : ''}`}>
        <svg viewBox={viewBox} className="iso-obj-svg" role="img" aria-label={ariaLabel} {...svgProps}>
          {children}
        </svg>
      </div>
      {extra}
      <div className="iso-obj-foot">
        <span className="iso-obj-hint">{hint}</span>
        <span className="iso-obj-readout">
          {auto && (
            <button type="button" className="iso-obj-auto" aria-pressed={auto.running} onClick={auto.toggle}>
              {auto.running ? 'auto' : 'manual'}
            </button>
          )}
          {readout}
        </span>
      </div>
    </div>
  );

  return (
    <figure className="iso-object my-10">
      {full ? (
        <>
          <div style={{ height: placeholder }} aria-hidden="true" />
          {createPortal(
            <div className="iso-object iso-obj-backdrop" onClick={(e) => e.target === e.currentTarget && setFull(false)}>
              {plate}
            </div>,
            document.body,
          )}
        </>
      ) : (
        plate
      )}
      {caption && <figcaption className="mt-3 font-mono text-[11px] leading-relaxed text-[var(--theme-text-muted)]">{caption}</figcaption>}
    </figure>
  );
}
