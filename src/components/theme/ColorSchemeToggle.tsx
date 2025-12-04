'use client';

import { useThemeStore } from '@/store/theme';

export default function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';

  return (
    <button
      onClick={toggleColorScheme}
      className="font-mono text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors select-none"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      [ {isDark ? 'dark' : 'light'} ]
    </button>
  );
}
