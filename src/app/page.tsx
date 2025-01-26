'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { pageTransition, gradientConfig } from '@/constants/animation';
import { textColors } from '@/constants/colors';
import { Mode } from '@/types/theme';

interface SectionProps {
  mode: Mode;
  title: string;
  subtitle: string;
  description: string;
  hoveredSide: Mode | null;
  selectedSide: Mode | null;
  isMobile: boolean;
  isDark: boolean;
  onHover: (mode: Mode | null) => void;
  onModeChange: (mode: Mode) => void;
}

const Section = ({ 
  mode, 
  title, 
  subtitle, 
  description, 
  hoveredSide, 
  selectedSide,
  isMobile,
  isDark,
  onHover,
  onModeChange 
}: SectionProps) => {
  const config = gradientConfig[mode];
  const isHovered = hoveredSide === mode;
  const isSelected = selectedSide === mode;
  const isOtherHovered = hoveredSide && hoveredSide !== mode;

  return (
    <motion.div 
      className="relative px-6 md:px-12 text-center"
      onMouseEnter={() => onHover(mode)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onModeChange(mode)}
      initial={isMobile ? { opacity: 0.8 } : undefined}
      whileTap={isMobile ? { scale: 0.98 } : undefined}
    >
      <motion.div 
        className="cursor-pointer mx-auto max-w-md"
        animate={{ 
          x: !isMobile ? (isHovered ? (mode === 'mle' ? 40 : -40) : isOtherHovered ? (mode === 'mle' ? -16 : 16) : 0) : 0,
          y: isMobile ? (isHovered ? -20 : isOtherHovered ? 8 : 0) : 0,
          opacity: isMobile 
            ? (selectedSide === null || isSelected ? 1 : 0.3)
            : (isOtherHovered ? 0.3 : 1),
          scale: isMobile && isSelected ? 1.05 : 1
        }}
        transition={pageTransition}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-light tracking-tight"
          animate={{ 
            color: (isHovered || isSelected)
              ? isDark ? config.textDark : config.textLight
              : isDark ? textColors.primary.dark : textColors.primary.light
          }}
          transition={pageTransition}
        >
          {title}
          <motion.span 
            className="block text-lg md:text-xl mt-1 md:mt-2"
            animate={{ 
              color: isDark ? config.textDark : config.textLight
            }}
            transition={pageTransition}
          >
            {subtitle}
          </motion.span>
        </motion.h2>

        <motion.p
          className="max-w-md mx-auto mt-3 md:mt-4 text-sm md:text-base"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : -20,
            color: isDark ? textColors.secondary.dark : textColors.secondary.light
          }}
          transition={pageTransition}
        >
          {description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

const Divider = ({ hoveredSide, isDark }: { hoveredSide: Mode | null, isDark: boolean }) => (
  <motion.div 
    className="hidden md:block absolute left-1/2 -translate-x-px w-px"
    style={{
      background: 'linear-gradient(to bottom, transparent, currentColor, transparent)',
      height: '3rem',
      top: '1.5rem'
    }}
    animate={{ 
      scaleY: hoveredSide ? 6 : 1,
      opacity: hoveredSide ? 0.4 : 0.2,
      x: hoveredSide === 'mle' 
        ? 20
        : hoveredSide === 'photography'
        ? -20
        : 0,
      color: hoveredSide === 'mle' 
        ? isDark ? gradientConfig.mle.textDark : gradientConfig.mle.textLight
        : hoveredSide === 'photography'
        ? isDark ? gradientConfig.photography.textDark : gradientConfig.photography.textLight
        : isDark ? textColors.muted.dark : textColors.muted.light,
      transformOrigin: 'center'
    }}
    transition={{
      ...pageTransition,
      scaleY: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }
    }}
  />
);

export default function Home() {
  const { setMode, colorScheme } = useThemeStore();
  const router = useRouter();
  const [hoveredSide, setHoveredSide] = useState<Mode | null>(null);
  const [selectedSide, setSelectedSide] = useState<Mode | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleModeChange = (mode: Mode) => {
    if (isMobile) {
      if (selectedSide === mode) {
        setMode(mode);
        router.push(mode === 'mle' ? '/projects' : '/portfolio');
      } else {
        setSelectedSide(mode);
        setHoveredSide(mode);
      }
    } else {
      setMode(mode);
      router.push(mode === 'mle' ? '/projects' : '/portfolio');
    }
  };

  const handleHover = (mode: Mode | null) => {
    if (!isMobile) {
      setHoveredSide(mode);
    }
  };

  const getGradientBackground = () => {
    if (!hoveredSide) return 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, transparent 0%)';
    
    const config = hoveredSide === 'mle' ? gradientConfig.mle : gradientConfig.photography;
    const position = isMobile 
      ? hoveredSide === 'mle' ? '50% 25%' : '50% 75%'
      : hoveredSide === 'mle' ? '35% 50%' : '65% 50%';
    return `radial-gradient(circle at ${position}, ${isDark ? config.dark : config.light} 0%, transparent 50%)`;
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center relative overflow-hidden py-12 md:py-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...pageTransition, delay: 0.1 }}
    >
      {/* Background gradients */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={{ 
          opacity: hoveredSide ? 1 : 0,
          background: getGradientBackground()
        }}
        transition={pageTransition}
      />

      <div className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-16 md:gap-0 relative">
        <Section 
          mode="mle"
          title="Machine Learning"
          subtitle="Engineer"
          description="Developing intelligent systems and algorithms that push the boundaries of artificial intelligence. Specializing in computer vision and natural language processing."
          hoveredSide={hoveredSide}
          selectedSide={selectedSide}
          isMobile={isMobile}
          isDark={isDark}
          onHover={handleHover}
          onModeChange={handleModeChange}
        />

        <Divider hoveredSide={hoveredSide} isDark={isDark} />

        <Section 
          mode="photography"
          title="Visual Stories"
          subtitle="Photography"
          description="Capturing moments and emotions through the lens, specializing in portrait and landscape photography. Creating visual narratives that resonate."
          hoveredSide={hoveredSide}
          selectedSide={selectedSide}
          isMobile={isMobile}
          isDark={isDark}
          onHover={handleHover}
          onModeChange={handleModeChange}
        />
      </div>
    </motion.div>
  );
}
