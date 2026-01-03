/**
 * QStash Webhook Endpoint
 * Receives scheduled triggers to process emails automatically
 */

import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { getTokens, updateTokens } from '@/lib/kv';
import { createOAuth2Client, fetchEmailsSince, refreshAccessTokenIfNeeded } from '@/lib/gmail';
import { classifyJobEmail } from '@/lib/jobClassifier';
import { addApplication, updateApplication, getAllApplications } from '@/lib/sheets';
import { getUserSettings, setLastProcessed } from '@/lib/userSettings';

// QStash signature verification
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from QStash or has valid cron secret
    const signature = request.headers.get('upstash-signature');
    const cronSecret = request.headers.get('x-cron-secret');
    const body = await request.text();

    // Verify QStash signature OR cron secret (for manual testing)
    if (signature) {
      const isValid = await receiver.verify({
        signature,
        body,
      });
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the request body
    const { userId } = JSON.parse(body);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      );
    }

    console.log(`[CRON] Processing emails for user: ${userId}`);

    // Get user settings to check lastProcessed
    const settings = await getUserSettings(userId);
    if (!settings.isActive) {
      console.log(`[CRON] User ${userId} has inactive schedule, skipping`);
      return NextResponse.json({ success: true, message: 'Schedule inactive' });
    }

    // Get stored tokens
    const tokens = await getTokens(userId);
    if (!tokens) {
      console.log(`[CRON] No tokens found for user ${userId}`);
      return NextResponse.json(
        { success: false, error: 'No tokens found' },
        { status: 401 }
      );
    }

    // Create OAuth client and refresh token if needed
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    try {
      await refreshAccessTokenIfNeeded(oauth2Client);
      // Save refreshed tokens
      const newCredentials = oauth2Client.credentials;
      if (newCredentials.access_token !== tokens.access_token) {
        await updateTokens(userId, newCredentials);
      }
    } catch (error) {
      console.error(`[CRON] Token refresh failed for user ${userId}:`, error);
      return NextResponse.json(
        { success: false, error: 'Token refresh failed' },
        { status: 401 }
      );
    }

    // Determine the date to fetch emails from
    const sinceDate = settings.lastProcessed
      ? new Date(settings.lastProcessed)
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours

    console.log(`[CRON] Fetching emails since: ${sinceDate.toISOString()}`);

    // Fetch emails since last processed
    const emails = await fetchEmailsSince(oauth2Client, sinceDate, 50);
    console.log(`[CRON] Found ${emails.length} emails to process`);

    if (emails.length === 0) {
      await setLastProcessed(userId);
      return NextResponse.json({
        success: true,
        message: 'No new emails',
        processed: 0,
      });
    }

    // Get existing applications for deduplication
    const existingApps = await getAllApplications(oauth2Client);
    const processedEmailIds = new Set(existingApps.map(app => app.emailId));

    let newJobs = 0;
    let updatedJobs = 0;
    let skipped = 0;
    let geminiCalls = 0;

    for (const email of emails) {
      // Skip already processed emails
      if (processedEmailIds.has(email.id)) {
        skipped++;
        continue;
      }

      // Rate limit: 200ms between Gemini calls
      if (geminiCalls > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      try {
        const jobData = await classifyJobEmail(email);
        geminiCalls++;

        if (!jobData) continue;

        // Check for existing job by title+company
        const existingJob = existingApps.find(
          app =>
            app.jobTitle.toLowerCase() === jobData.jobTitle.toLowerCase() &&
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
      } catch (classifyError) {
        console.error(`[CRON] Error classifying email ${email.id}:`, classifyError);
        // Continue processing other emails
      }
    }

    // Update last processed timestamp
    await setLastProcessed(userId);

    console.log(`[CRON] Completed: ${newJobs} new, ${updatedJobs} updated, ${skipped} skipped`);

    return NextResponse.json({
      success: true,
      message: 'Processing complete',
      newJobs,
      updatedJobs,
      processed: emails.length,
      skipped,
      geminiCalls,
    });
  } catch (error) {
    console.error('[CRON] Processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Processing failed' },
      { status: 500 }
    );
  }
}
