'use client';

import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/theme';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Blog() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      router.replace(`/blog/${mode}`);
    }
  }, [mode, mounted, router]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 0 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-12">
            <div className="h-12 bg-[var(--theme-text-secondary)] opacity-20 rounded w-48" />
          </div>
          <div className="space-y-8">
            <div className="h-32 bg-[var(--theme-text-secondary)] opacity-20 rounded" />
            <div className="h-32 bg-[var(--theme-text-secondary)] opacity-20 rounded" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
