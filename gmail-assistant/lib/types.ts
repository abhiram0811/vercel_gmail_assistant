/**
 * Type definitions for Gmail Assistant
 */

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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Job application tracking
 */
export interface JobApplication {
  jobTitle: string;
  companyName: string;
  dateApplied?: string;
  emailId: string;
  status: ApplicationStatus;
  lastUpdated: string;
  notes?: string;

  sheetRowId?: number;
}

export type ApplicationStatus = 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'assessment'
  | 'moving-forward';

/**
 * Schedule frequency for automated processing
 */
export type ScheduleFrequency = "3h" | "hourly" | "daily" | "manual";

/**
 * User settings for scheduled processing
 */
export interface UserSettings {
  scheduleFrequency: ScheduleFrequency;
  lastProcessed: string | null;
  qstashScheduleId: string | null;
  isActive: boolean;
}
