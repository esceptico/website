import { Mode, ThemeColors } from '@/types';
import { colors, gradients } from '@/constants';

export function getThemeColors(isDark: boolean, mode: Mode): ThemeColors {
  return {
    '--theme-bg-primary': isDark ? colors.background.primary.dark : colors.background.primary.light,
    '--theme-text-primary': isDark ? colors.text.primary.dark : colors.text.primary.light,
    '--theme-text-secondary': isDark ? colors.text.secondary.dark : colors.text.secondary.light,
    '--theme-accent-primary': isDark ? gradients[mode].textDark : gradients[mode].textLight,
    '--theme-border': isDark ? colors.border.primary.dark : colors.border.primary.light,
  };
}

export function getGradientBackground(isDark: boolean, mode: Mode): string {
  return mode === 'mle'
    ? `linear-gradient(to right, ${isDark ? gradients.mle.dark : gradients.mle.light} 0%, transparent 50%)`
    : `linear-gradient(to left, ${isDark ? gradients.photography.dark : gradients.photography.light} 0%, transparent 50%)`;
}
