import { motion } from 'framer-motion';
import { Mode } from '@/types';
import { colors, gradients } from '@/constants/theme';
import { transitions } from '@/constants/animation';

interface DividerProps {
  hoveredSide: Mode | null;
  isDark: boolean;
}

export const Divider = ({ hoveredSide, isDark }: DividerProps) => {
  const currentColor = hoveredSide === 'mle' 
    ? isDark ? gradients.mle.textDark : gradients.mle.textLight
    : hoveredSide === 'photography'
    ? isDark ? gradients.photography.textDark : gradients.photography.textLight
    : isDark ? colors.text.primary.dark : colors.text.primary.light;

  return (
    <motion.div 
      className="hidden md:block absolute left-1/2 -translate-x-px w-px transition-[background-image] duration-300"
      style={{
        background: `linear-gradient(to bottom, transparent, ${currentColor}, transparent)`,
        height: '2rem',
        top: '3rem'
      }}
      animate={{ 
        scaleY: hoveredSide ? 4 : 1,
        opacity: hoveredSide ? 0.4 : 0.2,
        x: hoveredSide === 'mle' 
          ? 20
          : hoveredSide === 'photography'
          ? -20
          : 0
      }}
      transition={{
        ...transitions.page,
        scaleY: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }
      }}
    />
  );
}; 