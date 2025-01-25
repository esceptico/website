'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BeakerIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/store/theme';

const itemVariants = {
  initial: { 
    opacity: 0,
    y: 10,
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    }
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    }
  },
};

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeStore();
  const isMLE = mode === 'mle';

  return (
    <button
      onClick={toggleMode}
      className="relative h-8 px-3"
    >
      <div 
        className="absolute inset-0 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: isMLE 
            ? 'rgb(238, 242, 255)' // indigo-50
            : 'rgb(255, 251, 235)', // amber-50
        }}
      />
      <div className="relative flex items-center h-full">
        <div className="w-16 flex justify-start overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center gap-2"
            >
              {isMLE ? (
                <>
                  <BeakerIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-light text-indigo-600">ML</span>
                </>
              ) : (
                <>
                  <CameraIcon className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-light text-amber-600">Photo</span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </button>
  );
} 