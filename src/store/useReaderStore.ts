import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReaderSettings } from '../types';

interface ReaderStore extends ReaderSettings {
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: ReaderSettings = {
  fontSize: 18,
  fontFamily: 'baskerville',
  lineHeight: 1.8,
  textWidth: 700,
  padding: 40,
  theme: 'white',
  autoScroll: false,
  autoScrollSpeed: 3,
  ttsEnabled: false,
  ttsVoice: '',
  ttsRate: 1,
  blueLight: false,
};

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'reader-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
