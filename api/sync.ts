// Vercel Serverless Function для синхронизации данных через Upstash Redis
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Инициализация Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId, action, data } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Проверка конфигурации Redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(503).json({ 
      error: 'Redis not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN' 
    });
  }

  const key = `user:${userId}:sync`;

  try {
    switch (action) {
      case 'save':
        // Сохранение данных
        if (!data) {
          return res.status(400).json({ error: 'data is required' });
        }
        
        const saveData = {
          ...data,
          lastSync: new Date().toISOString(),
        };
        
        // Сохраняем в Redis с TTL 30 дней
        await redis.set(key, JSON.stringify(saveData), {
          ex: 30 * 24 * 60 * 60, // 30 дней
        });
        
        return res.status(200).json({ 
          success: true, 
          message: 'Data saved successfully' 
        });

      case 'load':
        // Загрузка данных
        const userData = await redis.get(key);
        
        if (!userData) {
          return res.status(404).json({ 
            error: 'No data found for this user' 
          });
        }
        
        return res.status(200).json({ 
          success: true, 
          data: typeof userData === 'string' ? JSON.parse(userData) : userData
        });

      case 'delete':
        // Удаление данных
        await redis.del(key);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Data deleted successfully' 
        });

      default:
        return res.status(400).json({ 
          error: 'Invalid action. Use: save, load, or delete' 
        });
    }
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
