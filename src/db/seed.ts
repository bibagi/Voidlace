// Заполнение базы данных начальными данными
import { novelDB } from './database';
import { Novel } from '../types';

const generateChapterContent = (chapterNum: number, title: string): string => {
  return `# Глава ${chapterNum}: ${title}

Это начало главы ${chapterNum}. Здесь разворачивается захватывающий сюжет, полный неожиданных поворотов и интересных персонажей.

Главный герой стоял на краю обрыва, глядя на бескрайние просторы перед собой. Ветер трепал его волосы, а в душе бушевала буря эмоций.

"Я не сдамся," - прошептал он, сжимая кулаки. - "Что бы ни случилось, я найду правду."

За его спиной раздались шаги. Он обернулся и увидел знакомую фигуру в капюшоне.

Прошло несколько часов с того момента, как они начали разговор. Информация, которую он получил, переворачивала всё его понимание мира с ног на голову.

Следующим утром он проснулся с первыми лучами солнца. Сегодня начинались тренировки.

Тренировочная площадка оказалась огромным полем, окружённым древними рунами. В воздухе чувствовалась концентрация магической энергии.

Часы превращались в дни, дни в недели. Тренировки были изнурительными, но с каждым днём он становился сильнее.`;
};

export const seedDatabase = async (force: boolean = false) => {
  // Проверяем, есть ли уже данные
  const existing = await novelDB.getAll();
  if (existing.length > 0 && !force) {
    console.log('База данных уже содержит данные');
    return;
  }
  
  if (force) {
    console.log('Принудительное пересоздание данных...');
  }

  const novels: Novel[] = [
    {
      id: '1',
      title: 'Возрождение Мага Теней',
      originalTitle: 'Shadow Mage Rebirth',
      author: 'Александр Волков',
      cover: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=600&fit=crop',
      rating: 4.8,
      ratingCount: 15420,
      description: 'После предательства и смерти, величайший маг теней получает второй шанс. Вернувшись на 20 лет назад, он решает изменить свою судьбу и отомстить тем, кто его предал.',
      genres: ['Фэнтези', 'Экшен', 'Приключения'],
      tags: ['Магия', 'Реинкарнация', 'Месть', 'Сильный ГГ'],
      status: 'ongoing',
      type: 'ranobe',
      translationType: 'fan',
      year: 2024,
      views: 1250000,
      favorites: 45000,
      totalChapters: 50,
      recommendedByStaff: true,
      staffRecommendationText: 'Захватывающая история о втором шансе и мести. Отличный баланс между экшеном и развитием персонажа.',
      volumes: [
        {
          id: 'v1-1',
          number: 1,
          title: 'Возвращение',
          chapters: Array.from({ length: 50 }, (_, i) => ({
            id: `ch-1-${i + 1}`,
            number: i + 1,
            title: `Глава ${i + 1}`,
            volumeId: 'v1-1',
            content: generateChapterContent(i + 1, 'Возвращение'),
            publishDate: new Date(2024, 0, i + 1).toISOString(),
            isPremium: false,
            wordCount: 3500 + Math.floor(Math.random() * 1000),
          })),
        },
      ],
    },
    {
      id: '2',
      title: 'Система Культиватора',
      author: 'Лю Чэнь',
      cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
      rating: 4.6,
      ratingCount: 23100,
      description: 'Обычный студент получает загадочную систему культивации, которая позволяет ему быстро повышать свой уровень.',
      genres: ['Уся', 'Фэнтези', 'Экшен'],
      tags: ['Система', 'Культивация', 'Сильный ГГ'],
      status: 'ongoing',
      type: 'webnovel',
      translationType: 'fan',
      year: 2023,
      views: 2100000,
      favorites: 67000,
      totalChapters: 30,
      recommendedByCommunity: true,
      volumes: [
        {
          id: 'v2-1',
          number: 1,
          title: 'Пробуждение системы',
          chapters: Array.from({ length: 30 }, (_, i) => ({
            id: `ch-2-${i + 1}`,
            number: i + 1,
            title: `Глава ${i + 1}`,
            volumeId: 'v2-1',
            content: generateChapterContent(i + 1, 'Пробуждение'),
            publishDate: new Date(2023, 5, i + 1).toISOString(),
            isPremium: i > 20,
            wordCount: 4000 + Math.floor(Math.random() * 1500),
          })),
        },
      ],
    },
    {
      id: '3',
      title: 'Академия Героев',
      author: 'Екатерина Светлова',
      cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
      rating: 4.9,
      ratingCount: 31500,
      description: 'В мире, где суперспособности стали нормой, открывается новая академия для подготовки героев.',
      genres: ['Супергерои', 'Экшен', 'Драма'],
      tags: ['Академия', 'Суперсилы', 'Тайна'],
      status: 'ongoing',
      type: 'original',
      translationType: 'original',
      year: 2024,
      views: 1800000,
      favorites: 52000,
      totalChapters: 40,
      recommendedByStaff: true,
      recommendedByCommunity: true,
      staffRecommendationText: 'Эпическая сага о выживании и становлении героя. Обязательно к прочтению!',
      volumes: [
        {
          id: 'v3-1',
          number: 1,
          title: 'Первый день',
          chapters: Array.from({ length: 40 }, (_, i) => ({
            id: `ch-3-${i + 1}`,
            number: i + 1,
            title: `Глава ${i + 1}`,
            volumeId: 'v3-1',
            content: generateChapterContent(i + 1, 'Академия'),
            publishDate: new Date(2024, 2, i + 1).toISOString(),
            isPremium: false,
            wordCount: 3200 + Math.floor(Math.random() * 800),
          })),
        },
      ],
    },
  ];

  // Вставляем данные
  await novelDB.bulkInsert(novels);

  console.log('База данных успешно заполнена!');
};
