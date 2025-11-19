import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/user';
import { AnimatedAvatar } from '../components/common/AnimatedAvatar';
import { 
  ShieldCheckIcon, 
  PencilSquareIcon, 
  StarIcon,
  UserIcon 
} from '@heroicons/react/24/outline';

export const AdminUsers: React.FC = () => {
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }

    // Загружаем пользователей из localStorage
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = () => {
    const allUsers: User[] = [];
    
    // Получаем всех пользователей из auth-storage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed.state?.savedAccounts) {
        parsed.state.savedAccounts.forEach((acc: any) => {
          allUsers.push(acc.user);
        });
      }
      if (parsed.state?.user && !allUsers.find(u => u.id === parsed.state.user.id)) {
        allUsers.push(parsed.state.user);
      }
    }

    setUsers(allUsers);
  };

  const toggleRole = (userId: string, newRole: User['role']) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return;

    const parsed = JSON.parse(authStorage);
    
    // Обновляем роль в savedAccounts
    if (parsed.state?.savedAccounts) {
      parsed.state.savedAccounts = parsed.state.savedAccounts.map((acc: any) => {
        if (acc.user.id === userId) {
          return { ...acc, user: { ...acc.user, role: newRole } };
        }
        return acc;
      });
    }

    // Обновляем текущего пользователя если это он
    if (parsed.state?.user?.id === userId) {
      parsed.state.user.role = newRole;
    }

    localStorage.setItem('auth-storage', JSON.stringify(parsed));
    
    // Перезагружаем страницу для применения изменений
    window.location.reload();
  };

  const togglePremium = (userId: string) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return;

    const parsed = JSON.parse(authStorage);
    
    // Обновляем премиум в savedAccounts
    if (parsed.state?.savedAccounts) {
      parsed.state.savedAccounts = parsed.state.savedAccounts.map((acc: any) => {
        if (acc.user.id === userId) {
          const isPremium = !acc.user.isPremium;
          return { 
            ...acc, 
            user: { 
              ...acc.user, 
              isPremium,
              premiumUntil: isPremium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
            } 
          };
        }
        return acc;
      });
    }

    // Обновляем текущего пользователя если это он
    if (parsed.state?.user?.id === userId) {
      const isPremium = !parsed.state.user.isPremium;
      parsed.state.user.isPremium = isPremium;
      parsed.state.user.premiumUntil = isPremium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined;
    }

    localStorage.setItem('auth-storage', JSON.stringify(parsed));
    
    // Перезагружаем страницу для применения изменений
    window.location.reload();
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">Админ</span>;
      case 'editor':
        return <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">Редактор</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">Пользователь</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-8"
    >
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Управление пользователями</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Просмотр и управление ролями пользователей
          </p>
        </div>

        {/* Поиск */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Список пользователей */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <AnimatedAvatar
                    src={user.avatar || 'https://ui-avatars.com/api/?name=User'}
                    alt={user.username}
                    size="lg"
                    frame={user.avatarFrame}
                  />
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-bold">{user.username}</h3>
                      {getRoleBadge(user.role)}
                      {user.isPremium && (
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      ID: {user.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Кнопка роли */}
                  <div className="flex items-center space-x-1 glass rounded-xl p-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleRole(user.id, 'user')}
                      className={`p-2 rounded-lg transition-colors ${
                        user.role === 'user' ? 'bg-gray-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title="Пользователь"
                    >
                      <UserIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleRole(user.id, 'editor')}
                      className={`p-2 rounded-lg transition-colors ${
                        user.role === 'editor' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title="Редактор"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleRole(user.id, 'admin')}
                      className={`p-2 rounded-lg transition-colors ${
                        user.role === 'admin' ? 'bg-red-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title="Администратор"
                    >
                      <ShieldCheckIcon className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Кнопка Premium */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePremium(user.id)}
                    className={`p-3 rounded-xl transition-colors ${
                      user.isPremium
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                        : 'glass hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={user.isPremium ? 'Убрать Premium' : 'Выдать Premium'}
                  >
                    <StarIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Пользователи не найдены
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
