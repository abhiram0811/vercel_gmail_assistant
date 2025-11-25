# Context Snowball for Next Chat Session 🎯

## Project Overview
**Gmail Assistant** - Next.js app deployed on Vercel that tracks job applications automatically using AI.

## Current Status: ✅ Code Complete, 🔄 Deployment In Progress

### What Works Locally:
- ✅ Gmail OAuth authentication
- ✅ Job tracking feature with Gemini AI (gemini-2.0-flash-lite)
- ✅ Google Sheets integration for storing job applications
- ✅ Smart caching to prevent duplicate API calls
- ✅ Rate limiting (200ms delays between Gemini calls)
- ✅ Dashboard with "Track Job Applications" and "View Sheet" buttons

### Deployment Journey:
**Problem Solved:** Root directory confusion
- Initial issue: Vercel was deploying from `/gmail_wrapper_prod/` (root) but Next.js app is in `/gmail_wrapper_prod/gmail-assistant/`
- Solution applied: Set **Root Directory = `gmail-assistant`** in Vercel dashboard settings
- Clean-up done: Removed conflicting root-level `vercel.json`, created new one in `gmail-assistant/vercel.json`

### Current Deployment State:
- Last commit: "Remove root vercel.json - will use Vercel dashboard Root Directory setting instead"
- Vercel dashboard configured with: Root Directory = `gmail-assistant`
- vercel.json exists in: `/gmail-assistant/vercel.json` (contains cron config for future Pro plan)
- Waiting for: User to trigger redeploy after Root Directory setting change

## Technical Stack:
- **Framework:** Next.js 16.0.3 (App Router)
- **AI:** Google Gemini API (gemini-2.0-flash-lite) - Tier 1 quota
- **Storage:** Google Sheets API
- **Session:** @vercel/kv (Redis)
- **Hosting:** Vercel (Hobby plan - no cron support)

## Environment Variables (Already Set in Vercel):
- ✅ GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
- ✅ GEMINI_API_KEY
- ✅ GOOGLE_SHEET_ID
- ✅ NEXT_PUBLIC_GOOGLE_SHEET_ID (for client-side sheet URL)
- ✅ KV_REST_API_URL / KV_REST_API_TOKEN
- ✅ OAuth redirect URI updated: `https://gmail-assistant.vercel.app/api/auth/callback`

## Key Files & Logic:

### Job Tracking Flow:
1. **`app/api/jobs/track/route.ts`** - Main endpoint (GET request)
   - Fetches last 50 emails from Gmail
   - Uses smart caching: `processedEmailIds` Set to skip duplicates
   - Classifies with Gemini AI (200ms delay between calls)
   - Updates existing jobs by matching title+company
   - Adds new jobs to Google Sheets

2. **`lib/jobClassifier.ts`** - AI classification
   - Enhanced prompt to REJECT job alerts/newsletters
   - Only detects actual job applications
   - Returns: jobTitle, companyName, status, applicationDate, notes

3. **`lib/sheets.ts`** - Google Sheets CRUD
   - `formatDate()` helper for readable dates (e.g., "Nov 24, 2025")
   - Sheet columns: Job Title, Company, Date Applied, Status, Last Updated, Email ID, Notes

4. **`app/dashboard/page.tsx`** - UI
   - Green "Track Job Applications" button (manual trigger)
   - Blue "View Sheet" button (opens Google Sheet in new tab)
   - Shows: processed count, new jobs, updates, skipped emails, Gemini API calls

## Known Limitations:
- ❌ Cron jobs require Vercel Pro plan ($20/month)
- ✅ Workaround: Use free external cron service (cron-job.org or GitHub Actions)
- ⏳ Gemini rate limits: Tier 1 quota, may need wait time between testing runs

## Next Steps (TODO):
1. **Verify deployment success** after Root Directory change
2. **Test production:** Visit `https://gmail-assistant.vercel.app`, login, click "Track Job Applications"
3. **Setup free cron alternative:** Use cron-job.org or GitHub Actions to trigger `/api/jobs/track` daily at 9 AM

## Repository Structure:
```
gmail_wrapper_prod/              (Git root)
├── gmail-assistant/             (Vercel Root Directory)
│   ├── app/
│   │   ├── api/jobs/track/route.ts
│   │   └── dashboard/page.tsx
│   ├── lib/
│   │   ├── gemini.ts
│   │   ├── jobClassifier.ts
│   │   └── sheets.ts
│   ├── vercel.json              (cron config - requires Pro plan)
│   ├── package.json
│   └── .env.local               (local env vars)
└── [no root-level vercel.json]  (cleaned up)
```

## User's Learning Style:
- Prefers hands-on learning with challenges
- Values step-by-step teaching approach
- Teaching style documented in `TEACHING_STYLE_GUIDE.md`

## If Deployment Fails Again:
1. Check Vercel build logs for specific error
2. Verify Root Directory setting is `gmail-assistant`
3. Ensure all env vars are set for Production environment
4. Check that `NEXT_PUBLIC_GOOGLE_SHEET_ID` is added

## Quick Commands Reference:
```bash
# Local dev
cd /Users/abhirammulinti/Projects/gmail_wrapper_prod/gmail-assistant
npm run dev

# Git operations
git add -A
git commit -m "message"
git push origin main

# Check env vars locally
cat .env.local
```

---
**Ready to continue!** The app is code-complete and waiting for successful Vercel deployment. Main blocker: User needs to redeploy after setting Root Directory to `gmail-assistant` in Vercel dashboard. 🚀
