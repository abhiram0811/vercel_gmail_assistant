/**
 * Job Tracker API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { fetchTodaysEmails } from '@/lib/gmail';
import { getTokens } from '@/lib/kv';
import { classifyJobEmail } from '@/lib/jobClassifier'; 
import { updateApplication, addApplication, getAllApplications } from '@/lib/sheets';
import { createOAuth2Client } from '@/lib/gmail';

export async function GET(request: NextRequest) {
    try {
        const userId = await getSession();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Not Authenticated' },
                { status: 401 }
            );
        }

        const tokens = await getTokens(userId);
        if (!tokens) {
            return NextResponse.json(
                { success: false, error: 'No stored credentials found' },
                { status: 401 }
            )
        }

        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials(tokens);

        const emails = await fetchTodaysEmails(oauth2Client);

        const existingApps = await getAllApplications(oauth2Client);

        // Create a Set of processed email IDs for fast duplicate detection
        const processedEmailIds = new Set(existingApps.map(app => app.emailId));

        const newJobs = [];
        const updatedJobs = [];
        let skipped = 0;
        let geminiCallCount = 0;

        for (const email of emails) {
            // OPTIMIZATION 1: Skip if we've already processed THIS EXACT email
            if (processedEmailIds.has(email.id)) {
                skipped++;
                continue; // Same email, already processed
            }

            // Rate limit protection: Delay between Gemini calls (after first call)
            if (geminiCallCount > 0) {
                await new Promise(resolve => setTimeout(resolve, 200)); // 200ms between calls
            }

            // NEW email - classify it with Gemini
            const jobData = await classifyJobEmail(email);
            geminiCallCount++;
            
            if (!jobData) {
                continue; // Not job-related, skip
            }

            // OPTIMIZATION 2: Check if this job (by title+company) exists
            const existingJob = existingApps.find(
                app => app.jobTitle.toLowerCase() === jobData.jobTitle.toLowerCase() &&
                       app.companyName.toLowerCase() === jobData.companyName.toLowerCase()
            );

            if (existingJob) {
                // Same job exists! Check if status changed
                if (existingJob.status !== jobData.status) {
                    // Status update! (e.g., "applied" → "interview")
                    await updateApplication(oauth2Client, {
                        ...jobData,
                        sheetRowId: existingJob.sheetRowId,
                    });
                    updatedJobs.push(`${jobData.jobTitle} at ${jobData.companyName}`);
                }
                // Same status, no update needed
            } else {
                // Brand new job application!
                await addApplication(oauth2Client, jobData);
                newJobs.push(jobData.jobTitle);
            }
        }

        // STEP 7: Return summary
        return NextResponse.json({
            success: true,
            message: 'Job tracking completed',
            newJobs: newJobs.length,
            updatedJobs: updatedJobs.length,
            processed: emails.length,
            skipped: skipped,
            geminiCalls: emails.length - skipped,
        });

    } catch (error) {
        console.error('Job tracking error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to track jobs' },
            { status: 500 }
        );
    }
}