'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme';
import { useRouter, usePathname } from 'next/navigation';
import Navigation from "@/components/Navigation";
import { motion } from 'framer-motion';

const pageTransition = {
  duration: 0.4,
  ease: [0.43, 0.13, 0.23, 0.96]
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/about' || pathname === '/') return;
    
    if ((mode === 'mle' && pathname.includes('portfolio')) ||
        (mode === 'photography' && pathname.includes('projects'))) {
      router.push('/');
    }
  }, [mode, pathname, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={pageTransition}
    >
      <Navigation />
      {children}
    </motion.div>
  );
} 