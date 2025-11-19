import { useState } from 'react';
import { Novel } from '../../types';
import { VolumeAccordion } from './VolumeAccordion';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface ChapterListProps {
  novel: Novel;
}

export const ChapterList: React.FC<ChapterListProps> = ({ novel }) => {
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  
  const filteredVolumes = novel.volumes.map(volume => ({
    ...volume,
    chapters: volume.chapters.filter(chapter => {
      if (showPremiumOnly) return chapter.isPremium;
      if (showFreeOnly) return !chapter.isPremium;
      return true;
    }),
  })).filter(volume => volume.chapters.length > 0);
  
  return (
    <div className="glass rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Главы</h2>
        
        <div className="flex items-center space-x-3">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          
          <button
            onClick={() => {
              setShowFreeOnly(!showFreeOnly);
              setShowPremiumOnly(false);
            }}
            className={`px-4 py-2 rounded-xl transition-all ${
              showFreeOnly
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Бесплатные
          </button>
          
          <button
            onClick={() => {
              setShowPremiumOnly(!showPremiumOnly);
              setShowFreeOnly(false);
            }}
            className={`px-4 py-2 rounded-xl transition-all ${
              showPremiumOnly
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Premium
          </button>
        </div>
      </div>
      
      <VolumeAccordion volumes={filteredVolumes} novelId={novel.id} />
    </div>
  );
};
