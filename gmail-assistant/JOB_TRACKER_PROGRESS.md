# Job Tracker Feature - Development Progress

**Last Updated:** November 22, 2025  
**Developer:** Abhiram (TypeScript Intern)  
**Teaching Style:** Step-by-step guided learning with code challenges

---

## 🎯 Project Goal

Build an automated job application tracker that:
- Reads Gmail daily for job-related emails
- Uses Gemini AI (free tier) to intelligently classify emails
- Extracts job details (title, company, status)
- Updates a Google Sheet automatically
- Runs as a daily cron job on Vercel

---

## ✅ Completed Tasks

### 1. **Dependencies & Setup**
- ✅ Installed `@google/generative-ai` (Gemini SDK)
- ✅ Already had `googleapis` installed

### 2. **Core Infrastructure**

#### **`lib/gemini.ts`** - Gemini AI Client
- ✅ Created client initialization with lazy loading pattern
- ✅ Uses `GEMINI_API_KEY` environment variable
- ✅ Exports `getGeminiModel()` using `gemini-1.5-flash` model
- **Learning:** Followed same pattern as `lib/openai.ts`

#### **`lib/types.ts`** - Type Definitions
Added:
```typescript
export interface JobApplication {
  jobTitle: string;
  companyName: string;
  emailId: string;
  status: ApplicationStatus;
  dateApplied?: string;
  lastUpdated: string;
  notes?: string;
  sheetRowId?: number; // For tracking Google Sheets row
}

export type ApplicationStatus = 
  | 'applied' 
  | 'rejected' 
  | 'assessment' 
  | 'interview' 
  | 'moving-forward'
  | 'offer';
```
- **Learning:** Used union types for status, optional fields for uncertain data

#### **`lib/sheets.ts`** - Google Sheets Client
- ✅ `getAllApplications()` - Reads existing jobs from sheet
- ✅ `addApplication()` - Appends new job application
- ✅ `updateApplication()` - Updates existing row by `sheetRowId`
- **Key decisions:** 
  - Sheet name: `'Job Applications'`
  - Columns: Job Title | Company | Date Applied | Status | Last Updated | Email ID | Notes
  - Uses OAuth2Client (already configured in app)

---

## 🚧 In Progress

### 3. **Job Email Classifier** (`lib/jobClassifier.ts`)

**Next steps to complete:**

#### **Task:** Create the email classification function

**What it needs to do:**
1. Take a `GmailMessage` as input
2. Extract subject, from, snippet from email headers
3. Send to Gemini AI with structured prompt
4. Parse Gemini's JSON response
5. Return `JobApplication | null`

**Gemini AI Prompt Structure:**
```
You are an email classifier for job application tracking.

Analyze this email and determine:
1. Is this a job application-related email? (yes/no)
2. If yes, extract:
   - Job Title
   - Company Name
   - Application Status (choose ONE): applied, rejected, assessment, interview, moving-forward, offer

Status definitions:
- "applied": Confirmation of application submission
- "rejected": Application declined/not moving forward
- "assessment": Take-home assignment, coding test, or technical challenge
- "interview": Interview invitation or scheduling
- "moving-forward": Positive response, next steps mentioned (but not specific)
- "offer": Job offer received

Email details:
Subject: {subject}
From: {from}
Content: {snippet}

Respond in JSON format only:
{
  "isJobRelated": boolean,
  "jobTitle": string or null,
  "companyName": string or null,
  "status": string or null,
  "notes": string or null
}
```

**Student Challenge:**
```typescript
// File: lib/jobClassifier.ts

// Step 1: Import what you need
// - getGeminiModel from './gemini'
// - GmailMessage, JobApplication from './types'

// Step 2: Create function signature
export async function classifyJobEmail(email: GmailMessage): Promise<JobApplication | null> {
  // Step 3: Extract email details from headers
  
  // Step 4: Build prompt using template above
  
  // Step 5: Call Gemini AI
  
  // Step 6: Parse JSON response
  
  // Step 7: Return JobApplication or null
}
```

---

## 📋 Remaining Tasks

### 4. **API Endpoint** (`app/api/jobs/track/route.ts`)
**Purpose:** Main orchestrator that runs daily

**Logic flow:**
```typescript
1. Get OAuth client from session
2. Fetch today's emails using fetchTodaysEmails()
3. For each email:
   a. classifyJobEmail() → JobApplication?
   b. If job-related:
      - Check if emailId exists in sheet (getAllApplications())
      - If new: addApplication()
      - If exists: Compare status, updateApplication() if changed
4. Return summary of updates
```

### 5. **Vercel Cron Configuration** (`vercel.json`)
```json
{
  "crons": [{
    "path": "/api/jobs/track",
    "schedule": "0 9 * * *"  // 9 AM daily
  }]
}
```

### 6. **Environment Setup**
Add to `.env.local`:
```
GEMINI_API_KEY=your_key_here
GOOGLE_SHEET_ID=your_sheet_id_here
```

### 7. **Testing & Validation**
- Create test Google Sheet with headers
- Manually trigger `/api/jobs/track` endpoint
- Verify sheet updates correctly
- Test status transitions (applied → interview → offer)

---

## 🎓 Learning Style & Approach

**Student (Abhiram) prefers:**
- ✅ **Step-by-step guidance** - Break tasks into small chunks
- ✅ **Code challenges** - Let student attempt first, then review
- ✅ **Pattern learning** - Show existing code as examples (like openai.ts)
- ✅ **Conceptual questions** - Ask "why?" before implementing
- ✅ **Concise responses** - No walls of code, focus on one task at a time

**Teaching pattern:**
1. Ask conceptual question (1-2 min thinking)
2. Give code skeleton with hints
3. Let student implement
4. Review and refine together
5. Explain best practices
6. Move to next step

---

## 🔑 Key Technical Decisions

| Decision | Reasoning |
|----------|-----------|
| **Gemini over OpenAI** | Free tier (1500 req/day), cost optimization |
| **`gemini-1.5-flash`** | Fast, free, sufficient for classification |
| **OAuth over Service Account** | Already configured for Gmail, reuse auth |
| **Google Sheets over DB** | Easy visualization, user can manually edit |
| **Vercel Cron** | Already on Vercel, native support |
| **sheetRowId tracking** | Efficient updates without full sheet scan |

---

## 📚 Resources & References

**Existing code patterns to reference:**
- `lib/openai.ts` - Client initialization pattern
- `lib/gmail.ts` - OAuth2Client usage, `fetchTodaysEmails()`
- `app/api/emails/*` - API route structure

**External docs:**
- [Gemini API - Node.js](https://ai.google.dev/gemini-api/docs/get-started/node)
- [Google Sheets API v4](https://developers.google.com/sheets/api/reference/rest)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

## 🚀 Next Session Goals

1. **Complete `lib/jobClassifier.ts`**
   - Implement email detail extraction
   - Build Gemini prompt dynamically
   - Handle JSON parsing with error handling

2. **Create API endpoint**
   - Set up route handler
   - Implement main loop logic
   - Add logging for debugging

3. **Deploy & Test**
   - Add environment variables
   - Create Google Sheet
   - Test end-to-end flow

---

## 💡 Notes for Next Developer/Session

- Student is comfortable with TypeScript basics
- Prefers hands-on challenges over explanations
- Good at pattern recognition (copied openai.ts structure well)
- Needs gentle nudges on best practices (optional fields, error handling)
- Keep responses under 10 lines when possible
- Always ask "what do you think?" before revealing answers

**Current blocker:** None - ready to implement job classifier!

---

**Status:** 60% complete | **Estimated time to completion:** 2-3 focused sessions
