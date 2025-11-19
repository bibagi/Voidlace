import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '../../store/useThemeStore';
import { useState } from 'react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const themes = [
    { value: 'light' as const, label: 'Светлая', icon: SunIcon },
    { value: 'dark' as const, label: 'Тёмная', icon: MoonIcon },
    { value: 'system' as const, label: 'Система', icon: ComputerDesktopIcon },
  ];
  
  const currentTheme = themes.find(t => t.value === theme) || themes[2];
  const Icon = currentTheme.icon;
  
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Icon className="w-6 h-6" />
      </motion.button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-xl overflow-hidden z-50"
          >
            {themes.map((t) => {
              const ThemeIcon = t.icon;
              return (
                <motion.button
                  key={t.value}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                  onClick={() => {
                    setTheme(t.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center space-x-3 transition-colors"
                >
                  <ThemeIcon className="w-5 h-5" />
                  <span className="font-medium">{t.label}</span>
                  {theme === t.value && (
                    <motion.div
                      layoutId="theme-indicator"
                      className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
};
