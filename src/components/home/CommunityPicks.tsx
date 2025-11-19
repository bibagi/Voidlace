import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Novel } from '../../types';
import { StarIcon, HeartIcon, UsersIcon } from '@heroicons/react/24/solid';
import { formatNumber } from '../../utils/helpers';

interface CommunityPicksProps {
  novels: Novel[];
}

export const CommunityPicks: React.FC<CommunityPicksProps> = ({ novels }) => {
  const navigate = useNavigate();
  const communityPicks = novels.filter(n => n.recommendedByCommunity).slice(0, 8);

  if (communityPicks.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-12 lg:mb-16">
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 lg:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
          <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Рекомендовано сообществом</h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Любимые произведения наших читателей</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {communityPicks.map((novel, index) => (
          <motion.div
            key={novel.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/novel/${novel.id}`)}
            className="glass rounded-2xl overflow-hidden cursor-pointer group relative"
          >
            {/* Бейдж рекомендации */}
            <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-10 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>

            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={novel.cover}
                alt={novel.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1 line-clamp-2">
                  {novel.title}
                </h3>
                <div className="flex items-center space-x-1.5 sm:space-x-2 text-white/90 text-[10px] sm:text-xs">
                  <div className="flex items-center space-x-0.5 sm:space-x-1">
                    <StarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />
                    <span className="font-bold">{novel.rating}</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center space-x-0.5 sm:space-x-1 hidden sm:flex">
                    <HeartIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-400" />
                    <span>{formatNumber(novel.favorites)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
