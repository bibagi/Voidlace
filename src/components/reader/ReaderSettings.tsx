import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useReaderStore } from '../../store/useReaderStore';
import { useState } from 'react';

export const ReaderSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useReaderStore();
  
  const fontFamilies = [
    { value: 'inter' as const, label: 'Inter', class: 'font-reader-inter' },
    { value: 'baskerville' as const, label: 'Baskerville', class: 'font-reader-baskerville' },
    { value: 'roboto' as const, label: 'Roboto Mono', class: 'font-reader-roboto' },
    { value: 'system' as const, label: 'System', class: 'font-reader-system' },
  ];
  
  const themes = [
    { value: 'white' as const, label: 'Белый', class: 'reader-white' },
    { value: 'sepia' as const, label: 'Сепия', class: 'reader-sepia' },
    { value: 'dark' as const, label: 'Тёмный', class: 'reader-dark' },
    { value: 'black' as const, label: 'Чёрный', class: 'reader-black' },
    { value: 'gradient' as const, label: 'Градиент', class: 'reader-gradient' },
  ];
  
  return (
    <>
      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-full shadow-2xl z-40"
      >
        <Cog6ToothIcon className="w-6 h-6" />
      </motion.button>
      
      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 glass shadow-2xl z-50 overflow-y-auto custom-scrollbar"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Настройки читалки</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Font Size */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold mb-3">
                    Размер шрифта: {settings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="28"
                    value={settings.fontSize}
                    onChange={(e) => settings.updateSettings({ fontSize: Number(e.target.value) })}
                    className="w-full accent-primary-500"
                  />
                </div>
                
                {/* Font Family */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold mb-3">Шрифт</label>
                  <div className="grid grid-cols-2 gap-2">
                    {fontFamilies.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => settings.updateSettings({ fontFamily: font.value })}
                        className={`p-3 rounded-xl transition-all ${
                          settings.fontFamily === font.value
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        } ${font.class}`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Line Height */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold mb-3">
                    Межстрочный интервал: {settings.lineHeight.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="1.5"
                    max="2.5"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => settings.updateSettings({ lineHeight: Number(e.target.value) })}
                    className="w-full accent-primary-500"
                  />
                </div>
                
                {/* Text Width */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold mb-3">
                    Ширина текста: {settings.textWidth}px
                  </label>
                  <input
                    type="range"
                    min="600"
                    max="1000"
                    step="50"
                    value={settings.textWidth}
                    onChange={(e) => settings.updateSettings({ textWidth: Number(e.target.value) })}
                    className="w-full accent-primary-500"
                  />
                </div>
                
                {/* Padding */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold mb-3">
                    Отступы: {settings.padding}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="10"
                    value={settings.padding}
                    onChange={(e) => settings.updateSettings({ padding: Number(e.target.value) })}
                    className="w-full accent-primary-500"
                  />
                </div>
                
                {/* Theme */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold mb-3">Тема</label>
                  <div className="grid grid-cols-2 gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => settings.updateSettings({ theme: theme.value })}
                        className={`p-4 rounded-xl transition-all ${theme.class} ${
                          settings.theme === theme.value
                            ? 'ring-4 ring-primary-500 shadow-lg'
                            : 'hover:scale-105'
                        }`}
                      >
                        <div className="text-sm font-medium">{theme.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Auto Scroll */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold">Автопрокрутка</label>
                    <button
                      onClick={() => settings.updateSettings({ autoScroll: !settings.autoScroll })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.autoScroll ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.autoScroll ? 24 : 0 }}
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                  
                  {settings.autoScroll && (
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Скорость: {settings.autoScrollSpeed}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={settings.autoScrollSpeed}
                        onChange={(e) => settings.updateSettings({ autoScrollSpeed: Number(e.target.value) })}
                        className="w-full accent-primary-500"
                      />
                    </div>
                  )}
                </div>
                
                {/* Blue Light Filter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Синий фильтр</label>
                    <button
                      onClick={() => settings.updateSettings({ blueLight: !settings.blueLight })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.blueLight ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.blueLight ? 24 : 0 }}
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                </div>
                
                {/* Reset Button */}
                <button
                  onClick={() => settings.resetSettings()}
                  className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Сбросить настройки
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
