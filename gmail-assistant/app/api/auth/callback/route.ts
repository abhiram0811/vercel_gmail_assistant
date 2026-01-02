/**
 * OAuth Callback Route
 * Handles the OAuth callback from Google and stores tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOAuth2Client, getTokenFromCode, getGmailClient } from '@/lib/gmail';
import { storeTokens } from '@/lib/kv';
import { setSession, createUserId } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Log ALL query params for debugging
    const allParams = Object.fromEntries(searchParams.entries());
    console.error('OAuth callback received with params:', JSON.stringify(allParams, null, 2));

    if (error) {
      const errorDescription = searchParams.get('error_description') || 'No description';
      console.error('OAuth error details:', {
        error,
        error_description: errorDescription,
        all_params: allParams
      });
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(`${error}: ${errorDescription}`)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent('No authorization code received')}`, request.url)
      );
    }

    // Exchange code for tokens
    const oauth2Client = createOAuth2Client();
    const tokens = await getTokenFromCode(oauth2Client, code);

    // Get user email to create user ID
    const gmail = getGmailClient(oauth2Client);
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const emailAddress = profile.data.emailAddress || 'default_user';

    // Create user ID and store tokens
    const userId = createUserId(emailAddress);
    await storeTokens(userId, tokens);

    // Set session cookie
    await setSession(userId);

    console.log('Authentication successful for user:', emailAddress);

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error: any) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('Authentication failed')}`, request.url)
    );
  }
}
