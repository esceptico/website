'use client';

import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/theme';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function About() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      router.replace(`/about/${mode}`);
    }
  }, [mode, mounted, router]);

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 0 : 0.5 }}
        className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mb-12">
          <div className="h-12 bg-[var(--theme-text-secondary)] opacity-20 rounded w-48" />
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-[var(--theme-text-secondary)] opacity-20 rounded w-3/4" />
          <div className="h-4 bg-[var(--theme-text-secondary)] opacity-20 rounded w-2/3" />
          <div className="h-4 bg-[var(--theme-text-secondary)] opacity-20 rounded w-5/6" />
        </div>
      </motion.div>
    </div>
  );
} 