import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { AnimatedAvatar } from '../common/AnimatedAvatar';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon, 
  PlusIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';

export const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, savedAccounts, logout, switchAccount, removeAccount } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleSwitchAccount = (userId: string) => {
    switchAccount(userId);
    setIsOpen(false);
  };

  const handleAddAccount = () => {
    setIsOpen(false);
    navigate('/login?mode=add');
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <AnimatedAvatar
          src={user.avatar || 'https://ui-avatars.com/api/?name=User'}
          alt={user.username}
          size="sm"
          frame={user.avatarFrame}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-72 glass rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Текущий пользователь */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <AnimatedAvatar
                  src={user.avatar || 'https://ui-avatars.com/api/?name=User'}
                  alt={user.username}
                  size="md"
                  frame={user.avatarFrame}
                />
                <div className="flex-1">
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
                <CheckIcon className="w-5 h-5 text-primary-500" />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProfile}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Мой профиль</span>
              </motion.button>
            </div>

            {/* Другие аккаунты */}
            {savedAccounts.filter(acc => acc.user.id !== user.id).length > 0 && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Другие аккаунты
                </p>
                {savedAccounts
                  .filter(acc => acc.user.id !== user.id)
                  .map((account) => (
                    <div key={account.user.id} className="relative group">
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                        onClick={() => handleSwitchAccount(account.user.id)}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors"
                      >
                        <AnimatedAvatar
                          src={account.user.avatar || 'https://ui-avatars.com/api/?name=User'}
                          alt={account.user.username}
                          size="sm"
                          frame={account.user.avatarFrame}
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm">{account.user.username}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{account.user.email}</p>
                        </div>
                      </motion.button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAccount(account.user.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        title="Удалить аккаунт"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Действия */}
            <div className="p-2">
              <motion.button
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                onClick={handleAddAccount}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <span className="font-medium">Добавить аккаунт</span>
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors text-red-500"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="font-medium">Выйти из аккаунта</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
