# 🗄️ Database Setup Guide - Vercel Postgres

## Prerequisites
- Vercel account
- Project deployed or ready for deployment
- Access to Vercel dashboard

## Step 1: Create Vercel Postgres Database

### Navigate to Storage
1. Go to [vercel.com](https://vercel.com) and log in
2. Select your team/account
3. Click on **"Storage"** in the sidebar
4. Click **"Create Database"**
5. Select **"Postgres"**

### Configure Database
```
Database Name: telegram_editor_db (or any name you prefer)
Region: FRA1 (Frankfurt) - recommended for European users
Plan: Hobby (free) or Pro (paid)
```

### Create Database
- Click **"Create"**
- Wait for database creation (usually 1-2 minutes)
- Copy the **connection string** - you'll need it for environment variables

## Step 2: Configure Environment Variables

### In Vercel Dashboard
1. Go to your project dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in the sidebar
4. Click **"Add New"**

### Add POSTGRES_URL Variable
```
Name: POSTGRES_URL
Value: postgresql://username:password@host:port/database?sslmode=require
Environment: Production
```

**Important**: Use the connection string provided by Vercel Postgres (including the `?sslmode=require` parameter).

## Step 3: Trigger Deployment

### Auto-Deployment (Recommended)
- Once environment variables are saved, Vercel will automatically redeploy
- Check deployment status in the **"Deployments"** tab

### Manual Deployment (Alternative)
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** button
3. Select **"Production"** environment

## Step 4: Verify Database Connection

### Test API Endpoint
Visit your deployed app and test the API:
```
https://your-app.vercel.app/api/session?session_id=test-123e4567-e89b-12d3-a456-426614174000
```

Expected response:
```json
{
  "error": "Session not found or expired"
}
```

### Check Logs
1. In Vercel dashboard → **"Functions"** tab
2. Look for `/api/session` function logs
3. Should show successful database connection

## Step 5: Create Database Schema (Optional)

The application will automatically create the required table on first use:

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  data JSONB,
  status TEXT DEFAULT 'pending'
);
```

### Manual Creation (if needed)
You can create the table manually in Vercel Postgres dashboard:
1. Go to Storage → Your database
2. Click **"Query"** tab
3. Run the SQL above

## Troubleshooting

### Connection Errors
**Error**: `Connection refused` or `ECONNREFUSED`
- ✅ Check POSTGRES_URL is correct
- ✅ Verify database is not paused (Hobby plan pauses after inactivity)
- ✅ Check Vercel Postgres status

### SSL Errors
**Error**: SSL connection error
- ✅ Ensure `?sslmode=require` is in connection string
- ✅ Try `?sslmode=prefer` if issues persist

### Permission Errors
**Error**: Permission denied for database
- ✅ Verify connection string is correct
- ✅ Check if database is in different region
- ✅ Try recreating database connection

### Deployment Failures
**Error**: Build fails during deployment
- ✅ Check environment variables are set correctly
- ✅ Verify POSTGRES_URL format
- ✅ Check Vercel function logs

## Database Management

### View Data
- Vercel Dashboard → Storage → Your Database → **"Data"** tab
- Browse tables and view/edit records

### Run Queries
- Vercel Dashboard → Storage → Your Database → **"Query"** tab
- Execute SQL queries directly

### Monitor Usage
- Vercel Dashboard → Storage → Your Database → **"Usage"** tab
- Track connection count, storage, and performance

## Cost Optimization

### Hobby Plan (Free)
- **Limits**: 512MB storage, 1GB bandwidth/month
- **Auto-pause**: Database pauses after 7 days inactivity
- **Connections**: Up to 10 concurrent connections

### Pro Plan (Paid)
- **Limits**: Higher storage and bandwidth
- **Always-on**: No auto-pause
- **Connections**: Higher concurrent connection limits

## Backup and Recovery

### Automatic Backups
- Vercel Postgres provides automatic daily backups
- Retention: 7 days for Hobby, 30 days for Pro

### Manual Backup
1. Go to Vercel Dashboard → Storage → Your Database
2. Click **"Backups"** tab
3. Click **"Create Backup"**

### Restore
- Contact Vercel support for restore requests
- Only available for Pro plan users

## Security Best Practices

- ✅ Never commit database credentials to Git
- ✅ Use environment variables for all secrets
- ✅ Enable SSL mode for connections
- ✅ Regularly rotate database passwords
- ✅ Monitor access logs

## Performance Tips

- ✅ Use connection pooling (handled by Vercel)
- ✅ Optimize queries in your application
- ✅ Monitor slow queries in Vercel dashboard
- ✅ Consider database indexes for frequently queried columns

## Support

If you encounter issues:
1. Check Vercel status page: [vercel-status.com](https://vercel-status.com)
2. Review Vercel Postgres documentation
3. Contact Vercel support through dashboard

---

## ✅ Quick Setup Checklist

- [ ] Create Vercel Postgres database
- [ ] Copy connection string
- [ ] Add POSTGRES_URL environment variable
- [ ] Trigger deployment
- [ ] Test API endpoint
- [ ] Verify logs show successful connection
- [ ] Test full edit workflow

**🎉 Your database is now ready for production use!**
