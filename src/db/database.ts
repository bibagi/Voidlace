// IndexedDB Database setup using Dexie
import Dexie, { Table } from 'dexie';
import { Novel, ReadingProgress, LibraryItem } from '../types';
import { User } from '../types/user';

// Интерфейс для комментариев
export interface Comment {
  id: string;
  novelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating?: number;
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export class VoidlaceDB extends Dexie {
  // Основные таблицы
  novels!: Table<Novel, string>;
  users!: Table<User, string>;
  library!: Table<LibraryItem, string>;
  progress!: Table<ReadingProgress, string>;
  comments!: Table<Comment, string>;

  constructor() {
    super('VoidlaceDB');

    // Версия 4 - полная локальная БД
    this.version(4).stores({
      // Произведения
      novels: 'id, title, author, year, rating, status, *genres, *tags',
      
      // Пользователи
      users: 'id, username, email, role, createdAt',
      
      // Библиотека пользователя
      library: '[userId+novelId], userId, novelId, addedDate, status, isFavorite',
      
      // Прогресс чтения
      progress: '[userId+novelId], userId, novelId, chapterId, lastRead',
      
      // Комментарии
      comments: 'id, novelId, userId, createdAt',
    }).upgrade(async (trans) => {
      console.log('Upgrading database to version 4 - full local storage');
      
      // Миграция существующих данных если нужно
      const oldLibrary = await trans.table('library').toArray();
      const oldProgress = await trans.table('progress').toArray();
      
      // Очищаем и переносим данные
      await trans.table('library').clear();
      await trans.table('progress').clear();
      
      // Восстанавливаем данные с новой структурой
      for (const item of oldLibrary) {
        await trans.table('library').put(item);
      }
      
      for (const item of oldProgress) {
        await trans.table('progress').put(item);
      }
    });
  }
}

const db = new VoidlaceDB();

// Инициализация базы данных
export const initDatabase = async () => {
  // База создаётся автоматически при первом использовании
  await db.open();
  
  // Проверяем есть ли данные, если нет - заполняем
  const novelsCount = await db.novels.count();
  if (novelsCount === 0) {
    console.log('БД пуста, запускаем seed...');
    const { seedDatabase } = await import('./seed');
    await seedDatabase();
  }
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

// CRUD операции для пользователей
export const userDB = {
  getAll: async (): Promise<User[]> => {
    return await db.users.toArray();
  },

  getById: async (id: string): Promise<User | undefined> => {
    return await db.users.get(id);
  },

  getByUsername: async (username: string): Promise<User | undefined> => {
    return await db.users.where('username').equals(username).first();
  },

  insert: async (user: User): Promise<void> => {
    await db.users.put(user);
  },

  update: async (user: User): Promise<void> => {
    await db.users.put(user);
  },

  delete: async (id: string): Promise<void> => {
    await db.users.delete(id);
  },
};

// CRUD операции для комментариев
export const commentDB = {
  getAll: async (): Promise<Comment[]> => {
    return await db.comments.toArray();
  },

  getByNovelId: async (novelId: string): Promise<Comment[]> => {
    return await db.comments
      .where('novelId')
      .equals(novelId)
      .reverse()
      .sortBy('createdAt');
  },

  getByUserId: async (userId: string): Promise<Comment[]> => {
    return await db.comments
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('createdAt');
  },

  insert: async (comment: Comment): Promise<void> => {
    await db.comments.put(comment);
  },

  update: async (comment: Comment): Promise<void> => {
    await db.comments.put(comment);
  },

  delete: async (id: string): Promise<void> => {
    await db.comments.delete(id);
  },

  toggleLike: async (commentId: string, userId: string): Promise<void> => {
    const comment = await db.comments.get(commentId);
    if (!comment) return;

    const likedBy = comment.likedBy || [];
    const index = likedBy.indexOf(userId);

    if (index > -1) {
      // Unlike
      likedBy.splice(index, 1);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like
      likedBy.push(userId);
      comment.likes += 1;
    }

    comment.likedBy = likedBy;
    comment.updatedAt = new Date().toISOString();
    await db.comments.put(comment);
  },
};

// Экспорт всей БД для синхронизации
export const exportDatabase = async () => {
  const data = {
    novels: await db.novels.toArray(),
    users: await db.users.toArray(),
    library: await db.library.toArray(),
    progress: await db.progress.toArray(),
    comments: await db.comments.toArray(),
    exportDate: new Date().toISOString(),
  };
  
  return JSON.stringify(data);
};

// Импорт всей БД
export const importDatabase = async (jsonData: string) => {
  try {
    const data = JSON.parse(jsonData);
    
    // Очищаем существующие данные
    await db.novels.clear();
    await db.users.clear();
    await db.library.clear();
    await db.progress.clear();
    await db.comments.clear();
    
    // Импортируем новые данные
    if (data.novels) await db.novels.bulkPut(data.novels);
    if (data.users) await db.users.bulkPut(data.users);
    if (data.library) await db.library.bulkPut(data.library);
    if (data.progress) await db.progress.bulkPut(data.progress);
    if (data.comments) await db.comments.bulkPut(data.comments);
    
    console.log('✅ База данных импортирована');
    return true;
  } catch (error) {
    console.error('❌ Ошибка импорта базы данных:', error);
    return false;
  }
};

// Получение статистики БД
export const getDatabaseStats = async () => {
  return {
    novels: await db.novels.count(),
    users: await db.users.count(),
    library: await db.library.count(),
    progress: await db.progress.count(),
    comments: await db.comments.count(),
  };
};

export default db;
