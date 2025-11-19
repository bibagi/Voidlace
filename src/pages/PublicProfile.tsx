import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types/user';
import { AnimatedAvatar } from '../components/common/AnimatedAvatar';
import { GlobeAltIcon, PencilIcon } from '@heroicons/react/24/outline';

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, updateProfile } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    telegram: '',
    discord: '',
    website: '',
  });

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.state?.user?.username === username) {
        setUser(parsed.state.user);
        setEditData({
          bio: parsed.state.user.bio || '',
          telegram: parsed.state.user.telegram || '',
          discord: parsed.state.user.discord || '',
          website: parsed.state.user.website || '',
        });
      }
    }
  }, [username]);

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
    // Обновляем локальное состояние
    if (user) {
      setUser({ ...user, ...editData });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Пользователь не найден</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-8"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="glass rounded-3xl p-8">
          <div className="flex items-center space-x-6 mb-6">
            <AnimatedAvatar
              src={user.avatar || 'https://ui-avatars.com/api/?name=User'}
              alt={user.username}
              size="xl"
              frame={user.avatarFrame}
            />
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              {user.isPremium && (
                <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-semibold rounded-full">
                  Premium
                </span>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
              >
                <PencilIcon className="w-4 h-4" />
                <span>{isEditing ? 'Отменить' : 'Редактировать профиль'}</span>
              </motion.button>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">О себе</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Расскажите о себе..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Telegram</label>
                <input
                  type="text"
                  value={editData.telegram}
                  onChange={(e) => setEditData({ ...editData, telegram: e.target.value })}
                  placeholder="username"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Discord</label>
                <input
                  type="text"
                  value={editData.discord}
                  onChange={(e) => setEditData({ ...editData, discord: e.target.value })}
                  placeholder="username#1234"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Сайт</label>
                <input
                  type="url"
                  value={editData.website}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg"
              >
                Сохранить изменения
              </motion.button>
            </div>
          ) : (
            <>
              {user.bio && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">О себе</h3>
                  <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
                </div>
              )}

              <div className="space-y-2">
                {user.telegram && (
                  <a
                    href={`https://t.me/${user.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary-500 hover:underline"
                  >
                    <span>Telegram: @{user.telegram}</span>
                  </a>
                )}
                {user.discord && (
                  <p className="flex items-center space-x-2">
                    <span>Discord: {user.discord}</span>
                  </p>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary-500 hover:underline"
                  >
                    <GlobeAltIcon className="w-4 h-4" />
                    <span>{user.website}</span>
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
