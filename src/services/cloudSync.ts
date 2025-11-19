// Облачная синхронизация через Firebase
import { doc, setDoc, getDoc, onSnapshot, Firestore } from 'firebase/firestore';
import { db as firebaseDb, isConfigured } from '../config/firebase';

const db = firebaseDb as Firestore | undefined;

export interface CloudUserData {
  userId: string;
  auth: string;
  library: string;
  readerSettings: string;
  theme: string;
  lastSync: string;
}

/**
 * Сохраняет данные пользователя в облако
 */
export const saveToCloud = async (userId: string): Promise<boolean> => {
  if (!isConfigured || !db) {
    console.warn('Firebase не настроен');
    return false;
  }

  const firestore = db as Firestore;

  try {
    // Получаем только важные данные (без произведений из БД)
    const authData = localStorage.getItem('auth-storage');
    const libraryData = localStorage.getItem('library-storage');
    const readerSettings = localStorage.getItem('reader-settings');
    const themeData = localStorage.getItem('theme-storage');

    // Парсим и сохраняем только метаданные
    let authToSave = '';
    let libraryToSave = '';

    if (authData) {
      try {
        const auth = JSON.parse(authData);
        // Сохраняем только профиль пользователя, без savedAccounts
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

    if (libraryData) {
      try {
        const library = JSON.parse(libraryData);
        // Сохраняем только ID произведений и прогресс, без полных данных
        if (library.state) {
          libraryToSave = JSON.stringify({
            state: {
              library: library.state.library || [],
              readingProgress: library.state.readingProgress || {},
            }
          });
        }
      } catch (e) {
        console.error('Ошибка парсинга library:', e);
      }
    }

    const data: CloudUserData = {
      userId,
      auth: authToSave,
      library: libraryToSave,
      readerSettings: readerSettings || '',
      theme: themeData || '',
      lastSync: new Date().toISOString(),
    };

    // Проверяем размер данных
    const dataSize = new Blob([JSON.stringify(data)]).size;
    if (dataSize > 900000) { // 900KB лимит (оставляем запас)
      console.error('❌ Данные слишком большие:', dataSize, 'байт');
      alert('⚠️ Слишком много данных для синхронизации. Используйте экспорт файла.');
      return false;
    }

    await setDoc(doc(firestore, 'users', userId), data);
    console.log('✅ Данные сохранены в облако (', dataSize, 'байт)');
    return true;
  } catch (error) {
    console.error('❌ Ошибка сохранения в облако:', error);
    if (error instanceof Error && error.message.includes('longer than')) {
      alert('⚠️ Данные слишком большие для облачной синхронизации. Используйте экспорт файла.');
    }
    return false;
  }
};

/**
 * Загружает данные пользователя из облака
 */
export const loadFromCloud = async (userId: string): Promise<boolean> => {
  if (!isConfigured || !db) {
    console.warn('Firebase не настроен');
    return false;
  }

  const firestore = db as Firestore;

  try {
    const docRef = doc(firestore, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as CloudUserData;
      
      // Восстанавливаем данные, объединяя с существующими
      if (data.auth) {
        try {
          const cloudAuth = JSON.parse(data.auth);
          const localAuth = localStorage.getItem('auth-storage');
          
          if (localAuth) {
            const local = JSON.parse(localAuth);
            // Объединяем: берем профиль из облака, но сохраняем savedAccounts локально
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
      
      if (data.library) localStorage.setItem('library-storage', data.library);
      if (data.readerSettings) localStorage.setItem('reader-settings', data.readerSettings);
      if (data.theme) localStorage.setItem('theme-storage', data.theme);

      console.log('✅ Данные загружены из облака');
      return true;
    } else {
      console.log('ℹ️ Данные в облаке не найдены');
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки из облака:', error);
    return false;
  }
};

/**
 * Подписывается на изменения данных в реальном времени
 */
export const subscribeToCloudChanges = (
  userId: string,
  onUpdate: (data: CloudUserData) => void
): (() => void) => {
  if (!isConfigured || !db) {
    console.warn('Firebase не настроен');
    return () => {};
  }

  const firestore = db as Firestore;
  const docRef = doc(firestore, 'users', userId);
  
  const unsubscribe = onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as CloudUserData;
      onUpdate(data);
    }
  });

  return unsubscribe;
};

/**
 * Автоматическая синхронизация при изменении данных
 */
export const setupAutoSync = (userId: string) => {
  if (!isConfigured) {
    console.warn('Firebase не настроен, автосинхронизация отключена');
    return () => {};
  }

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
    saveToCloud(userId);
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Функция очистки
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    clearInterval(interval);
  };
};

/**
 * Проверяет, есть ли более новые данные в облаке
 */
export const checkCloudForUpdates = async (userId: string): Promise<boolean> => {
  if (!isConfigured || !db) {
    return false;
  }

  const firestore = db as Firestore;

  try {
    const docRef = doc(firestore, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cloudData = docSnap.data() as CloudUserData;
      const localLastSync = localStorage.getItem('lastSync');

      if (!localLastSync || new Date(cloudData.lastSync) > new Date(localLastSync)) {
        return true; // Есть более новые данные в облаке
      }
    }

    return false;
  } catch (error) {
    console.error('Ошибка проверки обновлений:', error);
    return false;
  }
};
