// File: lib/jobClassifier.ts

// Step 1: Import what you need
// - getGeminiModel from './gemini'
// - GmailMessage, JobApplication from './types'

// Step 2: Create function signature
// export async function classifyJobEmail(email: GmailMessage): Promise<JobApplication | null> {
//   // Step 3: Extract email details from headers
//   
//   // Step 4: Build prompt using template above
//   
//   // Step 5: Call Gemini AI
//   
//   // Step 6: Parse JSON response
//   
//   // Step 7: Return JobApplication or null
// }

import { getGeminiModel } from "./gemini";
import { GmailMessage, JobApplication } from "./types";

export async function classifyJobEmail(email: GmailMessage): Promise<JobApplication | null> {
    const headers = email.payload?.headers || [];

    const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
    const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
    const date = headers.find((h) => h.name === 'Date')?.value || new Date().toISOString();
    const snippet = email.snippet || '';

    const prompt = `You are an email classifier for job application tracking.

IMPORTANT: Only classify emails where the USER has APPLIED to a job, NOT job alerts/recommendations.

Analyze this email and determine:
1. Is this about a job application YOU submitted? (NOT job alerts, job board notifications, or recommendations)
2. If yes, extract:
   - Job Title
   - Company Name
   - Application Status (choose ONE): applied, rejected, assessment, interview, moving-forward, offer

Status definitions:
- "applied": Confirmation that you submitted an application
- "rejected": Application declined
- "assessment": Take-home assignment or coding test
- "interview": Interview invitation
- "moving-forward": Positive response, next steps
- "offer": Job offer received

REJECT these:
- Job alerts from LinkedIn, Indeed, Glassdoor
- Job recommendations
- Newsletter/promotional emails about jobs
- Emails that just list open positions

Email details:
Subject: ${subject}
From: ${from}
Content: ${snippet}

Respond in JSON format only:
{
  "isJobRelated": boolean,
  "jobTitle": string or null,
  "companyName": string or null,
  "status": string or null,
  "notes": string or null
}`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean the response (remove markdown code blocks if any)
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    const parsed = JSON.parse(cleanedText);

    // Check if it's job-related
    if (!parsed.isJobRelated) {
        return null;
    }

    return {
        jobTitle: parsed.jobTitle || 'Unknown',
        companyName: parsed.companyName || 'Unknown',
        status: parsed.status as JobApplication['status'],
        emailId: email.id,
        lastUpdated: new Date().toISOString(),
        dateApplied: date,
        notes: parsed.notes || undefined,
    };
}