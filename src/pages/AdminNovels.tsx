import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { novelDB } from '../db/database';
import { Novel } from '../types';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export const AdminNovels: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  useEffect(() => {
    if (!canEdit) {
      navigate('/');
      return;
    }
    loadNovels();
  }, [canEdit, navigate]);

  const loadNovels = async () => {
    try {
      const data = await novelDB.getAll();
      setNovels(data);
    } catch (error) {
      console.error('Error loading novels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_novelId: string) => {
    if (confirm('Вы уверены, что хотите удалить это произведение?')) {
      try {
        // В будущем добавим метод delete в novelDB
        alert('Функция удаления будет добавлена в следующей версии');
      } catch (error) {
        console.error('Error deleting novel:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-8"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="p-2 glass rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </motion.button>
            <h1 className="text-4xl font-bold">Управление произведениями</h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Добавить произведение</span>
          </motion.button>
        </div>

        {/* Novels List */}
        <div className="grid grid-cols-1 gap-4">
          {novels.map((novel) => (
            <NovelCard
              key={novel.id}
              novel={novel}
              onEdit={() => navigate(`/admin/novels/edit/${novel.id}`)}
              onDelete={() => handleDelete(novel.id)}
            />
          ))}
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <AddNovelModal onClose={() => setShowAddForm(false)} onSuccess={loadNovels} />
        )}
      </div>
    </motion.div>
  );
};

const NovelCard: React.FC<{
  novel: Novel;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ novel, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-2xl p-6 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
  >
    <div className="flex items-center space-x-6">
      <img
        src={novel.cover}
        alt={novel.title}
        className="w-24 h-32 object-cover rounded-xl shadow-lg"
      />

      <div className="flex-1">
        <h3 className="text-2xl font-bold mb-2">{novel.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">{novel.author}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {novel.genres.map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 bg-primary-500/20 text-primary-600 dark:text-primary-400 text-sm rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>⭐ {novel.rating}</span>
          <span>👁️ {novel.views.toLocaleString()}</span>
          <span>📚 {novel.totalChapters} глав</span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          <PencilIcon className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDelete}
          className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const AddNovelModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: '',
    description: '',
    genres: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newNovel: Novel = {
      id: `novel-${Date.now()}`,
      title: formData.title,
      author: formData.author,
      cover: formData.cover || 'https://via.placeholder.com/400x600',
      rating: 0,
      ratingCount: 0,
      description: formData.description,
      genres: formData.genres.split(',').map(g => g.trim()),
      tags: formData.tags.split(',').map(t => t.trim()),
      status: 'ongoing',
      type: 'original',
      translationType: 'original',
      year: new Date().getFullYear(),
      views: 0,
      favorites: 0,
      totalChapters: 0,
      volumes: [],
    };

    try {
      await novelDB.insert(newNovel);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding novel:', error);
      alert('Ошибка при добавлении произведения');
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Добавить произведение</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Название *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Автор *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Обложка</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="url"
                    value={formData.cover}
                    onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                    placeholder="URL обложки или загрузите файл"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const { processImageUpload } = await import('../utils/imageUtils');
                          const compressed = await processImageUpload(file, {
                            maxWidth: 600,
                            maxHeight: 900,
                            quality: 0.85,
                          });
                          setFormData({ ...formData, cover: compressed });
                        } catch (error) {
                          console.error('Ошибка загрузки изображения:', error);
                          alert(error instanceof Error ? error.message : 'Ошибка загрузки изображения');
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <div className="px-4 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors flex items-center space-x-2 whitespace-nowrap">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Загрузить</span>
                  </div>
                </label>
              </div>
              {formData.cover && (
                <div className="mt-3">
                  <img
                    src={formData.cover}
                    alt="Предпросмотр"
                    className="w-32 h-48 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Описание *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Жанры (через запятую) *</label>
              <input
                type="text"
                value={formData.genres}
                onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                placeholder="Фэнтези, Экшен, Приключения"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Теги (через запятую)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Магия, Сильный ГГ, Академия"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
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
