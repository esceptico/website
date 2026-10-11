'use client';

import { useEffect, useRef, useState } from 'react';

// Table of contents: a numbered rail on the left.
//
// Sections sit at an even pitch (not at their position in the document, which
// left big gaps and crammed the last sections together). The rail between two
// ticks is that section; it fills in accent as you read through it, so the
// highlighted section and the progress always agree. Idle, only the ticks and
// the current section's title show; hover or keyboard focus reveals every
// title, plus the subsections of the current one.

type Heading = { id: string; title: string; children: { id: string; title: string }[] };

const OFFSET = 100; // same offset headings scroll to (scroll-margin-top)

export function BlogTOC({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [open, setOpen] = useState(false);
  // hover intent: don't open for a pointer just passing over, don't close
  // while it crosses the gap between two items
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openSoon = (next: boolean, ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), ms);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const [pos, setPos] = useState({ index: -1, frac: 0, child: null as string | null });
  const tops = useRef<{ h1: number[]; h2: { id: string; top: number }[] }>({ h1: [], h2: [] });
  // While a click is smooth-scrolling to its target, hold the highlight on the
  // target instead of running it through every section on the way.
  const lock = useRef(false);

  // Sit beside the text: centred on the viewport by the closed height, so
  // opening the subsections only extends it downwards.
  const nav = useRef<HTMLElement>(null);
  const [top, setTop] = useState(96);
  useEffect(() => {
    const place = () => {
      const list = nav.current?.querySelector<HTMLElement>('.toc-list');
      if (!list || nav.current?.classList.contains('is-open')) return;
      setTop(Math.max(96, Math.round((window.innerHeight - list.offsetHeight) / 2)));
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [headings, pos.index]);

  // gather headings, and re-measure as figures, math and images settle
  useEffect(() => {
    const gather = () => {
      const main = document.querySelector('main');
      if (!main) return;
      const list: Heading[] = [];
      const h1: number[] = [];
      const h2: { id: string; top: number }[] = [];
      main.querySelectorAll<HTMLElement>('h1[id], h2[id]').forEach((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const title = el.textContent?.trim() ?? '';
        if (el.tagName === 'H1') {
          list.push({ id: el.id, title, children: [] });
          h1.push(top);
        } else if (list.length) {
          list[list.length - 1]!.children.push({ id: el.id, title });
          h2.push({ id: el.id, top });
        }
      });
      tops.current = { h1, h2 };
      setHeadings(list);
    };
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(gather);
    };
    gather();
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [content]);

  // where the reader is: current section, how far through it, current subsection
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (lock.current) return;
      const y = window.scrollY + OFFSET + 1;
      const { h1, h2 } = tops.current;
      let index = -1;
      for (let i = 0; i < h1.length; i++) if (y >= h1[i]!) index = i;
      const end = index + 1 < h1.length ? h1[index + 1]! : document.documentElement.scrollHeight - window.innerHeight + OFFSET;
      const frac = index < 0 ? 0 : Math.min(1, Math.max(0, (y - h1[index]!) / Math.max(1, end - h1[index]!)));
      let child: string | null = null;
      for (const c of h2) if (y >= c.top && index >= 0 && c.top >= h1[index]!) child = c.id;
      setPos((p) => (p.index === index && p.child === child && Math.abs(p.frac - frac) < 0.002 ? p : { index, frac, child }));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // the click-scroll has landed: release the hold and read the real position
    const onScrollEnd = () => {
      if (!lock.current) return;
      lock.current = false;
      update();
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', onScrollEnd);
    window.addEventListener('resize', onScroll);
    // the reader takes over mid-scroll (wheel, touch, keys): release at once
    const takeOver = () => (lock.current = false);
    window.addEventListener('wheel', takeOver, { passive: true });
    window.addEventListener('touchstart', takeOver, { passive: true });
    window.addEventListener('keydown', takeOver);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', onScrollEnd);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', takeOver);
      window.removeEventListener('touchstart', takeOver);
      window.removeEventListener('keydown', takeOver);
    };
  }, [headings]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const index = headings.findIndex((h) => h.id === id || h.children.some((c) => c.id === id));
    const child = headings[index]?.id === id ? null : id;
    lock.current = true;
    setPos({ index, frac: 0, child });
    // fallback for browsers without scrollend
    setTimeout(() => {
      if (lock.current) {
        lock.current = false;
        window.dispatchEvent(new Event('scroll'));
      }
    }, 1200);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - OFFSET, behavior: 'smooth' });
    window.history.pushState(null, '', `#${id}`);
  };

  if (headings.length === 0) return null;

  return (
    <>
    <MobileTOC headings={headings} index={pos.index} frac={pos.frac} go={go} />
    <nav
      ref={nav}
      style={{ top }}
      aria-label="Table of contents"
      className={`toc hidden lg:block ${open ? 'is-open' : ''}`}
      onMouseEnter={() => openSoon(true, 90)}
      onMouseLeave={() => openSoon(false, 180)}
      onFocus={() => openSoon(true, 0)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) openSoon(false, 0);
      }}
    >
      <ol className="toc-list">
        {headings.map((h, i) => {
          const state = i < pos.index ? 'is-done' : i === pos.index ? 'is-current' : '';
          const fill = i < pos.index ? 1 : i === pos.index ? pos.frac : 0;
          return (
            <li key={h.id} className={`toc-item ${state}`}>
              <span className="toc-seg" aria-hidden="true">
                <span style={{ transform: `scaleY(${fill})` }} />
              </span>
              <button type="button" className="toc-link" onClick={() => go(h.id)} aria-current={i === pos.index ? 'location' : undefined} title={h.title}>
                <span className="toc-tick" aria-hidden="true" />
                <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="toc-title">{h.title}</span>
              </button>
              {h.children.length > 0 && i === pos.index && (
                <div className="toc-sub">
                  <ol className="toc-sub-inner">
                    {h.children.map((c) => (
                      <li key={c.id}>
                        <button type="button" className={`toc-sublink${pos.child === c.id ? ' is-current' : ''}`} onClick={() => go(c.id)} title={c.title} tabIndex={open ? 0 : -1}>
                          {c.title}
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
    </>
  );
}

// Below lg there's no room for the rail: a pill at the bottom shows the
// current section and reading progress; tapping it opens the numbered list
// as a sheet. Hidden until the first section starts.
function MobileTOC({ headings, index, frac, go }: { headings: Heading[]; index: number; frac: number; go: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    sheet.current?.querySelector<HTMLElement>('[aria-current]')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const current = headings[index];
  const progress = index < 0 ? 0 : (index + frac) / headings.length;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className={`toc-pill${current ? ' is-on' : ''}`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={current ? `Contents. Current section: ${current.title}` : 'Contents'}
        tabIndex={current ? 0 : -1}
      >
        <span className="toc-pill-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="toc-pill-title">{current?.title}</span>
        <span className="toc-pill-count">/{String(headings.length).padStart(2, '0')}</span>
        <span className="toc-pill-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
      </button>

      <div className={`toc-sheet-wrap${open ? ' is-open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)} aria-hidden={!open}>
        <div ref={sheet} className="toc-sheet" role="dialog" aria-modal="true" aria-label="Contents">
          <div className="toc-sheet-head">
            <span>contents</span>
            <button type="button" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              close
            </button>
          </div>
          <ol>
            {headings.map((h, i) => (
              <li key={h.id}>
                <button
                  type="button"
                  className={i === index ? 'is-current' : i < index ? 'is-done' : undefined}
                  aria-current={i === index ? 'location' : undefined}
                  tabIndex={open ? 0 : -1}
                  onClick={() => {
                    setOpen(false);
                    go(h.id);
                  }}
                >
                  <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
                  <span>{h.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
