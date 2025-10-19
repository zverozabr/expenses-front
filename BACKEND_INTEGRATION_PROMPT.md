# 🤖 BACKEND INTEGRATION PROMPT

## MISSION: Интегрировать Telegram бота с веб-редактором чеков

### 🎯 ЦЕЛЬ:
Добавить возможность редактирования чеков через веб-интерфейс в существующего Telegram бота.

---

## 📋 ТЕКУЩАЯ АРХИТЕКТУРА БОТА

### Существующие компоненты:
- **OCR обработка** (Google Vision)
- **AI анализ** (GPT-5 + Claude)
- **Обработка чеков** (receipt_processor)
- **Telegram handlers** (бот логика)

### Новый компонент для добавления:
- **SessionManager** - управление сессиями редактирования
- **Веб-интеграция** - связь с Next.js фронтендом

---

## 🚀 ГОТОВЫЙ ФРОНТЕНД (НЕ ТРОГАТЬ)

### Production URL:
```
https://expenses-front.vercel.app
```

### API Endpoints:

#### 1. Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "database": {
    "connection": "successful",
    "provider": "Prisma Postgres",
    "sessions_table": "exists",
    "auto_migration": "successful"
  },
  "message": "Frontend is ready for bot integration"
}
```

#### 2. Получить данные сессии
```http
GET /api/session?session_id={uuid}
```
**Response:**
```json
{
  "data": [
    {
      "#": 1,
      "Qty": 2,
      "Unit": "pcs",
      "Price": 25.00,
      "Art": "DEMO001",
      "Item": "Demo Product",
      "Net": 50.00,
      "VAT": 0.00,
      "Total": 50.00
    }
  ]
}
```

#### 3. Сохранить данные сессии
```http
POST /api/session
Content-Type: application/json

{
  "session_id": "uuid-string",
  "data": [...]
}
```
**Response:**
```json
{
  "success": true
}
```

#### 4. Миграция базы данных
```http
POST /api/migrate
```
**Response:**
```json
{
  "success": true,
  "message": "Database migration completed"
}
```

---

## 📝 ЗАДАЧИ ДЛЯ РЕАЛИЗАЦИИ

### 1. Создать SessionManager

**Файл:** `src/receipt_processor/bot/session_manager.py`

**Функциональность:**
```python
class SessionManager:
    def __init__(self):
        # Инициализация с POSTGRES_URL

    def create_session(self, user_id: int, receipt_data: dict) -> str:
        """Создать новую сессию редактирования"""
        # Генерировать UUID
        # Сохранить данные в базу
        # Вернуть session_id

    def get_session_data(self, session_id: str) -> dict:
        """Получить данные сессии"""
        # Проверить существование
        # Вернуть данные или None

    def update_session_data(self, session_id: str, data: dict):
        """Обновить данные сессии"""
        # Сохранить отредактированные данные

    def mark_session_complete(self, session_id: str):
        """Отметить сессию как завершенную"""
        # Изменить статус на 'ready'

    def cleanup_old_sessions(self, days: int = 7):
        """Очистить старые сессии"""
        # Удалить сессии старше N дней
```

### 2. Обновить Telegram Handlers

**Файл:** `src/receipt_processor/bot/handlers.py`

**Новые команды:**
- `/edit` - запросить редактирование чека
- Inline кнопки: `[Принять]` `[Редактировать]`

**Новая логика:**
```python
# После обработки чека бот показывает кнопки
keyboard = InlineKeyboardMarkup([
    [InlineKeyboardButton("✅ Принять", callback_data=f"accept_{receipt_id}")],
    [InlineKeyboardButton("✏️ Редактировать", callback_data=f"edit_{receipt_id}")]
])

# Обработчик кнопки "Редактировать"
@bot.callback_query_handler(func=lambda call: call.data.startswith('edit_'))
def handle_edit_request(call):
    receipt_id = call.data.split('_')[1]

    # Создать сессию через SessionManager
    session_id = session_manager.create_session(call.from_user.id, receipt_data)

    # Отправить ссылку на редактор
    edit_url = f"https://expenses-front.vercel.app/edit?session_id={session_id}"
    bot.send_message(
        call.message.chat.id,
        f"✏️ Отредактируйте чек в веб-интерфейсе:\n{edit_url}",
        reply_markup=get_back_to_bot_keyboard(session_id)
    )
```

### 3. Мониторинг завершения редактирования

**Логика опроса:**
```python
def check_session_completion(session_id: str) -> bool:
    """Проверить, завершил ли пользователь редактирование"""
    # Опросить API: GET /api/session?session_id={session_id}
    # Проверить статус сессии
    # Если status == 'ready', получить финальные данные
    # Вернуть True/False
```

### 4. Финализация обработки

**После завершения редактирования:**
```python
# Пользователь нажимает "Готово" в Telegram
@bot.callback_query_handler(func=lambda call: call.data.startswith('complete_'))
def handle_completion(call):
    session_id = call.data.split('_')[1]

    # Получить финальные данные
    final_data = session_manager.get_session_data(session_id)

    # Продолжить обычную обработку чека
    process_final_receipt(call.from_user.id, final_data)
```

---

## 🔄 ПОЛНЫЙ USER FLOW

```
1. User: 📷 Отправляет фото чека
2. Bot: 🤖 Обрабатывает OCR + AI
3. Bot: 📝 Показывает результат + кнопки [Принять] [Редактировать]
4. User: ✏️ Нажимает "Редактировать"
5. Bot: 💾 Создает session в Postgres
6. Bot: 🔗 Отправляет веб-ссылку
7. User: 🌐 Открывает редактор
8. User: ✨ Редактирует данные (Qty, Items, etc.)
9. User: 💾 Сохраняет изменения
10. User: ↩️ Возвращается в Telegram
11. User: 🔄 Нажимает "Готово"
12. Bot: ✅ Получает финальные данные
13. Bot: 📊 Продолжает обработку чека
```

---

## 🛠️ ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ

### Зависимости для добавления:
```bash
uv add psycopg2-binary
```

### Environment Variables:
```bash
# Уже должен быть в системе
POSTGRES_URL=postgresql://...
```

### Обработка ошибок:
- **API недоступен** → Fallback на обычную обработку
- **База недоступна** → Логировать и продолжить
- **Сессия не найдена** → Уведомить пользователя

### Безопасность:
- **UUID валидация** - проверять формат
- **User ownership** - сессии принадлежат создателю
- **Session timeout** - автоматически удалять старые сессии

---

## 🧪 ТЕСТИРОВАНИЕ ИНТЕГРАЦИИ

### Тест сценарии:
1. **Создание сессии** - проверить сохранение в БД
2. **Получение данных** - проверить загрузку в веб-интерфейсе
3. **Сохранение изменений** - проверить обновление в БД
4. **Завершение сессии** - проверить получение финальных данных
5. **Очистка сессий** - проверить удаление старых записей

### E2E тест:
```bash
python tests/e2e/test_frontend_integration.py
```

---

## 📚 ДОКУМЕНТАЦИЯ

### Готовая документация:
- `docs/TELEGRAM_EDIT_INTEGRATION.md` - Полная архитектура
- `docs/EDIT_INTEGRATION_QUICKSTART.md` - Быстрый старт
- `MIGRATION_COMPLETE.md` - Статус готовности

### Код для копирования:
- `src/lib/db-helpers.ts` - Примеры работы с БД
- `migrations/001_create_sessions_table.sql` - Структура таблицы

---

## 🎯 УСПЕХ КРИТЕРИИ

### ✅ Функциональность:
- [ ] Бот может создавать сессии редактирования
- [ ] Пользователи получают рабочие ссылки на редактор
- [ ] Веб-интерфейс загружает данные чека
- [ ] Изменения сохраняются в базу данных
- [ ] Бот может получить отредактированные данные

### ✅ Качество кода:
- [ ] SOLID принципы соблюдены
- [ ] Обработка ошибок реализована
- [ ] Код документирован
- [ ] Тесты проходят

### ✅ User Experience:
- [ ] Seamless переход между ботом и вебом
- [ ] Clear инструкции для пользователя
- [ ] Error handling без потери данных
- [ ] Performance не ухудшилась

---

## 🚀 РЕАЛИЗАЦИЯ

**Приступай к созданию SessionManager и обновлению handlers!**

Frontend уже готов и ждет интеграции. 🎉</content>
</xai:function_call<parameter name="content"># 🤖 BACKEND INTEGRATION PROMPT

## MISSION: Интегрировать Telegram бота с веб-редактором чеков

### 🎯 ЦЕЛЬ:
Добавить возможность редактирования чеков через веб-интерфейс в существующего Telegram бота.

---

## 📋 ТЕКУЩАЯ АРХИТЕКТУРА БОТА

### Существующие компоненты:
- **OCR обработка** (Google Vision)
- **AI анализ** (GPT-5 + Claude)
- **Обработка чеков** (receipt_processor)
- **Telegram handlers** (бот логика)

### Новый компонент для добавления:
- **SessionManager** - управление сессиями редактирования
- **Веб-интеграция** - связь с Next.js фронтендом

---

## 🚀 ГОТОВЫЙ ФРОНТЕНД (НЕ ТРОГАТЬ)

### Production URL:
```
https://expenses-front.vercel.app
```

### API Endpoints:

#### 1. Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "database": {
    "connection": "successful",
    "provider": "Prisma Postgres",
    "sessions_table": "exists",
    "auto_migration": "successful"
  },
  "message": "Frontend is ready for bot integration"
}
```

#### 2. Получить данные сессии
```http
GET /api/session?session_id={uuid}
```
**Response:**
```json
{
  "data": [
    {
      "#": 1,
      "Qty": 2,
      "Unit": "pcs",
      "Price": 25.00,
      "Art": "DEMO001",
      "Item": "Demo Product",
      "Net": 50.00,
      "VAT": 0.00,
      "Total": 50.00
    }
  ]
}
```

#### 3. Сохранить данные сессии
```http
POST /api/session
Content-Type: application/json

{
  "session_id": "uuid-string",
  "data": [...]
}
```
**Response:**
```json
{
  "success": true
}
```

#### 4. Миграция базы данных
```http
POST /api/migrate
```
**Response:**
```json
{
  "success": true,
  "message": "Database migration completed"
}
```

---

## 📝 ЗАДАЧИ ДЛЯ РЕАЛИЗАЦИИ

### 1. Создать SessionManager

**Файл:** `src/receipt_processor/bot/session_manager.py`

**Функциональность:**
```python
class SessionManager:
    def __init__(self):
        # Инициализация с POSTGRES_URL

    def create_session(self, user_id: int, receipt_data: dict) -> str:
        """Создать новую сессию редактирования"""
        # Генерировать UUID
        # Сохранить данные в базу
        # Вернуть session_id

    def get_session_data(self, session_id: str) -> dict:
        """Получить данные сессии"""
        # Проверить существование
        # Вернуть данные или None

    def update_session_data(self, session_id: str, data: dict):
        """Обновить данные сессии"""
        # Сохранить отредактированные данные

    def mark_session_complete(self, session_id: str):
        """Отметить сессию как завершенную"""
        # Изменить статус на 'ready'

    def cleanup_old_sessions(self, days: int = 7):
        """Очистить старые сессии"""
        # Удалить сессии старше N дней
```

### 2. Обновить Telegram Handlers

**Файл:** `src/receipt_processor/bot/handlers.py`

**Новые команды:**
- `/edit` - запросить редактирование чека
- Inline кнопки: `[Принять]` `[Редактировать]`

**Новая логика:**
```python
# После обработки чека бот показывает кнопки
keyboard = InlineKeyboardMarkup([
    [InlineKeyboardButton("✅ Принять", callback_data=f"accept_{receipt_id}")],
    [InlineKeyboardButton("✏️ Редактировать", callback_data=f"edit_{receipt_id}")]
])

# Обработчик кнопки "Редактировать"
@bot.callback_query_handler(func=lambda call: call.data.startswith('edit_'))
def handle_edit_request(call):
    receipt_id = call.data.split('_')[1]

    # Создать сессию через SessionManager
    session_id = session_manager.create_session(call.from_user.id, receipt_data)

    # Отправить ссылку на редактор
    edit_url = f"https://expenses-front.vercel.app/edit?session_id={session_id}"
    bot.send_message(
        call.message.chat.id,
        f"✏️ Отредактируйте чек в веб-интерфейсе:\n{edit_url}",
        reply_markup=get_back_to_bot_keyboard(session_id)
    )
```

### 3. Мониторинг завершения редактирования

**Логика опроса:**
```python
def check_session_completion(session_id: str) -> bool:
    """Проверить, завершил ли пользователь редактирование"""
    # Опросить API: GET /api/session?session_id={session_id}
    # Проверить статус сессии
    # Если status == 'ready', получить финальные данные
    # Вернуть True/False
```

### 4. Финализация обработки

**После завершения редактирования:**
```python
# Пользователь нажимает "Готово" в Telegram
@bot.callback_query_handler(func=lambda call: call.data.startswith('complete_'))
def handle_completion(call):
    session_id = call.data.split('_')[1]

    # Получить финальные данные
    final_data = session_manager.get_session_data(session_id)

    # Продолжить обычную обработку чека
    process_final_receipt(call.from_user.id, final_data)
```

---

## 🔄 ПОЛНЫЙ USER FLOW

```
1. User: 📷 Отправляет фото чека
2. Bot: 🤖 Обрабатывает OCR + AI
3. Bot: 📝 Показывает результат + кнопки [Принять] [Редактировать]
4. User: ✏️ Нажимает "Редактировать"
5. Bot: 💾 Создает session в Postgres
6. Bot: 🔗 Отправляет веб-ссылку
7. User: 🌐 Открывает редактор
8. User: ✨ Редактирует данные (Qty, Items, etc.)
9. User: 💾 Сохраняет изменения
10. User: ↩️ Возвращается в Telegram
11. User: 🔄 Нажимает "Готово"
12. Bot: ✅ Получает финальные данные
13. Bot: 📊 Продолжает обработку чека
```

---

## 🛠️ ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ

### Зависимости для добавления:
```bash
uv add psycopg2-binary
```

### Environment Variables:
```bash
# Уже должен быть в системе
POSTGRES_URL=postgresql://...
```

### Обработка ошибок:
- **API недоступен** → Fallback на обычную обработку
- **База недоступна** → Логировать и продолжить
- **Сессия не найдена** → Уведомить пользователя

### Безопасность:
- **UUID валидация** - проверять формат
- **User ownership** - сессии принадлежат создателю
- **Session timeout** - автоматически удалять старые сессии

---

## 🧪 ТЕСТИРОВАНИЕ ИНТЕГРАЦИИ

### Тест сценарии:
1. **Создание сессии** - проверить сохранение в БД
2. **Получение данных** - проверить загрузку в веб-интерфейсе
3. **Сохранение изменений** - проверить обновление в БД
4. **Завершение сессии** - проверить получение финальных данных
5. **Очистка сессий** - проверить удаление старых записей

### E2E тест:
```bash
python tests/e2e/test_frontend_integration.py
```

---

## 📚 ДОКУМЕНТАЦИЯ

### Готовая документация:
- `docs/TELEGRAM_EDIT_INTEGRATION.md` - Полная архитектура
- `docs/EDIT_INTEGRATION_QUICKSTART.md` - Быстрый старт
- `MIGRATION_COMPLETE.md` - Статус готовности

### Код для копирования:
- `src/lib/db-helpers.ts` - Примеры работы с БД
- `migrations/001_create_sessions_table.sql` - Структура таблицы

---

## 🎯 УСПЕХ КРИТЕРИИ

### ✅ Функциональность:
- [ ] Бот может создавать сессии редактирования
- [ ] Пользователи получают рабочие ссылки на редактор
- [ ] Веб-интерфейс загружает данные чека
- [ ] Изменения сохраняются в базу данных
- [ ] Бот может получить отредактированные данные

### ✅ Качество кода:
- [ ] SOLID принципы соблюдены
- [ ] Обработка ошибок реализована
- [ ] Код документирован
- [ ] Тесты проходят

### ✅ User Experience:
- [ ] Seamless переход между ботом и вебом
- [ ] Clear инструкции для пользователя
- [ ] Error handling без потери данных
- [ ] Performance не ухудшилась

---

## 🚀 РЕАЛИЗАЦИЯ

**Приступай к созданию SessionManager и обновлению handlers!**

Frontend уже готов и ждет интеграции. 🎉
