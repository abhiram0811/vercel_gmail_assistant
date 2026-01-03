/**
 * Dashboard Page
 * Main interface for job application tracking - Redesigned with futuristic glass-morphism UI
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScheduleFrequency, UserSettings } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sparkles,
  LogOut,
  Scan,
  Bot,
  CheckCircle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const FREQUENCY_OPTIONS: { value: ScheduleFrequency; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'daily', label: 'Daily' },
  { value: '3h', label: 'Every 3h' },
  { value: 'hourly', label: 'Hourly' },
];

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scheduleSettings, setScheduleSettings] = useState<UserSettings | null>(null);
  const [updatingSchedule, setUpdatingSchedule] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('Never');
  const [trackingStats, setTrackingStats] = useState({ total: 0, newToday: 0, thisWeek: 0 });

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
        if (data.data.lastProcessed) {
          const lastProcessedDate = new Date(data.data.lastProcessed);
          const now = new Date();
          const diffMs = now.getTime() - lastProcessedDate.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          if (diffMins < 1) {
            setLastSynced('Just now');
          } else if (diffMins < 60) {
            setLastSynced(`${diffMins}m ago`);
          } else {
            const diffHours = Math.floor(diffMins / 60);
            setLastSynced(`${diffHours}h ago`);
          }
        }
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
        setTimeout(() => setSuccess(null), 5000);
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
        setSuccess(`Sync Complete! New: ${data.newJobs} | Updated: ${data.updatedJobs} | Processed: ${data.processed}`);
        setLastSynced('Just now');
        setTrackingStats(prev => ({
          ...prev,
          total: prev.total + data.newJobs,
          newToday: prev.newToday + data.newJobs,
          thisWeek: prev.thisWeek + data.newJobs
        }));
        setTimeout(() => setSuccess(null), 5000);
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

  const getNextRunTime = () => {
    if (!scheduleSettings?.isActive || scheduleSettings.scheduleFrequency === 'manual') {
      return '--:--';
    }
    const now = new Date();
    let nextRun = new Date(now);

    switch (scheduleSettings.scheduleFrequency) {
      case 'hourly':
        nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0);
        break;
      case '3h':
        const hours3 = Math.ceil(now.getHours() / 3) * 3;
        nextRun.setHours(hours3, 0, 0, 0);
        if (nextRun <= now) nextRun.setHours(nextRun.getHours() + 3);
        break;
      case 'daily':
        nextRun.setHours(9, 0, 0, 0);
        if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);
        break;
    }

    return nextRun.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getLastProcessedTime = () => {
    if (!scheduleSettings?.lastProcessed) return '--:--';
    return new Date(scheduleSettings.lastProcessed).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f7] dark:bg-[#161c1c]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#38686A] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-500 dark:text-slate-400 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#f6f7f7] dark:bg-gradient-app overflow-hidden text-slate-800 dark:text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#161c1c]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-xl bg-gradient-to-br from-[#38686A] to-[#2e5658] text-white shadow-lg shadow-[#38686A]/20">
            <Sparkles className="size-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">JobTracker AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            <span>Logout</span>
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Decorative blurred orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#38686A]/5 dark:bg-[#38686A]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#2e5658]/5 dark:bg-[#2e5658]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="layout-content-container max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Job Tracking Card */}
            <div className="glass-panel-light dark:glass-panel rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-[#38686A]/30 transition-colors duration-500 shadow-2xl shadow-black/5 dark:shadow-black/20 bg-white dark:bg-transparent">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#38686A]/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="flex items-center justify-between relative z-10">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                  Job Applications
                </h2>
                <div className="bg-[#38686A]/10 dark:bg-[#38686A]/20 border border-[#38686A]/20 dark:border-[#38686A]/30 text-[#38686A] dark:text-[#4a8587] px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm shadow-[#38686A]/10">
                  {trackingStats.total || '--'} TRACKED
                </div>
              </div>

              {/* Main Stats Display */}
              <div className="py-4 relative z-10">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {trackingStats.thisWeek || '--'}
                  </span>
                  {trackingStats.newToday > 0 && (
                    <span className="text-lg text-emerald-600 dark:text-emerald-400 font-medium mb-1.5">
                      +{trackingStats.newToday} today
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Applications detected this week</p>
              </div>

              <div className="flex flex-col gap-4 relative z-10 mt-auto">
                <button
                  onClick={handleJobTrack}
                  disabled={tracking}
                  className="relative w-full h-14 bg-[#38686A] hover:bg-[#2e5658] text-white text-base font-semibold rounded-xl transition-all shadow-lg shadow-[#38686A]/20 hover:shadow-[#38686A]/40 active:scale-[0.99] flex items-center justify-center gap-2 group/btn overflow-hidden shimmer-btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tracking ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Tracking...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="size-5" />
                      <span>Track Now</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 dark:text-slate-400 hover:text-[#38686A] dark:hover:text-[#4a8587] transition-colors text-sm font-medium flex items-center gap-1 group/link"
                  >
                    <span>Open Google Sheet</span>
                    <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
                  </a>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    Synced: {lastSynced}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Automation Card */}
            <div className="glass-panel-light dark:glass-panel rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-[#38686A]/30 transition-colors duration-500 shadow-2xl shadow-black/5 dark:shadow-black/20 bg-white dark:bg-transparent">
              <div className="flex items-center justify-between relative z-10">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="size-5 text-[#38686A]" />
                  Automated Processing
                </h2>
                {/* Live Indicator */}
                {scheduleSettings?.isActive && scheduleSettings.scheduleFrequency !== 'manual' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1c2424] border border-slate-200 dark:border-white/5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Active</span>
                  </div>
                )}
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-center py-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 block">
                  Sync Frequency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleScheduleChange(option.value, option.value !== 'manual')}
                      disabled={updatingSchedule}
                      className={`group relative flex items-center justify-center py-2.5 px-2 rounded-lg transition-all disabled:opacity-50 ${
                        scheduleSettings?.scheduleFrequency === option.value
                          ? 'bg-[#38686A] border border-[#38686A] text-white shadow-lg shadow-[#38686A]/20'
                          : 'border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                      }`}
                    >
                      <span className={`text-xs font-medium ${
                        scheduleSettings?.scheduleFrequency === option.value ? 'font-bold' : ''
                      }`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-2 relative z-10 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Next run</span>
                    <span className="text-sm font-mono text-slate-700 dark:text-white">{getNextRunTime()}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Last processed</span>
                    <span className="text-sm font-mono text-slate-700 dark:text-white">{getLastProcessedTime()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="w-full bg-slate-50 dark:bg-[#111616] border-t border-slate-200 dark:border-white/5 py-2 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <div className="text-slate-400 dark:text-slate-500 font-medium tracking-wide">SYSTEM STATUS</div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
              <CheckCircle className="size-[14px]" />
              <span className="font-medium">Gmail Connected</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
              <CheckCircle className="size-[14px]" />
              <span className="font-medium">Sheets Linked</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {success && (
        <div className="absolute top-24 right-8 animate-slide-in z-50">
          <div className="glass-panel-light dark:glass-panel bg-white dark:bg-[#161c1c]/90 border-l-4 border-l-emerald-500 px-4 py-3 rounded-r-lg shadow-xl flex items-center gap-3 min-w-[280px]">
            <CheckCircle2 className="size-5 text-emerald-500" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Success</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-24 right-8 animate-slide-in z-50">
          <div className="glass-panel-light dark:glass-panel bg-white dark:bg-[#161c1c]/90 border-l-4 border-l-red-500 px-4 py-3 rounded-r-lg shadow-xl flex items-center gap-3 min-w-[280px]">
            <div className="size-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">!</div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Error</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
