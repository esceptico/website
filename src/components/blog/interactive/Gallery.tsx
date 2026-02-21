'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

export function Gallery({ images }: GalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);

  const scrollTo = useCallback((i: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(i, images.length - 1));
    container.scrollTo({ left: clamped * container.offsetWidth, behavior: 'smooth' });
  }, [images.length]);

  // Track active slide via scroll position
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const w = container.offsetWidth;
        if (w > 0) setActive(Math.round(container.scrollLeft / w));
        ticking = false;
      });
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  // Arrow keys to navigate slides when container focused
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollTo(active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollTo(active - 1); }
    };

    container.addEventListener('keydown', onKey);
    return () => container.removeEventListener('keydown', onKey);
  }, [active, scrollTo]);

  // Zoom: lock body scroll, keyboard nav
  useEffect(() => {
    if (zoom === null) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(null);
      if (e.key === 'ArrowRight') setZoom(z => z !== null ? Math.min(z + 1, images.length - 1) : null);
      if (e.key === 'ArrowLeft') setZoom(z => z !== null ? Math.max(z - 1, 0) : null);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [zoom, images.length]);

  return (
    <>
      <div className="my-6">
        {/* Scroll container */}
        <div
          ref={scrollRef}
          tabIndex={0}
          className="flex overflow-x-auto snap-x snap-mandatory outline-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-none w-full snap-center"
            >
              <button
                onClick={() => setZoom(i)}
                className="w-full cursor-zoom-in block"
              >
                <img
                  src={img.src}
                  alt={img.alt || ''}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="w-full h-auto block"
                  draggable={false}
                />
              </button>

              {img.caption && (
                <div className="mt-2 px-1">
                  <span className="font-mono text-[11px] text-[var(--theme-text-muted)] leading-relaxed">
                    {img.caption}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Counter + dots */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2.5 mt-3">
            <span className="font-mono text-[10px] text-[var(--theme-text-muted)] tabular-nums">
              {active + 1}/{images.length}
            </span>
            <div className="flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className={`rounded-full transition-all duration-200 cursor-pointer ${
                    i === active
                      ? 'w-5 h-1.5 bg-[var(--accent)]'
                      : 'w-1.5 h-1.5 bg-[var(--theme-text-muted)]/40 hover:bg-[var(--theme-text-muted)]'
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom overlay — blurred background */}
      {zoom !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center cursor-zoom-out backdrop-blur-xl bg-[var(--theme-bg-primary)]/60"
          onClick={() => setZoom(null)}
        >
          {/* Counter + close */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 py-4 z-10">
            {images.length > 1 && (
              <span className="font-mono text-[10px] text-[var(--theme-text-primary)]/50 tracking-widest tabular-nums">
                {active + 1}&thinsp;/&thinsp;{images.length}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setZoom(null); }}
              className="ml-auto w-8 h-8 flex items-center justify-center text-[var(--theme-text-primary)]/50 hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setZoom(Math.max(0, zoom - 1)); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[var(--theme-text-primary)]/30 hover:text-[var(--theme-text-primary)] transition-colors z-10 cursor-pointer disabled:opacity-0"
                disabled={zoom === 0}
                aria-label="Previous"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setZoom(Math.min(images.length - 1, zoom + 1)); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[var(--theme-text-primary)]/30 hover:text-[var(--theme-text-primary)] transition-colors z-10 cursor-pointer disabled:opacity-0"
                disabled={zoom === images.length - 1}
                aria-label="Next"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          {/* Full image */}
          <img
            src={images[zoom]!.src}
            alt={images[zoom]!.alt || ''}
            className="relative z-10 max-w-[92vw] max-h-[85vh] object-contain pointer-events-none select-none"
            draggable={false}
          />

          {/* Caption */}
          {images[zoom]!.caption && (
            <div className="absolute bottom-6 inset-x-0 text-center z-10">
              <span className="font-mono text-[11px] text-[var(--theme-text-primary)]/50">
                {images[zoom]!.caption}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
