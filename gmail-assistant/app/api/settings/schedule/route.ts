/**
 * Schedule Settings API
 * Manages user schedule frequency and QStash schedules
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserSettings, updateUserSettings } from '@/lib/userSettings';
import { updateSchedule, FREQUENCY_LABELS, type ScheduleFrequency } from '@/lib/qstash';

export async function GET() {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const settings = await getUserSettings(userId);

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        frequencyLabel: FREQUENCY_LABELS[settings.scheduleFrequency],
      },
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { frequency, isActive } = body as {
      frequency?: ScheduleFrequency;
      isActive?: boolean;
    };

    // Get current settings
    const currentSettings = await getUserSettings(userId);
    
    // Determine new values
    const newFrequency = frequency ?? currentSettings.scheduleFrequency;
    const newIsActive = isActive ?? currentSettings.isActive;

    // Build webhook URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gmail-assistant.vercel.app';
    const webhookUrl = `${appUrl}/api/cron/process-emails`;

    // Update QStash schedule if frequency or active state changed
    let newScheduleId = currentSettings.qstashScheduleId;

    if (
      newFrequency !== currentSettings.scheduleFrequency ||
      newIsActive !== currentSettings.isActive
    ) {
      if (newIsActive && newFrequency !== 'manual') {
        // Create or update schedule
        newScheduleId = await updateSchedule(
          userId,
          currentSettings.qstashScheduleId,
          newFrequency,
          webhookUrl
        );
        console.log(`Schedule created/updated: ${newScheduleId}`);
      } else {
        // Delete existing schedule
        if (currentSettings.qstashScheduleId) {
          try {
            await updateSchedule(userId, currentSettings.qstashScheduleId, 'manual', webhookUrl);
          } catch (e) {
            console.log('Error deleting schedule:', e);
          }
        }
        newScheduleId = null;
      }
    }

    // Save updated settings
    const updatedSettings = await updateUserSettings(userId, {
      scheduleFrequency: newFrequency,
      isActive: newIsActive,
      qstashScheduleId: newScheduleId,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedSettings,
        frequencyLabel: FREQUENCY_LABELS[updatedSettings.scheduleFrequency],
      },
      message: newIsActive
        ? `Schedule set to ${FREQUENCY_LABELS[newFrequency]}`
        : 'Schedule disabled',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
