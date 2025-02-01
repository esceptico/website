import { motion } from 'framer-motion';
import { Mode } from '@/types';
import { colors, gradients } from '@/constants';

interface PersonalInfoProps {
  hoveredSide: Mode | null;
  isDark: boolean;
}

export const PersonalInfo = ({ hoveredSide, isDark }: PersonalInfoProps) => (
  <motion.div 
    className={`text-center mb-16 relative ${hoveredSide ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
  >
    <motion.h1 
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        color: hoveredSide === 'mle' 
          ? isDark ? gradients.mle.textDark : gradients.mle.textLight
          : hoveredSide === 'photography'
            ? isDark ? gradients.photography.textDark : gradients.photography.textLight
            : isDark ? colors.text.primary.dark : colors.text.primary.light
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="text-5xl font-light tracking-wide mb-4"
    >
      Timur Ganiev
    </motion.h1>
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="text-lg text-[var(--theme-text-secondary)] max-w-2xl mx-auto px-4 leading-relaxed"
    >
      Based in Yerevan
    </motion.p>
  </motion.div>
);
