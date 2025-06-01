import { ThemeColors } from '@/types';
import { colors, gradients } from '@/constants';

export function getThemeColors(isDark: boolean): ThemeColors {
  return {
    '--theme-bg-primary': isDark ? colors.background.primary.dark : colors.background.primary.light,
    '--theme-card-bg': isDark ? colors.background.card.dark : colors.background.card.light,
    '--theme-text-primary': isDark ? colors.text.primary.dark : colors.text.primary.light,
    '--theme-text-secondary': isDark ? colors.text.secondary.dark : colors.text.secondary.light,
    '--theme-accent-primary': isDark ? gradients.mle.textDark : gradients.mle.textLight,
    '--theme-border': isDark ? colors.border.primary.dark : colors.border.primary.light,
  };
}
