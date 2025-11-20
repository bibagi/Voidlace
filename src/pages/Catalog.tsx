import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNovels } from '../hooks/useNovels';
import { Novel } from '../types';
import { StarIcon, EyeIcon } from '@heroicons/react/24/solid';
import { formatNumber } from '../utils/helpers';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Loading } from '../components/common/Loading';

export const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const { novels, loading } = useNovels();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'views' | 'newest'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  
  // Получаем все уникальные жанры
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    novels.forEach(novel => novel.genres.forEach(g => genres.add(g)));
    return Array.from(genres);
  }, [novels]);
  
  // Фильтрация и сортировка
  const filteredNovels = useMemo(() => {
    let filtered = novels.filter(novel => {
      // Поиск
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!novel.title.toLowerCase().includes(query) &&
            !novel.author.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Жанры
      if (selectedGenres.length > 0) {
        if (!selectedGenres.some(g => novel.genres.includes(g))) {
          return false;
        }
      }
      
      // Статус
      if (selectedStatus !== 'all' && novel.status !== selectedStatus) {
        return false;
      }
      
      return true;
    });
    
    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'views':
          return b.views - a.views;
        case 'newest':
          return b.year - a.year;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [novels, searchQuery, selectedGenres, selectedStatus, sortBy]);
  
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
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
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Каталог</h1>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-4 py-2 glass rounded-xl flex items-center space-x-2"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Фильтры</span>
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-5 h-5" />
                  <h2 className="text-lg sm:text-xl font-bold">Фильтры</h2>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              {/* Search */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-semibold mb-2">Поиск</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Название или автор..."
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              {/* Status */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-semibold mb-2">Статус</label>
                <div className="space-y-1.5 sm:space-y-2">
                  {[
                    { value: 'all', label: 'Все' },
                    { value: 'ongoing', label: 'Выходит' },
                    { value: 'completed', label: 'Завершён' },
                    { value: 'hiatus', label: 'Пауза' },
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setSelectedStatus(status.value)}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg sm:rounded-xl text-left transition-all ${
                        selectedStatus === status.value
                          ? 'bg-primary-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Sort */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-semibold mb-2">Сортировка</label>
                <div className="space-y-1.5 sm:space-y-2">
                  {[
                    { value: 'rating' as const, label: 'По рейтингу' },
                    { value: 'views' as const, label: 'По просмотрам' },
                    { value: 'newest' as const, label: 'Новинки' },
                  ].map((sort) => (
                    <button
                      key={sort.value}
                      onClick={() => setSortBy(sort.value)}
                      className={`w-full px-4 py-2 rounded-xl text-left transition-all ${
                        sortBy === sort.value
                          ? 'bg-primary-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Genres */}
              <div>
                <label className="block text-sm font-semibold mb-2">Жанры</label>
                <div className="flex flex-wrap gap-2">
                  {allGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedGenres.includes(genre)
                          ? 'bg-primary-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Novels Grid */}
          <div className="flex-1">
            <div className="mb-4 text-gray-600 dark:text-gray-400">
              Найдено: {filteredNovels.length} произведений
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNovels.map((novel, index) => (
                <NovelCard key={novel.id} novel={novel} index={index} onClick={() => navigate(`/novel/${novel.id}`)} />
              ))}
            </div>
            
            {filteredNovels.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-gray-500">Ничего не найдено</p>
                <p className="text-gray-400 mt-2">Попробуйте изменить фильтры</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NovelCard: React.FC<{ novel: Novel; index: number; onClick: () => void }> = ({ novel, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="glass rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
    >
      <div className="relative h-64">
        <img
          src={novel.cover}
          alt={novel.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-3 text-white text-sm mb-2">
            <div className="flex items-center space-x-1">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span>{novel.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-4 h-4" />
              <span>{formatNumber(novel.views)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{novel.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{novel.author}</p>
        
        <div className="flex flex-wrap gap-1">
          {novel.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
