'use client';

import { useEffect, useState, useCallback } from 'react';

type ColorScheme = 'light' | 'dark';

const THEME_KEY = 'theme';
const LEGACY_THEME_KEY = 'theme-storage';

function getCurrentScheme(): ColorScheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export default function ColorSchemeToggle() {
  const [scheme, setScheme] = useState<ColorScheme>('dark');
  const [mounted, setMounted] = useState(false);

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
      className="nav-item cursor-pointer"
      aria-label={`Switch to ${scheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      [ {scheme} ]
    </button>
  );
}
