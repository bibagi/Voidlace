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
    const data: CloudUserData = {
      userId,
      auth: localStorage.getItem('auth-storage') || '',
      library: localStorage.getItem('library-storage') || '',
      readerSettings: localStorage.getItem('reader-settings') || '',
      theme: localStorage.getItem('theme-storage') || '',
      lastSync: new Date().toISOString(),
    };

    await setDoc(doc(firestore, 'users', userId), data);
    console.log('✅ Данные сохранены в облако');
    return true;
  } catch (error) {
    console.error('❌ Ошибка сохранения в облако:', error);
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
      
      if (data.auth) localStorage.setItem('auth-storage', data.auth);
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
