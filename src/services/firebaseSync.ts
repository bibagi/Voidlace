// Полноценная синхронизация через Firebase Realtime Database
import { initializeApp, getApps } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue, 
  serverTimestamp,
  onDisconnect,
  update
} from 'firebase/database';

// Firebase конфигурация (бесплатный план)
const firebaseConfig = {
  apiKey: "AIzaSyC6EAIQQZmF3o026EZ7Ye8rz7CUVtBbLIw",
  authDomain: "voidlace-77e77.firebaseapp.com",
  databaseURL: "https://voidlace-77e77-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "voidlace-77e77",
  storageBucket: "voidlace-77e77.firebasestorage.app",
  messagingSenderId: "357118907864",
  appId: "1:357118907864:web:0a2b6bdba8aafdd28b8ead",
  measurementId: "G-DGQT8KH5TY"
};

// Инициализация Firebase
let app: any;
let database: any;

export const initFirebase = () => {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('🔥 Firebase инициализирован');
  }
  return database;
};

/**
 * Сохранение данных пользователя на сервер
 */
export const saveUserData = async (userId: string, data: any) => {
  try {
    const db = initFirebase();
    const userRef = ref(db, `users/${userId}/data`);
    
    await set(userRef, {
      ...data,
      lastSync: serverTimestamp(),
    });
    
    console.log('✅ Данные сохранены на сервер');
    return true;
  } catch (error) {
    console.error('❌ Ошибка сохранения:', error);
    return false;
  }
};

/**
 * Загрузка данных пользователя с сервера
 */
export const loadUserData = async (userId: string) => {
  try {
    const db = initFirebase();
    const userRef = ref(db, `users/${userId}/data`);
    
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      console.log('✅ Данные загружены с сервера');
      return snapshot.val();
    }
    
    return null;
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    return null;
  }
};

/**
 * Отслеживание онлайн статуса пользователя
 */
export const setupOnlinePresence = (userId: string, userData: any) => {
  const db = initFirebase();
  const userStatusRef = ref(db, `users/${userId}/status`);
  const userInfoRef = ref(db, `users/${userId}/info`);
  
  // Статус онлайн
  const onlineStatus = {
    state: 'online',
    lastSeen: serverTimestamp(),
  };
  
  // Статус оффлайн (при отключении)
  const offlineStatus = {
    state: 'offline',
    lastSeen: serverTimestamp(),
  };
  
  // Информация о пользователе
  const userInfo = {
    username: userData.username,
    avatar: userData.avatar,
    role: userData.role,
    isPremium: userData.isPremium,
  };
  
  // Устанавливаем онлайн статус
  set(userStatusRef, onlineStatus);
  set(userInfoRef, userInfo);
  
  // Настраиваем автоматическое изменение статуса при отключении
  onDisconnect(userStatusRef).set(offlineStatus);
  
  console.log('👁️ Онлайн статус активирован');
};

/**
 * Получение списка онлайн пользователей
 */
export const getOnlineUsers = (callback: (users: any[]) => void) => {
  const db = initFirebase();
  const usersRef = ref(db, 'users');
  
  return onValue(usersRef, (snapshot) => {
    const users: any[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const userId = childSnapshot.key;
      const userData = childSnapshot.val();
      
      if (userData.status?.state === 'online' && userData.info) {
        users.push({
          id: userId,
          ...userData.info,
          lastSeen: userData.status.lastSeen,
        });
      }
    });
    
    callback(users);
  });
};

/**
 * Подписка на изменения данных пользователя (реал-тайм синхронизация)
 */
export const subscribeToUserData = (userId: string, callback: (data: any) => void) => {
  const db = initFirebase();
  const userRef = ref(db, `users/${userId}/data`);
  
  return onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};

/**
 * Обновление прогресса чтения (в реальном времени)
 */
export const updateReadingProgress = async (
  userId: string, 
  novelId: string, 
  chapterId: string, 
  progress: number
) => {
  try {
    const db = initFirebase();
    const progressRef = ref(db, `users/${userId}/data/progress/${novelId}`);
    
    await update(progressRef, {
      chapterId,
      progress,
      lastRead: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка обновления прогресса:', error);
    return false;
  }
};

/**
 * Синхронизация библиотеки
 */
export const syncLibrary = async (userId: string, library: any[]) => {
  try {
    const db = initFirebase();
    const libraryRef = ref(db, `users/${userId}/data/library`);
    
    await set(libraryRef, library);
    return true;
  } catch (error) {
    console.error('❌ Ошибка синхронизации библиотеки:', error);
    return false;
  }
};

/**
 * Получение статистики онлайн пользователей
 */
export const getOnlineCount = (callback: (count: number) => void) => {
  const db = initFirebase();
  const usersRef = ref(db, 'users');
  
  return onValue(usersRef, (snapshot) => {
    let count = 0;
    
    snapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val();
      if (userData.status?.state === 'online') {
        count++;
      }
    });
    
    callback(count);
  });
};
