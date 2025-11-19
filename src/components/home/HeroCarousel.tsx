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
    <div className="relative h-[600px] rounded-3xl overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-32 py-20">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl ml-8"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-3 py-1 bg-primary-500 text-white text-sm font-semibold rounded-full">
                    Популярное
                  </span>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-bold">{current.rating}</span>
                    <span className="text-gray-300 text-sm">
                      ({formatNumber(current.ratingCount)})
                    </span>
                  </div>
                </div>

                <h1 className="text-5xl font-bold text-white mb-4">
                  {current.title}
                </h1>

                <p className="text-lg text-gray-200 mb-6 line-clamp-3">
                  {current.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {current.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 glass text-white text-sm rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/novel/${current.id}`)}
                    className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-2xl flex items-center space-x-2"
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>Читать</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/novel/${current.id}`)}
                    className="px-8 py-4 glass text-white font-semibold rounded-xl"
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
        className="absolute left-12 top-1/2 -translate-y-1/2 p-4 glass rounded-full hover:bg-white/30 transition-colors z-10 shadow-2xl"
      >
        <ChevronLeftIcon className="w-8 h-8 text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-12 top-1/2 -translate-y-1/2 p-4 glass rounded-full hover:bg-white/30 transition-colors z-10 shadow-2xl"
      >
        <ChevronRightIcon className="w-8 h-8 text-white" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {featured.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
          />
        ))}
      </div>
    </div>
  );
};
