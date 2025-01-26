'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BeakerIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/store/theme';

const ToggleContent = ({ mode }: { mode: 'mle' | 'photography' }) => {
  const isMLE = mode === 'mle';
  return (
    <>
      {isMLE ? (
        <BeakerIcon className="w-4 h-4 text-indigo-400" />
      ) : (
        <CameraIcon className="w-4 h-4 text-orange-400" />
      )}
      <span 
        className={`text-sm font-light ${
          isMLE ? 'text-indigo-400' : 'text-orange-400'
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
            ? 'rgb(49, 46, 129, 0.3)' // indigo-900 with opacity
            : 'rgb(124, 45, 18, 0.3)', // orange-900 with opacity
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