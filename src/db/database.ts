// IndexedDB Database setup using Dexie
import Dexie, { Table } from 'dexie';
import { Novel, ReadingProgress, LibraryItem } from '../types';

export class VoidlaceDB extends Dexie {
  novels!: Table<Novel, string>;
  library!: Table<LibraryItem, string>;
  progress!: Table<ReadingProgress, string>;

  constructor() {
    super('VoidlaceDB');
    
    // Версия 1 - старая схема (для совместимости)
    this.version(1).stores({
      novels: 'id, title, author, year, rating, status',
      library: 'id, userId, novelId, addedDate, status',
      progress: 'id, userId, novelId, chapterId, lastRead',
    });
    
    // Версия 3 - новая схема с составными ключами
    this.version(3).stores({
      novels: 'id, title, author, year, rating, status',
      library: '[userId+novelId], userId, novelId, addedDate, status',
      progress: '[userId+novelId], userId, novelId, chapterId, lastRead',
    }).upgrade(async (trans) => {
      // Очищаем старые данные при миграции
      console.log('Upgrading database to version 3 - clearing old data');
      await trans.table('library').clear();
      await trans.table('progress').clear();
    });
  }
}

const db = new VoidlaceDB();

// Инициализация базы данных
export const initDatabase = async () => {
  // База создаётся автоматически при первом использовании
  await db.open();
};

// CRUD операции для произведений
export const novelDB = {
  getAll: async (): Promise<Novel[]> => {
    return await db.novels.toArray();
  },

  getById: async (id: string): Promise<Novel | undefined> => {
    return await db.novels.get(id);
  },

  insert: async (novel: Novel): Promise<void> => {
    console.log('Saving novel:', novel.id, 'Chapters:', novel.totalChapters);
    await db.novels.put(novel);
    console.log('Novel saved successfully');
  },

  update: async (novel: Novel): Promise<void> => {
    console.log('Updating novel:', novel.id, 'Chapters:', novel.totalChapters);
    await db.novels.put(novel);
    console.log('Novel updated successfully');
  },

  bulkInsert: async (novels: Novel[]): Promise<void> => {
    await db.novels.bulkPut(novels);
  },

  delete: async (id: string): Promise<void> => {
    await db.novels.delete(id);
  },

  search: async (query: string): Promise<Novel[]> => {
    const lowerQuery = query.toLowerCase();
    return await db.novels
      .filter(novel => 
        novel.title.toLowerCase().includes(lowerQuery) ||
        novel.author.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  },
};

// CRUD операции для библиотеки
export const libraryDB = {
  getAll: async (userId: string): Promise<LibraryItem[]> => {
    return await db.library.where('userId').equals(userId).toArray();
  },

  add: async (item: LibraryItem): Promise<void> => {
    await db.library.put(item);
  },

  remove: async (userId: string, novelId: string): Promise<void> => {
    await db.library.where('[userId+novelId]').equals([userId, novelId]).delete();
  },

  toggleFavorite: async (userId: string, novelId: string): Promise<void> => {
    const item = await db.library.get([userId, novelId]);
    if (item) {
      await db.library.put({ ...item, isFavorite: !item.isFavorite });
    }
  },
};

// CRUD операции для прогресса чтения
export const progressDB = {
  getAll: async (userId: string): Promise<Record<string, ReadingProgress>> => {
    const items = await db.progress.where('userId').equals(userId).toArray();
    const result: Record<string, ReadingProgress> = {};
    items.forEach(item => {
      result[item.novelId] = item;
    });
    return result;
  },

  update: async (progress: ReadingProgress): Promise<void> => {
    await db.progress.put(progress);
  },
};

export default db;
