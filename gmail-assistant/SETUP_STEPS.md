# 🚀 SETUP STEPS - Get Your Gmail Assistant Running

**Last Updated**: November 20, 2025  
**Estimated Time**: 20-30 minutes

Follow these steps **in order** to get your Gmail Assistant working locally and deployed to Vercel.

---

## ✅ Phase 1: Prerequisites (5 minutes)

### 1.1 Create Accounts (if you don't have them)

- [ ] **Google Account** - You already have this for Gmail
- [ ] **Google Cloud Console** - Sign in at [console.cloud.google.com](https://console.cloud.google.com/)
- [ ] **OpenAI Account** - Sign up at [platform.openai.com](https://platform.openai.com/)
- [ ] **Pinecone Account** - Sign up at [pinecone.io](https://www.pinecone.io/)
- [ ] **Vercel Account** - Sign up at [vercel.com](https://vercel.com/) (use GitHub login)

### 1.2 Install Required Tools

```bash
# Check Node.js version (need 18+)
node --version

# If not installed or version < 18, download from nodejs.org

# Install Vercel CLI globally
npm install -g vercel
```

---

## 🔑 Phase 2: Get API Credentials (10 minutes)

### 2.1 Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a New Project**:
   - Click "Select a Project" → "New Project"
   - Name: `Gmail Assistant`
   - Click "Create"

3. **Enable Gmail API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click on it → Click "Enable"

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External"
   - Fill in:
     - App name: `Gmail Assistant`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Skip "Scopes" (click "Save and Continue")
   - Add test users: Your Gmail address
   - Click "Save and Continue"

5. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Gmail Assistant"
   - Authorized redirect URIs:
     - Add: `http://localhost:3000/api/auth/callback`
   - Click "Create"
   - **IMPORTANT**: Copy Client ID and Client Secret (you'll need these!)

### 2.2 OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name: `Gmail Assistant`
4. Copy the key (starts with `sk-...`)
5. **IMPORTANT**: Save this key securely (you can't see it again!)

### 2.3 Pinecone API Key

1. Go to: https://app.pinecone.io/
2. Sign in / Create account
3. Go to "API Keys" in sidebar
4. Copy your API key
5. Note: A free index will be created automatically when you first run the app

---

## 💻 Phase 3: Local Development Setup (5 minutes)

### 3.1 Navigate to Project

```bash
cd /Users/abhirammulinti/Projects/gmail_wrapper_prod/gmail-assistant
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Set Up Vercel KV for Local Development

```bash
# Login to Vercel
vercel login

# Link your project (follow prompts)
vercel link

# Pull environment variables (includes KV credentials)
vercel env pull .env.local
```

When prompted:
- Set up and link: Yes
- Scope: Your personal account
- Link to existing project: No
- Project name: `gmail-assistant` (or your choice)
- Directory: `./` (current directory)

### 3.4 Add Your API Credentials

Edit `.env.local` and add these lines at the top:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# OpenAI
OPENAI_API_KEY=sk-your_actual_openai_key

# Pinecone
PINECONE_API_KEY=your_actual_pinecone_key
```

Replace the values with your actual credentials from Phase 2!

---

## ▶️ Phase 4: Run Locally (2 minutes)

### 4.1 Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:   http://localhost:3000
```

### 4.2 Test the Application

1. Open browser: http://localhost:3000
2. Click "Sign in with Google"
3. Authorize the app
4. You should be redirected to the dashboard!

### 4.3 Index and Search Emails

1. Click "Index Today's Emails"
2. Wait for indexing to complete
3. Try searching:
   - "project updates"
   - "meeting invitations"
   - "emails from today"

**🎉 If this works, your local setup is complete!**

---

## 🌐 Phase 5: Deploy to Vercel (10 minutes)

### 5.1 Create Vercel KV Database

1. Go to: https://vercel.com/dashboard
2. Select your `gmail-assistant` project
3. Go to **Storage** tab
4. Click "Create Database"
5. Select "KV (Redis)"
6. Name: `gmail-assistant-kv`
7. Region: Select closest to you
8. Click "Create"

### 5.2 Set Environment Variables in Vercel

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add these variables for **Production**:

| Variable Name | Value |
|--------------|-------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://YOUR-PROJECT.vercel.app/api/auth/callback` |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `PINECONE_API_KEY` | Your Pinecone API key |

**IMPORTANT**: Replace `YOUR-PROJECT` with your actual Vercel project name!

### 5.3 Update Google OAuth Redirect URI

1. Go back to Google Cloud Console
2. "APIs & Services" → "Credentials"
3. Click your OAuth client
4. Under "Authorized redirect URIs", add:
   ```
   https://YOUR-PROJECT.vercel.app/api/auth/callback
   ```
5. Click "Save"

### 5.4 Deploy to Production

```bash
vercel --prod
```

Wait for deployment to complete. You'll get a URL like:
```
https://gmail-assistant-xyz.vercel.app
```

### 5.5 Test Production Deployment

1. Open your production URL
2. Sign in with Google
3. Index emails
4. Test search

**🚀 If this works, you're fully deployed!**

---

## 📋 Verification Checklist

Make sure everything works:

### Local Development
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000
- [ ] "Sign in with Google" works
- [ ] Redirected to dashboard after login
- [ ] Can click "Index Today's Emails"
- [ ] Indexing completes successfully
- [ ] Can search emails
- [ ] Search returns relevant results
- [ ] Can logout

### Production Deployment
- [ ] Vercel project created
- [ ] KV database created and linked
- [ ] Environment variables set in Vercel
- [ ] Google OAuth redirect URI updated
- [ ] `vercel --prod` completes successfully
- [ ] Can access production URL
- [ ] All features work in production

---

## 🎯 Quick Start Commands

After initial setup, these are the only commands you need:

### Local Development
```bash
cd gmail-assistant
npm run dev
# Open http://localhost:3000
```

### Deploy Updates
```bash
vercel --prod
```

### Pull Latest Environment Variables
```bash
vercel env pull .env.local
```

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch"
- Check OAuth redirect URI in Google Console matches exactly
- For local: `http://localhost:3000/api/auth/callback`
- For production: `https://your-project.vercel.app/api/auth/callback`

### "OPENAI_API_KEY not found"
- Check `.env.local` file exists
- Verify API key starts with `sk-`
- Make sure no spaces around `=` in .env file

### "Failed to connect to Pinecone"
- Verify API key is correct
- Check internet connection
- First run may take extra time to create index

### "Not authenticated" after login
- Clear browser cookies
- Logout and login again
- Check KV database is running (Vercel dashboard)

### Build errors in Vercel
- Check all environment variables are set
- Verify no TypeScript errors locally
- Check Vercel build logs for specific error

---

## 💡 What You Can Do Now

✅ **Search your emails by meaning**
- "project updates from this week"
- "meeting invitations"
- "emails about payments"

✅ **Access from anywhere**
- Your deployed Vercel URL works from any device
- Sign in with Google OAuth

✅ **Keep data synced**
- Click "Index Today's Emails" daily
- Or whenever you get important new emails

✅ **Share with others** (optional)
- Add them as test users in Google Console
- They can use the same deployed app

---

## 📈 Next Steps (Optional)

### Set Up Daily Auto-Indexing
Use Vercel Cron to automatically index emails daily:
1. Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/emails/index",
    "schedule": "0 9 * * *"
  }]
}
```
2. Deploy: `vercel --prod`

### Add Custom Domain
1. In Vercel, go to Settings → Domains
2. Add your domain
3. Update Google OAuth redirect URI

### Monitor Usage
- Check Vercel Dashboard for:
  - Function invocations
  - Bandwidth usage
  - Error rates
  - Performance metrics

---

## 🆘 Need Help?

1. **Check documentation**:
   - [README.md](./README.md) - Overview
   - [USER_GUIDE.md](./USER_GUIDE.md) - How to use
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment details

2. **Check browser console** (F12):
   - Look for error messages
   - Check network requests

3. **Check Vercel logs**:
   ```bash
   vercel logs
   ```

4. **Common issues**:
   - Clear browser cache/cookies
   - Verify all environment variables
   - Check API keys are valid
   - Ensure OAuth redirect URIs match

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Sign in with Google works smoothly
2. ✅ Dashboard loads with statistics
3. ✅ Indexing completes without errors
4. ✅ Search returns relevant results
5. ✅ Match scores are 50%+
6. ✅ Can logout and re-login successfully

---

**You're all set! Enjoy your AI-powered email search! 📧✨**

Questions? Check the documentation or browser console for errors.
