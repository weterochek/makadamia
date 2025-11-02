# Миграция с MongoDB на Supabase

## Шаги миграции:

### 1. Установка зависимостей
```bash
npm install @supabase/supabase-js
npm uninstall mongoose mongodb
```

### 2. Создание таблиц в Supabase
Выполните SQL из файла `supabase-schema.sql` в SQL Editor вашего проекта Supabase.

### 3. Обновленные файлы:
- `package.json` - обновлены зависимости
- `config/supabase.js` - конфигурация подключения
- `models/User.js` - переписан для Supabase
- `models/Products.js` - переписан для Supabase  
- `models/Order.js` - переписан для Supabase
- `models/Cart.js` - переписан для Supabase
- `models/Review.js` - переписан для Supabase
- `server.js` - обновлены маршруты

### 4. Изменения в API:
- Все методы теперь используют Supabase вместо Mongoose
- ID теперь UUID вместо ObjectId
- Связи реализованы через foreign keys
- Автоматическая сортировка по created_at

### 5. Что нужно сделать дополнительно:
1. Обновить middleware/authMiddleware.js для работы с UUID
2. Обновить routes/orderRoutes.js и routes/reviewRoutes.js
3. Перенести существующие данные из MongoDB в Supabase
4. Обновить frontend для работы с UUID вместо ObjectId

### 6. Переменные окружения:
Можно удалить MONGO_URI из .env файла, так как теперь используется Supabase.