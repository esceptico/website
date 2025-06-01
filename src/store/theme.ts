import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ColorScheme = 'light' | 'dark';

interface ThemeState {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorScheme: 'dark',
      setColorScheme: (colorScheme) => set({ colorScheme }),
      toggleColorScheme: () => set((state) => ({ 
        colorScheme: state.colorScheme === 'dark' ? 'light' : 'dark' 
      })),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
