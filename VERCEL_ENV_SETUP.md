# ⚙️ Настройка переменных окружения в Vercel

## Шаг 1: Откройте настройки проекта

1. Перейдите на https://vercel.com/dashboard
2. Выберите ваш проект **Voidlace**
3. Нажмите **Settings** (вверху)
4. В левом меню выберите **Environment Variables**

## Шаг 2: Добавьте переменные

### Переменная 1: UPSTASH_REDIS_REST_URL

```
Name: UPSTASH_REDIS_REST_URL
Value: https://magical-wallaby-22552.upstash.io
```

Выберите окружения:
- ✅ Production
- ✅ Preview  
- ✅ Development

Нажмите **Save**

### Переменная 2: UPSTASH_REDIS_REST_TOKEN

```
Name: UPSTASH_REDIS_REST_TOKEN
Value: AVgYAAIncDI1MWQyMzk1ZTgxOTM0YWYzOWQ4NDAyNTM4ZWY5YTQ2ZHAyMjI1NTI
```

Выберите окружения:
- ✅ Production
- ✅ Preview
- ✅ Development

Нажмите **Save**

## Шаг 3: Redeploy

1. Перейдите в **Deployments**
2. Нажмите на последний деплой
3. Нажмите **⋯** (три точки)
4. Выберите **Redeploy**
5. Подождите завершения

## Готово! ✅

Теперь синхронизация будет работать!

---

**Важно:** Не коммитьте токены в Git! Они должны быть только в Vercel Dashboard.
