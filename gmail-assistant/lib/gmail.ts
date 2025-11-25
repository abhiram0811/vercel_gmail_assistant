/**
 * Gmail API Client
 * Handles Gmail authentication and email fetching
 */

import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import type { GmailMessage } from './types';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/spreadsheets', // Add Sheets access
];

/**
 * Creates an OAuth2 client with credentials from environment
 */
export function createOAuth2Client(): OAuth2Client {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    throw new Error('Missing required Google OAuth environment variables');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client;
}

/**
 * Generates the OAuth2 authorization URL
 */
export function getAuthUrl(oauth2Client: OAuth2Client): string {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to get refresh token
  });

  return authUrl;
}

/**
 * Exchanges authorization code for tokens
 */
export async function getTokenFromCode(oauth2Client: OAuth2Client, code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

/**
 * Creates an authenticated Gmail client
 */
export function getGmailClient(oauth2Client: OAuth2Client) {
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Fetches recent emails from Gmail
 */
export async function fetchRecentEmails(
  oauth2Client: OAuth2Client,
  maxResults: number = 10,
  query: string = ''
): Promise<GmailMessage[]> {
  try {
    const gmail = getGmailClient(oauth2Client);

    // Fetch list of message IDs
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
      q: query,
    });

    const messages = listResponse.data.messages;

    if (!messages || messages.length === 0) {
      return [];
    }

    // Fetch full message details in parallel
    const emailDetailsPromises = messages.map((message) =>
      gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full',
      })
    );

    const emailDetails = await Promise.all(emailDetailsPromises);

    return emailDetails.map((response) => response.data as GmailMessage);
  } catch (error: any) {
    console.error('Error fetching emails:', error);
    
    if (error.code === 401) {
      throw new Error('Authentication expired. Please re-authenticate.');
    }
    
    throw new Error('Failed to fetch emails from Gmail');
  }
}

/**
 * Fetches today's emails from Gmail
 */
export async function fetchTodaysEmails(
  oauth2Client: OAuth2Client,
  maxResults: number = 50
): Promise<GmailMessage[]> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  const dateQuery = `after:${year}/${month}/${day}`;
  
  return fetchRecentEmails(oauth2Client, maxResults, dateQuery);
}

/**
 * Verifies if the OAuth client has valid credentials
 */
export function hasValidCredentials(oauth2Client: OAuth2Client): boolean {
  const credentials = oauth2Client.credentials;
  
  if (!credentials.access_token) {
    return false;
  }

  // Check if token is expired
  if (credentials.expiry_date && credentials.expiry_date < Date.now()) {
    return false;
  }

  return true;
}

/**
 * Refreshes the access token if needed
 */
export async function refreshAccessTokenIfNeeded(oauth2Client: OAuth2Client): Promise<void> {
  const credentials = oauth2Client.credentials;

  // If no expiry date, assume it's valid
  if (!credentials.expiry_date) {
    return;
  }

  // Refresh if expired or expiring in the next 5 minutes
  const expiryThreshold = Date.now() + 5 * 60 * 1000;
  
  if (credentials.expiry_date < expiryThreshold) {
    try {
      const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(newCredentials);
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }
}
