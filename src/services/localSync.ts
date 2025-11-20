// Локальная синхронизация через файлы без облачных сервисов

import { exportDatabase, importDatabase } from '../db/database';

/**
 * Автоматически экспортирует БД в файл при изменениях
 */
export const autoExportDatabase = async () => {
  try {
    const data = await exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Сохраняем в localStorage для быстрого доступа
    localStorage.setItem('voidlace-db-backup', data);
    localStorage.setItem('voidlace-db-backup-date', new Date().toISOString());
    
    console.log('✅ БД автоматически сохранена');
    
    // Очищаем URL
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка автоэкспорта БД:', error);
    return false;
  }
};

/**
 * Скачивает БД как файл
 */
export const downloadDatabase = async () => {
  try {
    const data = await exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voidlace-full-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ БД скачана');
    return true;
  } catch (error) {
    console.error('❌ Ошибка скачивания БД:', error);
    return false;
  }
};

/**
 * Загружает БД из файла
 */
export const uploadDatabase = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const success = await importDatabase(content);
        
        if (success) {
          // Сохраняем в localStorage
          localStorage.setItem('voidlace-db-backup', content);
          localStorage.setItem('voidlace-db-backup-date', new Date().toISOString());
          console.log('✅ БД загружена из файла');
        }
        
        resolve(success);
      } catch (error) {
        console.error('❌ Ошибка загрузки БД:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Восстанавливает БД из localStorage
 */
export const restoreFromLocalStorage = async (): Promise<boolean> => {
  try {
    const backup = localStorage.getItem('voidlace-db-backup');
    if (!backup) {
      console.log('ℹ️ Резервная копия не найдена');
      return false;
    }
    
    const success = await importDatabase(backup);
    if (success) {
      console.log('✅ БД восстановлена из localStorage');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Ошибка восстановления БД:', error);
    return false;
  }
};

/**
 * Получает информацию о последнем бэкапе
 */
export const getBackupInfo = () => {
  const date = localStorage.getItem('voidlace-db-backup-date');
  const hasBackup = !!localStorage.getItem('voidlace-db-backup');
  
  return {
    hasBackup,
    lastBackupDate: date ? new Date(date) : null,
  };
};

/**
 * Настройка автоматической синхронизации
 */
export const setupAutoSync = () => {
  // Сохраняем при изменении данных в IndexedDB
  let syncTimeout: ReturnType<typeof setTimeout>;
  
  const triggerSync = () => {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      autoExportDatabase();
    }, 2000); // Задержка 2 секунды после последнего изменения
  };
  
  // Слушаем изменения в localStorage (между вкладками)
  window.addEventListener('storage', (e) => {
    if (e.key?.startsWith('voidlace-')) {
      triggerSync();
    }
  });
  
  // Периодическое сохранение (каждые 5 минут)
  const interval = setInterval(() => {
    autoExportDatabase();
  }, 5 * 60 * 1000);
  
  // Сохраняем при закрытии страницы
  const handleBeforeUnload = () => {
    autoExportDatabase();
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Сохраняем при потере фокуса (переключение вкладки)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      autoExportDatabase();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Начальное сохранение
  autoExportDatabase();
  
  // Функция очистки
  return () => {
    clearTimeout(syncTimeout);
    clearInterval(interval);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Создает событие синхронизации для других вкладок
 */
export const broadcastSync = () => {
  localStorage.setItem('voidlace-sync-trigger', Date.now().toString());
};

/**
 * Слушает события синхронизации от других вкладок
 */
export const listenForSync = (callback: () => void) => {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'voidlace-sync-trigger') {
      callback();
    }
  };
  
  window.addEventListener('storage', handleStorage);
  
  return () => {
    window.removeEventListener('storage', handleStorage);
  };
};
