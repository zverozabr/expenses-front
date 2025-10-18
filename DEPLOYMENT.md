# 🚀 Deployment Guide - Vercel

## Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- GitHub account (recommended for automatic deployments)

## Quick Deploy (Recommended)

### Option 1: GitHub Integration (Automatic)

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/telegram-bot-json-editor.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Vercel will auto-detect Next.js and deploy

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add: `POSTGRES_URL` (get from Vercel Postgres)

### Option 2: Manual Deploy

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Database Setup

### Vercel Postgres (Recommended)

1. **Create Database**:
   - In Vercel dashboard, go to Storage → Postgres
   - Create new database
   - Copy connection string

2. **Create Table**:
   ```sql
   CREATE TABLE sessions (
     id UUID PRIMARY KEY,
     data JSONB,
     status TEXT DEFAULT 'pending'
   );
   ```

3. **Set Environment Variable**:
   - `POSTGRES_URL=your_connection_string_here`

## Environment Variables

Required for production:

```bash
POSTGRES_URL=postgresql://username:password@host:port/database
```

## Post-Deployment Checklist

- [ ] ✅ App loads at deployed URL
- [ ] ✅ API endpoints respond (test `/api/session?session_id=test`)
- [ ] ✅ PWA manifest works (check `/manifest.json`)
- [ ] ✅ Service worker loads (check DevTools → Application)
- [ ] ✅ Database connection works
- [ ] ✅ Environment variables set correctly

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Verify `vercel.json` configuration
- Check build logs in Vercel dashboard

### Runtime Errors
- Verify environment variables are set
- Check database connectivity
- Review server logs in Vercel dashboard

### PWA Issues
- Ensure `manifest.json` is accessible
- Check service worker registration
- Verify HTTPS (required for PWA)

## Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Telegram Bot Integration

After deployment, update your bot code:

```python
# Replace with your deployed URL
edit_url = f"https://your-app.vercel.app/edit?session_id={session_id}"
```

## Monitoring

- **Analytics**: Vercel provides built-in analytics
- **Logs**: Check Vercel dashboard for server logs
- **Errors**: Monitor API responses and error rates

## Cost Optimization

- **Free Tier**: Suitable for development/testing
- **Pro Plan**: For production with higher limits
- **Database**: Monitor usage in Vercel Postgres dashboard

---

🎉 **Your Telegram JSON Editor is now live!**
