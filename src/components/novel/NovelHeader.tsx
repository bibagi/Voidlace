import { motion } from 'framer-motion';
import { StarIcon, HeartIcon, BookmarkIcon, EyeIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { Novel } from '../../types';
import { formatNumber, getStatusColor, getStatusText } from '../../utils/helpers';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

interface NovelHeaderProps {
  novel: Novel;
}

export const NovelHeader: React.FC<NovelHeaderProps> = ({ novel }) => {
  const navigate = useNavigate();
  const { isInLibrary, isFavorite, addToLibrary, removeFromLibrary, toggleFavorite } = useLibraryStore();
  
  const inLibrary = isInLibrary(novel.id);
  const favorite = isFavorite(novel.id);
  
  const handleLibraryToggle = () => {
    if (inLibrary) {
      removeFromLibrary(novel.id);
    } else {
      addToLibrary(novel.id);
    }
  };
  
  const handleFavoriteToggle = () => {
    if (!inLibrary) {
      addToLibrary(novel.id);
    }
    toggleFavorite(novel.id);
  };
  
  const handleStartReading = () => {
    const firstChapter = novel.volumes[0]?.chapters[0];
    if (firstChapter) {
      navigate(`/reader/${novel.id}/${firstChapter.id}`);
    }
  };
  
  return (
    <div className="relative">
      {/* Background with blur */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-30"
          style={{ backgroundImage: `url(${novel.cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
      </div>
      
      {/* Content */}
      <div className="relative glass rounded-3xl p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cover */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-shrink-0"
          >
            <div className="relative group">
              <img
                src={novel.cover}
                alt={novel.title}
                className="w-full lg:w-64 h-96 object-cover rounded-2xl shadow-2xl"
              />
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 ${getStatusColor(novel.status)} text-white text-sm font-semibold rounded-full shadow-lg`}>
                  {getStatusText(novel.status)}
                </span>
              </div>
            </div>
          </motion.div>
          
          {/* Info */}
          <div className="flex-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold mb-2">{novel.title}</h1>
              
              {novel.originalTitle && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {novel.originalTitle}
                </p>
              )}
              
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Автор: <span className="font-semibold">{novel.author}</span>
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                  <span className="text-2xl font-bold">{novel.rating}</span>
                  <span className="text-gray-500">
                    ({formatNumber(novel.ratingCount)})
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <EyeIcon className="w-6 h-6 text-gray-400" />
                  <span className="font-semibold">{formatNumber(novel.views)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <HeartIcon className="w-6 h-6 text-red-400" />
                  <span className="font-semibold">{formatNumber(novel.favorites)}</span>
                </div>
              </div>
              
              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {novel.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white font-medium rounded-full shadow-lg"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {novel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={handleStartReading}
                  className="flex-1 sm:flex-none"
                >
                  Читать
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleLibraryToggle}
                  className="flex items-center space-x-2"
                >
                  {inLibrary ? (
                    <BookmarkIcon className="w-5 h-5 text-primary-500" />
                  ) : (
                    <BookmarkOutline className="w-5 h-5" />
                  )}
                  <span>{inLibrary ? 'В библиотеке' : 'В библиотеку'}</span>
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleFavoriteToggle}
                  className="flex items-center space-x-2"
                >
                  {favorite ? (
                    <HeartIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartOutline className="w-5 h-5" />
                  )}
                  <span>{favorite ? 'В избранном' : 'В избранное'}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
