import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { useAuthStore } from './store/useAuthStore';
import './utils/clearDatabase';
import { setupStorageSync, setupAutoBackup } from './utils/syncUtils';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { Library } from './pages/Library';
import { NovelDetail } from './pages/NovelDetail';
import { ReaderPage } from './pages/ReaderPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { PublicProfile } from './pages/PublicProfile';
import { AdminNovels } from './pages/AdminNovels';
import { AdminUsers } from './pages/AdminUsers';
import { Premium } from './pages/Premium';
import { EditNovel } from './pages/EditNovel';

function AnimatedRoutes() {
  const location = useLocation();
  
  // Не показываем Header на странице читалки, логина и регистрации
  const hideHeader = location.pathname.startsWith('/reader') || 
                     location.pathname === '/login' || 
                     location.pathname === '/register';
  
  return (
    <>
      {!hideHeader && <Header />}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/library" element={<Library />} />
          <Route path="/novel/:id" element={<NovelDetail />} />
          <Route path="/reader/:novelId/:chapterId" element={<ReaderPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:username" element={<PublicProfile />} />
          <Route path="/admin/novels" element={<AdminNovels />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/admin/novels/edit/:id" element={<EditNovel />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  const { user } = useAuthStore();

  useEffect(() => {
    // Инициализация БД
    const initDB = async () => {
      try {
        const { initDatabase } = await import('./db/database');
        await initDatabase();
        console.log('✅ База данных инициализирована');
      } catch (error) {
        console.error('❌ Ошибка инициализации БД:', error);
      }
    };
    
    initDB();
    
    // Настройка синхронизации между вкладками
    setupStorageSync();
    
    // Автоматическое резервное копирование каждые 30 минут
    setupAutoBackup(30);
    
    // Настройка локальной автосинхронизации
    const setupLocalSync = async () => {
      try {
        const { setupAutoSync } = await import('./services/localSync');
        const cleanup = setupAutoSync();
        console.log('✅ Автоматическая синхронизация активирована');
        return cleanup;
      } catch (error) {
        console.error('❌ Ошибка настройки синхронизации:', error);
      }
    };

    setupLocalSync();
    
    console.log('Синхронизация данных активирована');
  }, []);

  // Облачная синхронизация при входе пользователя
  useEffect(() => {
    if (!user) return;

    let cleanup: (() => void) | undefined;
    let firebaseCleanup: (() => void) | undefined;

    const setupCloudSync = async () => {
      try {
        // Firebase синхронизация (если настроен)
        try {
          const { initFirebase, setupOnlinePresence, loadUserData, subscribeToUserData } = 
            await import('./services/firebaseSync');
          
          initFirebase();
          
          // Устанавливаем онлайн статус
          setupOnlinePresence(user.id, user);
          
          // Загружаем данные с сервера
          const serverData = await loadUserData(user.id);
          if (serverData) {
            console.log('🔥 Данные загружены с Firebase');
            // Здесь можно восстановить данные
          }
          
          // Подписываемся на изменения в реальном времени
          firebaseCleanup = subscribeToUserData(user.id, (data) => {
            console.log('🔥 Получены обновления с Firebase:', data);
            // Здесь обновляем локальные данные
          });
          
          console.log('🔥 Firebase синхронизация активирована');
        } catch (firebaseError) {
          console.log('ℹ️ Firebase не настроен, используем Upstash');
        }
        
        // Upstash синхронизация (резервная)
        const { setupAutoSync, loadFromCloud, checkCloudForUpdates } = await import('./services/syncService');
        
        // Проверяем, есть ли данные в облаке
        const hasCloudData = await checkCloudForUpdates(user.id);
        
        if (hasCloudData) {
          // Спрашиваем пользователя о загрузке
          const shouldLoad = confirm(
            '☁️ Найдены данные в облаке!\n\n' +
            'Хотите загрузить их?\n' +
            '(Это заменит текущие локальные данные)'
          );
          
          if (shouldLoad) {
            const success = await loadFromCloud(user.id);
            if (success) {
              alert('✅ Данные загружены из облака! Страница будет перезагружена.');
              window.location.reload();
            }
          }
        }
        
        // Настраиваем автоматическую синхронизацию
        cleanup = setupAutoSync(user.id);
        console.log('☁️ Облачная синхронизация активирована');
      } catch (error) {
        console.error('❌ Ошибка настройки облачной синхронизации:', error);
      }
    };

    setupCloudSync();

    return () => {
      if (cleanup) cleanup();
      if (firebaseCleanup) firebaseCleanup();
    };
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
