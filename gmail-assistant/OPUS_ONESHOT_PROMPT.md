# One-Shot Implementation Prompt for Claude Opus 4.5

Copy everything below the line and paste it as your prompt:

---

## Context

I have a Gmail Assistant Next.js app deployed on Vercel that tracks job applications. Here's my current setup:

**Current Features:**
- Google OAuth (Gmail + Sheets scopes) - in testing mode
- Manual job tracking via Gemini AI classification
- Manual email indexing to Pinecone (OpenAI embeddings)
- Google Sheets for job application storage
- Upstash Redis for token storage
- Dashboard with manual trigger buttons

**Tech Stack:**
- Next.js 16.x (App Router)
- Gemini AI (gemini-2.0-flash-lite)
- OpenAI embeddings (text-embedding-3-small)
- Pinecone serverless
- Upstash Redis
- Vercel Hobby plan (no cron support)

**Key Existing Files:**
- `app/api/jobs/track/route.ts` - Job tracking endpoint
- `app/api/emails/index/route.ts` - Email indexing endpoint
- `app/dashboard/page.tsx` - Main UI
- `lib/gmail.ts` - Gmail API client
- `lib/sheets.ts` - Google Sheets CRUD
- `lib/jobClassifier.ts` - Gemini classification
- `lib/openai.ts` - OpenAI embeddings
- `lib/pinecone.ts` - Pinecone client
- `lib/kv.ts` - Upstash Redis token storage
- `lib/types.ts` - TypeScript types

## Task

Implement automated scheduled email processing with these features:

### 1. Scheduled Processing (using QStash)

Since Vercel Hobby doesn't support cron, use Upstash QStash for HTTP-based scheduling.

**Create `lib/qstash.ts`:**
```typescript
import { Client } from "@upstash/qstash";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export type ScheduleFrequency = "3h" | "hourly" | "daily" | "manual";

const CRON_SCHEDULES: Record<ScheduleFrequency, string> = {
  "3h": "0 */3 * * *",
  "hourly": "0 * * * *",
  "daily": "0 9 * * *",
  "manual": "",
};

export async function createSchedule(
  userId: string,
  frequency: ScheduleFrequency,
  webhookUrl: string
): Promise<string | null> {
  if (frequency === "manual") return null;

  const schedule = await qstashClient.schedules.create({
    destination: webhookUrl,
    cron: CRON_SCHEDULES[frequency],
    body: JSON.stringify({ userId }),
    headers: {
      "Content-Type": "application/json",
      "x-cron-secret": process.env.CRON_SECRET!,
    },
  });

  return schedule.scheduleId;
}

export async function deleteSchedule(scheduleId: string): Promise<void> {
  await qstashClient.schedules.delete(scheduleId);
}

export async function updateSchedule(
  userId: string,
  oldScheduleId: string | null,
  newFrequency: ScheduleFrequency,
  webhookUrl: string
): Promise<string | null> {
  if (oldScheduleId) {
    try {
      await deleteSchedule(oldScheduleId);
    } catch (e) {
      console.log("Old schedule not found");
    }
  }
  return createSchedule(userId, newFrequency, webhookUrl);
}

export { qstashClient };
```

### 2. User Settings Storage

**Create `lib/userSettings.ts`:**
```typescript
import { Redis } from "@upstash/redis";
import type { ScheduleFrequency } from "./qstash";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SETTINGS_PREFIX = "user_settings:";

export interface UserSettings {
  scheduleFrequency: ScheduleFrequency;
  lastProcessed: string | null;
  qstashScheduleId: string | null;
  isActive: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  scheduleFrequency: "manual",
  lastProcessed: null,
  qstashScheduleId: null,
  isActive: false,
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const key = `${SETTINGS_PREFIX}${userId}`;
  const settings = await redis.get<UserSettings>(key);
  return settings || DEFAULT_SETTINGS;
}

export async function updateUserSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  const key = `${SETTINGS_PREFIX}${userId}`;
  const current = await getUserSettings(userId);
  const updated = { ...current, ...updates };
  await redis.set(key, updated);
  return updated;
}

export async function setLastProcessed(userId: string): Promise<void> {
  await updateUserSettings(userId, {
    lastProcessed: new Date().toISOString(),
  });
}
```

### 3. Webhook Endpoint for QStash

**Create `app/api/cron/process-emails/route.ts`:**

This endpoint should:
1. Verify QStash signature OR x-cron-secret header
2. Get userId from request body
3. Fetch user tokens from Redis
4. Get emails since lastProcessed timestamp
5. Embed emails to Pinecone
6. Run job classification and update Google Sheets
7. Update lastProcessed timestamp

Use `@upstash/qstash` Receiver for signature verification:
```typescript
import { Receiver } from "@upstash/qstash";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});
```

### 4. Settings API

**Create `app/api/settings/schedule/route.ts`:**
- GET: Return current user settings
- POST: Update frequency and toggle active state
- When updating, create/delete QStash schedules accordingly

### 5. Add to `lib/gmail.ts`

Add this function:
```typescript
export async function fetchEmailsSince(
  oauth2Client: OAuth2Client,
  sinceDate: Date,
  maxResults: number = 100
): Promise<GmailMessage[]> {
  const timestamp = Math.floor(sinceDate.getTime() / 1000);
  const query = `after:${timestamp}`;
  return fetchRecentEmails(oauth2Client, maxResults, query);
}
```

### 6. Update `lib/types.ts`

Add:
```typescript
export type ScheduleFrequency = "3h" | "hourly" | "daily" | "manual";

export interface UserSettings {
  scheduleFrequency: ScheduleFrequency;
  lastProcessed: string | null;
  qstashScheduleId: string | null;
  isActive: boolean;
}
```

### 7. Update Dashboard UI

Modify `app/dashboard/page.tsx` to add:
- New state for settings
- `loadSettings()` function to fetch current settings
- `handleScheduleChange(frequency, isActive)` function
- A new Card component showing:
  - Schedule frequency selector (Manual, Daily, Every 3 Hours, Hourly)
  - Active/Inactive badge
  - Last processed timestamp
  - Visual buttons/chips for frequency selection

Style the frequency options as selectable cards/buttons that show the current selection highlighted.

## Requirements

1. **DO NOT** delete or break any existing functionality
2. Add the `@upstash/qstash` package to package.json
3. Handle token expiry gracefully - if tokens are invalid, log error and skip (don't crash)
4. Rate limit Gemini calls with 200ms delay between calls
5. Use existing patterns from the codebase for consistency
6. Match the existing dark mode compatible styling in the dashboard

## Environment Variables Needed

```
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
```

## Expected Deliverables

Please provide:
1. All new files with complete code
2. All modifications to existing files (show full updated functions/sections)
3. Updated package.json dependencies section
4. A summary of changes made
5. Testing instructions

## File Structure After Implementation

```
lib/
  qstash.ts (NEW)
  userSettings.ts (NEW)
  gmail.ts (MODIFIED - add fetchEmailsSince)
  types.ts (MODIFIED - add new types)

app/api/
  cron/
    process-emails/
      route.ts (NEW)
  settings/
    schedule/
      route.ts (NEW)

app/dashboard/
  page.tsx (MODIFIED - add settings UI)
```

Implement all changes now. Show complete file contents, not snippets.

---

## How to Use This Prompt

1. Copy everything above the line
2. Start a new Claude Opus 4.5 chat
3. Paste the prompt
4. Claude will implement all the changes
5. Review the output and apply to your codebase
6. Install the new dependency: `npm install @upstash/qstash`
7. Add environment variables to Vercel
8. Deploy and test!

## Post-Implementation Steps

1. **Get QStash credentials:**
   - Go to https://console.upstash.com
   - Create a QStash instance (free tier is fine)
   - Copy QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY

2. **Generate CRON_SECRET:**
   ```bash
   openssl rand -hex 32
   ```

3. **Add to Vercel Environment Variables:**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add all the new variables

4. **Test locally:**
   ```bash
   # Test the webhook endpoint manually
   curl -X POST http://localhost:3000/api/cron/process-emails \
     -H "Content-Type: application/json" \
     -H "x-cron-secret: YOUR_CRON_SECRET" \
     -d '{"userId": "YOUR_USER_ID"}'
   ```

5. **Test schedule creation:**
   - Login to your app
   - Go to dashboard
   - Select a schedule frequency
   - Check Upstash QStash console to verify schedule was created

## Important Notes

- **OAuth Testing Mode:** Since your Google OAuth is in testing mode, tokens expire in 7 days. Users will need to re-authenticate periodically. The cron job handles this gracefully by skipping users with expired tokens.

- **Vercel Function Timeout:** Vercel Hobby has a 10-second function timeout. If processing many emails, consider:
  - Limiting emails per run
  - Using Vercel Pro for 60-second timeout
  - Breaking into multiple smaller functions

- **QStash Free Tier:** 500 messages/day is plenty for personal use (hourly = 24/day, every 3h = 8/day)

