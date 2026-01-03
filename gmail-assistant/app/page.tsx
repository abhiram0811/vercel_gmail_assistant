/**
 * Landing Page
 * Entry point of the application - Redesigned with futuristic glass-morphism UI
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { ThemeToggleWithLabel } from '@/components/theme-toggle';
import {
  Sparkles,
  Rocket,
  MailCheck,
  Table,
  TrendingUp,
  Clock,
  Brain
} from 'lucide-react';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
      setLoading(false);
      return;
    }
    checkAuthStatus();
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      if (data.success && data.data.authenticated) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login');
      const data = await response.json();
      if (data.success && data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        setError('Failed to initiate login');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to initiate login');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f7] dark:bg-[#161c1c]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#38686A] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-500 dark:text-slate-400 animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#f6f7f7] dark:bg-[#161c1c] text-slate-900 dark:text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav-light dark:glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38686A] to-[#2e5658] flex items-center justify-center text-white shadow-lg shadow-[#38686A]/20">
              <Sparkles className="size-5" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">JobTracker AI</h2>
          </div>
          {/* Theme Toggle */}
          <ThemeToggleWithLabel />
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <main className="flex-grow pt-20 relative">
        {/* Decorative Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-orb-light dark:bg-gradient-orb rounded-full pointer-events-none -z-10 opacity-60 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(56,104,106,0.1)_0%,rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(circle,rgba(56,104,106,0.15)_0%,rgba(0,0,0,0)_70%)] rounded-full pointer-events-none -z-10 blur-3xl"></div>

        {/* Hero Section */}
        <section className="relative px-6 pt-20 pb-24 md:pt-32 md:pb-32 flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38686A]/10 border border-[#38686A]/20 text-[#4a8587] dark:text-[#4a8587] text-xs font-semibold tracking-wide uppercase mb-8 backdrop-blur-sm">
            <Rocket className="size-4" />
            <span>v2.0 Now Available</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
            Track Your Job Applications. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a8587] via-[#38686A] to-[#2e5658] dark:from-[#4a8587] dark:via-white dark:to-[#4a8587] animate-gradient">
              Automatically.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed font-light">
            Turn your Gmail inbox into a structured career pipeline using AI. No spreadsheets, no manual entry, just focus on the interview.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-8 px-6 py-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 max-w-md animate-scale-in">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="group relative flex items-center justify-center gap-3 bg-[#38686A] hover:bg-[#4a8587] text-white font-semibold text-base px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#38686A]/30 hover:shadow-xl hover:-translate-y-0.5 min-w-[200px] shimmer-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <>
                  {/* Google G Icon */}
                  <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.5 12.2C23.5 11.4 23.4 10.6 23.3 9.8H12V14.4H18.5C18.2 16 17.3 17.4 16 18.3V21.5H19.9C22.2 19.4 23.5 16.2 23.5 12.2Z" fill="#4285F4"/>
                    <path d="M12 24C15.2 24 17.9 22.9 19.9 21.1L16 17.9C15 18.6 13.6 19.1 12 19.1C8.9 19.1 6.3 17 5.4 14.1H1.4V17.2C3.4 21.2 7.5 24 12 24Z" fill="#34A853"/>
                    <path d="M5.4 14.1C5.2 13.4 5.1 12.7 5.1 12C5.1 11.3 5.2 10.6 5.4 9.9V6.8H1.4C0.5 8.4 0 10.1 0 12C0 13.9 0.5 15.6 1.4 17.2L5.4 14.1Z" fill="#FBBC05"/>
                    <path d="M12 4.9C13.8 4.9 15.3 5.5 16.6 6.7L20 3.2C17.9 1.3 15.2 0 12 0C7.5 0 3.4 2.8 1.4 6.8L5.4 9.9C6.3 7 8.9 4.9 12 4.9Z" fill="#EA4335"/>
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"></span>
            </button>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-b from-[#38686A]/30 to-transparent rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-100 dark:bg-[#0f1313]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#f6f7f7] dark:from-[#161c1c] via-transparent to-transparent z-10 h-full w-full pointer-events-none"></div>
              {/* Abstract Grid Mockup */}
              <div className="w-full h-[300px] md:h-[400px] bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8 opacity-40 dark:opacity-40 transform scale-95 origin-top">
                  <div className="col-span-1 h-32 rounded-lg bg-[#38686A]/20 border border-[#38686A]/30"></div>
                  <div className="col-span-2 h-32 rounded-lg bg-slate-300 dark:bg-white/5 border border-slate-400 dark:border-white/10"></div>
                  <div className="col-span-2 h-32 rounded-lg bg-slate-300 dark:bg-white/5 border border-slate-400 dark:border-white/10"></div>
                  <div className="col-span-1 h-32 rounded-lg bg-slate-300 dark:bg-white/5 border border-slate-400 dark:border-white/10"></div>
                  <div className="col-span-1 h-32 rounded-lg bg-slate-300 dark:bg-white/5 border border-slate-400 dark:border-white/10"></div>
                  <div className="col-span-1 h-32 rounded-lg bg-slate-300 dark:bg-white/5 border border-slate-400 dark:border-white/10"></div>
                  <div className="col-span-1 h-32 rounded-lg bg-[#38686A]/20 border border-[#38686A]/30"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-200 dark:from-[#161c1c] to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative px-6 py-20 max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-16 text-center sm:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Seamless Automation</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
              Our AI works quietly in the background so you can focus on preparing for your next interview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="glass-card-light dark:glass-card p-6 rounded-2xl flex flex-col gap-4 group hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#38686A]/5 hover:border-[#38686A]/30 bg-white/60 dark:bg-transparent border border-slate-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-xl bg-[#38686A]/20 flex items-center justify-center text-[#4a8587] group-hover:bg-[#38686A] group-hover:text-white transition-colors duration-300">
                <MailCheck className="size-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">AI Email Detection</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Instantly identifies application confirmations and rejections from your inbox.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card-light dark:glass-card p-6 rounded-2xl flex flex-col gap-4 group hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#38686A]/5 hover:border-[#38686A]/30 bg-white/60 dark:bg-transparent border border-slate-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-xl bg-[#38686A]/20 flex items-center justify-center text-[#4a8587] group-hover:bg-[#38686A] group-hover:text-white transition-colors duration-300">
                <Table className="size-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Auto Sheets Sync</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Populates your Google Sheets tracker without you lifting a single finger.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card-light dark:glass-card p-6 rounded-2xl flex flex-col gap-4 group hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#38686A]/5 hover:border-[#38686A]/30 bg-white/60 dark:bg-transparent border border-slate-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-xl bg-[#38686A]/20 flex items-center justify-center text-[#4a8587] group-hover:bg-[#38686A] group-hover:text-white transition-colors duration-300">
                <TrendingUp className="size-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Smart Status Tracking</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Know exactly when you&apos;ve moved to the interview stage or been archived.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="glass-card-light dark:glass-card p-6 rounded-2xl flex flex-col gap-4 group hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#38686A]/5 hover:border-[#38686A]/30 bg-white/60 dark:bg-transparent border border-slate-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-xl bg-[#38686A]/20 flex items-center justify-center text-[#4a8587] group-hover:bg-[#38686A] group-hover:text-white transition-colors duration-300">
                <Clock className="size-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Scheduled Processing</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Runs silently in the background every hour to keep your data fresh.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24 flex justify-center">
          <div className="max-w-4xl w-full text-center space-y-8 p-12 rounded-3xl relative overflow-hidden bg-gradient-to-br from-[#38686A]/10 to-transparent border border-[#38686A]/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#38686A] to-transparent opacity-50"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Ready to automate your job search?</h2>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-[#38686A] hover:bg-[#4a8587] text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-[#38686A]/30 transition-all hover:scale-105 disabled:opacity-50"
            >
              Get Started Free
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-10 text-center relative z-10 bg-[#f6f7f7] dark:bg-[#161c1c]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            JobTracker AI © {new Date().getFullYear()}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-200 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-300 dark:border-white/5">
            <Brain className="size-4 text-[#38686A]" />
            <span>Powered by Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f7] dark:bg-[#161c1c]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38686A] mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
