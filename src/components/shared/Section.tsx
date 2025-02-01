import { motion } from 'framer-motion';
import { Mode } from '@/types';
import { colors, gradients } from '@/constants';
import { transitions } from '@/constants/animation';

export interface SectionProps {
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

export const Section = ({ 
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
  const config = gradients[mode];
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
        transition={transitions.page}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-light tracking-tight"
          animate={{ 
            color: (isHovered || isSelected)
              ? isDark ? colors.text.primary.dark : colors.text.primary.light
              : isDark ? colors.text.primary.dark : colors.text.primary.light
          }}
          transition={transitions.page}
        >
          {title}
          <motion.span 
            className="block text-lg md:text-xl mt-1 md:mt-2"
            animate={{ 
              color: isDark ? config.textDark : config.textLight
            }}
            transition={transitions.page}
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
            color: isDark ? colors.text.secondary.dark : colors.text.secondary.light
          }}
          transition={transitions.page}
        >
          {description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}; 