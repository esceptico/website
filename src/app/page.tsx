'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const transition = {
  duration: 0.4,
  ease: [0.43, 0.13, 0.23, 0.96]
};

export default function Home() {
  const { setMode, colorScheme } = useThemeStore();
  const router = useRouter();
  const [hoveredSide, setHoveredSide] = useState<'mle' | 'photography' | null>(null);
  const isDark = colorScheme === 'dark';

  const handleModeChange = (mode: 'mle' | 'photography') => {
    setMode(mode);
    router.push(mode === 'mle' ? '/projects' : '/portfolio');
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...transition, delay: 0.1 }}
    >
      {/* Background gradients */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={{ 
          opacity: hoveredSide ? 1 : 0,
          background: hoveredSide === 'mle' 
            ? `radial-gradient(circle at 25% 50%, ${isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.1)'} 0%, transparent 50%)` 
            : hoveredSide === 'photography'
            ? `radial-gradient(circle at 75% 50%, ${isDark ? 'rgba(217, 119, 6, 0.15)' : 'rgba(217, 119, 6, 0.1)'} 0%, transparent 50%)`
            : 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, transparent 0%)'
        }}
        transition={transition}
      />

      <div className="w-full max-w-5xl mx-auto grid md:grid-cols-2 relative">
        {/* MLE Section */}
        <div 
          className="relative px-12"
          onMouseEnter={() => setHoveredSide('mle')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleModeChange('mle')}
        >
          <motion.div 
            className="cursor-pointer"
            animate={{ 
              x: hoveredSide === 'mle' ? 40 : hoveredSide === 'photography' ? -16 : 0,
              opacity: hoveredSide === 'photography' ? 0.5 : 1
            }}
            transition={transition}
          >
            <motion.h2 
              className="text-4xl font-light tracking-tight"
              animate={{ 
                color: hoveredSide === 'mle' 
                  ? isDark ? 'rgb(129, 140, 248)' : 'rgb(67, 56, 202)'
                  : isDark ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)'
              }}
              transition={transition}
            >
              Machine Learning
              <motion.span 
                className="block text-xl mt-2"
                animate={{ 
                  color: isDark ? 'rgb(129, 140, 248)' : 'rgb(67, 56, 202)'
                }}
                transition={transition}
              >
                Engineer
              </motion.span>
            </motion.h2>

            <motion.p
              className="max-w-md mt-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: hoveredSide === 'mle' ? 1 : 0,
                y: hoveredSide === 'mle' ? 0 : -20,
                color: isDark ? 'rgb(156, 163, 175)' : 'rgb(75, 85, 99)'
              }}
              transition={transition}
            >
              Developing intelligent systems and algorithms that push the boundaries 
              of artificial intelligence. Specializing in computer vision and natural 
              language processing.
            </motion.p>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div 
          className="hidden md:block absolute left-1/2 -translate-x-px w-px"
          style={{
            background: 'linear-gradient(to bottom, transparent, currentColor, transparent)',
            height: '3rem',
            top: '1.5rem'
          }}
          animate={{ 
            scaleY: hoveredSide ? 6 : 1,
            opacity: hoveredSide ? 0.4 : 0.2,
            x: hoveredSide === 'mle' 
              ? 20
              : hoveredSide === 'photography'
              ? -20
              : 0,
            color: hoveredSide === 'mle' 
              ? isDark ? 'rgb(129, 140, 248)' : 'rgb(67, 56, 202)'
              : hoveredSide === 'photography'
              ? isDark ? 'rgb(251, 146, 60)' : 'rgb(217, 119, 6)'
              : isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)',
            transformOrigin: 'center'
          }}
          transition={{
            ...transition,
            scaleY: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
        />

        {/* Photography Section */}
        <div 
          className="relative px-12"
          onMouseEnter={() => setHoveredSide('photography')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleModeChange('photography')}
        >
          <motion.div 
            className="cursor-pointer text-right"
            animate={{ 
              x: hoveredSide === 'photography' ? -40 : hoveredSide === 'mle' ? 16 : 0,
              opacity: hoveredSide === 'mle' ? 0.5 : 1
            }}
            transition={transition}
          >
            <motion.h2 
              className="text-4xl font-light tracking-tight"
              animate={{ 
                color: hoveredSide === 'photography' 
                  ? isDark ? 'rgb(251, 146, 60)' : 'rgb(217, 119, 6)'
                  : isDark ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)'
              }}
              transition={transition}
            >
              Visual Stories
              <motion.span 
                className="block text-xl mt-2"
                animate={{ 
                  color: isDark ? 'rgb(251, 146, 60)' : 'rgb(217, 119, 6)'
                }}
                transition={transition}
              >
                Photography
              </motion.span>
            </motion.h2>

            <motion.p
              className="max-w-md mt-4 ml-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: hoveredSide === 'photography' ? 1 : 0,
                y: hoveredSide === 'photography' ? 0 : -20,
                color: isDark ? 'rgb(156, 163, 175)' : 'rgb(75, 85, 99)'
              }}
              transition={transition}
            >
              Capturing moments and emotions through the lens, specializing in portrait 
              and landscape photography. Creating visual narratives that resonate.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
