'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { MLEContent } from './components/MLEContent';
import { PhotographyContent } from './components/PhotographyContent';

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
          <div className="relative group">
            <motion.div
              className="relative"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
            >
              <h1 className="text-4xl font-light text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">
                About Me
              </h1>
            </motion.div>
          </div>
        </div>
        {mode === 'mle' ? <MLEContent isDark={isDark} /> : <PhotographyContent isDark={isDark} />}
      </motion.div>
    </div>
  );
} 