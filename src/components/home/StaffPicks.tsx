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
    <section className="mb-16">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
          <ShieldCheckIcon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Рекомендовано руководством</h2>
          <p className="text-gray-600 dark:text-gray-400">Лучшие произведения по мнению нашей команды</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffPicks.map((novel, index) => (
          <motion.div
            key={novel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            onClick={() => navigate(`/novel/${novel.id}`)}
            className="glass rounded-2xl overflow-hidden cursor-pointer group relative"
          >
            {/* Бейдж рекомендации */}
            <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center space-x-1">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Выбор редакции</span>
            </div>

            <div className="relative h-64 overflow-hidden">
              <img
                src={novel.cover}
                alt={novel.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                  {novel.title}
                </h3>
                <div className="flex items-center space-x-3 text-white/90 text-sm">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold">{novel.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{formatNumber(novel.views)} просмотров</span>
                </div>
              </div>
            </div>

            {novel.staffRecommendationText && (
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">
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
