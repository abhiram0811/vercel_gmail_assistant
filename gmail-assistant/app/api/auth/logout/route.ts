/**
 * Logout Route
 * Clears session and tokens
 */

import { NextResponse } from 'next/server';
import { getSession, clearSession } from '@/lib/session';
import { deleteTokens } from '@/lib/kv';

export async function POST() {
  try {
    const userId = await getSession();

    if (userId) {
      await deleteTokens(userId);
    }

    await clearSession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to logout',
      },
      { status: 500 }
    );
  }
}
