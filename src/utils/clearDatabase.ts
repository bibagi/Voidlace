// Утилита для очистки базы данных
export const clearDatabase = async () => {
  const dbName = 'VoidlaceDB';
  
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    
    request.onsuccess = () => {
      console.log('Database deleted successfully');
      resolve();
    };
    
    request.onerror = () => {
      console.error('Error deleting database');
      reject(request.error);
    };
    
    request.onblocked = () => {
      console.warn('Database deletion blocked. Close all tabs using this database.');
    };
  });
};

// Добавляем в window для вызова из консоли браузера
if (typeof window !== 'undefined') {
  (window as any).clearDatabase = clearDatabase;
}
