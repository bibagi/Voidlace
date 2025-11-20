// Сервис синхронизации через Vercel API

const API_URL = '/api/sync';

export interface SyncData {
  auth?: string;
  library?: string;
  readerSettings?: string;
  theme?: string;
  lastSync?: string;
}

/**
 * Сохраняет данные пользователя в облако
 */
export const saveToCloud = async (userId: string): Promise<boolean> => {
  try {
    // Экспортируем всю БД
    const { exportDatabase } = await import('../db/database');
    const dbExport = await exportDatabase();
    
    // Собираем настройки из localStorage
    const authData = localStorage.getItem('auth-storage');
    const readerSettings = localStorage.getItem('reader-settings');
    const themeData = localStorage.getItem('theme-storage');

    // Оптимизируем auth данные
    let authToSave = '';
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        if (auth.state?.user) {
          authToSave = JSON.stringify({
            state: {
              user: auth.state.user,
              isAuthenticated: auth.state.isAuthenticated,
            }
          });
        }
      } catch (e) {
        console.error('Ошибка парсинга auth:', e);
      }
    }

    const data: SyncData = {
      auth: authToSave,
      library: dbExport, // Вся БД в одном поле
      readerSettings: readerSettings || '',
      theme: themeData || '',
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action: 'save',
        data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save data');
    }

    const result = await response.json();
    console.log('✅ Данные сохранены в облако');
    return result.success;
  } catch (error) {
    console.error('❌ Ошибка сохранения в облако:', error);
    return false;
  }
};

/**
 * Загружает данные пользователя из облака
 */
export const loadFromCloud = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action: 'load',
      }),
    });

    if (response.status === 404) {
      console.log('ℹ️ Данные в облаке не найдены');
      return false;
    }

    if (!response.ok) {
      throw new Error('Failed to load data');
    }

    const result = await response.json();
    const data: SyncData = result.data;

    // Восстанавливаем данные
    if (data.auth) {
      try {
        const cloudAuth = JSON.parse(data.auth);
        const localAuth = localStorage.getItem('auth-storage');
        
        if (localAuth) {
          const local = JSON.parse(localAuth);
          const merged = {
            state: {
              ...cloudAuth.state,
              savedAccounts: local.state?.savedAccounts || [],
            }
          };
          localStorage.setItem('auth-storage', JSON.stringify(merged));
        } else {
          localStorage.setItem('auth-storage', data.auth);
        }
      } catch (e) {
        console.error('Ошибка восстановления auth:', e);
      }
    }
    
    // Восстанавливаем всю БД
    if (data.library) {
      try {
        const { importDatabase } = await import('../db/database');
        await importDatabase(data.library);
      } catch (e) {
        console.error('Ошибка восстановления БД:', e);
      }
    }
    
    if (data.readerSettings) localStorage.setItem('reader-settings', data.readerSettings);
    if (data.theme) localStorage.setItem('theme-storage', data.theme);

    console.log('✅ Данные загружены из облака');
    return true;
  } catch (error) {
    console.error('❌ Ошибка загрузки из облака:', error);
    return false;
  }
};

/**
 * Проверяет, есть ли данные в облаке
 */
export const checkCloudForUpdates = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action: 'load',
      }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Автоматическая синхронизация
 */
export const setupAutoSync = (userId: string) => {
  // Сохраняем при изменении localStorage
  const handleStorageChange = () => {
    saveToCloud(userId);
  };

  window.addEventListener('storage', handleStorageChange);

  // Периодическое сохранение (каждые 5 минут)
  const interval = setInterval(() => {
    saveToCloud(userId);
  }, 5 * 60 * 1000);

  // Сохраняем при закрытии страницы
  const handleBeforeUnload = () => {
    // Используем sendBeacon для надежной отправки при закрытии
    const data = {
      userId,
      action: 'save',
      data: {
        auth: localStorage.getItem('auth-storage') || '',
        library: localStorage.getItem('library-storage') || '',
        readerSettings: localStorage.getItem('reader-settings') || '',
        theme: localStorage.getItem('theme-storage') || '',
      }
    };
    
    navigator.sendBeacon(API_URL, JSON.stringify(data));
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Функция очистки
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    clearInterval(interval);
  };
};
