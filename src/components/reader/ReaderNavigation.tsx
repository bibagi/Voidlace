import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Chapter } from '../../types';

interface ReaderNavigationProps {
  novelId: string;
  currentChapter: Chapter;
  prevChapter?: Chapter;
  nextChapter?: Chapter;
  onClose: () => void;
}

export const ReaderNavigation: React.FC<ReaderNavigationProps> = ({
  novelId,
  currentChapter,
  prevChapter,
  nextChapter,
  onClose,
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      {/* Top Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 glass border-b border-white/10 z-30"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="flex-1 text-center px-4">
            <h2 className="font-bold text-lg truncate">
              Глава {currentChapter.number}: {currentChapter.title}
            </h2>
          </div>
          
          <button
            onClick={() => navigate(`/novel/${novelId}`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ListBulletIcon className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
      
      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-30"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => prevChapter && navigate(`/reader/${novelId}/${prevChapter.id}`)}
            disabled={!prevChapter}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span className="hidden sm:block">Предыдущая</span>
          </motion.button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Глава {currentChapter.number}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => nextChapter && navigate(`/reader/${novelId}/${nextChapter.id}`)}
            disabled={!nextChapter}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:block">Следующая</span>
            <ChevronRightIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
      
      {/* Side Navigation (Desktop) */}
      <div className="hidden lg:block">
        {prevChapter && (
          <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            onClick={() => navigate(`/reader/${novelId}/${prevChapter.id}`)}
            className="fixed left-4 top-1/2 -translate-y-1/2 p-4 glass rounded-full shadow-xl z-30"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </motion.button>
        )}
        
        {nextChapter && (
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            onClick={() => navigate(`/reader/${novelId}/${nextChapter.id}`)}
            className="fixed right-4 top-1/2 -translate-y-1/2 p-4 glass rounded-full shadow-xl z-30"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </motion.button>
        )}
      </div>
    </>
  );
};
