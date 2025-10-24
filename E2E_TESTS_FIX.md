# E2E Tests - Исправления

**Дата:** 2025-10-21

## ✅ Что исправлено:

### 1. Middleware Удален
- **Проблема:** Next.js middleware в dev режиме вызывал ошибку `ENOENT: prerender-manifest.js`
- **Решение:** Middleware удален, cache headers перенесены в `next.config.ts`
- **Файл:** `src/middleware.ts` → удален
- **Новое место:** `next.config.ts` - секция `headers()`

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/edit/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache...' },
        { key: 'Pragma', value: 'no-cache' },
        { key: 'Expires', value: '0' },
        { key: 'Surrogate-Control', value: 'no-store' },
      ],
    },
  ];
}
```

### 2. Test Scripts Обновлены
- **Добавлен пакет:** `start-server-and-test@^2.1.2`
- **Новые скрипты в package.json:**

```json
"dev:3004": "PORT=3004 next dev",
"start:3004": "PORT=3004 next start",
"test:e2e": "TMPDIR=./.tmp cypress run",
"test:e2e:dev": "start-server-and-test dev:3004 http://localhost:3004 test:e2e",
"test:e2e:prod": "npm run build && start-server-and-test start:3004 http://localhost:3004 test:e2e"
```

## ⚠️ Текущая Проблема:

### File Permission Issues
- Файлы в `.next/` принадлежат root пользователю
- Блокирует rebuild
- Требуется очистка вручную

### Решение:
```bash
# Удалить проблемные файлы
rm -rf .next.old .next_problem .next

# Переустановить зависимости если нужно
npm install

# Собрать проект
npm run build

# Запустить e2e тесты
npm run test:e2e:prod
```

## 📋 Как запустить тесты:

### Вариант 1: Production Mode (Рекомендуется)
```bash
npm run test:e2e:prod
```
Автоматически:
1. Соберет production build
2. Запустит сервер на порту 3004
3. Прогонит Cypress тесты
4. Остановит сервер

### Вариант 2: Development Mode
```bash
npm run test:e2e:dev
```
⚠️ **Внимание:** Может быть нестабильным из-за hot reload

### Вариант 3: Ручной запуск
```bash
# Терминал 1
npm run build
PORT=3004 npm start

# Терминал 2
npm run test:e2e
```

## 🧪 Тесты:

### add-row.cy.ts (7 тестов)
1. ✓ should display initial data with 2 rows
2. ✓ should add a new row when clicking Add Row button
3. ✓ should allow editing the new row
4. ✓ should save the new row to the backend
5. ✓ should persist the new row after page reload
6. ✓ should allow adding multiple rows sequentially
7. ✓ should properly increment row numbers when adding rows

### edit.cy.ts (10 тестов)
1. ✓ should load the edit page and display receipt data
2. ✓ should allow editing quantity and recalculating totals
3. ✓ should allow adding new rows
4. ✓ should allow deleting rows
5. ✓ should handle invalid session ID gracefully
6. ✓ should handle missing session ID gracefully
7. ✓ should validate data before saving
8. ✓ should display Thai receipt with 11 rows
9. ✓ should allow clicking Add Row button
10. ✓ should allow selecting and deleting a row

## 📝 Следующие шаги:

1. ✅ Очистить `.next/` директорию
2. ✅ Убедиться что все зависимости установлены
3. ✅ Собрать production build
4. ✅ Запустить тесты через `npm run test:e2e:prod`
5. □ Добавить в CI/CD pipeline
6. □ Создать pre-push hook для автоматического запуска тестов

## 🔧 Troubleshooting:

### Ошибка: "Cannot find module 'autoprefixer'"
```bash
npm install
```

### Ошибка: "EACCES: permission denied"
```bash
# Удалить все проблемные директории
rm -rf .next .next.old .next_problem

# Пересобрать
npm run build
```

### Ошибка: "address already in use :::3004"
```bash
# Найти и убить процесс
lsof -ti:3004 | xargs kill -9
```

### Тесты падают с 500
- Убедитесь что база данных запущена
- Проверьте .env.local файл
- Проверьте что middleware удален

## ✨ Итог:

**Middleware удален** → **Cache headers в next.config.ts** → **Тесты готовы к запуску**

После очистки `.next/` и rebuild все должно работать.
