'use client';

import { useEffect, useState, useRef, useMemo } from 'react';

interface HeadingData {
  id: string;
  title: string;
  level: number;
  percent: number;
  children: HeadingData[];
}

export function BlogTOC({ content }: { content: string }) {
  const [headings, setHeadings] = useState<HeadingData[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredH1, setHoveredH1] = useState<string | null>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const docHeightRef = useRef(1);

  // Determine which H1 is currently active based on scroll position
  const activeH1Id = useMemo(() => {
    if (headings.length === 0) return null;
    
    // Find the last heading that we've scrolled past
    let active: string | null = null;
    for (const h of headings) {
      if (scrollPercent >= h.percent) {
        active = h.id;
      } else {
        break;
      }
    }
    return active;
  }, [headings, scrollPercent]);

  // Gather headings
  useEffect(() => {
    const gather = () => {
      const main = document.querySelector('main');
      if (!main) return;

      docHeightRef.current = document.documentElement.scrollHeight;
      const docHeight = docHeightRef.current;

      const allHeadings = main.querySelectorAll('h1[id], h2[id]');
      const h1s: HeadingData[] = [];
      let currentH1: HeadingData | null = null;

      allHeadings.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        const scrollWhenAtHeading = absoluteTop - 100;
        const level = el.tagName === 'H1' ? 1 : 2;

        const heading: HeadingData = {
          id: el.id,
          title: el.textContent?.trim() || '',
          level,
          percent: (Math.max(0, scrollWhenAtHeading) / docHeight) * 100,
          children: []
        };

        if (level === 1) {
          h1s.push(heading);
          currentH1 = heading;
        } else if (level === 2 && currentH1) {
          currentH1.children.push(heading);
        }
      });

      setHeadings(h1s);
    };

    gather();
    window.addEventListener('resize', gather);
    return () => window.removeEventListener('resize', gather);
  }, [content]);

  // Track scroll
  useEffect(() => {
    const onScroll = () => {
      const pct = (window.scrollY / docHeightRef.current) * 100;
      setScrollPercent(pct);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  if (headings.length === 0) return null;

  return (
    <nav
      className="hidden lg:block fixed left-6 top-24 bottom-24 w-64 z-30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setHoveredH1(null); }}
    >
      <div className="relative h-full">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--theme-border)]" />

        <div
          className="absolute left-0 w-3 h-0.5 bg-[var(--accent)]"
          style={{ top: `${scrollPercent}%`, transform: 'translateY(-50%)' }}
        />

        {/* H1 headings */}
        {headings.map((h, idx) => (
          <div
            key={`${h.id}-${idx}`}
            className="absolute left-0"
            style={{ top: `${h.percent}%`, transform: 'translateY(-50%)' }}
            onMouseEnter={() => setHoveredH1(h.id)}
            onMouseLeave={() => setHoveredH1(null)}
          >
            <button
              onClick={() => scrollTo(h.id)}
              className="flex items-center cursor-pointer"
            >
              <span className="block w-2 h-px bg-[var(--theme-text-muted)]" />
              <span
                className={`
                  ml-2 max-w-48 font-mono text-[10px] tracking-widest uppercase text-left leading-tight
                  transition-opacity duration-150
                  ${isHovered || activeH1Id === h.id ? 'opacity-100' : 'opacity-0'}
                  ${activeH1Id === h.id ? 'text-[var(--theme-text-primary)]' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]'}
                `}
              >
                {h.title}
              </span>
            </button>

            {/* H2 popover - with invisible bridge for hover */}
            {h.children.length > 0 && hoveredH1 === h.id && (
              <>
                {/* Invisible bridge to keep hover when moving to popover */}
                <div className="absolute left-0 top-full w-48 h-2" />
                <div className="absolute left-4 top-full mt-2 px-3 py-2 bg-[var(--theme-bg-primary)] border border-[var(--theme-border)] rounded-sm shadow-lg min-w-max z-50">
                  <div className="flex flex-col gap-1.5">
                    {h.children.map((child, childIdx) => (
                      <button
                        key={`${child.id}-${childIdx}`}
                        onClick={() => scrollTo(child.id)}
                        className="font-mono text-[9px] tracking-wide text-left text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors"
                      >
                        {child.title}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
