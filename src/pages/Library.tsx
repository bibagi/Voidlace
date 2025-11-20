import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../store/useLibraryStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNovels } from '../hooks/useNovels';
import { StarIcon, HeartIcon, BookOpenIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Loading } from '../components/common/Loading';

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { library, readingProgress } = useLibraryStore();
  const { novels, loading } = useNovels();
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed' | 'plan-to-read' | 'dropped'>('all');
  const [showFavorites, setShowFavorites] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  // Фильтруем произведения из библиотеки
  const libraryNovels = useMemo(() => {
    return library
      .filter(item => {
        if (filter !== 'all' && item.status !== filter) return false;
        if (showFavorites && !item.isFavorite) return false;
        return true;
      })
      .map(item => {
        const novel = novels.find(n => n.id === item.novelId);
        const progress = readingProgress[item.novelId];
        return { ...item, novel, progress };
      })
      .filter(item => item.novel); // Убираем элементы без произведения
  }, [library, novels, filter, showFavorites, readingProgress]);

  const stats = {
    total: library.length,
    reading: library.filter(i => i.status === 'reading').length,
    completed: library.filter(i => i.status === 'completed').length,
    planToRead: library.filter(i => i.status === 'plan-to-read').length,
    dropped: library.filter(i => i.status === 'dropped').length,
    favorites: library.filter(i => i.isFavorite).length,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Моя библиотека</h1>

        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            label="Всего"
            value={stats.total}
            icon={BookOpenIcon}
            color="from-blue-500 to-cyan-500"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <StatCard
            label="Читаю"
            value={stats.reading}
            icon={BookOpenIcon}
            color="from-green-500 to-emerald-500"
            active={filter === 'reading'}
            onClick={() => setFilter('reading')}
          />
          <StatCard
            label="Прочитано"
            value={stats.completed}
            icon={CheckCircleIcon}
            color="from-purple-500 to-pink-500"
            active={filter === 'completed'}
            onClick={() => setFilter('completed')}
          />
          <StatCard
            label="Запланировано"
            value={stats.planToRead}
            icon={ClockIcon}
            color="from-yellow-500 to-orange-500"
            active={filter === 'plan-to-read'}
            onClick={() => setFilter('plan-to-read')}
          />
          <StatCard
            label="Брошено"
            value={stats.dropped}
            icon={XCircleIcon}
            color="from-gray-500 to-gray-600"
            active={filter === 'dropped'}
            onClick={() => setFilter('dropped')}
          />
          <StatCard
            label="Избранное"
            value={stats.favorites}
            icon={HeartIcon}
            color="from-red-500 to-pink-500"
            active={showFavorites}
            onClick={() => setShowFavorites(!showFavorites)}
          />
        </div>

        {/* Список произведений */}
        {libraryNovels.length === 0 ? (
          <div className="glass rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
            <BookOpenIcon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Библиотека пуста</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Добавьте произведения в библиотеку, чтобы отслеживать прогресс чтения
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/catalog')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg"
            >
              Перейти в каталог
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {libraryNovels.map((item, index) => (
              <NovelCard
                key={item.novelId}
                item={item}
                index={index}
                onClick={() => navigate(`/novel/${item.novelId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, value, icon: Icon, color, active, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left transition-all ${
      active ? 'ring-2 ring-primary-500 shadow-lg' : ''
    }`}
  >
    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${color} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 shadow-lg`}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
    </div>
    <p className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">{value}</p>
    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </motion.button>
);

const NovelCard: React.FC<{
  item: any;
  index: number;
  onClick: () => void;
}> = ({ item, index, onClick }) => {
  const { novel, progress, isFavorite } = item;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="glass rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group relative"
    >
      {isFavorite && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      )}

      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img
          src={novel.cover}
          alt={novel.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {progress && (
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <div className="mb-2">
              <div className="flex items-center justify-between text-white text-xs sm:text-sm mb-1">
                <span>Прогресс</span>
                <span>{progress.progress}%</span>
              </div>
              <div className="w-full h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 line-clamp-2">
          {novel.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
          {novel.author}
        </p>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center space-x-1">
            <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
            <span className="font-bold">{novel.rating}</span>
          </div>
          <span className="text-gray-500">{novel.totalChapters} глав</span>
        </div>
      </div>
    </motion.div>
  );
};
