/**
 * Gmail OAuth2 Authentication Module
 * 
 * This module handles the OAuth2 flow for Gmail API access.
 * 
 * KEY CONCEPTS:
 * 1. OAuth2Client - Google's authentication client
 * 2. Access Token - Temporary key to access Gmail (expires after 1 hour)
 * 3. Refresh Token - Long-lived token to get new access tokens
 * 4. Scopes - Permissions we're asking for (readonly Gmail access)
 */

import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the permissions we need from Gmail
// 'readonly' means we can read emails but not modify/delete them
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Where we'll save the access token after authentication
const TOKEN_PATH = path.join(__dirname, '..', 'token.json');

/**
 * Creates an OAuth2 client with our credentials
 * 
 * LEARNING: This is a factory function - it creates and returns an object
 * we'll use for authentication throughout the app
 */
export function createOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  return oauth2Client;
}

/**
 * Generates the URL where users will authenticate
 * 
 * LEARNING: This URL includes:
 * - client_id: Identifies your app
 * - redirect_uri: Where Google sends the user back
 * - scope: What permissions you're requesting
 * - access_type: 'offline' gives us a refresh token
 */
export function getAuthUrl(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Get refresh token
    scope: SCOPES,
    prompt: 'consent' // Force consent screen (ensures we get refresh token)
  });
  
  return authUrl;
}

/**
 * Exchanges the authorization code for access tokens
 * 
 * ASYNC LEARNING: This is an async function because:
 * - It makes a network request to Google (takes time)
 * - We use 'await' to wait for the response
 * - The 'async' keyword lets us use 'await'
 * 
 * @param {OAuth2Client} oauth2Client - The auth client
 * @param {string} code - The code Google sent back after user approval
 */
export async function getTokenFromCode(oauth2Client, code) {
  try {
    // ASYNC: Wait for Google to exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Set the tokens in our client
    oauth2Client.setCredentials(tokens);
    
    // Save tokens to file for future use
    // ASYNC: File writing is slow, so we await it
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    
    console.log('✅ Tokens saved successfully!');
    return oauth2Client;
    
  } catch (error) {
    console.error('❌ Error getting tokens:', error.message);
    throw error;
  }
}

/**
 * Loads saved tokens from file
 * 
 * ASYNC LEARNING: Reading files is slow, so it's async
 * We check if the file exists first to avoid errors
 */
export async function loadSavedTokens(oauth2Client) {
  try {
    // Check if token file exists
    await fs.access(TOKEN_PATH);
    
    // Read and parse the token file
    const tokenData = await fs.readFile(TOKEN_PATH, 'utf-8');
    const tokens = JSON.parse(tokenData);
    
    // Set tokens in our client
    oauth2Client.setCredentials(tokens);
    
    console.log('✅ Loaded saved tokens');
    return true;
    
  } catch (error) {
    // File doesn't exist or can't be read
    console.log('ℹ️  No saved tokens found, need to authenticate');
    return false;
  }
}

/**
 * Gets an authenticated Gmail API client
 * 
 * This is the main function you'll use in other parts of the app.
 * It handles the entire authentication flow:
 * 1. Try to load saved tokens
 * 2. If no tokens, need to authenticate (handled elsewhere)
 * 3. Return ready-to-use Gmail client
 * 
 * LEARNING: Now includes auto-refresh of expired tokens!
 */
export async function getAuthenticatedClient() {
  const oauth2Client = createOAuth2Client();
  
  const hasTokens = await loadSavedTokens(oauth2Client);
  
  if (!hasTokens) {
    throw new Error('Not authenticated. Run authentication flow first.');
  }
  
  // AUTO-REFRESH: When access token expires, automatically get a new one
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      // We got a new refresh token, save it
      console.log('🔄 Refresh token updated');
    }
    // Save the new access token
    try {
      const existingTokens = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf-8'));
      const updatedTokens = { ...existingTokens, ...tokens };
      await fs.writeFile(TOKEN_PATH, JSON.stringify(updatedTokens));
      console.log('✅ Access token refreshed automatically');
    } catch (error) {
      console.error('⚠️  Could not save refreshed token:', error.message);
    }
  });
  
  // Create Gmail API client with authentication
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  return gmail;
}

/**
 * Checks if we're currently authenticated
 */
export async function isAuthenticated() {
  try {
    await fs.access(TOKEN_PATH);
    return true;
  } catch {
    return false;
  }
}
