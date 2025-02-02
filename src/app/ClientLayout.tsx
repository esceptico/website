'use client';

import { useEffect, useState, useMemo } from 'react';
import { useThemeStore } from '@/store/theme';
import { useRouter, usePathname } from 'next/navigation';
import Navigation from "@/components/layout/Navigation";
import ColorSchemeToggle from "@/components/theme/ColorSchemeToggle";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { transitions } from '@/constants/animation';
import { gradients } from '@/constants/theme';
import { getThemeColors } from '@/utils/theme';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode, colorScheme } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();
  const isDark = colorScheme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (pathname === '/') return;

    const currentMode = pathname.includes('/mle/') || pathname === '/projects' ? 'mle' : 
                       pathname.includes('/photography/') || pathname === '/portfolio' ? 'photography' : null;
    
    if (currentMode && currentMode !== mode) {
      const redirectPath = mode === 'mle' ? 
        pathname.replace('/photography/', '/mle/').replace('/portfolio', '/projects') :
        pathname.replace('/mle/', '/photography/').replace('/projects', '/portfolio');
      router.replace(redirectPath);
    }
  }, [mode, pathname, router, mounted]);

  const gradientBackground = useMemo(() => 
    mode === 'mle'
      ? `linear-gradient(to right, ${isDark ? gradients.mle.dark : gradients.mle.light} 0%, transparent 50%)`
      : `linear-gradient(to left, ${isDark ? gradients.photography.dark : gradients.photography.light} 0%, transparent 50%)`,
    [mode, isDark]
  );

  const themeColors = useMemo(() => 
    getThemeColors(isDark, mode),
    [isDark, mode]
  );

  if (!mounted) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={false}
        animate={{ 
          opacity: pathname === '/' ? 0 : 1,
          background: gradientBackground
        }}
        transition={transitions.page}
      />
      <motion.div
        initial={false}
        animate={{ 
          backgroundColor: isDark ? 'rgb(3, 7, 18)' : 'rgb(249, 250, 251)',
        }}
        transition={transitions.page}
        className="min-h-screen"
        style={themeColors as React.CSSProperties}
      >
        <Navigation />
        {pathname === '/' && <ColorSchemeToggle />}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transitions.page}
        >
          {children}
        </motion.main>
        {pathname !== '/portfolio' && <Footer />}
      </motion.div>
    </>
  );
} 