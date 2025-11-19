import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, PlayIcon } from '@heroicons/react/24/solid';
import { Novel } from '../../types';
import { formatNumber } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

interface HeroCarouselProps {
  novels: Novel[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ novels }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const featured = novels.slice(0, 5);

  useEffect(() => {
    if (featured.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 10000); // Изменено с 5000 на 10000 (10 секунд)

    return () => clearInterval(timer);
  }, [featured.length]);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % featured.length);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);

  if (featured.length === 0) {
    return null;
  }

  const current = featured[currentIndex];

  return (
    <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${current.cover})` }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/90 via-black/70 sm:via-black/50 to-black/30 sm:to-transparent" />

          {/* Content */}
          <div className="relative h-full flex items-end sm:items-center">
            <div className="container mx-auto px-4 sm:px-8 lg:px-32 py-6 sm:py-12 lg:py-20">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-full sm:max-w-2xl sm:ml-8"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <span className="px-2 sm:px-3 py-1 bg-primary-500 text-white text-xs sm:text-sm font-semibold rounded-full">
                    Популярное
                  </span>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    <span className="text-white text-sm sm:text-base font-bold">{current.rating}</span>
                    <span className="text-gray-300 text-xs sm:text-sm">
                      ({formatNumber(current.ratingCount)})
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 line-clamp-2">
                  {current.title}
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
                  {current.description}
                </p>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-8">
                  {current.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 glass text-white text-xs sm:text-sm rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/novel/${current.id}`)}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm sm:text-base font-semibold rounded-xl shadow-2xl flex items-center justify-center space-x-2"
                  >
                    <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Читать</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/novel/${current.id}`)}
                    className="px-6 sm:px-8 py-3 sm:py-4 glass text-white text-sm sm:text-base font-semibold rounded-xl"
                  >
                    Подробнее
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrev}
        className="absolute left-2 sm:left-4 lg:left-12 top-1/2 -translate-y-1/2 p-2 sm:p-3 lg:p-4 glass rounded-full hover:bg-white/30 transition-colors z-10 shadow-2xl"
      >
        <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 lg:right-12 top-1/2 -translate-y-1/2 p-2 sm:p-3 lg:p-4 glass rounded-full hover:bg-white/30 transition-colors z-10 shadow-2xl"
      >
        <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2 z-10">
        {featured.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 sm:h-2 rounded-full transition-all ${index === currentIndex ? 'w-6 sm:w-8 bg-white' : 'w-1.5 sm:w-2 bg-white/50'
              }`}
          />
        ))}
      </div>
    </div>
  );
};
