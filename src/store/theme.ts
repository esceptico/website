import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'mle' | 'photography';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  backgroundColors: {
    mle: {
      primary: string;
      secondary: string;
      accent: string;
    };
    photography: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'mle',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'mle' ? 'photography' : 'mle' })),
      backgroundColors: {
        mle: {
          primary: '#E0E7FF',   // indigo-100
          secondary: '#C7D2FE', // indigo-200
          accent: '#4F46E5',    // indigo-600
        },
        photography: {
          primary: '#FEF3C7',   // amber-100
          secondary: '#FDE68A', // amber-200
          accent: '#D97706',    // amber-600
        },
      },
    }),
    {
      name: 'theme-storage',
    }
  )
); 