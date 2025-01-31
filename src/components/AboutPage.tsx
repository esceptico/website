'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/SectionHeader';
import { useEffect, useState } from 'react';
import { Mode } from '@/types/theme';
import { MLEContent } from '@/components/MLEContent';
import { PhotographyContent } from '@/components/PhotographyContent';
import { mleDescription, photographyDescription } from '@/constants/content';

interface AboutPageProps {
  mode: Mode;
}

export function AboutPage({ mode }: AboutPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-12">
            <SectionHeader 
              title="About Me"
              as="h1" 
              variant="primary" 
              useAccentColor 
            />
            <p className="mt-4 text-[var(--theme-text-secondary)]">
              {mode === 'mle' ? mleDescription : photographyDescription}
            </p>
          </div>
          {mode === 'mle' ? <MLEContent /> : <PhotographyContent />}
        </motion.div>
      </div>
    </div>
  );
} 