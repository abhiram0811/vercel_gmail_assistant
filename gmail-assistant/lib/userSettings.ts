/**
 * User Settings Storage
 * Stores user preferences for scheduled processing in Upstash Redis
 */

import { Redis } from "@upstash/redis";
import type { ScheduleFrequency } from "./qstash";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SETTINGS_PREFIX = "user_settings:";

export interface UserSettings {
  scheduleFrequency: ScheduleFrequency;
  lastProcessed: string | null;
  qstashScheduleId: string | null;
  isActive: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  scheduleFrequency: "manual",
  lastProcessed: null,
  qstashScheduleId: null,
  isActive: false,
};

/**
 * Gets user settings from Redis
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const key = `${SETTINGS_PREFIX}${userId}`;
  const settings = await redis.get<UserSettings>(key);
  return settings || DEFAULT_SETTINGS;
}

/**
 * Updates user settings in Redis
 */
export async function updateUserSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  const key = `${SETTINGS_PREFIX}${userId}`;
  const current = await getUserSettings(userId);
  const updated = { ...current, ...updates };
  await redis.set(key, updated);
  return updated;
}

/**
 * Sets the lastProcessed timestamp to now
 */
export async function setLastProcessed(userId: string): Promise<void> {
  await updateUserSettings(userId, {
    lastProcessed: new Date().toISOString(),
  });
}

/**
 * Checks if user has an active schedule
 */
export async function isScheduleActive(userId: string): Promise<boolean> {
  const settings = await getUserSettings(userId);
  return settings.isActive && settings.scheduleFrequency !== "manual";
}
