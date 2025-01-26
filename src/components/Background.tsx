import { motion } from 'framer-motion';
import { Mode } from '@/types/theme';
import { pageTransition, gradientConfig } from '@/constants/animation';

interface BackgroundProps {
  hoveredSide: Mode | null;
  isDark: boolean;
  isMobile: boolean;
}

const getGradientBackground = (hoveredSide: Mode | null, isDark: boolean, isMobile: boolean) => {
  if (!hoveredSide) {
    return 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, transparent 0%)';
  }
  
  const config = hoveredSide === 'mle' ? gradientConfig.mle : gradientConfig.photography;
  const position = isMobile 
    ? hoveredSide === 'mle' ? '50% 25%' : '50% 75%'
    : hoveredSide === 'mle' ? '35% 50%' : '65% 50%';
  return `radial-gradient(circle at ${position}, ${isDark ? config.dark : config.light} 0%, transparent 50%)`;
};

export const Background = ({ hoveredSide, isDark, isMobile }: BackgroundProps) => (
  <motion.div
    className="absolute inset-0 pointer-events-none"
    initial={false}
    animate={{ 
      opacity: hoveredSide ? 1 : 0,
      background: getGradientBackground(hoveredSide, isDark, isMobile)
    }}
    transition={pageTransition}
  />
); 