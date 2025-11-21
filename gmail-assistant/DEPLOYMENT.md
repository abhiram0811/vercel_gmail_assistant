# 🚀 Deployment Guide - Gmail Assistant on Vercel

This guide walks you through deploying your Gmail Assistant to Vercel's free tier.

## 📋 Prerequisites

Before deploying, make sure you have:

- ✅ Vercel account (free tier)
- ✅ Google OAuth credentials configured
- ✅ OpenAI API key
- ✅ Pinecone API key
- ✅ Code tested locally

## 🎯 Step-by-Step Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Link Your Project

```bash
cd gmail-assistant
vercel link
```

This will:
- Create a new Vercel project
- Link your local directory to it
- Set up the project configuration

### Step 4: Create Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **KV (Redis)**
6. Choose a name (e.g., `gmail-assistant-kv`)
7. Select region closest to you
8. Click **Create**

The KV database is automatically linked to your project!

### Step 5: Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://your-project-name.vercel.app/api/auth/callback
   ```
   (Replace `your-project-name` with your actual Vercel project name)
5. Click **Save**

### Step 6: Set Environment Variables in Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings** > **Environment Variables**
3. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | Production, Preview, Development |
| `GOOGLE_REDIRECT_URI` | `https://your-project.vercel.app/api/auth/callback` | Production |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3000/api/auth/callback` | Development |
| `OPENAI_API_KEY` | Your OpenAI API Key | Production, Preview, Development |
| `PINECONE_API_KEY` | Your Pinecone API Key | Production, Preview, Development |

**Note**: KV variables (`KV_URL`, etc.) are automatically injected by Vercel!

#### Option B: Via Vercel CLI

```bash
# Set production environment variables
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GOOGLE_REDIRECT_URI production
vercel env add OPENAI_API_KEY production
vercel env add PINECONE_API_KEY production
```

### Step 7: Deploy to Production

```bash
vercel --prod
```

This will:
- Build your Next.js application
- Deploy to Vercel
- Assign a production URL (e.g., `your-project.vercel.app`)

### Step 8: Verify Deployment

1. Open your production URL: `https://your-project.vercel.app`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Index some emails
5. Test search functionality

## 🔄 Updating Your Deployment

Whenever you make changes:

```bash
# Deploy to production
vercel --prod

# Or preview deployment (for testing)
vercel
```

## 📊 Monitoring

### View Logs

```bash
# Real-time logs
vercel logs

# Or in the dashboard
```

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Deployments** tab
4. Click on a deployment to view logs

### Check Function Invocations

1. In Vercel Dashboard, go to **Analytics**
2. View function invocations, errors, and performance

## 🎨 Custom Domain (Optional)

1. In Vercel Dashboard, go to **Settings** > **Domains**
2. Click **Add**
3. Enter your custom domain
4. Follow DNS configuration instructions
5. Update `GOOGLE_REDIRECT_URI` to use your custom domain

## 🔐 Security Checklist

Before going live, ensure:

- [ ] OAuth redirect URIs are correct in Google Console
- [ ] All environment variables are set in Vercel
- [ ] KV database is linked to your project
- [ ] `GOOGLE_CLIENT_SECRET` is kept secure (never committed to git)
- [ ] Test OAuth flow in production
- [ ] Test email indexing works
- [ ] Test search functionality works

## 💡 Environment-Specific Configuration

### Production
```
GOOGLE_REDIRECT_URI=https://your-project.vercel.app/api/auth/callback
```

### Preview (for testing branches)
```
GOOGLE_REDIRECT_URI=https://your-project-git-branch.vercel.app/api/auth/callback
```

### Development (local)
```
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

## 🐛 Troubleshooting

### "redirect_uri_mismatch" error
- Ensure redirect URI in Google Console exactly matches your deployment URL
- Check for trailing slashes
- Make sure you added the callback path: `/api/auth/callback`

### Environment variables not working
```bash
# Pull latest environment variables
vercel env pull

# Verify they're set correctly
vercel env ls
```

### KV connection errors
- Ensure KV database is created in Vercel
- Verify it's linked to your project
- KV variables are auto-injected (no manual setup needed)

### Function timeout
- Free tier has 10s timeout limit
- For large email batches, process in smaller chunks
- Consider upgrading to Pro if needed ($20/month)

## 📈 Scaling Considerations

### Free Tier Limits
- **Bandwidth**: 100GB/month (plenty for personal use)
- **Function Invocations**: Unlimited
- **Function Duration**: 10s max per invocation
- **KV Storage**: 256MB
- **KV Requests**: 30K/month

### If You Exceed Limits
1. **Upgrade to Pro**: $20/month
   - 1TB bandwidth
   - 1000GB-hours function duration
   - 60s function timeout
   - More KV storage and requests

2. **Optimize**:
   - Index emails in smaller batches
   - Cache frequently searched queries
   - Implement pagination for results

## 🎉 Success!

Your Gmail Assistant is now live on Vercel! 

Access it at: `https://your-project.vercel.app`

## 📚 Next Steps

1. **Bookmark** your app URL
2. **Set up Vercel Cron** (optional) - Auto-index emails daily
3. **Monitor usage** in Vercel Dashboard
4. **Share feedback** and improvements

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Support](https://vercel.com/support)

---

**Happy Deploying! 🚀**
