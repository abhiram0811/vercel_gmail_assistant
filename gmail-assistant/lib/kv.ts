/**
 * Upstash Redis Client
 * Handles token storage in Upstash Redis
 */

import { Redis } from '@upstash/redis';
import type { Credentials } from 'google-auth-library';

const TOKEN_KEY_PREFIX = 'gmail_token:';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Stores OAuth tokens in Upstash Redis
 */
export async function storeTokens(userId: string, tokens: Credentials): Promise<void> {
  try {
    const key = `${TOKEN_KEY_PREFIX}${userId}`;
    await redis.set(key, JSON.stringify(tokens));
    console.log('Tokens stored successfully in Upstash');
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw new Error('Failed to store tokens');
  }
}

/**
 * Retrieves OAuth tokens from Upstash Redis
 */
export async function getTokens(userId: string): Promise<Credentials | null> {
  try {
    const key = `${TOKEN_KEY_PREFIX}${userId}`;
    const tokensStr = await redis.get<string>(key);
    
    if (!tokensStr) {
      return null;
    }

    // Handle both string and already-parsed object
    if (typeof tokensStr === 'string') {
      return JSON.parse(tokensStr);
    }
    return tokensStr as unknown as Credentials;
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return null;
  }
}

/**
 * Deletes OAuth tokens from Upstash Redis
 */
export async function deleteTokens(userId: string): Promise<void> {
  try {
    const key = `${TOKEN_KEY_PREFIX}${userId}`;
    await redis.del(key);
    console.log('Tokens deleted successfully from Upstash');
  } catch (error) {
    console.error('Error deleting tokens:', error);
    throw new Error('Failed to delete tokens');
  }
}

/**
 * Checks if user has stored tokens
 */
export async function hasTokens(userId: string): Promise<boolean> {
  try {
    const tokens = await getTokens(userId);
    return tokens !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Updates tokens in Redis (used after refresh)
 */
export async function updateTokens(userId: string, tokens: Credentials): Promise<void> {
  await storeTokens(userId, tokens);
}
