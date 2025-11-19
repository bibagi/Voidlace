import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AvatarFrame } from '../types/user';

interface SavedAccount {
  user: User;
  lastActive: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  savedAccounts: SavedAccount[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchAccount: (userId: string) => void;
  removeAccount: (userId: string) => void;
  isAdmin: () => boolean;
  updateAvatar: (avatarUrl: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  updateAvatarFrame: (frame: Partial<AvatarFrame>) => void;
}

// Хардкод админа
const ADMIN_USERNAME = 'iuwfe';
const ADMIN_PASSWORD = 'seedeeek228';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      savedAccounts: [],
      
      login: async (username: string, password: string) => {
        let newUser: User | null = null;
        
        // Проверка админа
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          newUser = {
            id: 'admin-1',
            username: 'Admin',
            email: 'admin@voidlace.com',
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=0ea5e9&color=fff',
            createdAt: new Date().toISOString(),
            avatarFrame: {
              enabled: true,
              color: 'from-yellow-400 to-orange-500',
              animation: 'spin',
              thickness: 4,
            },
          };
        } else if (username && password) {
          // Обычный пользователь (для демо)
          newUser = {
            id: `user-${Date.now()}`,
            username: username,
            email: `${username}@example.com`,
            role: 'user',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
            createdAt: new Date().toISOString(),
            bio: '',
            telegram: '',
            discord: '',
            website: '',
          };
        }
        
        if (newUser) {
          const savedAccounts = get().savedAccounts;
          const existingIndex = savedAccounts.findIndex(acc => acc.user.id === newUser!.id);
          
          let updatedAccounts: SavedAccount[];
          if (existingIndex >= 0) {
            // Обновляем существующий аккаунт
            updatedAccounts = [...savedAccounts];
            updatedAccounts[existingIndex] = {
              user: newUser,
              lastActive: new Date().toISOString(),
            };
          } else {
            // Добавляем новый аккаунт
            updatedAccounts = [
              ...savedAccounts,
              { user: newUser, lastActive: new Date().toISOString() }
            ];
          }
          
          set({ 
            user: newUser, 
            isAuthenticated: true,
            savedAccounts: updatedAccounts
          });

          // Проверяем облачную синхронизацию
          try {
            const { checkCloudForUpdates, loadFromCloud, saveToCloud } = await import('../services/cloudSync');
            const hasUpdates = await checkCloudForUpdates(newUser.id);
            
            if (hasUpdates) {
              const shouldSync = confirm('Найдены данные в облаке. Загрузить их?');
              if (shouldSync) {
                await loadFromCloud(newUser.id);
                window.location.reload();
              }
            } else {
              // Сохраняем текущие данные в облако
              await saveToCloud(newUser.id);
            }
          } catch (error) {
            console.log('Облачная синхронизация недоступна:', error);
          }

          return true;
        }
        
        return false;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      switchAccount: (userId: string) => {
        const savedAccounts = get().savedAccounts;
        const account = savedAccounts.find(acc => acc.user.id === userId);
        
        if (account) {
          const updatedAccounts = savedAccounts.map(acc =>
            acc.user.id === userId
              ? { ...acc, lastActive: new Date().toISOString() }
              : acc
          );
          
          set({ 
            user: account.user, 
            isAuthenticated: true,
            savedAccounts: updatedAccounts
          });
        }
      },
      
      removeAccount: (userId: string) => {
        const savedAccounts = get().savedAccounts;
        const updatedAccounts = savedAccounts.filter(acc => acc.user.id !== userId);
        
        // Если удаляем текущий аккаунт
        if (get().user?.id === userId) {
          if (updatedAccounts.length > 0) {
            // Переключаемся на другой аккаунт
            set({ 
              user: updatedAccounts[0].user, 
              isAuthenticated: true,
              savedAccounts: updatedAccounts
            });
          } else {
            // Выходим полностью
            set({ 
              user: null, 
              isAuthenticated: false,
              savedAccounts: []
            });
          }
        } else {
          set({ savedAccounts: updatedAccounts });
        }
      },
      
      isAdmin: () => {
        return get().user?.role === 'admin';
      },
      
      updateAvatar: (avatarUrl: string) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, avatar: avatarUrl } });
        }
      },
      
      updateProfile: (updates: Partial<User>) => {
        const user = get().user;
        if (user) {
          const updatedUser = { ...user, ...updates };
          const savedAccounts = get().savedAccounts;
          
          // Обновляем в savedAccounts
          const updatedAccounts = savedAccounts.map(acc =>
            acc.user.id === user.id
              ? { ...acc, user: updatedUser }
              : acc
          );
          
          set({ 
            user: updatedUser,
            savedAccounts: updatedAccounts
          });
        }
      },
      
      updateAvatarFrame: (frame: Partial<AvatarFrame>) => {
        const user = get().user;
        if (user) {
          const updatedUser = { 
            ...user, 
            avatarFrame: { ...user.avatarFrame, ...frame } as AvatarFrame 
          };
          const savedAccounts = get().savedAccounts;
          
          // Обновляем в savedAccounts
          const updatedAccounts = savedAccounts.map(acc =>
            acc.user.id === user.id
              ? { ...acc, user: updatedUser }
              : acc
          );
          
          set({ 
            user: updatedUser,
            savedAccounts: updatedAccounts
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
