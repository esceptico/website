'use client';

import { useEffect, useState } from 'react';

type ColorScheme = 'light' | 'dark';

const THEME_KEY = 'theme';
const LEGACY_THEME_KEY = 'theme-storage';

function getCurrentScheme(): ColorScheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export default function ColorSchemeToggle() {
  const [scheme, setScheme] = useState<ColorScheme>('dark');

  useEffect(() => {
    setScheme(getCurrentScheme());
  }, []);

  const toggle = () => {
    const next: ColorScheme = scheme === 'dark' ? 'light' : 'dark';
    setScheme(next);

    document.documentElement.classList.toggle('dark', next === 'dark');

    // Persist (new key)
    try {
      localStorage.setItem(THEME_KEY, next);
      // Persist (legacy key used by the old zustand store)
      localStorage.setItem(LEGACY_THEME_KEY, JSON.stringify({ state: { colorScheme: next }, version: 0 }));
    } catch {
      // ignore
    }

    // Update theme-color meta tag for mobile browser UI
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', next === 'dark' ? '#121212' : '#fafafa');
    }
  };

  return (
    <button
      onClick={toggle}
      className="font-mono text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors select-none cursor-pointer"
      aria-label={`Switch to ${scheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      [ {scheme} ]
    </button>
  );
}
