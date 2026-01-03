/**
 * Dashboard Page
 * Main interface for job application tracking
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScheduleFrequency, UserSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';

const FREQUENCY_OPTIONS: { value: ScheduleFrequency; label: string; description: string }[] = [
  { value: 'manual', label: 'Manual', description: 'Only when you click' },
  { value: 'daily', label: 'Daily', description: '9 AM UTC' },
  { value: '3h', label: 'Every 3h', description: '8 times per day' },
  { value: 'hourly', label: 'Hourly', description: '24 times per day' },
];

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scheduleSettings, setScheduleSettings] = useState<UserSettings | null>(null);
  const [updatingSchedule, setUpdatingSchedule] = useState(false);

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();

      if (!data.success || !data.data.authenticated) {
        router.push('/');
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/schedule');
      const data = await response.json();
      if (data.success) {
        setScheduleSettings(data.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleScheduleChange = async (frequency: ScheduleFrequency, isActive: boolean) => {
    setUpdatingSchedule(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/settings/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency, isActive }),
      });

      const data = await response.json();

      if (data.success) {
        setScheduleSettings(data.data);
        setSuccess(data.message);
      } else {
        setError(data.error || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Schedule update error:', error);
      setError('Failed to update schedule');
    } finally {
      setUpdatingSchedule(false);
    }
  };

  const handleJobTrack = async () => {
    setTracking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/jobs/track');
      const data = await response.json();

      if (data.success) {
        setSuccess(
          `Job tracking complete! Processed: ${data.processed} emails | New jobs: ${data.newJobs} | Updated: ${data.updatedJobs} | Skipped: ${data.skipped}`
        );
      } else {
        setError(data.error || 'Job tracking failed');
      }
    } catch (error) {
      console.error('Job tracking error:', error);
      setError('Failed to track jobs');
    } finally {
      setTracking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-border shadow-sm transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient">
                Gmail Assistant
              </h1>
              <p className="text-sm text-muted-foreground mt-1">AI-powered job application tracker</p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Job Tracking Actions */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-3xl bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Job Applications
            </CardTitle>
            <CardDescription className="text-base mt-2">Track and manage your job search effortlessly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleJobTrack}
                disabled={tracking}
                size="lg"
                className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
              >
                {tracking ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Tracking...
                  </span>
                ) : (
                  'Track Job Applications'
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
              >
                <a
                  href={`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  View Google Sheet
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Settings */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Automated Processing
                  {scheduleSettings?.isActive && scheduleSettings.scheduleFrequency !== 'manual' && (
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Schedule automatic email processing and job tracking
                </CardDescription>
              </div>
              {scheduleSettings?.lastProcessed && (
                <div className="text-right text-sm text-muted-foreground">
                  <div>Last processed:</div>
                  <div className="font-medium">
                    {new Date(scheduleSettings.lastProcessed).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {FREQUENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleScheduleChange(option.value, option.value !== 'manual')}
                  disabled={updatingSchedule}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    scheduleSettings?.scheduleFrequency === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                </button>
              ))}
            </div>
            {scheduleSettings?.scheduleFrequency !== 'manual' && scheduleSettings?.isActive && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <span className="animate-pulse">●</span>
                <span>Emails will be processed automatically</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert className="border-2 border-destructive/50 bg-destructive/10 backdrop-blur-sm shadow-lg animate-scale-in">
            <AlertDescription className="flex items-center gap-3 text-base">
              <span className="text-destructive font-medium">{error}</span>
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-2 border-green-500/50 bg-green-50 dark:bg-green-950/30 backdrop-blur-sm shadow-lg animate-scale-in">
            <AlertDescription className="text-green-700 dark:text-green-400 font-medium text-base">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
