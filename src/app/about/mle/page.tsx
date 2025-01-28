'use client';

import { motion } from 'framer-motion';
import { MLEContent } from '@/components/MLEContent';
import { SectionHeader } from '@/components/SectionHeader';
import { useEffect, useState } from 'react';

export default function MLEAbout() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
        <MLEContent />
      </motion.div>
    </div>
  );
} 