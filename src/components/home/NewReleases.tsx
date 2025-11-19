import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Novel } from '../../types';
import { StarIcon, EyeIcon } from '@heroicons/react/24/solid';
import { formatNumber } from '../../utils/helpers';

interface NewReleasesProps {
  novels: Novel[];
}

export const NewReleases: React.FC<NewReleasesProps> = ({ novels }) => {
  const navigate = useNavigate();
  const newReleases = novels.slice(0, 10);
  
  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Новинки</h2>
        <button
          onClick={() => navigate('/catalog')}
          className="text-sm sm:text-base text-primary-500 hover:text-primary-600 font-semibold"
        >
          Все →
        </button>
      </div>
      
      <div className="relative">
        <div className="flex space-x-3 sm:space-x-4 lg:space-x-6 overflow-x-auto pb-4 custom-scrollbar">
          {newReleases.map((novel, index) => (
            <motion.div
              key={novel.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/novel/${novel.id}`)}
              className="flex-shrink-0 w-36 sm:w-48 lg:w-64 cursor-pointer group"
            >
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-3 shadow-lg group-hover:shadow-2xl transition-shadow">
                <img
                  src={novel.cover}
                  alt={novel.title}
                  className="w-full h-52 sm:h-64 lg:h-80 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Info on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center justify-between text-white text-sm">
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
              
              <h3 className="font-bold text-lg mb-1 line-clamp-2 group-hover:text-primary-500 transition-colors">
                {novel.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {novel.author}
              </p>
              
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
