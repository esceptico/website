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

  // Simplified styling, adjust as needed for a sleek look
  const buttonClasses = "p-2 rounded-md hover:bg-[var(--theme-border)] transition-colors";

  return (
    <button
      onClick={toggleColorScheme}
      className={buttonClasses}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
          }}
          transition={transition}
          className="absolute inset-0"
        >
          <MoonIcon className={`w-5 h-5 text-[var(--theme-text-secondary)]`} />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
          }}
          transition={transition}
          className="absolute inset-0"
        >
          <SunIcon className={`w-5 h-5 text-[var(--theme-text-secondary)]`} />
        </motion.div>
      </div>
    </button>
  );
} 
