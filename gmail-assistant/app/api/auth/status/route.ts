/**
 * Auth Status Route
 * Checks if user is authenticated
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasTokens } from '@/lib/kv';

export async function GET() {
  try {
    const userId = await getSession();

    if (!userId) {
      return NextResponse.json({
        success: true,
        data: { authenticated: false },
      });
    }

    const tokensExist = await hasTokens(userId);

    return NextResponse.json({
      success: true,
      data: { authenticated: tokensExist },
    });
  } catch (error: any) {
    console.error('Error checking auth status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check authentication status',
      },
      { status: 500 }
    );
  }
}
