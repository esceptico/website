'use client';

import { motion } from 'framer-motion';
import { BeakerIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/store/theme';

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeStore();
  const isMLE = mode === 'mle';

  return (
    <button
      onClick={toggleMode}
      className="relative flex items-center gap-2 px-4 py-2 rounded-full transition-colors"
    >
      <div className="relative flex items-center">
        <motion.div
          className={`absolute inset-0 rounded-full ${isMLE ? 'bg-indigo-50' : 'bg-amber-50'}`}
          layoutId="pill"
          transition={{ type: "spring", duration: 0.5 }}
        />
        <motion.div
          className="relative flex items-center gap-2 px-3 py-1.5"
          animate={{ color: isMLE ? 'rgb(79, 70, 229)' : 'rgb(217, 119, 6)' }}
        >
          {isMLE ? (
            <>
              <BeakerIcon className="h-4 w-4" />
              <span className="text-sm font-medium">ML</span>
            </>
          ) : (
            <>
              <CameraIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Photo</span>
            </>
          )}
        </motion.div>
      </div>
    </button>
  );
} 