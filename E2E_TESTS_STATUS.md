# E2E Tests Status Report

**Date:** 2025-10-21

## 📊 Current Status: **BLOCKED**

### Issues Found:

1. **Next.js Middleware Bug in Dev Mode**
   - Error: `ENOENT: no such file or directory, open '.next/prerender-manifest.js'`
   - Причина: В dev режиме Next.js middleware динамически перекомпилируется и удаляет prerender-manifest.js
   - Это известная проблема Next.js 14.x с middleware в development режиме

2. **File Permission Issues**
   - Некоторые файлы в `.next/` принадлежат root пользователю
   - Блокирует rebuild и очистку

### Test Suite Overview:

#### 📁 `cypress/e2e/add-row.cy.ts` - 7 тестов
- ✅ Тесты создания сессий через API работают (200 OK)
- ❌ Все UI тесты падают с 500 ошибкой из-за middleware

**Tests:**
1. should display initial data with 2 rows
2. should add a new row when clicking Add Row button  
3. should allow editing the new row
4. should save the new row to the backend
5. should persist the new row after page reload
6. should allow adding multiple rows sequentially
7. should properly increment row numbers when adding rows

#### 📁 `cypress/e2e/edit.cy.ts` - 10 тестов

**Suite: Complete Receipt Editing Workflow**
1. should load the edit page and display receipt data
2. should allow editing quantity and recalculating totals
3. should allow adding new rows
4. should allow deleting rows
5. should handle invalid session ID gracefully
6. should handle missing session ID gracefully
7. should validate data before saving

**Suite: Thai Receipt Data Display Test**
8. should display Thai receipt with 11 rows
9. should allow clicking Add Row button
10. should allow selecting and deleting a row

### Solutions:

#### Option 1: Use Production Mode (Recommended)
```bash
npm run build
PORT=3004 npm start &
npm run test:e2e
```

#### Option 2: Disable Middleware for Tests
Временно отключить middleware в dev режиме

#### Option 3: Use Next.js 15
Обновиться до Next.js 15, где эта проблема исправлена

### Test Configuration:

**cypress.config.ts:**
- baseUrl: `http://localhost:3004`
- Browser: Electron 118 (headless)
- Cypress: 13.17.0

**package.json scripts:**
```json
"test:e2e": "TMPDIR=./.tmp cypress run"
```

### Recommendations:

1. **Создать dedicated test script** для запуска production server + тесты
2. **Добавить start-server-and-test** пакет для автоматизации
3. **Исправить middleware** - вынести cache headers в layout.tsx metadata
4. **Добавить CI/CD** pipeline с production build для e2e тестов

### Helper Script Created:

`run-e2e-tests.sh` - автоматически:
- Чистит .next
- Собирает production
- Запускает сервер
- Прогоняет тесты
- Останавливает сервер
