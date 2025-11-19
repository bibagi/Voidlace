import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useNovel } from '../hooks/useNovels';
import { NovelHeader } from '../components/novel/NovelHeader';
import { ChapterList } from '../components/novel/ChapterList';
import { Loading } from '../components/common/Loading';

export const NovelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { novel, loading } = useNovel(id!);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  if (loading) {
    return <Loading />;
  }
  
  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl">Произведение не найдено</p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-16"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <NovelHeader novel={novel} />
        
        {/* Description */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-8 my-8"
        >
          <h2 className="text-3xl font-bold mb-4">Описание</h2>
          
          <div className="relative">
            <p className={`text-lg leading-relaxed ${!showFullDescription && 'line-clamp-4'}`}>
              {novel.description}
            </p>
            
            {!showFullDescription && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
            )}
          </div>
          
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="mt-4 text-primary-500 hover:text-primary-600 font-semibold"
          >
            {showFullDescription ? 'Скрыть' : 'Показать полностью'}
          </button>
          
          {/* Additional Info */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Тип</p>
              <p className="font-semibold capitalize">{novel.type}</p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Перевод</p>
              <p className="font-semibold capitalize">
                {novel.translationType === 'official' ? 'Официальный' : 
                 novel.translationType === 'fan' ? 'Фанатский' : 'Оригинал'}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Год</p>
              <p className="font-semibold">{novel.year}</p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Глав</p>
              <p className="font-semibold">{novel.totalChapters}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Chapters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ChapterList novel={novel} />
        </motion.div>
      </div>
    </motion.div>
  );
};
