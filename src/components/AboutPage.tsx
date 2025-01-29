'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/SectionHeader';
import { useEffect, useState } from 'react';
import { Mode } from '@/types/theme';
import { MLEContent } from '@/components/MLEContent';
import { PhotographyContent } from '@/components/PhotographyContent';

interface AboutPageProps {
  mode: Mode;
}

export function AboutPage({ mode }: AboutPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0.5 }}
        className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mb-12">
          <SectionHeader 
            title="About Me"
            as="h1" 
            variant="primary" 
            useAccentColor 
          />
        </div>
        {mode === 'mle' ? <MLEContent /> : <PhotographyContent />}
      </motion.div>
    </div>
  );
} 