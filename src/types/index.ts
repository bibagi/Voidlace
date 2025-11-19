// Основные типы приложения

export interface Novel {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  cover: string;
  rating: number;
  ratingCount: number;
  description: string;
  genres: string[];
  tags: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  type: 'ranobe' | 'webnovel' | 'fanfic' | 'original';
  translationType: 'official' | 'fan' | 'original';
  year: number;
  views: number;
  favorites: number;
  volumes: Volume[];
  totalChapters: number;
  recommendedByStaff?: boolean;
  recommendedByCommunity?: boolean;
  staffRecommendationText?: string;
}

export interface Volume {
  id: string;
  number: number;
  title: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  volumeId: string;
  content: string;
  publishDate: string;
  isPremium: boolean;
  wordCount: number;
}

export interface ReadingProgress {
  userId: string;
  novelId: string;
  chapterId: string;
  progress: number; // 0-100
  lastRead: string;
  scrollPosition: number;
}

export interface LibraryItem {
  userId: string;
  novelId: string;
  addedDate: string;
  isFavorite: boolean;
  status: 'reading' | 'completed' | 'plan-to-read' | 'dropped';
}

export interface ReaderSettings {
  fontSize: number; // 14-24
  fontFamily: 'inter' | 'baskerville' | 'roboto' | 'system';
  lineHeight: number; // 1.5-2.5
  textWidth: number; // 600-900
  padding: number; // 20-60
  theme: 'white' | 'sepia' | 'dark' | 'black' | 'gradient';
  autoScroll: boolean;
  autoScrollSpeed: number; // 1-10
  ttsEnabled: boolean;
  ttsVoice: string;
  ttsRate: number; // 0.5-2
  blueLight: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en';
}
