'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme';
import { useRouter, usePathname } from 'next/navigation';
import Navigation from "@/components/Navigation";
import ColorSchemeToggle from "@/components/ColorSchemeToggle";
import Footer from "@/components/Footer";
import { motion } from 'framer-motion';
import { pageTransition, gradientConfig } from '@/constants/animation';
import { getThemeColors } from '@/constants/theme';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode, colorScheme } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (pathname === '/about' || pathname === '/') return;
    
    if ((mode === 'mle' && pathname.includes('portfolio')) ||
        (mode === 'photography' && pathname.includes('projects'))) {
      router.push('/');
    }
  }, [mode, pathname, router]);

  const gradientBackground = mode === 'mle'
    ? `radial-gradient(circle at 25% 50%, ${isDark ? gradientConfig.mle.dark : gradientConfig.mle.light} 0%, transparent 50%)`
    : `radial-gradient(circle at 75% 50%, ${isDark ? gradientConfig.photography.dark : gradientConfig.photography.light} 0%, transparent 50%)`;

  return (
    <>
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={false}
        animate={{ 
          opacity: pathname === '/' ? 0 : 1,
          background: gradientBackground
        }}
        transition={pageTransition}
      />
      <motion.div
        initial={false}
        animate={{ 
          backgroundColor: isDark ? 'rgb(3, 7, 18)' : 'rgb(249, 250, 251)',
        }}
        transition={pageTransition}
        className="min-h-screen"
        style={getThemeColors(isDark, mode) as React.CSSProperties}
      >
        <Navigation />
        <ColorSchemeToggle />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={pageTransition}
        >
          {children}
        </motion.main>
        <Footer />
      </motion.div>
    </>
  );
} 