'use client';

import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/store/theme';

const transition = {
  duration: 0.2,
  ease: [0.43, 0.13, 0.23, 0.96]
};

export default function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';

  return (
    <button
      onClick={toggleColorScheme}
      className={`fixed bottom-6 right-6 p-3 rounded-full backdrop-blur-sm border transition-colors ${
        isDark 
          ? 'bg-gray-900/50 border-gray-800 hover:bg-gray-900/70' 
          : 'bg-white/50 border-gray-200 hover:bg-white/70'
      }`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-6 h-6">
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
            rotate: isDark ? 0 : 90,
          }}
          transition={transition}
          className="absolute inset-0"
        >
          <MoonIcon className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
            rotate: isDark ? -90 : 0,
          }}
          transition={transition}
          className="absolute inset-0"
        >
          <SunIcon className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
        </motion.div>
      </div>
    </button>
  );
} 
