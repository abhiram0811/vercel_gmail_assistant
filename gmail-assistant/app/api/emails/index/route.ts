/**
 * Email Indexing Route
 * Fetches emails from Gmail and indexes them in Pinecone
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getTokens } from '@/lib/kv';
import { createOAuth2Client, fetchTodaysEmails, fetchRecentEmails } from '@/lib/gmail';
import { embedEmails } from '@/lib/openai';
import { upsertEmails } from '@/lib/pinecone';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get stored tokens
    const tokens = await getTokens(userId);
    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'No stored credentials found' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { mode = 'today', maxResults = 50 } = body;

    // Create OAuth client with stored tokens
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    // Fetch emails
    console.log(`Fetching emails (mode: ${mode})...`);
    let emails;
    
    if (mode === 'today') {
      emails = await fetchTodaysEmails(oauth2Client, maxResults);
    } else {
      emails = await fetchRecentEmails(oauth2Client, maxResults);
    }

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No emails to index',
        data: { indexed: 0 },
      });
    }

    console.log(`Found ${emails.length} emails. Creating embeddings...`);

    // Create embeddings
    const embeddedEmails = await embedEmails(emails, (current, total, subject) => {
      console.log(`Processing ${current}/${total}: ${subject}`);
    });

    console.log('Uploading to Pinecone...');

    // Upload to Pinecone
    await upsertEmails(embeddedEmails, (current, total) => {
      console.log(`Uploaded ${current}/${total} emails`);
    });

    return NextResponse.json({
      success: true,
      message: 'Emails indexed successfully',
      data: {
        indexed: embeddedEmails.length,
        mode,
      },
    });
  } catch (error: any) {
    console.error('Error indexing emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to index emails',
      },
      { status: 500 }
    );
  }
}
