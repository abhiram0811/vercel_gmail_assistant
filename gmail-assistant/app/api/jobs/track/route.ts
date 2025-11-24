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

        const newJobs = [];
        const updatedJobs = [];

        for (const email of emails) {
            
            const jobData = await classifyJobEmail(email);
            
            if (!jobData) {
                continue; // Go to next email
            }

            const existingJob = existingApps.find(app => app.emailId === email.id);

            if (existingJob) {
                // We've seen this email before!
                // Check: Did the status change? (e.g., "applied" → "interview")
                if (existingJob.status !== jobData.status) {
                    // Status changed! Update it in the sheet
                    await updateApplication(oauth2Client, {
                        ...jobData,
                        sheetRowId: existingJob.sheetRowId, // Keep same row number
                    });
                    updatedJobs.push(jobData.jobTitle);
                }
                // If status is same, do nothing (skip)
            } else {
                // Brand new job email! Add it to the sheet
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
        });

    } catch (error) {
        console.error('Job tracking error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to track jobs' },
            { status: 500 }
        );
    }
}