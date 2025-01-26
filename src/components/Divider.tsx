import { motion } from 'framer-motion';
import { Mode } from '@/types/theme';
import { pageTransition, gradientConfig } from '@/constants/animation';
import { textColors } from '@/constants/colors';

interface DividerProps {
  hoveredSide: Mode | null;
  isDark: boolean;
}

export const Divider = ({ hoveredSide, isDark }: DividerProps) => (
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