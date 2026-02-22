'use client';

import { useEffect, useRef } from 'react';

export function Flicker({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeout: ReturnType<typeof setTimeout>;
    let visible = true;

    const glitch = () => {
      if (!visible) {
        // was hidden — snap back on
        el.style.opacity = '1';
        el.style.transform = 'none';
        visible = true;
        // next glitch burst in 1–5s (irregular calm periods)
        timeout = setTimeout(glitch, 800 + Math.random() * 4000);
      } else {
        // pick a random glitch style
        const r = Math.random();
        if (r < 0.4) {
          // hard dropout
          el.style.opacity = '0';
        } else if (r < 0.7) {
          // dim + shift
          el.style.opacity = String(0.1 + Math.random() * 0.3);
          el.style.transform = `translateX(${(Math.random() - 0.5) * 3}px) skewX(${(Math.random() - 0.5) * 4}deg)`;
        } else {
          // rapid partial
          el.style.opacity = String(0.3 + Math.random() * 0.4);
          el.style.transform = `translateY(${(Math.random() - 0.5) * 2}px)`;
        }
        visible = false;
        // glitch lasts 30-120ms (fast stutter)
        timeout = setTimeout(glitch, 30 + Math.random() * 90);
      }
    };

    // initial delay before first glitch
    timeout = setTimeout(glitch, 1500 + Math.random() * 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <span
      ref={ref}
      className="flicker"
      style={{ display: 'inline-block', willChange: 'opacity, transform' }}
    >
      {children}
    </span>
  );
}
