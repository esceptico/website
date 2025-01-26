'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme';
import { useRouter, usePathname } from 'next/navigation';
import Navigation from "@/components/Navigation";
import ColorSchemeToggle from "@/components/ColorSchemeToggle";
import { motion } from 'framer-motion';

const transition = {
  duration: 0.4,
  ease: [0.43, 0.13, 0.23, 0.96]
};

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

  return (
    <motion.div
      initial={false}
      animate={{ 
        backgroundColor: isDark ? 'rgb(3, 7, 18)' : 'rgb(249, 250, 251)',
      }}
      transition={transition}
      className="min-h-screen"
      style={{
        '--theme-text-primary': isDark ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)',
        '--theme-text-secondary': isDark ? 'rgb(156, 163, 175)' : 'rgb(75, 85, 99)',
        '--theme-accent-primary': mode === 'mle' 
          ? (isDark ? 'rgb(129, 140, 248)' : 'rgb(67, 56, 202)')
          : (isDark ? 'rgb(251, 146, 60)' : 'rgb(217, 119, 6)'),
        '--theme-accent-secondary': mode === 'mle'
          ? (isDark ? 'rgb(99, 102, 241)' : 'rgb(79, 70, 229)')
          : (isDark ? 'rgb(234, 88, 12)' : 'rgb(234, 88, 12)'),
        '--theme-bg-card': isDark ? 'rgba(17, 24, 39, 0.5)' : 'rgba(255, 255, 255, 0.5)',
        '--theme-border': isDark ? 'rgb(31, 41, 55)' : 'rgb(229, 231, 235)',
      } as React.CSSProperties}
    >
      <Navigation />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      >
        {children}
      </motion.main>
      <ColorSchemeToggle />
    </motion.div>
  );
} 