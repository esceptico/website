'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { MLEContent } from '@/components/MLEContent';
import { PhotographyContent } from '@/components/PhotographyContent';
import { SectionHeader } from '@/components/SectionHeader';
import { HackerText } from '@/components/HackerText';

export default function About() {
  const { mode, colorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mb-12">
          <SectionHeader 
            title={<HackerText text="About Me" duration={100} />}
            as="h1" 
            variant="primary" 
            useAccentColor 
          />
        </div>
        {mode === 'mle' ? <MLEContent isDark={isDark} /> : <PhotographyContent isDark={isDark} />}
      </motion.div>
    </div>
  );
} 