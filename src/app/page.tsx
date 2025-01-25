'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const { setMode } = useThemeStore();
  const router = useRouter();
  const [hoveredSide, setHoveredSide] = useState<'mle' | 'photography' | null>(null);

  const handleModeChange = (mode: 'mle' | 'photography') => {
    setMode(mode);
    router.push(mode === 'mle' ? '/projects' : '/portfolio');
  };

  return (
    <div className="min-h-screen flex items-center relative overflow-hidden">
      {/* Background gradients */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ 
          background: hoveredSide === 'mle' 
            ? 'linear-gradient(to right, rgb(238, 242, 255) 0%, transparent 50%)' 
            : hoveredSide === 'photography'
            ? 'linear-gradient(to left, rgb(255, 247, 237) 0%, transparent 50%)'
            : 'none'
        }}
        transition={{ duration: 0.4 }}
      />

      <div className="w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 md:gap-24 relative">
        {/* MLE Section */}
        <div 
          className="relative"
          onMouseEnter={() => setHoveredSide('mle')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleModeChange('mle')}
        >
          <motion.div className="cursor-pointer">
            <motion.h2 
              className="text-4xl font-light tracking-tight"
              animate={{ 
                color: hoveredSide === 'mle' ? 'rgb(79, 70, 229)' : 'rgb(17, 24, 39)',
                x: hoveredSide === 'mle' ? 16 : 0
              }}
              transition={{ duration: 0.4 }}
            >
              Machine Learning
              <span className="block text-xl mt-2">Engineer</span>
            </motion.h2>

            <motion.p
              className="text-gray-600 max-w-md mt-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: hoveredSide === 'mle' ? 1 : 0,
                y: hoveredSide === 'mle' ? 0 : -20,
                x: hoveredSide === 'mle' ? 16 : 0
              }}
              transition={{ duration: 0.4 }}
            >
              Developing intelligent systems and algorithms that push the boundaries 
              of artificial intelligence. Specializing in computer vision and natural 
              language processing.
            </motion.p>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div 
          className="hidden md:block absolute left-1/2 h-24 top-[4.5rem] -translate-x-px w-px"
          style={{
            background: 'linear-gradient(to bottom, transparent, currentColor, transparent)',
            color: hoveredSide === 'mle' 
              ? 'rgb(79, 70, 229)' 
              : hoveredSide === 'photography'
              ? 'rgb(217, 119, 6)'
              : 'rgb(229, 231, 235)'
          }}
          animate={{ 
            scaleY: hoveredSide ? 1.1 : 1,
            opacity: hoveredSide ? 0.3 : 0.5
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Photography Section */}
        <div 
          className="relative"
          onMouseEnter={() => setHoveredSide('photography')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleModeChange('photography')}
        >
          <motion.div className="cursor-pointer text-right">
            <motion.h2 
              className="text-4xl font-light tracking-tight"
              animate={{ 
                color: hoveredSide === 'photography' ? 'rgb(217, 119, 6)' : 'rgb(17, 24, 39)',
                x: hoveredSide === 'photography' ? -16 : 0
              }}
              transition={{ duration: 0.4 }}
            >
              Visual Stories
              <span className="block text-xl mt-2">Photography</span>
            </motion.h2>

            <motion.p
              className="text-gray-600 max-w-md mt-4 ml-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: hoveredSide === 'photography' ? 1 : 0,
                y: hoveredSide === 'photography' ? 0 : -20,
                x: hoveredSide === 'photography' ? -16 : 0
              }}
              transition={{ duration: 0.4 }}
            >
              Capturing moments and emotions through the lens, specializing in portrait 
              and landscape photography. Creating visual narratives that resonate.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
