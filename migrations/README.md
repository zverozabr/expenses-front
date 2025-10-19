# Database Migrations

This directory contains database migration scripts for the Telegram Bot Frontend Integration.

## Quick Migration (Recommended)

### Option 1: Automated Python Script

```bash
# Install dependencies
pip install psycopg2-binary

# Set environment variable
export POSTGRES_URL="postgresql://your-connection-string-from-vercel"

# Run migration
python migrations/migrate.py
```

### Option 2: Manual SQL Execution

1. Open Vercel Dashboard → Storage → Postgres → Query
2. Copy and paste the contents of `001_create_sessions_table.sql`
3. Click "Run"

## Migration Files

### 001_create_sessions_table.sql
Creates the `sessions` table required for frontend-backend communication.

**Table Structure:**
- `id` (UUID): Primary key for session identification
- `data` (JSONB): Receipt data for editing
- `status` (TEXT): 'pending' or 'ready'
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Indexes:**
- `idx_sessions_status`: Fast status lookups for bot polling
- `idx_sessions_id`: Fast UUID lookups
- `idx_sessions_updated_at`: For cleanup queries

**Triggers:**
- `update_sessions_updated_at`: Auto-updates `updated_at` on changes

## Verification

After running migration, test with:

```bash
curl "https://expenses-front-eight.vercel.app/api/session?session_id=550e8400-e29b-41d4-a716-446655440000"
```

Expected result: `{"error":"Session not found or expired"}` ✅

## Troubleshooting

### Connection Issues
```
❌ POSTGRES_URL not set
```
**Solution:** Get connection string from Vercel Dashboard → Storage → Postgres → Settings

### Permission Issues
```
❌ Migration failed: permission denied
```
**Solution:** Check your Vercel Postgres permissions

### Table Already Exists
```
⚠️  Sessions table already exists
```
**Solution:** Migration is safe to re-run (uses `IF NOT EXISTS`)

## Rollback

To drop the table (if needed):

```sql
DROP TABLE IF EXISTS sessions;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Next Steps

After migration:
1. Test API endpoints
2. Run E2E tests: `python tests/e2e/test_frontend_integration.py`
3. Integrate with your Telegram bot
4. Deploy bot updates

---

**🎯 This migration enables full frontend-backend communication for your Telegram bot!**
