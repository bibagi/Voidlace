// Утилиты для синхронизации данных между вкладками и устройствами

/**
 * Синхронизирует данные между вкладками через localStorage events
 */
export const setupStorageSync = () => {
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth-storage' || e.key === 'library-storage' || e.key === 'reader-settings') {
      // Перезагружаем страницу при изменении данных в другой вкладке
      window.location.reload();
    }
  });
};

/**
 * Экспортирует все данные пользователя для синхронизации
 */
export const exportUserData = () => {
  const data = {
    auth: localStorage.getItem('auth-storage'),
    library: localStorage.getItem('library-storage'),
    readerSettings: localStorage.getItem('reader-settings'),
    theme: localStorage.getItem('theme-storage'),
    timestamp: new Date().toISOString(),
  };
  
  return JSON.stringify(data);
};

/**
 * Импортирует данные пользователя
 */
export const importUserData = (jsonData: string) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.auth) localStorage.setItem('auth-storage', data.auth);
    if (data.library) localStorage.setItem('library-storage', data.library);
    if (data.readerSettings) localStorage.setItem('reader-settings', data.readerSettings);
    if (data.theme) localStorage.setItem('theme-storage', data.theme);
    
    return true;
  } catch (error) {
    console.error('Ошибка импорта данных:', error);
    return false;
  }
};

/**
 * Скачивает данные пользователя как файл
 */
export const downloadUserData = () => {
  const data = exportUserData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voidlace-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Загружает данные из файла
 */
export const uploadUserData = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importUserData(content);
      resolve(success);
    };
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Сохраняет данные в облако (через localStorage как временное решение)
 * В будущем можно заменить на реальный API
 */
export const saveToCloud = async (userId: string) => {
  const data = exportUserData();
  const cloudKey = `cloud-backup-${userId}`;
  localStorage.setItem(cloudKey, data);
  return true;
};

/**
 * Загружает данные из облака
 */
export const loadFromCloud = async (userId: string) => {
  const cloudKey = `cloud-backup-${userId}`;
  const data = localStorage.getItem(cloudKey);
  
  if (data) {
    return importUserData(data);
  }
  
  return false;
};

/**
 * Автоматическое резервное копирование
 */
export const setupAutoBackup = (intervalMinutes: number = 30) => {
  setInterval(() => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        if (auth.state?.user?.id) {
          saveToCloud(auth.state.user.id);
          console.log('Автоматическое резервное копирование выполнено');
        }
      } catch (error) {
        console.error('Ошибка автоматического резервного копирования:', error);
      }
    }
  }, intervalMinutes * 60 * 1000);
};
