# Gmail Assistant - Enhanced Implementation Plan

## Current State Summary

**Existing Features:**
- Google OAuth with Gmail & Sheets scopes
- Manual job tracking via `/api/jobs/track` (Gemini AI classification)
- Manual email indexing to Pinecone via `/api/emails/index` (OpenAI embeddings)
- Google Sheets integration for job application tracking
- Upstash Redis for token storage
- Dashboard UI with manual trigger buttons

**Tech Stack:**
- Next.js 16.x (App Router)
- Gemini AI (gemini-2.0-flash-lite) for job classification
- OpenAI text-embedding-3-small for embeddings
- Pinecone vector DB (serverless)
- Upstash Redis
- Vercel (Hobby plan - no cron support)

**Constraints:**
- Google OAuth in testing mode (100 user limit, tokens expire in 7 days)
- Vercel Hobby plan doesn't support cron jobs
- Need external scheduler (QStash recommended since already using Upstash)

---

## Required Changes

### 1. Add QStash for Scheduled Jobs (Vercel-friendly cron alternative)

**Why QStash:**
- Already using Upstash Redis, so QStash integrates seamlessly
- Works with Vercel Hobby plan (HTTP-based scheduling)
- Supports dynamic schedule management via API
- Free tier: 500 messages/day (plenty for hourly/3-hour intervals)

**New Environment Variables:**
```
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=<your-qstash-token>
QSTASH_CURRENT_SIGNING_KEY=<signing-key>
QSTASH_NEXT_SIGNING_KEY=<next-signing-key>
CRON_SECRET=<random-secret-for-api-protection>
```

### 2. New API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/cron/process-emails` | POST | QStash webhook endpoint - processes emails + tracks jobs |
| `/api/settings/schedule` | GET/POST | Get/update user's schedule preference |
| `/api/cron/register` | POST | Register/update QStash schedule for user |

### 3. Database Schema (Redis Keys)

```
user_settings:{userId} = {
  scheduleFrequency: "3h" | "hourly" | "daily" | "manual",
  lastProcessed: ISO timestamp,
  qstashScheduleId: string | null,
  isActive: boolean
}
```

### 4. UI Changes (Dashboard)

- Add "Settings" card with schedule selector dropdown
- Show last processed timestamp
- Toggle for enabling/disabling auto-processing
- Visual indicator of current schedule status

---

## Files to Create/Modify

### NEW FILES:

1. `lib/qstash.ts` - QStash client and schedule management
2. `lib/userSettings.ts` - User settings CRUD operations
3. `app/api/cron/process-emails/route.ts` - Main webhook endpoint
4. `app/api/settings/schedule/route.ts` - Schedule settings API
5. `app/api/cron/register/route.ts` - Register schedules with QStash

### MODIFIED FILES:

1. `app/dashboard/page.tsx` - Add settings UI
2. `lib/types.ts` - Add new type definitions
3. `lib/gmail.ts` - Add `fetchEmailsSince()` function

---

## Detailed Implementation

### File 1: `lib/qstash.ts`

```typescript
/**
 * QStash Client for Scheduled Jobs
 * Handles schedule management for automated email processing
 */

import { Client } from "@upstash/qstash";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export type ScheduleFrequency = "3h" | "hourly" | "daily" | "manual";

// Cron expressions for each frequency
const CRON_SCHEDULES: Record<ScheduleFrequency, string> = {
  "3h": "0 */3 * * *",      // Every 3 hours
  "hourly": "0 * * * *",     // Every hour
  "daily": "0 9 * * *",      // Daily at 9 AM
  "manual": "",              // No schedule
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
  // Delete old schedule if exists
  if (oldScheduleId) {
    try {
      await deleteSchedule(oldScheduleId);
    } catch (e) {
      console.log("Old schedule already deleted or not found");
    }
  }

  // Create new schedule
  return createSchedule(userId, newFrequency, webhookUrl);
}

export { qstashClient };
```

### File 2: `lib/userSettings.ts`

```typescript
/**
 * User Settings Management
 * Stores user preferences in Upstash Redis
 */

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

### File 3: `app/api/cron/process-emails/route.ts`

```typescript
/**
 * Cron Webhook Endpoint
 * Called by QStash on schedule - processes emails and tracks jobs
 */

import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { getTokens } from "@/lib/kv";
import { createOAuth2Client, fetchEmailsSince } from "@/lib/gmail";
import { classifyJobEmail } from "@/lib/jobClassifier";
import { updateApplication, addApplication, getAllApplications } from "@/lib/sheets";
import { embedEmails } from "@/lib/openai";
import { upsertEmails } from "@/lib/pinecone";
import { getUserSettings, setLastProcessed } from "@/lib/userSettings";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Verify request is from QStash or has valid secret
    const signature = request.headers.get("upstash-signature");
    const cronSecret = request.headers.get("x-cron-secret");

    const body = await request.text();

    // Verify QStash signature if present
    if (signature) {
      const isValid = await receiver.verify({
        signature,
        body,
      });
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = JSON.parse(body);

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get user tokens
    const tokens = await getTokens(userId);
    if (!tokens) {
      console.log(`No tokens for user ${userId} - skipping`);
      return NextResponse.json({
        success: false,
        error: "No valid tokens - user needs to re-authenticate"
      });
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    // Get user settings to determine since when to fetch emails
    const settings = await getUserSettings(userId);
    const sinceDate = settings.lastProcessed
      ? new Date(settings.lastProcessed)
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours

    // Fetch emails since last processed
    const emails = await fetchEmailsSince(oauth2Client, sinceDate, 100);

    if (emails.length === 0) {
      await setLastProcessed(userId);
      return NextResponse.json({
        success: true,
        message: "No new emails to process",
        processed: 0,
      });
    }

    // === STEP 1: Embed emails to Pinecone ===
    console.log(`Embedding ${emails.length} emails to Pinecone...`);
    const embeddedEmails = await embedEmails(emails);
    await upsertEmails(embeddedEmails);

    // === STEP 2: Track jobs ===
    console.log("Tracking jobs...");
    const existingApps = await getAllApplications(oauth2Client);
    const processedEmailIds = new Set(existingApps.map(app => app.emailId));

    let newJobs = 0;
    let updatedJobs = 0;
    let geminiCalls = 0;

    for (const email of emails) {
      if (processedEmailIds.has(email.id)) continue;

      // Rate limit protection
      if (geminiCalls > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const jobData = await classifyJobEmail(email);
      geminiCalls++;

      if (!jobData) continue;

      const existingJob = existingApps.find(
        app => app.jobTitle.toLowerCase() === jobData.jobTitle.toLowerCase() &&
               app.companyName.toLowerCase() === jobData.companyName.toLowerCase()
      );

      if (existingJob) {
        if (existingJob.status !== jobData.status) {
          await updateApplication(oauth2Client, {
            ...jobData,
            sheetRowId: existingJob.sheetRowId,
          });
          updatedJobs++;
        }
      } else {
        await addApplication(oauth2Client, jobData);
        newJobs++;
      }
    }

    // Update last processed timestamp
    await setLastProcessed(userId);

    return NextResponse.json({
      success: true,
      message: "Processing complete",
      emailsProcessed: emails.length,
      emailsIndexed: embeddedEmails.length,
      newJobs,
      updatedJobs,
      geminiCalls,
    });

  } catch (error: any) {
    console.error("Cron processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### File 4: `app/api/settings/schedule/route.ts`

```typescript
/**
 * Schedule Settings API
 * GET: Retrieve current settings
 * POST: Update schedule frequency
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserSettings, updateUserSettings } from "@/lib/userSettings";
import { updateSchedule, type ScheduleFrequency } from "@/lib/qstash";

export async function GET() {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const settings = await getUserSettings(userId);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { frequency, isActive } = await request.json();

    if (!["3h", "hourly", "daily", "manual"].includes(frequency)) {
      return NextResponse.json({ success: false, error: "Invalid frequency" }, { status: 400 });
    }

    const currentSettings = await getUserSettings(userId);

    // Build webhook URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/cron/process-emails`;

    // Update QStash schedule if active
    let newScheduleId = currentSettings.qstashScheduleId;

    if (isActive && frequency !== "manual") {
      newScheduleId = await updateSchedule(
        userId,
        currentSettings.qstashScheduleId,
        frequency as ScheduleFrequency,
        webhookUrl
      );
    } else if (!isActive || frequency === "manual") {
      // Delete schedule if turning off or switching to manual
      if (currentSettings.qstashScheduleId) {
        await updateSchedule(userId, currentSettings.qstashScheduleId, "manual", webhookUrl);
        newScheduleId = null;
      }
    }

    const updated = await updateUserSettings(userId, {
      scheduleFrequency: frequency as ScheduleFrequency,
      isActive: isActive && frequency !== "manual",
      qstashScheduleId: newScheduleId,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### File 5: Add to `lib/gmail.ts`

```typescript
/**
 * Fetches emails since a specific date
 */
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

### File 6: Add to `lib/types.ts`

```typescript
/**
 * Schedule settings
 */
export type ScheduleFrequency = "3h" | "hourly" | "daily" | "manual";

export interface UserSettings {
  scheduleFrequency: ScheduleFrequency;
  lastProcessed: string | null;
  qstashScheduleId: string | null;
  isActive: boolean;
}
```

### File 7: Updated Dashboard UI Component

Add this new section to `app/dashboard/page.tsx`:

```tsx
// Add these state variables
const [settings, setSettings] = useState<{
  scheduleFrequency: string;
  lastProcessed: string | null;
  isActive: boolean;
} | null>(null);
const [savingSettings, setSavingSettings] = useState(false);

// Add this useEffect
useEffect(() => {
  loadSettings();
}, []);

const loadSettings = async () => {
  try {
    const response = await fetch('/api/settings/schedule');
    const data = await response.json();
    if (data.success) {
      setSettings(data.data);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

const handleScheduleChange = async (frequency: string, isActive: boolean) => {
  setSavingSettings(true);
  try {
    const response = await fetch('/api/settings/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frequency, isActive }),
    });
    const data = await response.json();
    if (data.success) {
      setSettings(data.data);
      setSuccess(`Schedule updated to ${frequency === 'manual' ? 'manual' : frequency}`);
    } else {
      setError(data.error || 'Failed to update schedule');
    }
  } catch (error) {
    setError('Failed to update schedule');
  } finally {
    setSavingSettings(false);
  }
};

// Add this JSX section after the Job Applications card:
{/* Schedule Settings Card */}
<Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
  <CardHeader>
    <div className="flex justify-between items-start">
      <div>
        <CardTitle className="text-2xl">Auto-Processing Schedule</CardTitle>
        <CardDescription className="mt-2">
          Configure automatic email processing and job tracking
        </CardDescription>
      </div>
      {settings?.isActive && (
        <Badge className="bg-green-500 text-white">Active</Badge>
      )}
    </div>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium">Processing Frequency</label>
      <div className="flex flex-wrap gap-3">
        {[
          { value: 'manual', label: 'Manual Only', desc: 'Click button to process' },
          { value: 'daily', label: 'Daily', desc: 'Once per day at 9 AM' },
          { value: '3h', label: 'Every 3 Hours', desc: '8 times per day' },
          { value: 'hourly', label: 'Hourly', desc: 'Premium - 24 times/day' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleScheduleChange(option.value, option.value !== 'manual')}
            disabled={savingSettings}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              settings?.scheduleFrequency === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-xs text-muted-foreground">{option.desc}</div>
          </button>
        ))}
      </div>
    </div>

    {settings?.lastProcessed && (
      <div className="text-sm text-muted-foreground">
        Last processed: {new Date(settings.lastProcessed).toLocaleString()}
      </div>
    )}
  </CardContent>
</Card>
```

---

## Environment Variables to Add

Add these to Vercel and `.env.local`:

```bash
# QStash (get from Upstash console)
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key

# Cron Security
CRON_SECRET=generate_a_random_32_char_string

# App URL (for webhook callbacks)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Dependencies to Install

```bash
npm install @upstash/qstash
```

---

## Google OAuth Considerations

Since OAuth is in testing mode:
1. Tokens expire in 7 days - users need to re-authenticate periodically
2. Limited to 100 test users
3. When the cron runs and tokens are expired, it will log the error and skip that user
4. Consider adding email notification when re-auth is needed

---

## Testing Checklist

1. [ ] Install `@upstash/qstash` package
2. [ ] Add environment variables to Vercel
3. [ ] Create QStash account at console.upstash.com
4. [ ] Test schedule creation via UI
5. [ ] Verify webhook endpoint with Postman/curl
6. [ ] Test token expiry handling
7. [ ] Verify Pinecone indexing works
8. [ ] Verify Google Sheets updates

---

## One-Shot Prompt for Opus 4.5

See the next section for the complete prompt to implement all changes.

