/**
 * Landing Page
 * Entry point of the application
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/theme-provider';
import { Switch } from '@/components/ui/switch';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Check for error in URL
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
      setLoading(false);
      return;
    }

    // Check auth status
    checkAuthStatus();
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();

      if (data.success && data.data.authenticated) {
        // Redirect to dashboard if already authenticated
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-muted-foreground animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-500">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3 animate-fade-in-up">
        <span className="text-sm text-muted-foreground">☀️</span>
        <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
        <span className="text-sm text-muted-foreground">🌙</span>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-4xl w-full animate-fade-in-up">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-6 text-sm px-6 py-2 animate-scale-in bg-linear-to-r from-blue-500 to-indigo-500 text-white border-0">
              ✨ AI-Powered Email Management
            </Badge>
            <h1 className="text-7xl font-bold mb-6 animate-gradient bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Gmail Assistant
            </h1>
            <p className="text-2xl text-foreground/80 mb-3 max-w-2xl mx-auto font-medium">
              Track job applications automatically with AI
            </p>
            <p className="text-muted-foreground text-lg">
              Never miss a job opportunity. Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">Google Gemini</span>.
            </p>
          </div>

          {error && (
            <Card className="mb-8 p-6 bg-destructive/10 border-destructive/30 backdrop-blur-sm animate-scale-in">
              <p className="font-semibold text-destructive flex items-center gap-2">
                <span className="text-xl">⚠️</span> Error
              </p>
              <p className="text-sm text-destructive/90 mt-2">{error}</p>
            </Card>
          )}

          <Card className="p-10 shadow-2xl border-0 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 hover:shadow-blue-500/20 transition-all duration-500 animate-scale-in">
            <div className="space-y-10">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="group flex items-start space-x-4 p-6 rounded-xl bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200/50 dark:border-blue-800/50 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">📧</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">Smart Job Tracking</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">AI automatically detects and organizes job applications from your inbox</p>
                  </div>
                </div>
                <div className="group flex items-start space-x-4 p-6 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/50 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🤖</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">Google Gemini AI</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Powered by advanced AI to understand application emails</p>
                  </div>
                </div>
                <div className="group flex items-start space-x-4 p-6 rounded-xl bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border border-green-200/50 dark:border-green-800/50 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">📊</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">Google Sheets Export</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">All applications synced to a spreadsheet for easy tracking</p>
                  </div>
                </div>
                <div className="group flex items-start space-x-4 p-6 rounded-xl bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border border-purple-200/50 dark:border-purple-800/50 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🔒</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">OAuth2 authentication with read-only Gmail access</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-6 space-y-4">
                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  size="lg"
                  className="w-full text-lg font-bold py-7 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Connecting...
                    </span>
                  ) : (
                    '🚀 Sign in with Google'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                  <span className="text-green-500">✓</span> We only request read-only access to your Gmail
                </p>
              </div>
            </div>
          </Card>

          <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
              <span>Built with</span>
              <Badge variant="outline" className="font-mono">Next.js</Badge>
              <Badge variant="outline" className="font-mono">Google Gemini</Badge>
              <Badge variant="outline" className="font-mono">Google Sheets</Badge>
              <Badge variant="outline" className="font-mono">Vercel</Badge>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
