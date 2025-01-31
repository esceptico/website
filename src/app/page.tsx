'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mode } from '@/types/theme';
import { Section } from '@/components/Section';
import { Divider } from '@/components/Divider';
import { Background } from '@/components/Background';
import { PersonalInfo } from '@/components/PersonalInfo';
import { sections } from '@/constants/sections';
import { useDevice } from '@/hooks/useDevice';

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
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: {
            duration: 0.4,
            when: "beforeChildren"
          }
        }
      }}
    >
      <Background 
        hoveredSide={hoveredSide}
        isDark={isDark}
        isMobile={isMobile}
      />

      <PersonalInfo hoveredSide={hoveredSide} isDark={isDark} />

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
