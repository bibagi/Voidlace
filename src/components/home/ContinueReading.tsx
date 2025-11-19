import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../../store/useLibraryStore';
import { Novel } from '../../types';
import { BookOpenIcon } from '@heroicons/react/24/outline';

interface ContinueReadingProps {
  novels: Novel[];
}

export const ContinueReading: React.FC<ContinueReadingProps> = ({ novels }) => {
  const navigate = useNavigate();
  const { readingProgress } = useLibraryStore();
  
  const continueReading = Object.values(readingProgress)
    .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime())
    .slice(0, 5)
    .map(progress => novels.find(n => n.id === progress.novelId))
    .filter(Boolean) as Novel[];
  
  if (continueReading.length === 0) return null;
  
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Продолжить чтение</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {continueReading.map((novel, index) => {
          const progress = readingProgress[novel.id];
          
          return (
            <motion.div
              key={novel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/reader/${novel.id}/${progress.chapterId}`)}
              className="glass rounded-2xl p-4 cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="flex space-x-4">
                <img
                  src={novel.cover}
                  alt={novel.title}
                  className="w-24 h-32 object-cover rounded-xl"
                />
                
                <div className="flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {novel.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Глава {progress.chapterId.split('-')[2]}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {progress.progress}%
                      </span>
                      <BookOpenIcon className="w-4 h-4 text-primary-500" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
