/**
 * Type definitions for Gmail Assistant
 */

export interface EmailMetadata {
  subject: string;
  from: string;
  date: string;
  snippet: string;
  id?: string;
}

export interface EmbeddedEmail {
  id: string;
  values: number[];
  metadata: EmailMetadata;
}

export interface PreparedEmail {
  id: string;
  text: string;
  metadata: EmailMetadata;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: EmailMetadata;
}

export interface GmailMessage {
  id: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  payload?: {
    headers: Array<{
      name: string;
      value: string;
    }>;
  };
}

export interface IndexStats {
  totalRecordCount: number;
  dimension: number;
  namespaces?: Record<string, { recordCount: number }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
