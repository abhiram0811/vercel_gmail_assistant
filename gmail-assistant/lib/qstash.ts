/**
 * QStash Client for Scheduled Jobs
 * Handles creating/updating/deleting scheduled email processing
 */

import { Client } from "@upstash/qstash";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export type ScheduleFrequency = "3h" | "hourly" | "daily" | "manual";

const CRON_SCHEDULES: Record<ScheduleFrequency, string> = {
  "3h": "0 */3 * * *",      // Every 3 hours
  "hourly": "0 * * * *",     // Every hour
  "daily": "0 9 * * *",      // Daily at 9 AM UTC
  "manual": "",              // No schedule
};

export const FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  "3h": "Every 3 Hours",
  "hourly": "Hourly",
  "daily": "Daily (9 AM UTC)",
  "manual": "Manual Only",
};

/**
 * Creates a QStash schedule for a user
 */
export async function createSchedule(
  userId: string,
  frequency: ScheduleFrequency,
  webhookUrl: string
): Promise<string | null> {
  if (frequency === "manual") return null;

  const schedule = await qstashClient.schedules.create({
    destination: webhookUrl,
    cron: CRON_SCHEDULES[frequency],
    body: JSON.stringify({ userId }),
    headers: {
      "Content-Type": "application/json",
      "x-cron-secret": process.env.CRON_SECRET!,
    },
  });

  return schedule.scheduleId;
}

/**
 * Deletes a QStash schedule
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  await qstashClient.schedules.delete(scheduleId);
}

/**
 * Updates a user's schedule (deletes old, creates new)
 */
export async function updateSchedule(
  userId: string,
  oldScheduleId: string | null,
  newFrequency: ScheduleFrequency,
  webhookUrl: string
): Promise<string | null> {
  // Delete old schedule if exists
  if (oldScheduleId) {
    try {
      await deleteSchedule(oldScheduleId);
    } catch (e) {
      console.log("Old schedule not found or already deleted");
    }
  }
  
  return createSchedule(userId, newFrequency, webhookUrl);
}

export { qstashClient };
