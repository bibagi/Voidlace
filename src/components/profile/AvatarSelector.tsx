import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhotoIcon, LinkIcon, ArrowUpTrayIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatarUrl: string) => void;
  isPremium?: boolean;
}

const premiumAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
];

const freeAvatars = [
  'https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff&size=200',
  'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=200',
  'https://ui-avatars.com/api/?name=User&background=ec4899&color=fff&size=200',
  'https://ui-avatars.com/api/?name=User&background=10b981&color=fff&size=200',
  'https://ui-avatars.com/api/?name=User&background=f59e0b&color=fff&size=200',
  'https://ui-avatars.com/api/?name=User&background=ef4444&color=fff&size=200',
  'https://ui-avatars.com/api/?name=User&background=06b6d4&color=fff&size=200',
  'https://ui-avatars.com/api/?name=User&background=84cc16&color=fff&size=200',
  'https://ui-avatars.com/api/?name=User&background=f97316&color=fff&size=200',
];

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2 ${active
      ? 'bg-primary-500 text-white shadow-lg'
      : 'glass hover:bg-white/50 dark:hover:bg-gray-800/50'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </motion.button>
);

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  isPremium = false,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [customUrl, setCustomUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера файла (5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер: 5 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onSelect(reader.result as string);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUrlSubmit = () => {
    if (customUrl.trim()) {
      onSelect(customUrl);
      setCustomUrl('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Выбрать аватар</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6 overflow-x-auto">
                <TabButton
                  active={activeTab === 'gallery'}
                  onClick={() => setActiveTab('gallery')}
                  icon={SparklesIcon}
                  label="Галерея"
                />
                <TabButton
                  active={activeTab === 'upload'}
                  onClick={() => setActiveTab('upload')}
                  icon={ArrowUpTrayIcon}
                  label="Загрузить"
                />
                <TabButton
                  active={activeTab === 'url'}
                  onClick={() => setActiveTab('url')}
                  icon={LinkIcon}
                  label="URL"
                />
              </div>

              {/* Content */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  {isPremium && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <SparklesIcon className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-bold">Premium аватары</h3>
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full">
                          Premium
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {premiumAvatars.map((url, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              onSelect(url);
                              onClose();
                            }}
                            className="aspect-square rounded-2xl overflow-hidden ring-2 ring-transparent hover:ring-yellow-500 hover:shadow-xl transition-all relative group"
                          >
                            <img src={url} alt={`Premium Avatar ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                              <span className="text-white text-xs font-semibold">Выбрать</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isPremium ? 0.3 : 0 }}
                  >
                    <h3 className="font-bold mb-3">Базовые аватары</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {freeAvatars.map((url, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (isPremium ? premiumAvatars.length : 0) * 0.05 + index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            onSelect(url);
                            onClose();
                          }}
                          className="aspect-square rounded-2xl overflow-hidden ring-2 ring-transparent hover:ring-primary-500 hover:shadow-lg transition-all relative group"
                        >
                          <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                            <span className="text-white text-xs font-semibold">Выбрать</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {!isPremium && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
                    >
                      <div className="flex items-start space-x-3">
                        <SparklesIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                            Разблокируйте Premium аватары
                          </h4>
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                            Получите доступ к эксклюзивной коллекции профессиональных аватаров
                          </p>
                          <button
                            onClick={() => {
                              onClose();
                              window.location.href = '/premium';
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
                          >
                            Узнать больше
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${isDragging
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-105'
                      : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
                      }`}
                  >
                    <motion.div
                      animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ repeat: isDragging ? Infinity : 0, duration: 1 }}
                    >
                      <PhotoIcon className={`w-16 h-16 mx-auto mb-4 transition-colors ${isDragging ? 'text-primary-500' : 'text-gray-400'
                        }`} />
                    </motion.div>
                    <p className="text-lg font-semibold mb-2">
                      {isDragging ? 'Отпустите файл' : 'Перетащите изображение сюда'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      или
                    </p>
                    <label className="inline-block px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl cursor-pointer hover:bg-primary-600 transition-all hover:scale-105">
                      Выбрать файл
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Поддерживаемые форматы: JPG, PNG, GIF, WebP</p>
                    <p>Максимальный размер: 5 МБ</p>
                  </div>
                </div>
              )}

              {activeTab === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      URL изображения
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {customUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 glass rounded-xl"
                    >
                      <p className="text-sm font-semibold mb-2">Предпросмотр:</p>
                      <div className="flex justify-center">
                        <img
                          src={customUrl}
                          alt="Preview"
                          className="w-32 h-32 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                          onError={(e) => {
                            e.currentTarget.src = 'https://ui-avatars.com/api/?name=Error&background=ef4444&color=fff&size=200';
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUrlSubmit}
                    disabled={!customUrl.trim()}
                    className="w-full px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <LinkIcon className="w-5 h-5" />
                    <span>Применить URL</span>
                  </motion.button>
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Вставьте прямую ссылку на изображение</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
