import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Mode } from '@/types';

export type ColorScheme = 'light' | 'dark';

interface ThemeState {
  mode: Mode;
  colorScheme: ColorScheme;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
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

function getInitialMode(): Mode {
  if (typeof window === 'undefined') return 'mle';
  
  try {
    const stored = localStorage.getItem('theme-storage');
    if (!stored) return 'mle';
    
    const { state } = JSON.parse(stored);
    return state.mode || 'mle';
  } catch {
    return 'mle';
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: getInitialMode(),
      colorScheme: 'dark',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((state) => ({ 
        mode: state.mode === 'mle' ? 'photography' : 'mle' 
      })),
      setColorScheme: (colorScheme) => set({ colorScheme }),
      toggleColorScheme: () => set((state) => ({ 
        colorScheme: state.colorScheme === 'dark' ? 'light' : 'dark' 
      })),
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
      storage: createJSONStorage(() => localStorage)
    }
  )
);
