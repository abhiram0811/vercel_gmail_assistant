/**
 * Vercel KV Client
 * Handles token storage in Redis
 */

import { kv } from '@vercel/kv';
import type { Credentials } from 'google-auth-library';
import { createClient } from 'redis';

const TOKEN_KEY_PREFIX = 'gmail_token:';

// Use Redis client if REDIS_URL is available, otherwise use Vercel KV
let redisClient: any = null;

async function getRedisClient() {
  if (process.env.REDIS_URL) {
    if (!redisClient) {
      redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
    }
    return redisClient;
  }
  return null;
}

/**
 * Stores OAuth tokens in Vercel KV or Redis
 */
export async function storeTokens(userId: string, tokens: Credentials): Promise<void> {
  try {
    const key = `${TOKEN_KEY_PREFIX}${userId}`;
    const value = JSON.stringify(tokens);
    
    // Try Redis client first if REDIS_URL is available
    const client = await getRedisClient();
    if (client) {
      await client.set(key, value);
      console.log('Tokens stored successfully in Redis');
      return;
    }
    
    // Fallback to Vercel KV
    await kv.set(key, value);
    console.log('Tokens stored successfully in KV');
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw new Error('Failed to store tokens');
  }
}

/**
 * Retrieves OAuth tokens from Vercel KV or Redis
 */
export async function getTokens(userId: string): Promise<Credentials | null> {
  try {
    const key = `${TOKEN_KEY_PREFIX}${userId}`;
    
    // Try Redis client first if REDIS_URL is available
    const client = await getRedisClient();
    if (client) {
      const tokensStr = await client.get(key);
      if (!tokensStr) {
        return null;
      }
      return JSON.parse(tokensStr);
    }
    
    // Fallback to Vercel KV
    const tokensStr = await kv.get<string>(key);
    
    if (!tokensStr) {
      return null;
    }

    return JSON.parse(tokensStr);
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return null;
  }
}

/**
 * Deletes OAuth tokens from Vercel KV or Redis
 */
export async function deleteTokens(userId: string): Promise<void> {
  try {
    const key = `${TOKEN_KEY_PREFIX}${userId}`;
    
    // Try Redis client first if REDIS_URL is available
    const client = await getRedisClient();
    if (client) {
      await client.del(key);
      console.log('Tokens deleted successfully from Redis');
      return;
    }
    
    // Fallback to Vercel KV
    await kv.del(key);
    console.log('Tokens deleted successfully from KV');
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
 * Updates tokens in KV (used after refresh)
 */
export async function updateTokens(userId: string, tokens: Credentials): Promise<void> {
  await storeTokens(userId, tokens);
}
