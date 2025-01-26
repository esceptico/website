import { gradientConfig } from './animation';
import { textColors, backgroundColors, borderColors } from './colors';
import { Mode, ThemeColors } from '@/types/theme';

export const getThemeColors = (isDark: boolean, mode: Mode): ThemeColors => ({
  '--theme-text-primary': isDark ? textColors.primary.dark : textColors.primary.light,
  '--theme-text-secondary': isDark ? textColors.secondary.dark : textColors.secondary.light,
  '--theme-accent-primary': mode === 'mle' 
    ? (isDark ? gradientConfig.mle.textDark : gradientConfig.mle.textLight)
    : (isDark ? gradientConfig.photography.textDark : gradientConfig.photography.textLight),
  '--theme-accent-secondary': mode === 'mle'
    ? (isDark ? 'rgb(99, 102, 241)' : 'rgb(79, 70, 229)')
    : (isDark ? 'rgb(234, 88, 12)' : 'rgb(234, 88, 12)'),
  '--theme-bg-card': isDark ? backgroundColors.card.dark : backgroundColors.card.light,
  '--theme-border': isDark ? borderColors.primary.dark : borderColors.primary.light,
  '--theme-bg': isDark ? backgroundColors.primary.dark : backgroundColors.primary.light
}); 
