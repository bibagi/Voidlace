# Настройка Firebase для облачной синхронизации

## Шаг 1: Создайте проект Firebase

1. Перейдите на https://console.firebase.google.com/
2. Нажмите "Add project" (Добавить проект)
3. Введите название проекта: `voidlace`
4. Отключите Google Analytics (не обязательно для этого проекта)
5. Нажмите "Create project"

## Шаг 2: Настройте Firestore Database

1. В левом меню выберите **Build** → **Firestore Database**
2. Нажмите **"Create database"**
3. Выберите режим **"Start in test mode"** (для разработки)
4. Выберите регион: **europe-west** (ближайший к вам)
5. Нажмите **"Enable"**

### Настройка правил безопасности (важно!)

После создания базы данных, перейдите во вкладку **"Rules"** и замените правила на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать и писать только свои данные
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Нажмите **"Publish"**

## Шаг 3: Получите конфигурацию Firebase

1. Нажмите на иконку **шестеренки** → **Project settings**
2. Прокрутите вниз до раздела **"Your apps"**
3. Нажмите на иконку **веб** (`</>`)
4. Введите название приложения: `voidlace-web`
5. **НЕ** включайте Firebase Hosting
6. Нажмите **"Register app"**
7. Скопируйте объект `firebaseConfig`

## Шаг 4: Создайте файл .env

В корне проекта создайте файл `.env` и вставьте ваши данные:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=voidlace-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=voidlace-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=voidlace-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

## Шаг 5: Настройте Vercel

### Для локальной разработки:
Файл `.env` уже работает

### Для Vercel (продакшн):

1. Перейдите в настройки проекта на Vercel
2. Откройте **Settings** → **Environment Variables**
3. Добавьте каждую переменную:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Нажмите **"Save"**
5. Сделайте **Redeploy** проекта

## Шаг 6: Проверьте работу

1. Запустите проект: `npm run dev`
2. Войдите в аккаунт
3. В консоли браузера должно появиться: `✅ Firebase инициализирован`
4. Перейдите в профиль
5. Нажмите **"Сохранить в облако"**
6. Проверьте в Firebase Console → Firestore Database, что данные появились

## Как работает синхронизация

### Автоматическая синхронизация:
- ✅ Данные сохраняются в облако каждые 5 минут
- ✅ Данные сохраняются при закрытии страницы
- ✅ Данные сохраняются при изменении localStorage

### Ручная синхронизация:
- **Сохранить в облако** - принудительно сохранить текущие данные
- **Загрузить из облака** - загрузить данные с другого устройства

### Синхронизация между устройствами:

1. **На ПК:**
   - Войдите в аккаунт
   - Данные автоматически сохранятся в облако

2. **На телефоне:**
   - Войдите в тот же аккаунт
   - При входе появится вопрос: "Найдены данные в облаке. Загрузить их?"
   - Нажмите "OK"
   - Данные синхронизируются!

## Структура данных в Firestore

```
users/
  └── {userId}/
      ├── auth: string (localStorage auth-storage)
      ├── library: string (localStorage library-storage)
      ├── readerSettings: string (localStorage reader-settings)
      ├── theme: string (localStorage theme-storage)
      └── lastSync: timestamp
```

## Безопасность

- ✅ Каждый пользователь видит только свои данные
- ✅ Данные шифруются при передаче (HTTPS)
- ✅ Firebase Authentication не используется (данные привязаны к userId)

## Troubleshooting

### "Firebase не настроен"
- Проверьте, что файл `.env` создан
- Проверьте, что все переменные заполнены
- Перезапустите dev сервер

### "Ошибка сохранения в облако"
- Проверьте правила безопасности в Firestore
- Проверьте консоль браузера на ошибки
- Убедитесь, что Firestore Database включен

### Данные не синхронизируются
- Проверьте, что используете один и тот же userId
- Проверьте Firebase Console → Firestore Database
- Попробуйте ручную синхронизацию через кнопки в профиле

## Стоимость

Firebase предоставляет **бесплатный план** (Spark):
- 1 ГБ хранилища
- 10 ГБ трафика в месяц
- 50,000 чтений в день
- 20,000 записей в день

Этого более чем достаточно для личного использования!
