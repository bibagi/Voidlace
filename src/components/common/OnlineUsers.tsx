import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { getOnlineUsers, getOnlineCount } from '../../services/firebaseSync';

export const OnlineUsers: React.FC = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showList, setShowList] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    let unsubscribeCount: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;

    const setupFirebase = async () => {
      try {
        // Подписываемся на количество онлайн пользователей
        unsubscribeCount = getOnlineCount((count) => {
          setOnlineCount(count);
          setIsFirebaseReady(true);
        });
        
        // Подписываемся на список онлайн пользователей
        unsubscribeUsers = getOnlineUsers((users) => {
          setOnlineUsers(users);
        });

        console.log('👥 Подписка на онлайн пользователей активирована');
      } catch (error) {
        console.log('⚠️ Firebase онлайн статус недоступен:', error);
        setIsFirebaseReady(false);
      }
    };

    setupFirebase();

    return () => {
      if (unsubscribeCount) unsubscribeCount();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  // Не показываем компонент если Firebase не готов
  if (!isFirebaseReady) {
    return null;
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowList(!showList)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl glass hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
      >
        <UserGroupIcon className="w-5 h-5" />
        <span className="text-sm font-semibold">{onlineCount}</span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {showList && onlineUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-64 glass rounded-xl p-4 shadow-xl z-50"
          >
            <h3 className="text-sm font-bold mb-3">Онлайн сейчас</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {onlineUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || 'https://ui-avatars.com/api/?name=User'}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.username}</p>
                    {user.isPremium && (
                      <span className="text-xs text-yellow-500">⭐ Premium</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
