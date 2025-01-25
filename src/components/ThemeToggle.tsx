'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BeakerIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/store/theme';

const ToggleContent = ({ mode }: { mode: 'mle' | 'photography' }) => {
  const isMLE = mode === 'mle';
  return (
    <>
      {isMLE ? (
        <BeakerIcon className="w-4 h-4 text-indigo-600" />
      ) : (
        <CameraIcon className="w-4 h-4 text-amber-600" />
      )}
      <span 
        className={`text-sm font-light ${
          isMLE ? 'text-indigo-600' : 'text-amber-600'
        }`}
      >
        {isMLE ? 'ML' : 'Photo'}
      </span>
    </>
  );
};

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeStore();

  return (
    <button
      onClick={toggleMode}
      className="relative h-8 px-3"
    >
      <div 
        className="absolute inset-0 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: mode === 'mle' 
            ? 'rgb(238, 242, 255)' // indigo-50
            : 'rgb(255, 251, 235)', // amber-50
        }}
      />
      <div className="relative flex items-center h-full">
        <div className="w-16 flex justify-start overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <ToggleContent mode={mode} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </button>
  );
} 