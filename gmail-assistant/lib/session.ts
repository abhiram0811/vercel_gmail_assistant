/**
 * Session Management Utilities
 * Handles user sessions using cookies
 */

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'gmail_assistant_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Creates a simple user ID from email
 */
export function createUserId(email: string): string {
  // Simple hash for user ID (in production, use proper user management)
  return Buffer.from(email).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Sets session cookie
 */
export async function setSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  });
}

/**
 * Gets current session user ID
 */
export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  return sessionCookie?.value || null;
}

/**
 * Clears session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Checks if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
