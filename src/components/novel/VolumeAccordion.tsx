import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Volume } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../../store/useLibraryStore';
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { getReadingTime } from '../../utils/helpers';

interface VolumeAccordionProps {
  volumes: Volume[];
  novelId: string;
}

export const VolumeAccordion: React.FC<VolumeAccordionProps> = ({ volumes, novelId }) => {
  const [openVolumes, setOpenVolumes] = useState<Set<string>>(new Set([volumes[0]?.id]));
  const navigate = useNavigate();
  const { readingProgress } = useLibraryStore();
  
  const toggleVolume = (volumeId: string) => {
    setOpenVolumes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(volumeId)) {
        newSet.delete(volumeId);
      } else {
        newSet.add(volumeId);
      }
      return newSet;
    });
  };
  
  const isChapterRead = (chapterId: string) => {
    const progress = readingProgress[novelId];
    if (!progress) return false;
    
    const currentChapterNum = parseInt(chapterId.split('-')[2]);
    const readChapterNum = parseInt(progress.chapterId.split('-')[2]);
    
    return currentChapterNum < readChapterNum || (currentChapterNum === readChapterNum && progress.progress === 100);
  };
  
  return (
    <div className="space-y-4">
      {volumes.map((volume) => {
        const isOpen = openVolumes.has(volume.id);
        
        return (
          <motion.div
            key={volume.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Volume Header */}
            <button
              onClick={() => toggleVolume(volume.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">
                    {volume.number}
                  </span>
                </div>
                
                <div className="text-left">
                  <h3 className="text-xl font-bold">{volume.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {volume.chapters.length} глав
                  </p>
                </div>
              </div>
              
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDownIcon className="w-6 h-6" />
              </motion.div>
            </button>
            
            {/* Chapters List */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 space-y-2">
                    {volume.chapters.map((chapter) => {
                      const isRead = isChapterRead(chapter.id);
                      
                      return (
                        <motion.button
                          key={chapter.id}
                          whileHover={{ scale: 1.02, x: 4 }}
                          onClick={() => navigate(`/reader/${novelId}/${chapter.id}`)}
                          className="w-full px-4 py-3 flex items-center justify-between bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors group"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {isRead && (
                              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                            )}
                            
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-medium truncate group-hover:text-primary-500 transition-colors">
                                Глава {chapter.number}: {chapter.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {getReadingTime(chapter.wordCount)}
                              </p>
                            </div>
                          </div>
                          
                          {chapter.isPremium && (
                            <div className="flex items-center space-x-1 text-yellow-500 flex-shrink-0">
                              <LockClosedIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">Premium</span>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
