'use client';

import { useEffect, useState, useMemo } from 'react';
import { useThemeStore } from '@/store/theme';
import ColorSchemeToggle from "@/components/theme/ColorSchemeToggle";
import { motion } from 'framer-motion';
import { transitions } from '@/constants';
import { getThemeColors } from '@/utils';
import { CommandPalette } from '@/components/shared/CommandPalette';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colorScheme, setColorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';
  const [mounted, setMounted] = useState(false);
  const [hasUserPreference, setHasUserPreference] = useState(false);
  const [isMac, setIsMac] = useState(true);

  const themeColors = useMemo(() => 
    getThemeColors(isDark),
    [isDark]
  );

  useEffect(() => {
    setMounted(true);
    
    // Detect platform
    if (typeof navigator !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
    
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme-storage');
    if (savedTheme) {
      setHasUserPreference(true);
    } else {
      // No saved preference, use system theme
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setColorScheme(systemTheme);
    }
  }, [setColorScheme]);

  // Listen for OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || hasUserPreference) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (!hasUserPreference) {
        setColorScheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [setColorScheme, hasUserPreference]);

  // Track when user manually changes theme
  useEffect(() => {
    if (mounted && !hasUserPreference) {
      // If the theme changes after mount and we didn't have a preference, user must have toggled
      const unsubscribe = useThemeStore.subscribe(() => {
        setHasUserPreference(true);
      });
      return unsubscribe;
    }
  }, [mounted, hasUserPreference]);

  useEffect(() => {
    Object.entries(themeColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#121212' : '#fafafa');
    }
  }, [themeColors, isDark]);

  const handleCommandPaletteOpen = () => {
    // Trigger the keyboard event to open command palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <CommandPalette />
      <motion.div
        initial={false}
        animate={{}}
        transition={transitions.page}
        className="min-h-screen relative pt-16" 
      >
        {/* Theme Toggle - Top Left */}
        <div className="fixed top-4 left-4 z-50">
          <ColorSchemeToggle />
        </div>

        {/* Command Palette Trigger - Bottom Right */}
        <button
          onClick={handleCommandPaletteOpen}
          className="fixed bottom-4 right-4 z-40 px-2.5 py-1.5 
                     text-xs text-[var(--theme-text-secondary)] font-mono cursor-pointer
                     bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)]
                     rounded-md shadow-sm
                     hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-hover)]
                     hover:border-[var(--theme-border-hover)] hover:shadow-md
                     transition-all duration-200 opacity-40 hover:opacity-100"
        >
          {isMac ? '⌘K' : 'Ctrl+K'}
        </button>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transitions.page}
        >
          {children}
        </motion.main>
      </motion.div>
    </>
  );
} 