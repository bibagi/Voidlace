import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { useNavigate } from 'react-router-dom';
import { AnimatedAvatar } from '../components/common/AnimatedAvatar';
import { AvatarSelector } from '../components/profile/AvatarSelector';
import { 
  UserCircleIcon, 
  BookOpenIcon, 
  HeartIcon, 
  ClockIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

export const Profile: React.FC = () => {
  const { user, logout, isAdmin, updateAvatar, updateProfile } = useAuthStore();
  const { library, readingProgress } = useLibraryStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    setShowAvatarSelector(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    try {
      const { processImageUpload } = await import('../utils/imageUtils');
      const compressed = await processImageUpload(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9,
      });
      updateAvatar(compressed);
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      alert(error instanceof Error ? error.message : 'Ошибка загрузки изображения');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };



  const stats = {
    total: library.length,
    favorites: library.filter(item => item.isFavorite).length,
    reading: library.filter(item => item.status === 'reading').length,
    completed: library.filter(item => item.status === 'completed').length,
    chaptersRead: Object.keys(readingProgress).length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-4 sm:py-8"
    >
      <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
        {/* Профиль */}
        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div 
              className="relative group cursor-pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleAvatarClick}
            >
              <div className={`relative ${isDragging ? 'ring-4 ring-primary-500 rounded-full' : ''}`}>
                <AnimatedAvatar
                  src={user.avatar || 'https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff'}
                  alt={user.username}
                  size="xl"
                  frame={user.avatarFrame}
                  className="shadow-lg"
                />
                
                {/* Оверлей при наведении */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <CameraIcon className="w-8 h-8 text-white mb-1" />
                  <span className="text-xs text-white">Нажмите или перетащите</span>
                </div>
                
                {isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary-500/80 rounded-full">
                    <span className="text-white font-semibold">Отпустите</span>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {isAdmin() && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left w-full">
              {isEditingUsername ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Новое имя пользователя"
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (newUsername.trim()) {
                          updateProfile({ username: newUsername.trim() });
                          setIsEditingUsername(false);
                          setNewUsername('');
                        }
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
                    >
                      Сохранить
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsEditingUsername(false);
                        setNewUsername('');
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 glass rounded-xl"
                    >
                      Отмена
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{user.username}</h1>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setNewUsername(user.username);
                      setIsEditingUsername(true);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    title="Изменить имя"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </motion.button>
                </div>
              )}
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                  user.role === 'admin'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                    : user.role === 'editor'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-primary-500 text-white'
                }`}>
                  {user.role === 'admin' ? 'Администратор' : user.role === 'editor' ? 'Редактор' : 'Пользователь'}
                </span>
                {user.isPremium && (
                  <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs sm:text-sm font-semibold rounded-full">
                    Premium
                  </span>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 sm:p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors sm:self-start"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </div>
          
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <StatCard
            icon={BookOpenIcon}
            label="В библиотеке"
            value={stats.total}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={HeartIcon}
            label="Избранное"
            value={stats.favorites}
            color="from-red-500 to-pink-500"
          />
          <StatCard
            icon={ClockIcon}
            label="Читаю"
            value={stats.reading}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={UserCircleIcon}
            label="Прочитано глав"
            value={stats.chaptersRead}
            color="from-purple-500 to-indigo-500"
          />
        </div>

        {/* Настройки рамки */}
        {user.avatarFrame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-4 sm:mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Настройки рамки аватара</h2>
            <AvatarFrameSettings />
          </motion.div>
        )}

        {/* Админ/Редактор панель */}
        {(user.role === 'admin' || user.role === 'editor') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-8"
          >
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <ShieldCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
              <h2 className="text-xl sm:text-2xl font-bold">
                {user.role === 'admin' ? 'Панель администратора' : 'Панель редактора'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <AdminButton
                label="Управление произведениями"
                description="Добавить, редактировать или удалить"
                onClick={() => navigate('/admin/novels')}
                icon={BookOpenIcon}
              />
              {user.role === 'admin' && (
                <>
                  <AdminButton
                    label="Пользователи"
                    description="Просмотр и управление"
                    onClick={() => navigate('/admin/users')}
                    icon={UserCircleIcon}
                  />
                  <AdminButton
                    label="Статистика"
                    description="Просмотры, рейтинги, активность"
                    onClick={() => alert('В разработке')}
                  />
                  <AdminButton
                    label="Настройки"
                    description="Конфигурация системы"
                    onClick={() => alert('В разработке')}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Avatar Selector Modal */}
        <AvatarSelector
          isOpen={showAvatarSelector}
          onClose={() => setShowAvatarSelector(false)}
          onSelect={updateAvatar}
          isPremium={user.isPremium}
        />
      </div>
    </motion.div>
  );
};

const StatCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}> = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6"
  >
    <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br ${color} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4 shadow-lg`}>
      <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
    </div>
    <p className="text-xl sm:text-3xl font-bold mb-1">{value}</p>
    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </motion.div>
);

const AdminButton: React.FC<{
  label: string;
  description: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}> = ({ label, description, onClick, icon: Icon }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="glass rounded-xl p-4 sm:p-6 text-left hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
  >
    <div className="flex items-start space-x-3">
      {Icon && (
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      )}
      <div>
        <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">{label}</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </motion.button>
);

const AvatarFrameSettings: React.FC = () => {
  const { user, updateAvatarFrame } = useAuthStore();
  const frame = user?.avatarFrame || {
    enabled: true,
    color: 'from-yellow-400 to-orange-500',
    animation: 'spin',
    thickness: 4,
  };

  const colors = [
    { value: 'from-yellow-400 to-orange-500', label: 'Золотой' },
    { value: 'from-red-500 to-pink-500', label: 'Красный' },
    { value: 'from-blue-500 to-cyan-500', label: 'Синий' },
    { value: 'from-green-500 to-emerald-500', label: 'Зелёный' },
    { value: 'from-purple-500 to-pink-500', label: 'Фиолетовый' },
    { value: 'from-gray-500 to-gray-700', label: 'Серый' },
  ];

  const animations = [
    { value: 'spin' as const, label: 'Вращение' },
    { value: 'pulse' as const, label: 'Пульсация' },
    { value: 'glow' as const, label: 'Свечение' },
    { value: 'none' as const, label: 'Без анимации' },
  ];

  return (
    <div className="space-y-6">
      {/* Включить/выключить */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">Включить рамку</label>
        <button
          onClick={() => updateAvatarFrame({ enabled: !frame.enabled })}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            frame.enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'
          }`}
        >
          <motion.div
            animate={{ x: frame.enabled ? 24 : 0 }}
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
          />
        </button>
      </div>

      {frame.enabled && (
        <>
          {/* Цвет */}
          <div>
            <label className="block text-sm font-semibold mb-3">Цвет рамки</label>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateAvatarFrame({ color: color.value })}
                  className={`p-3 rounded-xl transition-all ${
                    frame.color === color.value
                      ? 'ring-4 ring-primary-500 shadow-lg'
                      : 'hover:scale-105'
                  }`}
                >
                  <div className={`h-8 rounded-lg bg-gradient-to-r ${color.value}`} />
                  <p className="text-xs mt-2">{color.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Анимация */}
          <div>
            <label className="block text-sm font-semibold mb-3">Анимация</label>
            <div className="grid grid-cols-2 gap-2">
              {animations.map((anim) => (
                <button
                  key={anim.value}
                  onClick={() => updateAvatarFrame({ animation: anim.value })}
                  className={`p-3 rounded-xl transition-all ${
                    frame.animation === anim.value
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>

          {/* Толщина */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Толщина: {frame.thickness}px
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={frame.thickness}
              onChange={(e) => updateAvatarFrame({ thickness: Number(e.target.value) })}
              className="w-full accent-primary-500"
            />
          </div>
        </>
      )}
    </div>
  );
};
