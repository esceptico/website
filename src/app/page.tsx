'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { pageTransition } from '@/constants/animation';
import { Mode } from '@/types/theme';
import { Section } from '@/components/Section';
import { Divider } from '@/components/Divider';
import { Background } from '@/components/Background';
import { sections } from '@/constants/sections';
import { useDevice } from '@/hooks/useDevice';
import { gradientConfig } from '@/constants/animation';
import { textColors } from '@/constants/colors';

export default function Home() {
  const { setMode, colorScheme } = useThemeStore();
  const router = useRouter();
  const { isMobile } = useDevice();
  const [hoveredSide, setHoveredSide] = useState<Mode | null>(null);
  const [selectedSide, setSelectedSide] = useState<Mode | null>(null);
  const isDark = colorScheme === 'dark';
  
  const handleModeChange = (mode: Mode) => {
    if (isMobile) {
      if (selectedSide === mode) {
        setMode(mode);
        router.push(sections.find(s => s.mode === mode)?.path || '/');
      } else {
        setSelectedSide(mode);
        setHoveredSide(mode);
      }
    } else {
      setMode(mode);
      router.push(sections.find(s => s.mode === mode)?.path || '/');
    }
  };

  const handleHover = (mode: Mode | null) => {
    if (!isMobile) {
      setHoveredSide(mode);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col justify-center relative overflow-hidden py-12 md:py-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...pageTransition, delay: 0.1 }}
    >
      <Background 
        hoveredSide={hoveredSide}
        isDark={isDark}
        isMobile={isMobile}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...pageTransition, delay: 0.2 }}
        className={`text-center mb-16 relative ${hoveredSide ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
      >
        <motion.h1 
          className="text-5xl font-light tracking-wide mb-4"
          animate={{ 
            color: hoveredSide === 'mle' 
              ? isDark ? gradientConfig.mle.textDark : gradientConfig.mle.textLight
              : hoveredSide === 'photography'
                ? isDark ? gradientConfig.photography.textDark : gradientConfig.photography.textLight
                : isDark ? textColors.primary.dark : textColors.primary.light
          }}
          transition={pageTransition}
        >
          Timur Ganiev
        </motion.h1>
        <p className="text-lg text-[var(--theme-text-secondary)] max-w-2xl mx-auto px-4 leading-relaxed">
          Based in San Francisco Bay Area
        </p>
      </motion.div>

      <div className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-16 md:gap-0 relative">
        {sections.map((section, index) => (
          <div key={section.mode} className="contents">
            <Section 
              {...section}
              hoveredSide={hoveredSide}
              selectedSide={selectedSide}
              isMobile={isMobile}
              isDark={isDark}
              onHover={handleHover}
              onModeChange={handleModeChange}
            />
            {index === 0 && <Divider hoveredSide={hoveredSide} isDark={isDark} />}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
