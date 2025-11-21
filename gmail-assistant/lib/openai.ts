/**
 * OpenAI Embeddings Client
 * Creates embeddings for email content
 */

import OpenAI from 'openai';
import type { GmailMessage, PreparedEmail, EmbeddedEmail } from './types';

let openaiClient: OpenAI | null = null;

/**
 * Gets or creates OpenAI client instance
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

/**
 * Creates a text embedding using OpenAI
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const openai = getOpenAIClient();
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw new Error('Failed to create embedding');
  }
}

/**
 * Prepares email for embedding by extracting relevant fields
 */
export function prepareEmailForEmbedding(emailData: GmailMessage): PreparedEmail {
  const headers = emailData.payload?.headers || [];
  
  const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
  const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
  const date = headers.find((h) => h.name === 'Date')?.value || new Date().toISOString();
  const snippet = emailData.snippet || '';

  // Combine fields into a single text for embedding
  const textToEmbed = `
From: ${from}
Subject: ${subject}
Content: ${snippet}
  `.trim();

  return {
    id: emailData.id,
    text: textToEmbed,
    metadata: {
      subject,
      from,
      date,
      snippet: snippet.substring(0, 200),
      id: emailData.id,
    },
  };
}

/**
 * Creates embeddings for multiple emails
 */
export async function embedEmails(
  emails: GmailMessage[],
  onProgress?: (current: number, total: number, subject: string) => void
): Promise<EmbeddedEmail[]> {
  const embeddedEmails: EmbeddedEmail[] = [];

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const prepared = prepareEmailForEmbedding(email);

    if (onProgress) {
      onProgress(i + 1, emails.length, prepared.metadata.subject);
    }

    try {
      // Create embedding
      const embedding = await createEmbedding(prepared.text);

      embeddedEmails.push({
        id: prepared.id,
        values: embedding,
        metadata: prepared.metadata,
      });

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error embedding email ${prepared.id}:`, error);
      // Continue with other emails even if one fails
    }
  }

  return embeddedEmails;
}

/**
 * Batch process emails for embedding with retry logic
 */
export async function batchEmbedEmails(
  emails: GmailMessage[],
  batchSize: number = 10,
  onProgress?: (current: number, total: number) => void
): Promise<EmbeddedEmail[]> {
  const allEmbedded: EmbeddedEmail[] = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const embedded = await embedEmails(batch);
    allEmbedded.push(...embedded);

    if (onProgress) {
      onProgress(Math.min(i + batchSize, emails.length), emails.length);
    }
  }

  return allEmbedded;
}
