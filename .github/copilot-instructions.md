# Gmail Assistant - AI Coding Agent Instructions

## Project Overview
Next.js 14 App Router application that provides AI-powered job application tracking via Gmail integration. Uses Google OAuth2 for authentication, Gemini AI for email classification, and Google Sheets for data persistence. Deployed on Vercel.

**Key Architecture**: Serverless Next.js API routes + OAuth2 token storage in Vercel KV/Redis + AI classification + Google Sheets CRUD.

## Repository Structure
```
gmail_wrapper_prod/              # Git root
└── gmail-assistant/             # Vercel Root Directory (IMPORTANT!)
    ├── app/                     # Next.js App Router
    │   ├── api/                 # Serverless API routes
    │   │   ├── auth/            # OAuth2 flow endpoints
    │   │   ├── jobs/track/      # Job tracking endpoint
    │   │   └── emails/          # Email search/stats (legacy)
    │   ├── dashboard/           # Main UI
    │   └── page.tsx             # Landing page
    └── lib/                     # Core business logic
        ├── gmail.ts             # Gmail API client
        ├── gemini.ts            # AI classification
        ├── jobClassifier.ts     # Email → Job parser
        ├── sheets.ts            # Google Sheets CRUD
        ├── kv.ts                # Token storage (KV/Redis)
        └── session.ts           # Cookie-based sessions
```

## Development Workflow

### Local Development
```bash
cd gmail-assistant  # ALWAYS work from this directory
npm run dev         # Starts on localhost:3000
```

### Environment Variables Required
**Local** (`.env.local`):
```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
GEMINI_API_KEY=...
GOOGLE_SHEET_ID=...
NEXT_PUBLIC_GOOGLE_SHEET_ID=...  # Client-side access
KV_REST_API_URL=...              # Vercel KV
KV_REST_API_TOKEN=...
```

**Production** (Vercel dashboard):
- Set `Root Directory = gmail-assistant` (critical for deployment)
- Update `GOOGLE_REDIRECT_URI` to production URL

## Critical Patterns & Conventions

### 1. Authentication Flow (OAuth2 → KV → Session Cookie)
- **Login**: `/api/auth/login` → Google OAuth2 → `/api/auth/callback`
- **Token Storage**: `lib/kv.ts` stores `Credentials` in Vercel KV with key `gmail_token:{userId}`
- **Session**: Cookie-based (`lib/session.ts`), userId = base64(email), 30-day expiry
- **Auth Check**: All protected routes call `getSession()` → `getTokens(userId)` → set OAuth2Client credentials

### 2. Gmail API Integration (`lib/gmail.ts`)
- **Scopes**: `gmail.readonly` + `spreadsheets` (both required)
- **Pattern**: Always create OAuth2Client → set credentials → pass to Google API clients
- **Example**:
  ```typescript
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  ```

### 3. AI-Powered Job Classification (`lib/jobClassifier.ts`)
- **Model**: Gemini 2.0 Flash Lite (fast, free tier)
- **Rate Limiting**: 200ms delay between Gemini calls (see `app/api/jobs/track/route.ts`)
- **Prompt Strategy**: Explicitly rejects job alerts/newsletters, only extracts actual applications
- **Output**: Structured JSON with `isJobRelated`, `jobTitle`, `companyName`, `status`, `notes`
- **Status Values**: `applied`, `rejected`, `assessment`, `interview`, `moving-forward`, `offer`

### 4. Google Sheets as Database (`lib/sheets.ts`)
- **Sheet Name**: `Sheet1` (hardcoded, match your Google Sheet tab)
- **Columns**: `Job Title | Company | Date Applied | Status | Last Updated | Email ID | Notes`
- **Key Operations**:
  - `getAllApplications()`: Read all rows (starts at A2, skips header)
  - `addApplication()`: Append new row
  - `updateApplication()`: Update by `sheetRowId` (row number, 1-indexed)
- **Date Formatting**: `formatDate()` converts ISO → "Nov 24, 2025" for readability

### 5. Job Tracking Logic (`app/api/jobs/track/route.ts`)
**Smart deduplication strategy**:
1. Load all existing applications from Sheets
2. Create `Set<emailId>` for O(1) duplicate detection
3. For each email:
   - Skip if `emailId` already processed (same email)
   - Classify with Gemini (rate-limited)
   - If job exists (match by title + company):
     - Update status if changed (e.g., "applied" → "interview")
   - Else: Add new job to Sheets

**Why this pattern**: Prevents duplicate Gemini API calls + handles status updates for multi-email threads.

### 6. Vercel Deployment Gotchas
- **Root Directory**: Must be set to `gmail-assistant` in Vercel dashboard (NOT root of git repo)
- **Cron Jobs**: `vercel.json` contains cron config but requires Pro plan ($20/month)
- **Workaround**: Use free external cron (cron-job.org, GitHub Actions) to call `/api/jobs/track`
- **Build Command**: Auto-detected `npm run build` (works from `gmail-assistant/`)

## File Editing Guidelines

### When modifying AI behavior:
- Edit `lib/jobClassifier.ts` prompt for classification logic
- Test with diverse email samples (rejections, interviews, alerts)
- Add rate limiting delays if hitting quota limits

### When adding new API routes:
- Place in `app/api/` following Next.js 14 conventions
- Always check auth: `const userId = await getSession()`
- Retrieve tokens: `const tokens = await getTokens(userId)`
- Return structured JSON: `{ success: boolean, data?: any, error?: string }`

### When modifying Google Sheets schema:
- Update `HEADER_ROW` in `lib/sheets.ts`
- Adjust row mapping in `getAllApplications()` and `addApplication()`
- Update `JobApplication` type in `lib/types.ts`

## Testing & Debugging

### Local Testing
```bash
# Test OAuth flow
http://localhost:3000 → Login → Callback → Dashboard

# Test job tracking
curl http://localhost:3000/api/jobs/track
```

### Production Testing
- Visit `https://gmail-assisstant.vercel.app` (note: double 's' in domain)
- Check Vercel logs for deployment errors
- Verify environment variables in Vercel dashboard

### Common Issues
- **"Missing required Google OAuth environment variables"**: Check `.env.local` or Vercel env vars
- **"No stored credentials found"**: User needs to re-login (tokens expired/missing)
- **Gemini quota exceeded**: Add longer delays or wait for quota reset (hourly)
- **Deployment fails**: Verify Root Directory = `gmail-assistant` in Vercel settings

## External Dependencies & Integrations
- **Gmail API**: Read-only access, fetches emails for classification
- **Gemini AI**: gemini-2.0-flash-lite model (Tier 1 quota, rate-limited)
- **Google Sheets API**: CRUD operations on user's tracking spreadsheet
- **Vercel KV**: Redis-compatible key-value store for OAuth tokens
- **Vercel Serverless**: Hosts Next.js API routes (no persistent state)

## Project Context Documents
- `CONTEXT_SNOWBALL.md`: Deployment history, current blockers, user preferences
- `README.md`: High-level overview, setup instructions, live URL
- See `gmail-assistant/` directory for all project-specific docs

## Code Style
- **TypeScript**: Strict mode, explicit return types on exported functions
- **Error Handling**: Try-catch in API routes, console.error for debugging
- **Comments**: JSDoc-style function headers in `lib/` files
- **Naming**: Descriptive variables (e.g., `processedEmailIds` not `ids`)
