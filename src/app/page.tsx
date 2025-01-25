'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const pageTransition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1]
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
    <motion.div 
      className="min-h-screen flex items-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={pageTransition}
    >
      {/* Background gradients */}
      <motion.div
        className="absolute inset-0 origin-left"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ 
          opacity: hoveredSide === 'mle' ? 1 : 0,
          scaleX: hoveredSide === 'mle' ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(to right, rgb(238, 242, 255) 0%, rgb(238, 242, 255, 0) 100%)'
        }}
      />
      <motion.div
        className="absolute inset-0 origin-right"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ 
          opacity: hoveredSide === 'photography' ? 1 : 0,
          scaleX: hoveredSide === 'photography' ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(to left, rgb(254, 243, 199) 0%, rgb(254, 243, 199, 0) 100%)'
        }}
      />

      <div className="w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 md:gap-24 relative">
        {/* MLE Section */}
        <motion.section
          onHoverStart={() => setHoveredSide('mle')}
          onHoverEnd={() => setHoveredSide(null)}
          onClick={() => handleModeChange('mle')}
          className="group cursor-pointer relative flex flex-col items-start"
        >
          <div className="h-[120px]"> {/* Fixed height container for consistent spacing */}
            <motion.h2 
              className="text-4xl font-light tracking-tight"
              animate={{ 
                color: hoveredSide === 'mle' ? 'rgb(79, 70, 229)' : 'rgb(17, 24, 39)'
              }}
              transition={{ duration: 0.2 }}
            >
              Machine Learning
              <span className="block text-xl mt-2">Engineer</span>
            </motion.h2>
            <motion.p
              className="text-gray-600 max-w-md absolute"
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: hoveredSide === 'mle' ? 1 : 0,
                y: hoveredSide === 'mle' ? 0 : -20
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Developing intelligent systems and algorithms that push the boundaries 
              of artificial intelligence. Specializing in computer vision and natural 
              language processing.
            </motion.p>
          </div>
        </motion.section>

        {/* Divider */}
        <motion.div 
          className="hidden md:block absolute left-1/2 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"
          animate={{ 
            x: hoveredSide === 'mle' ? -2 : hoveredSide === 'photography' ? 2 : 0,
            opacity: hoveredSide ? 0.5 : 1
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Photography Section */}
        <motion.section
          onHoverStart={() => setHoveredSide('photography')}
          onHoverEnd={() => setHoveredSide(null)}
          onClick={() => handleModeChange('photography')}
          className="group cursor-pointer relative flex flex-col items-start"
        >
          <div className="h-[120px]"> {/* Fixed height container for consistent spacing */}
            <motion.h2 
              className="text-4xl font-light tracking-tight"
              animate={{ 
                color: hoveredSide === 'photography' ? 'rgb(217, 119, 6)' : 'rgb(17, 24, 39)'
              }}
              transition={{ duration: 0.2 }}
            >
              Visual Stories
              <span className="block text-xl mt-2">Photography</span>
            </motion.h2>
            <motion.p
              className="text-gray-600 max-w-md absolute"
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: hoveredSide === 'photography' ? 1 : 0,
                y: hoveredSide === 'photography' ? 0 : -20
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Capturing moments and emotions through the lens, specializing in portrait 
              and landscape photography. Creating visual narratives that resonate.
            </motion.p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
