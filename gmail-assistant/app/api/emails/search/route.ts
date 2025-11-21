/**
 * Email Search Route
 * Performs semantic search on indexed emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { searchEmails } from '@/lib/pinecone';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { query, topK = 5 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Search emails
    console.log(`Searching for: "${query}"`);
    const results = await searchEmails(query, topK);

    return NextResponse.json({
      success: true,
      data: {
        query,
        results,
        count: results.length,
      },
    });
  } catch (error: any) {
    console.error('Error searching emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search emails',
      },
      { status: 500 }
    );
  }
}
