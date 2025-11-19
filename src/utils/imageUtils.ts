// Утилиты для работы с изображениями

/**
 * Сжимает изображение до указанного размера
 * @param file - Файл изображения
 * @param maxWidth - Максимальная ширина
 * @param maxHeight - Максимальная высота
 * @param quality - Качество сжатия (0-1)
 * @returns Promise с base64 строкой
 */
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Вычисляем новые размеры с сохранением пропорций
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Не удалось получить контекст canvas'));
          return;
        }
        
        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Конвертируем в base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Ошибка загрузки изображения'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Проверяет размер base64 строки в килобайтах
 * @param base64String - Base64 строка
 * @returns Размер в KB
 */
export const getBase64Size = (base64String: string): number => {
  const stringLength = base64String.length - 'data:image/jpeg;base64,'.length;
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
  return sizeInBytes / 1024;
};

/**
 * Валидирует файл изображения
 * @param file - Файл для проверки
 * @param maxSizeMB - Максимальный размер в мегабайтах
 * @returns true если файл валиден
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } => {
  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Файл должен быть изображением' };
  }
  
  // Проверка размера
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Размер файла не должен превышать ${maxSizeMB}MB` };
  }
  
  return { valid: true };
};

/**
 * Обрабатывает загрузку изображения с валидацией и сжатием
 * @param file - Файл изображения
 * @param options - Опции обработки
 * @returns Promise с обработанным base64
 */
export const processImageUpload = async (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeMB?: number;
  } = {}
): Promise<string> => {
  const {
    maxWidth = 800,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeMB = 5,
  } = options;
  
  // Валидация
  const validation = validateImageFile(file, maxSizeMB);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Сжатие
  const compressed = await compressImage(file, maxWidth, maxHeight, quality);
  
  // Проверка размера после сжатия
  const size = getBase64Size(compressed);
  console.log(`Размер изображения после сжатия: ${size.toFixed(2)} KB`);
  
  return compressed;
};
