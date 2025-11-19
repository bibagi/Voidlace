import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserPreferences } from '../types';

interface ThemeStore extends UserPreferences {
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (language: UserPreferences['language']) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'ru',
      
      setTheme: (theme) => {
        set({ theme });
        get().initTheme();
      },
      
      setLanguage: (language) => set({ language }),
      
      initTheme: () => {
        const { theme } = get();
        const root = window.document.documentElement;
        
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Инициализация темы при загрузке
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useThemeStore.getState().initTheme();
  }, 0);
  
  // Слушаем изменения системной темы
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useThemeStore.getState().theme === 'system') {
      useThemeStore.getState().initTheme();
    }
  });
}
