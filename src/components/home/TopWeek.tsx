import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Novel } from '../../types';
import { StarIcon, FireIcon } from '@heroicons/react/24/solid';
import { formatNumber } from '../../utils/helpers';

interface TopWeekProps {
  novels: Novel[];
}

export const TopWeek: React.FC<TopWeekProps> = ({ novels }) => {
  const navigate = useNavigate();
  const topNovels = [...novels]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
  
  return (
    <section className="mb-12">
      <div className="flex items-center space-x-3 mb-6">
        <FireIcon className="w-8 h-8 text-orange-500" />
        <h2 className="text-3xl font-bold">Топ недели</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {topNovels.map((novel, index) => (
          <motion.div
            key={novel.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/novel/${novel.id}`)}
            className="glass rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center space-x-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {index + 1}
                </span>
              </div>
              
              {/* Cover */}
              <img
                src={novel.cover}
                alt={novel.title}
                className="w-16 h-24 object-cover rounded-lg shadow-md"
              />
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1 truncate">
                  {novel.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {novel.author}
                </p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold">{novel.rating}</span>
                    <span className="text-gray-500">
                      ({formatNumber(novel.ratingCount)})
                    </span>
                  </div>
                  
                  <span className="text-gray-500">
                    {novel.totalChapters} глав
                  </span>
                </div>
              </div>
              
              {/* Genres */}
              <div className="hidden lg:flex flex-wrap gap-2 max-w-xs">
                {novel.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
