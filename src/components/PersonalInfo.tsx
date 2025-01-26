import { motion } from 'framer-motion';
import { Mode } from '@/types/theme';
import { pageTransition, gradientConfig } from '@/constants/animation';
import { textColors } from '@/constants/colors';

interface PersonalInfoProps {
  hoveredSide: Mode | null;
  isDark: boolean;
}

export const PersonalInfo = ({ hoveredSide, isDark }: PersonalInfoProps) => (
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
); 