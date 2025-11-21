/**
 * Pinecone Vector Database Client
 * Handles vector storage and similarity search
 */

import { Pinecone } from '@pinecone-database/pinecone';
import type { EmbeddedEmail, SearchResult, IndexStats } from './types';
import { createEmbedding } from './openai';

const INDEX_NAME = 'gmail-emails';

let pineconeClient: Pinecone | null = null;
let index: any = null;

/**
 * Initialize Pinecone connection
 */
export async function initializePinecone() {
  if (pineconeClient && index) {
    return { client: pineconeClient, index };
  }

  if (!process.env.PINECONE_API_KEY) {
    throw new Error('Missing PINECONE_API_KEY environment variable');
  }

  try {
    console.log('Connecting to Pinecone...');

    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    // Check if index exists
    const indexList = await pineconeClient.listIndexes();
    const indexExists = indexList.indexes?.some((idx) => idx.name === INDEX_NAME);

    if (!indexExists) {
      console.log(`Creating new index: ${INDEX_NAME}...`);

      await pineconeClient.createIndex({
        name: INDEX_NAME,
        dimension: 1536, // OpenAI text-embedding-3-small dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });

      console.log('Waiting for index to be ready...');
      // Wait for index to be ready (serverless indexes are usually ready quickly)
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    index = pineconeClient.index(INDEX_NAME);
    console.log('Pinecone connected!');

    return { client: pineconeClient, index };
  } catch (error) {
    console.error('Error initializing Pinecone:', error);
    throw new Error('Failed to initialize Pinecone');
  }
}

/**
 * Upsert (insert or update) emails into Pinecone
 */
export async function upsertEmails(
  embeddedEmails: EmbeddedEmail[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  try {
    const { index } = await initializePinecone();

    console.log(`Uploading ${embeddedEmails.length} emails to Pinecone...`);

    const batchSize = 100;
    for (let i = 0; i < embeddedEmails.length; i += batchSize) {
      const batch = embeddedEmails.slice(i, i + batchSize);
      
      await index.upsert(batch);
      
      const uploaded = Math.min(i + batchSize, embeddedEmails.length);
      console.log(`Uploaded ${uploaded}/${embeddedEmails.length} emails`);
      
      if (onProgress) {
        onProgress(uploaded, embeddedEmails.length);
      }
    }

    console.log('All emails uploaded!');
  } catch (error) {
    console.error('Error upserting emails:', error);
    throw new Error('Failed to upload emails to Pinecone');
  }
}

/**
 * Search for similar emails using semantic search
 */
export async function searchEmails(
  queryText: string,
  topK: number = 5
): Promise<SearchResult[]> {
  try {
    const { index } = await initializePinecone();

    console.log(`Searching for: "${queryText}"`);

    // Create embedding for the query
    const queryEmbedding = await createEmbedding(queryText);

    // Query Pinecone
    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    // Transform results
    const matches: SearchResult[] = results.matches.map((match: any) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    }));

    return matches;
  } catch (error) {
    console.error('Error searching emails:', error);
    throw new Error('Failed to search emails');
  }
}

/**
 * Get index statistics
 */
export async function getIndexStats(): Promise<IndexStats> {
  try {
    const { index } = await initializePinecone();
    
    const stats = await index.describeIndexStats();
    
    return {
      totalRecordCount: stats.totalRecordCount || 0,
      dimension: stats.dimension || 1536,
      namespaces: stats.namespaces,
    };
  } catch (error) {
    console.error('Error getting index stats:', error);
    throw new Error('Failed to get index statistics');
  }
}

/**
 * Delete emails from index by IDs
 */
export async function deleteEmails(emailIds: string[]): Promise<void> {
  try {
    const { index } = await initializePinecone();
    
    await index.deleteMany(emailIds);
    
    console.log(`Deleted ${emailIds.length} emails from index`);
  } catch (error) {
    console.error('Error deleting emails:', error);
    throw new Error('Failed to delete emails from index');
  }
}

/**
 * Clear all emails from the index
 */
export async function clearIndex(): Promise<void> {
  try {
    const { index } = await initializePinecone();
    
    await index.deleteAll();
    
    console.log('Index cleared successfully');
  } catch (error) {
    console.error('Error clearing index:', error);
    throw new Error('Failed to clear index');
  }
}
