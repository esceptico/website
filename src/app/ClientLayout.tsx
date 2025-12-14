'use client';

import ColorSchemeToggle from "@/components/theme/ColorSchemeToggle";
import { motion } from 'framer-motion';

const transitions = {
  page: {
    duration: 0.4,
    ease: [0.43, 0.13, 0.23, 0.96],
  },
} as const;

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Skip to main content link for keyboard accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--theme-bg-primary)] focus:text-[var(--theme-text-primary)] focus:border focus:border-[var(--theme-border)] focus:rounded"
      >
        Skip to main content
      </a>
      
      <div className="min-h-screen relative pt-16">
        {/* Theme Toggle - Top Right */}
        <div className="fixed top-0 right-6 z-50 h-14 flex items-center">
          <ColorSchemeToggle />
        </div>

        <motion.main
          id="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transitions.page}
        >
          {children}
        </motion.main>
      </div>
    </>
  );
} 