'use client';

import { useEffect, useState, useMemo } from 'react';
import { useThemeStore } from '@/store/theme';
import { useRouter, usePathname } from 'next/navigation';
import ColorSchemeToggle from "@/components/theme/ColorSchemeToggle";
import { motion } from 'framer-motion';
import { transitions } from '@/constants';
import { getThemeColors } from '@/utils';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colorScheme, setColorScheme } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();
  const isDark = colorScheme === 'dark';
  const [mounted, setMounted] = useState(false);
  const [hasUserPreference, setHasUserPreference] = useState(false);

  const themeColors = useMemo(() => 
    getThemeColors(isDark),
    [isDark]
  );

  useEffect(() => {
    setMounted(true);
    
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

  useEffect(() => {
    if (!mounted) return;
  }, [mounted, pathname, router]);

  if (!mounted) {
    return null;
  }

  return (
    <>
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