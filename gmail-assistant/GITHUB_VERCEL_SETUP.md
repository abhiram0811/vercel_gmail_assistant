# Connect Vercel to GitHub for Automatic Deployments

## ✅ Git Repository Setup Complete!

Your code is now pushed to: **https://github.com/abhiram0811/vercel_gmail_assistant**

## 🔗 Connect Vercel to GitHub (Automatic Deployments)

### Step 1: Go to Vercel Dashboard
Visit: https://vercel.com/abhiram-reddy-mulintis-projects/gmail-assisstant/settings/git

### Step 2: Connect Git Repository

1. Click on **"Connect Git Repository"**
2. Select **GitHub**
3. Search for and select: **abhiram0811/vercel_gmail_assistant**
4. Click **Connect**

### Step 3: Configure Project Settings

Vercel should auto-detect:
- **Framework Preset**: Next.js
- **Root Directory**: `gmail-assistant/`  ⚠️ **IMPORTANT: Set this!**
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Step 4: Set Root Directory

Since your Next.js app is in the `gmail-assistant/` subdirectory, you MUST configure this:

1. In Vercel Dashboard → Project Settings → General
2. Find **"Root Directory"**
3. Set it to: `gmail-assistant`
4. Save

### Step 5: Verify Environment Variables

Make sure all environment variables are still set:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `OPENAI_API_KEY`
- `PINECONE_API_KEY`
- `REDIS_URL`

(They should already be there from your earlier setup)

### Step 6: Test Automatic Deployment

Once connected, every push to `main` branch will automatically deploy!

Test it:
```bash
cd /Users/abhirammulinti/Projects/gmail_wrapper_prod
echo "# Test automatic deployment" >> gmail-assistant/README.md
git add -A
git commit -m "Test: Verify automatic Vercel deployment"
git push
```

Watch the deployment at: https://vercel.com/abhiram-reddy-mulintis-projects/gmail-assisstant

## 🎯 Workflow Going Forward

```
Make changes → Commit → Push → Vercel auto-deploys! 🚀
```

No more manual `vercel --prod` commands needed!

---

## 📝 Quick Commands

### Development
```bash
cd gmail-assistant
npm run dev
```

### Deploy to Production
```bash
git add -A
git commit -m "Your changes"
git push
# Vercel automatically deploys!
```

### Check Deployment Status
```bash
vercel ls --prod
# or visit: https://vercel.com/dashboard
```

---

**Repository**: https://github.com/abhiram0811/vercel_gmail_assistant  
**Live App**: https://gmail-assisstant.vercel.app  
**Vercel Dashboard**: https://vercel.com/abhiram-reddy-mulintis-projects/gmail-assisstant
