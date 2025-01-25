'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useThemeStore } from '@/store/theme';

export default function AnimatedBackground() {
  const { mode, backgroundColors } = useThemeStore();
  const { scrollY } = useScroll();

  // Reduce parallax range and make it more subtle
  const y1 = useTransform(scrollY, [0, 1000], [0, 100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  const colors = backgroundColors[mode];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          backgroundColor: colors.primary,
          willChange: 'transform',
        }}
      />
      
      {/* Optimized blobs with reduced blur and simpler animations */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-2xl opacity-40"
        initial={{ x: 0, y: 0 }}
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          top: '5%',
          left: '10%',
          backgroundColor: colors.secondary,
          y: y1,
          willChange: 'transform',
        }}
      />
      
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-2xl opacity-30"
        initial={{ x: 0, y: 0 }}
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          top: '30%',
          right: '10%',
          backgroundColor: colors.accent,
          y: y2,
          willChange: 'transform',
        }}
      />
    </div>
  );
} 