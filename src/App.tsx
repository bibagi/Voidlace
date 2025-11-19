import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import './utils/clearDatabase';
import { setupStorageSync, setupAutoBackup } from './utils/syncUtils';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
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
  useEffect(() => {
    // Настройка синхронизации между вкладками
    setupStorageSync();
    
    // Автоматическое резервное копирование каждые 30 минут
    setupAutoBackup(30);
    
    // Настройка облачной синхронизации
    const setupCloudSync = async () => {
      try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const auth = JSON.parse(authData);
          if (auth.state?.user?.id) {
            const { setupAutoSync } = await import('./services/syncService');
            const cleanup = setupAutoSync(auth.state.user.id);
            
            // Очистка при размонтировании
            return cleanup;
          }
        }
      } catch (error) {
        console.log('Облачная синхронизация недоступна');
      }
    };

    setupCloudSync();
    
    console.log('Синхронизация данных активирована');
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
