import { create } from 'zustand';
import { LibraryItem, ReadingProgress } from '../types';
import { libraryDB, progressDB } from '../db/database';

interface LibraryStore {
  library: LibraryItem[];
  readingProgress: Record<string, ReadingProgress>;
  
  loadData: () => Promise<void>;
  addToLibrary: (novelId: string) => Promise<void>;
  removeFromLibrary: (novelId: string) => Promise<void>;
  toggleFavorite: (novelId: string) => Promise<void>;
  updateStatus: (novelId: string, status: LibraryItem['status']) => Promise<void>;
  isInLibrary: (novelId: string) => boolean;
  isFavorite: (novelId: string) => boolean;
  
  updateProgress: (progress: ReadingProgress) => Promise<void>;
  getProgress: (novelId: string) => ReadingProgress | undefined;
  getChapterProgress: (chapterId: string) => number;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  library: [],
  readingProgress: {},
  
  loadData: async () => {
    // Получаем текущего пользователя
    const authData = localStorage.getItem('auth-storage');
    if (!authData) return;
    
    const parsed = JSON.parse(authData);
    const userId = parsed.state?.user?.id;
    if (!userId) return;
    
    const library = await libraryDB.getAll(userId);
    const readingProgress = await progressDB.getAll(userId);
    set({ library, readingProgress });
  },
  
  addToLibrary: async (novelId) => {
    const authData = localStorage.getItem('auth-storage');
    if (!authData) return;
    const parsed = JSON.parse(authData);
    const userId = parsed.state?.user?.id;
    if (!userId) return;
    
    const exists = get().library.find(item => item.novelId === novelId);
    if (!exists) {
      const newItem: LibraryItem = {
        userId,
        novelId,
        addedDate: new Date().toISOString(),
        isFavorite: false,
        status: 'reading',
      };
      await libraryDB.add(newItem);
      set((state) => ({
        library: [...state.library, newItem],
      }));
    }
  },
  
  removeFromLibrary: async (novelId) => {
    const authData = localStorage.getItem('auth-storage');
    if (!authData) return;
    const parsed = JSON.parse(authData);
    const userId = parsed.state?.user?.id;
    if (!userId) return;
    
    await libraryDB.remove(userId, novelId);
    set((state) => ({
      library: state.library.filter(item => item.novelId !== novelId),
    }));
  },
  
  toggleFavorite: async (novelId) => {
    const authData = localStorage.getItem('auth-storage');
    if (!authData) return;
    const parsed = JSON.parse(authData);
    const userId = parsed.state?.user?.id;
    if (!userId) return;
    
    await libraryDB.toggleFavorite(userId, novelId);
    set((state) => ({
      library: state.library.map(item =>
        item.novelId === novelId
          ? { ...item, isFavorite: !item.isFavorite }
          : item
      ),
    }));
  },
  
  updateStatus: async (novelId, status) => {
    const item = get().library.find(i => i.novelId === novelId);
    if (item) {
      await libraryDB.add({ ...item, status });
      set((state) => ({
        library: state.library.map(item =>
          item.novelId === novelId ? { ...item, status } : item
        ),
      }));
    }
  },
  
  isInLibrary: (novelId) => {
    return get().library.some(item => item.novelId === novelId);
  },
  
  isFavorite: (novelId) => {
    const item = get().library.find(item => item.novelId === novelId);
    return item?.isFavorite || false;
  },
  
  updateProgress: async (progress) => {
    const authData = localStorage.getItem('auth-storage');
    if (!authData) return;
    const parsed = JSON.parse(authData);
    const userId = parsed.state?.user?.id;
    if (!userId) return;
    
    const progressWithUser = { ...progress, userId };
    await progressDB.update(progressWithUser);
    set((state) => ({
      readingProgress: {
        ...state.readingProgress,
        [progress.novelId]: progressWithUser,
      },
    }));
  },
  
  getProgress: (novelId) => {
    return get().readingProgress[novelId];
  },
  
  getChapterProgress: (chapterId) => {
    const progress = Object.values(get().readingProgress).find(
      p => p.chapterId === chapterId
    );
    return progress?.progress || 0;
  },
}));
