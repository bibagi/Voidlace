import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { novelDB } from '../db/database';
import { Novel, Volume, Chapter } from '../types';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

export const EditNovel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'chapters'>('info');

  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  useEffect(() => {
    if (!canEdit) {
      navigate('/');
      return;
    }
    loadNovel();
  }, [id, canEdit, navigate]);

  const loadNovel = async () => {
    if (!id) return;
    try {
      const data = await novelDB.getById(id);
      setNovel(data || null);
    } catch (error) {
      console.error('Error loading novel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!novel) return;
    try {
      // Пересчитываем общее количество глав
      const totalChapters = novel.volumes.reduce((sum, vol) => sum + vol.chapters.length, 0);
      const updatedNovel = { ...novel, totalChapters };
      
      console.log('Saving novel with chapters:', updatedNovel);
      await novelDB.update(updatedNovel);
      alert('Произведение сохранено!');
      navigate('/admin/novels');
    } catch (error) {
      console.error('Error saving novel:', error);
      alert('Ошибка при сохранении: ' + error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Произведение не найдено</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-8"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/novels')}
              className="p-2 glass rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </motion.button>
            <h1 className="text-4xl font-bold">Редактирование: {novel.title}</h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg"
          >
            Сохранить
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'glass hover:bg-white/50 dark:hover:bg-gray-800/50'
            }`}
          >
            Информация
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'chapters'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'glass hover:bg-white/50 dark:hover:bg-gray-800/50'
            }`}
          >
            Главы ({novel.totalChapters})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'info' ? (
          <InfoTab novel={novel} setNovel={setNovel} />
        ) : (
          <ChaptersTab novel={novel} setNovel={setNovel} />
        )}
      </div>
    </motion.div>
  );
};

const InfoTab: React.FC<{
  novel: Novel;
  setNovel: (novel: Novel) => void;
}> = ({ novel, setNovel }) => {
  return (
    <div className="glass rounded-3xl p-8 space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2">Название</label>
        <input
          type="text"
          value={novel.title}
          onChange={(e) => setNovel({ ...novel, title: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Автор</label>
        <input
          type="text"
          value={novel.author}
          onChange={(e) => setNovel({ ...novel, author: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">URL обложки</label>
        <input
          type="url"
          value={novel.cover}
          onChange={(e) => setNovel({ ...novel, cover: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Описание</label>
        <textarea
          value={novel.description}
          onChange={(e) => setNovel({ ...novel, description: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Жанры (через запятую)</label>
          <input
            type="text"
            value={novel.genres.join(', ')}
            onChange={(e) => setNovel({ ...novel, genres: e.target.value.split(',').map(g => g.trim()) })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Теги (через запятую)</label>
          <input
            type="text"
            value={novel.tags.join(', ')}
            onChange={(e) => setNovel({ ...novel, tags: e.target.value.split(',').map(t => t.trim()) })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Рекомендации */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
        <h3 className="text-lg font-bold mb-4">Рекомендации</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 glass rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Рекомендовано руководством</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Отображается в специальном разделе</p>
              </div>
            </div>
            <button
              onClick={() => setNovel({ ...novel, recommendedByStaff: !novel.recommendedByStaff })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                novel.recommendedByStaff ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <motion.div
                animate={{ x: novel.recommendedByStaff ? 24 : 0 }}
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
              />
            </button>
          </div>

          {novel.recommendedByStaff && (
            <div>
              <label className="block text-sm font-semibold mb-2">Текст рекомендации (опционально)</label>
              <textarea
                value={novel.staffRecommendationText || ''}
                onChange={(e) => setNovel({ ...novel, staffRecommendationText: e.target.value })}
                rows={2}
                placeholder="Краткое описание, почему это произведение рекомендовано..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4 glass rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Рекомендовано сообществом</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Любимое произведение читателей</p>
              </div>
            </div>
            <button
              onClick={() => setNovel({ ...novel, recommendedByCommunity: !novel.recommendedByCommunity })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                novel.recommendedByCommunity ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <motion.div
                animate={{ x: novel.recommendedByCommunity ? 24 : 0 }}
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChaptersTab: React.FC<{
  novel: Novel;
  setNovel: (novel: Novel) => void;
}> = ({ novel, setNovel }) => {
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<string>(novel.volumes[0]?.id || '');
  const [hasChanges, setHasChanges] = useState(false);

  const addVolume = () => {
    const newVolume: Volume = {
      id: `vol-${Date.now()}`,
      number: novel.volumes.length + 1,
      title: `Том ${novel.volumes.length + 1}`,
      chapters: [],
    };
    setNovel({ ...novel, volumes: [...novel.volumes, newVolume] });
    setHasChanges(true);
  };

  const addChapter = (volumeId: string, chapterData: Partial<Chapter>) => {
    const volumes = novel.volumes.map(vol => {
      if (vol.id === volumeId) {
        const newChapter: Chapter = {
          id: `ch-${Date.now()}`,
          number: vol.chapters.length + 1,
          title: chapterData.title || `Глава ${vol.chapters.length + 1}`,
          volumeId: vol.id,
          content: chapterData.content || '',
          publishDate: new Date().toISOString(),
          isPremium: chapterData.isPremium || false,
          wordCount: chapterData.content?.split(/\s+/).filter(w => w.length > 0).length || 0,
        };
        console.log('Adding chapter:', newChapter);
        return { ...vol, chapters: [...vol.chapters, newChapter] };
      }
      return vol;
    });
    
    const totalChapters = volumes.reduce((sum, vol) => sum + vol.chapters.length, 0);
    console.log('Total chapters after add:', totalChapters);
    setNovel({ ...novel, volumes, totalChapters });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-700 dark:text-yellow-300"
        >
          ⚠️ У вас есть несохранённые изменения. Не забудьте нажать "Сохранить" вверху страницы!
        </motion.div>
      )}
      
      {/* Add Volume Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={addVolume}
        className="w-full p-4 glass rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all flex items-center justify-center space-x-2"
      >
        <PlusIcon className="w-5 h-5" />
        <span className="font-semibold">Добавить том</span>
      </motion.button>

      {/* Volumes */}
      {novel.volumes.map((volume) => (
        <div key={volume.id} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              Том {volume.number}: {volume.title}
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedVolume(volume.id);
                setShowAddChapter(true);
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Добавить главу</span>
            </motion.button>
          </div>

          <div className="space-y-2">
            {volume.chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">
                    Глава {chapter.number}: {chapter.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {chapter.wordCount} слов
                    {chapter.isPremium && ' • Premium'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Chapter Modal */}
      {showAddChapter && (
        <AddChapterModal
          onClose={() => setShowAddChapter(false)}
          onAdd={(data) => {
            addChapter(selectedVolume, data);
            setShowAddChapter(false);
          }}
        />
      )}
    </div>
  );
};

const AddChapterModal: React.FC<{
  onClose: () => void;
  onAdd: (data: Partial<Chapter>) => void;
}> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, content, isPremium });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div className="glass rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6">Добавить главу</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Название главы</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Содержание</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                placeholder="Введите текст главы..."
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="premium"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-5 h-5 accent-primary-500"
              />
              <label htmlFor="premium" className="text-sm font-semibold">
                Premium глава
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg"
              >
                Добавить
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-xl"
              >
                Отмена
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};
