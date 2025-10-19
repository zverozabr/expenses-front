# 🤝 API CONTRACT - Backend Integration

**Version:** 1.0
**Date:** 2025-10-19
**Status:** CRITICAL FIXES NEEDED

---

## 🎯 Цель

Контракт API между:
- **Backend:** Thai Receipt Processor (Telegram Bot)
- **Frontend:** Next.js Web Editor (Vercel)

---

## 🔗 Base URLs

### Production
```
Frontend: https://expenses-front-weld.vercel.app
Backend: TBD (Telegram Bot)
```

---

## 📡 API Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`

**Purpose:** Проверка доступности API и базы данных

**Request:**
```bash
curl https://expenses-front-weld.vercel.app/api/health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "database": {
    "connection": "successful",
    "provider": "Prisma Postgres",
    "sessions_table": "exists",
    "auto_migration": "not_needed"
  },
  "timestamp": "2025-10-19T16:36:02.472Z"
}
```

**Error Response:** `500 Internal Server Error`
```json
{
  "status": "error",
  "error": "Database connection failed"
}
```

---

### 2. Create Session (Bot → Frontend)

**Endpoint:** `POST /api/session`

**Purpose:** Создать новую сессию редактирования с данными распознанного чека

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": [
    {
      "#": 1,
      "Qty": 2,
      "Unit": "pcs",
      "Price": 25.50,
      "Art": "8850123456789",
      "Item": "Product Name",
      "Net": 51.00,
      "VAT": 0.00,
      "Total": 51.00
    }
  ]
}
```

**Field Specifications:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `session_id` | string (UUID) | ✅ Yes | Must be valid UUID v4 | Unique session identifier |
| `data` | array | ✅ Yes | Min 1 item | Array of receipt items |
| `data[].#` | number | ✅ Yes | Integer >= 1 | Row number |
| `data[].Qty` | number | ✅ Yes | > 0 | Quantity |
| `data[].Unit` | string | ✅ Yes | Min 1 char | Unit of measurement |
| `data[].Price` | number | ✅ Yes | >= 0 | Unit price |
| `data[].Art` | string | ❌ No | Optional | Article/barcode |
| `data[].Item` | string | ✅ Yes | Min 1 char | Item description |
| `data[].Net` | number | ✅ Yes | >= 0 | Subtotal (before VAT) |
| `data[].VAT` | number | ✅ Yes | >= 0 | VAT amount |
| `data[].Total` | number | ✅ Yes | >= 0 | Total (Net + VAT) |

**Success Response:** `200 OK`
```json
{
  "success": true
}
```

**Error Responses:**

`400 Bad Request` - Invalid data
```json
{
  "error": "Invalid receipt data: [validation details]"
}
```

`400 Bad Request` - Missing fields
```json
{
  "error": "Missing required fields: session_id and data"
}
```

`400 Bad Request` - Invalid session_id
```json
{
  "error": "Invalid session ID format"
}
```

`429 Too Many Requests` - Rate limit
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

`500 Internal Server Error`
```json
{
  "error": "Internal server error"
}
```

---

### 3. Get Session (Bot → Frontend OR User → Frontend)

**Endpoint:** `GET /api/session?session_id={uuid}`

**Purpose:** Получить данные сессии (для проверки статуса или получения отредактированных данных)

**Request:**
```bash
curl "https://expenses-front-weld.vercel.app/api/session?session_id=550e8400-e29b-41d4-a716-446655440000"
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string (UUID) | ✅ Yes | Session identifier |

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "#": 1,
      "Qty": 2,
      "Unit": "pcs",
      "Price": 25.50,
      "Art": "8850123456789",
      "Item": "Product Name",
      "Net": 51.00,
      "VAT": 0.00,
      "Total": 51.00
    }
  ]
}
```

**Error Responses:**

`400 Bad Request` - Missing session_id
```json
{
  "error": "Missing session_id parameter"
}
```

`400 Bad Request` - Invalid format
```json
{
  "error": "Invalid session ID format"
}
```

`404 Not Found` - Session doesn't exist
```json
{
  "error": "Session not found or expired"
}
```

`429 Too Many Requests`
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

`500 Internal Server Error`
```json
{
  "error": "Internal server error"
}
```

---

### 4. Update Session (User → Frontend via Web UI)

**Endpoint:** `POST /api/session`

**Purpose:** Обновить данные сессии после редактирования пользователем

**Note:** Uses same endpoint as Create (UPSERT pattern)

**Request Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": [
    {
      "#": 1,
      "Qty": 3,
      "Unit": "pcs",
      "Price": 25.50,
      "Art": "8850123456789",
      "Item": "Updated Product Name",
      "Net": 76.50,
      "VAT": 0.00,
      "Total": 76.50
    },
    {
      "#": 2,
      "Qty": 1,
      "Unit": "pcs",
      "Price": 10.00,
      "Art": "",
      "Item": "New Item Added",
      "Net": 10.00,
      "VAT": 0.00,
      "Total": 10.00
    }
  ]
}
```

**Success Response:** `200 OK`
```json
{
  "success": true
}
```

**Same error responses as Create Session**

---

## 🔄 Integration Workflow

### Complete User Journey

```
┌──────────────────────────────────────────────────────────────┐
│ 1. USER SENDS RECEIPT PHOTO                                  │
│    Telegram → Bot                                             │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. BOT PROCESSES RECEIPT                                      │
│    - OCR (Google Vision)                                      │
│    - AI Analysis (GPT-5 + Claude)                             │
│    - Format data → Receipt JSON                               │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. BOT CREATES EDIT SESSION                                   │
│    POST /api/session                                          │
│    {                                                          │
│      "session_id": "uuid-v4",                                │
│      "data": [...receipt items...]                           │
│    }                                                          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. BOT SENDS EDIT LINK TO USER                                │
│    Telegram message with:                                     │
│    https://expenses-front-weld.vercel.app/edit?session_id=... │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. USER OPENS LINK IN BROWSER                                 │
│    Frontend loads: GET /api/session?session_id=...           │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. USER EDITS DATA                                            │
│    - Change quantities                                        │
│    - Edit item names                                          │
│    - Add/delete rows                                          │
│    - Fix prices                                               │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. USER SAVES CHANGES                                         │
│    POST /api/session (update)                                 │
│    {                                                          │
│      "session_id": "same-uuid",                              │
│      "data": [...edited items...]                            │
│    }                                                          │
│    → Session status changes to 'ready'                        │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. USER RETURNS TO TELEGRAM                                   │
│    Clicks "Done" button in bot                                │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 9. BOT RETRIEVES EDITED DATA                                  │
│    GET /api/session?session_id=...                           │
│    ← Returns edited data                                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 10. BOT CONTINUES PROCESSING                                  │
│     - Save to bot's database                                  │
│     - Categorization                                          │
│     - Send confirmation to user                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🐛 CRITICAL ISSUES FOUND (2025-10-19)

### Issue #1: GET returns 404 after POST creates session ❌

**Test Result:**
```bash
POST /api/session → 200 OK ✅
GET /api/session?session_id=same-id → 404 Not Found ❌
```

**Expected:** GET should return the data that was just POSTed

**Possible Causes:**
1. Database write not completing before GET
2. Cache invalidation issue
3. Data type mismatch (UUID string vs UUID type)
4. Transaction not committed

**Required Fix:** See FRONTEND_FIX_INSTRUCTIONS.md

---

### Issue #2: Invalid session_id causes 500 instead of 400 ❌

**Test Result:**
```bash
GET /api/session?session_id=invalid-format → 500 Internal Server Error ❌
```

**Expected:** `400 Bad Request` with validation error

**Required Fix:** Improve error handling in validateSessionId()

---

## 💾 Database Schema

### sessions table

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ready')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_id ON sessions(id);
CREATE INDEX idx_sessions_updated_at ON sessions(updated_at);
```

**Fields:**
- `id` - UUID (matches session_id from API)
- `data` - JSONB (array of receipt items)
- `status` - 'pending' (initial) or 'ready' (after user saves)
- `created_at` - Timestamp when session was created
- `updated_at` - Auto-updated on changes

---

## 🔒 Security & Rate Limiting

### Rate Limits
- **60 requests per minute** per IP address
- Applies to all API endpoints
- Returns `429` with `Retry-After` header

### Validation
- Session ID must be valid UUID v4
- All numeric fields validated (Qty > 0, prices >= 0)
- Item names must be non-empty
- Data structure validated with Zod

### CORS
- Frontend domain whitelisted
- Backend (bot) will call from server-side (no CORS needed)

---

## 📊 Success Criteria

✅ **Ready for Integration when:**

1. Health check returns 200 ✅
2. POST creates session successfully ✅
3. GET retrieves created session immediately ❌ **BROKEN**
4. POST updates existing session ✅
5. GET returns updated data ❌ **BROKEN**
6. Invalid data rejected with 400 ✅
7. Invalid session_id rejected with 400 ❌ **BROKEN**
8. Non-existent session returns 404 ✅
9. Thai characters preserved ✅
10. Rate limiting works ✅

**Current Status:** 7/10 tests passing
**Blocking Issues:** #1 and #2 (see above)

---

## 🛠️ Next Steps

1. **Fix GET after POST issue** (Critical)
2. **Fix 500 → 400 for invalid session_id**
3. **Re-run E2E tests**
4. **Backend integration** (create SessionManager.py)

---

## 📚 Related Documents

- `FRONTEND_FIX_INSTRUCTIONS.md` - Detailed fix instructions
- `BACKEND_INTEGRATION.md` - Backend integration guide
- `tests/e2e/test_frontend_integration.py` - E2E test suite

---

**Contract Owner:** Frontend Team
**Integration Partner:** Backend Team (Telegram Bot)
**Last Updated:** 2025-10-19
**Status:** 🔴 CRITICAL FIXES NEEDED

