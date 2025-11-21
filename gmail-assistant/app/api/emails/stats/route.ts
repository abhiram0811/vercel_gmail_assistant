/**
 * Index Statistics Route
 * Returns statistics about the Pinecone index
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getIndexStats } from '@/lib/pinecone';

export async function GET() {
  try {
    // Check authentication
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get index stats
    const stats = await getIndexStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error getting index stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get index statistics',
      },
      { status: 500 }
    );
  }
}
