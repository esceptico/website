import { useThemeStore } from '@/store/theme';
import { ThemeColors } from '@/types';
import { useMemo } from 'react';
import { getThemeColors, getGradientBackground } from '@/utils/theme';

export function useTheme() {
  const { mode, colorScheme, toggleMode } = useThemeStore();
  const isDark = colorScheme === 'dark';

  const colors = useMemo<ThemeColors>(() => 
    getThemeColors(isDark, mode),
    [isDark, mode]
  );

  const gradientBackground = useMemo(() => 
    getGradientBackground(isDark, mode),
    [mode, isDark]
  );

  return {
    mode,
    isDark,
    colors,
    gradientBackground,
    toggleMode
  };
} 
