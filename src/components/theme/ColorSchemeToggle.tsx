'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type ColorScheme = 'light' | 'dark';

const THEME_KEY = 'theme';
const LEGACY_THEME_KEY = 'theme-storage';

function getCurrentScheme(): ColorScheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export default function ColorSchemeToggle() {
  const [scheme, setScheme] = useState<ColorScheme>('dark');
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setScheme(getCurrentScheme());
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    const next: ColorScheme = scheme === 'dark' ? 'light' : 'dark';
    setScheme(next);

    document.documentElement.classList.toggle('dark', next === 'dark');

    try {
      localStorage.setItem(THEME_KEY, next);
      localStorage.setItem(LEGACY_THEME_KEY, JSON.stringify({ state: { colorScheme: next }, version: 0 }));
    } catch {
      // ignore
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', next === 'dark' ? '#0a0a0a' : '#fafafa');
    }
  }, [scheme]);

  if (!mounted) {
    return <div className="h-5 w-12" aria-hidden="true" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${scheme === 'dark' ? 'light' : 'dark'} mode`}
      className="group -m-2 inline-flex items-center p-2 font-jetbrains-mono text-xs text-[var(--theme-text-secondary)] cursor-pointer transition-[color,transform] duration-150 ease-out hover:text-[var(--theme-text-primary)] active:scale-[0.96]"
    >
      <span className="text-[var(--theme-text-muted)] transition-transform duration-200 ease-out group-hover:-translate-x-[2px] group-hover:text-[var(--accent)]">
        [
      </span>
      <span className="relative inline-flex h-4 w-10 items-center justify-center overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.span
            key={scheme}
            initial={reduceMotion ? false : { y: '110%', filter: 'blur(3px)', opacity: 0 }}
            animate={{ y: '0%', filter: 'blur(0px)', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '-110%', filter: 'blur(3px)', opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {scheme}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-[var(--theme-text-muted)] transition-transform duration-200 ease-out group-hover:translate-x-[2px] group-hover:text-[var(--accent)]">
        ]
      </span>
    </button>
  );
}
