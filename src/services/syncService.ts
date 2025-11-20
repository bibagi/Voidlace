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
export const saveToCloud = async (userId: string, silent = false): Promise<boolean> => {
  try {
    if (!silent) {
      window.dispatchEvent(new CustomEvent('sync:start'));
    }

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
    
    if (!silent) {
      window.dispatchEvent(new CustomEvent('sync:success'));
    }
    
    return result.success;
  } catch (error) {
    console.error('❌ Ошибка сохранения в облако:', error);
    
    if (!silent) {
      window.dispatchEvent(new CustomEvent('sync:error'));
    }
    
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
  let lastSyncTime = Date.now();
  let syncTimeout: NodeJS.Timeout | null = null;

  // Дебаунс для предотвращения частых сохранений
  const debouncedSave = () => {
    if (syncTimeout) clearTimeout(syncTimeout);
    
    syncTimeout = setTimeout(() => {
      const now = Date.now();
      // Сохраняем не чаще раза в 30 секунд
      if (now - lastSyncTime > 30000) {
        saveToCloud(userId, true); // silent mode для фоновой синхронизации
        lastSyncTime = now;
      }
    }, 2000); // Ждем 2 секунды после последнего изменения
  };

  // Отслеживаем изменения в localStorage
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key && ['auth-storage', 'reader-settings', 'theme-storage'].includes(e.key)) {
      console.log('📝 Изменения в localStorage, планируем синхронизацию...');
      debouncedSave();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Периодическое сохранение (каждые 3 минуты)
  const interval = setInterval(() => {
    console.log('⏰ Периодическая синхронизация...');
    saveToCloud(userId, true);
    lastSyncTime = Date.now();
  }, 3 * 60 * 1000);

  // Сохраняем при закрытии страницы
  const handleBeforeUnload = async () => {
    console.log('👋 Сохранение перед закрытием...');
    // Синхронное сохранение перед закрытием
    await saveToCloud(userId, true);
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Сохраняем при потере фокуса (переключение вкладки)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('👁️ Вкладка скрыта, сохраняем...');
      saveToCloud(userId, true);
      lastSyncTime = Date.now();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Начальная синхронизация
  console.log('☁️ Начальная синхронизация...');
  saveToCloud(userId, false); // Показываем индикатор при первой синхронизации

  // Функция очистки
  return () => {
    if (syncTimeout) clearTimeout(syncTimeout);
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    clearInterval(interval);
    console.log('🛑 Автосинхронизация остановлена');
  };
};
