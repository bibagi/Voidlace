// Mock API для локальной разработки (когда Vercel API недоступен)

const STORAGE_KEY = 'mock-cloud-sync';

export const mockSyncApi = async (body: any) => {
  const { userId, action, data } = body;

  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 500));

  switch (action) {
    case 'save':
      // Сохраняем в localStorage как "облако"
      const saveData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(saveData));
      return { success: true, message: 'Data saved successfully (mock)' };

    case 'load':
      // Загружаем из localStorage
      const userData = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
      if (!userData) {
        throw { status: 404, message: 'No data found' };
      }
      return { success: true, data: JSON.parse(userData) };

    case 'delete':
      // Удаляем из localStorage
      localStorage.removeItem(`${STORAGE_KEY}:${userId}`);
      return { success: true, message: 'Data deleted successfully (mock)' };

    default:
      throw { status: 400, message: 'Invalid action' };
  }
};
