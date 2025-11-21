/**
 * OAuth Login Initiation Route
 * Starts the OAuth flow by redirecting to Google
 */

import { NextResponse } from 'next/server';
import { createOAuth2Client, getAuthUrl } from '@/lib/gmail';

export async function GET() {
  try {
    const oauth2Client = createOAuth2Client();
    const authUrl = getAuthUrl(oauth2Client);

    return NextResponse.json({
      success: true,
      data: { authUrl },
    });
  } catch (error: any) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate authentication URL',
      },
      { status: 500 }
    );
  }
}
