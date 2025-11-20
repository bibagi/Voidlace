import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export const SyncIndicator: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Слушаем события синхронизации
    const handleSyncStart = () => setStatus('syncing');
    const handleSyncSuccess = () => {
      setStatus('success');
      setLastSyncTime(new Date());
      setTimeout(() => setStatus('idle'), 2000);
    };
    const handleSyncError = () => {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    };

    window.addEventListener('sync:start', handleSyncStart);
    window.addEventListener('sync:success', handleSyncSuccess);
    window.addEventListener('sync:error', handleSyncError);

    return () => {
      window.removeEventListener('sync:start', handleSyncStart);
      window.removeEventListener('sync:success', handleSyncSuccess);
      window.removeEventListener('sync:error', handleSyncError);
    };
  }, []);

  const getTimeAgo = () => {
    if (!lastSyncTime) return '';
    const seconds = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000);
    if (seconds < 60) return 'только что';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    return `${hours} ч назад`;
  };

  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white/50 dark:bg-gray-800/50"
          title={lastSyncTime ? `Последняя синхронизация: ${getTimeAgo()}` : undefined}
        >
          {status === 'syncing' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <CloudArrowUpIcon className="w-4 h-4 text-blue-500" />
              </motion.div>
              <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                Синхронизация...
              </span>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                Сохранено
              </span>
            </>
          )}
          
          {status === 'error' && (
            <>
              <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                Ошибка
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
