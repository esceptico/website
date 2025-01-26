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
  const { setMode } = useThemeStore();
  const router = useRouter();
  const [hoveredSide, setHoveredSide] = useState<'mle' | 'photography' | null>(null);

  const handleModeChange = (mode: 'mle' | 'photography') => {
    setMode(mode);
    router.push(mode === 'mle' ? '/projects' : '/portfolio');
  };

  return (
    <div className="min-h-screen flex items-center relative overflow-hidden bg-gray-950">
      {/* Background gradients */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ 
          opacity: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, transparent 0%)'
        }}
        animate={{ 
          opacity: hoveredSide ? 1 : 0,
          background: hoveredSide === 'mle' 
            ? 'radial-gradient(circle at 25% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 50%)' 
            : hoveredSide === 'photography'
            ? 'radial-gradient(circle at 75% 50%, rgba(217, 119, 6, 0.15) 0%, transparent 50%)'
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
              className="text-4xl font-light tracking-tight text-gray-200"
              animate={{ 
                color: hoveredSide === 'mle' ? 'rgb(129, 140, 248)' : 'rgb(229, 231, 235)'
              }}
              transition={transition}
            >
              Machine Learning
              <span className="block text-xl mt-2 text-indigo-400">Engineer</span>
            </motion.h2>

            <motion.p
              className="text-gray-400 max-w-md mt-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: hoveredSide === 'mle' ? 1 : 0,
                y: hoveredSide === 'mle' ? 0 : -20
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
          className="hidden md:block absolute left-1/2 h-24 top-[4.5rem] -translate-x-px w-px"
          style={{
            background: 'linear-gradient(to bottom, transparent, currentColor, transparent)',
            color: hoveredSide === 'mle' 
              ? 'rgb(129, 140, 248)' 
              : hoveredSide === 'photography'
              ? 'rgb(251, 146, 60)'
              : 'rgb(75, 85, 99)'
          }}
          animate={{ 
            scaleY: hoveredSide ? 1.1 : 1,
            opacity: hoveredSide ? 0.4 : 0.2,
            x: hoveredSide === 'mle' 
              ? 20
              : hoveredSide === 'photography'
              ? -20
              : 0
          }}
          transition={transition}
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
              className="text-4xl font-light tracking-tight text-gray-200"
              animate={{ 
                color: hoveredSide === 'photography' ? 'rgb(251, 146, 60)' : 'rgb(229, 231, 235)'
              }}
              transition={transition}
            >
              Visual Stories
              <span className="block text-xl mt-2 text-orange-400">Photography</span>
            </motion.h2>

            <motion.p
              className="text-gray-400 max-w-md mt-4 ml-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: hoveredSide === 'photography' ? 1 : 0,
                y: hoveredSide === 'photography' ? 0 : -20
              }}
              transition={transition}
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
