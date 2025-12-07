import { ThemeColors } from '@/types';
import { colors } from '@/constants';

export function getThemeColors(isDark: boolean): ThemeColors {
  return {
    '--theme-bg-primary': isDark ? colors.background.primary.dark : colors.background.primary.light,
    '--theme-text-primary': isDark ? colors.text.primary.dark : colors.text.primary.light,
    '--theme-text-secondary': isDark ? colors.text.secondary.dark : colors.text.secondary.light,
    '--theme-border': isDark ? colors.border.primary.dark : colors.border.primary.light,
  };
}
