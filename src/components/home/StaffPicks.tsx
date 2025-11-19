import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Novel } from '../../types';
import { StarIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { formatNumber } from '../../utils/helpers';

interface StaffPicksProps {
  novels: Novel[];
}

export const StaffPicks: React.FC<StaffPicksProps> = ({ novels }) => {
  const navigate = useNavigate();
  const staffPicks = novels.filter(n => n.recommendedByStaff).slice(0, 6);

  if (staffPicks.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-12 lg:mb-16">
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 lg:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
          <ShieldCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Рекомендовано руководством</h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Лучшие произведения по мнению нашей команды</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {staffPicks.map((novel, index) => (
          <motion.div
            key={novel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            onClick={() => navigate(`/novel/${novel.id}`)}
            className="glass rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group relative"
          >
            {/* Бейдж рекомендации */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg flex items-center space-x-0.5 sm:space-x-1">
              <ShieldCheckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Выбор редакции</span>
            </div>

            <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
              <img
                src={novel.cover}
                alt={novel.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                <h3 className="text-sm sm:text-base lg:text-xl font-bold text-white mb-1 sm:mb-2 line-clamp-2">
                  {novel.title}
                </h3>
                <div className="flex items-center space-x-2 sm:space-x-3 text-white/90 text-xs sm:text-sm">
                  <div className="flex items-center space-x-0.5 sm:space-x-1">
                    <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    <span className="font-bold">{novel.rating}</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{formatNumber(novel.views)} просмотров</span>
                </div>
              </div>
            </div>

            {novel.staffRecommendationText && (
              <div className="p-2 sm:p-4 hidden sm:block">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">
                  "{novel.staffRecommendationText}"
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
