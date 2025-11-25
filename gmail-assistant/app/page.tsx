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

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl w-full py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
            AI-Powered Email Management
          </Badge>
          <h1 className="text-6xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Gmail Assistant
          </h1>
          <p className="text-xl text-muted-foreground mb-2 max-w-2xl mx-auto">
            Track job applications automatically with AI
          </p>
          <p className="text-muted-foreground">
            Never miss a job opportunity. Powered by Google Gemini.
          </p>
        </div>

        {error && (
          <Card className="mb-6 p-4 bg-destructive/10 border-destructive/20">
            <p className="font-semibold text-destructive">Error</p>
            <p className="text-sm text-destructive/80">{error}</p>
          </Card>
        )}

        <Card className="p-8 shadow-xl border-0">
          <div className="space-y-8">
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-blue-50/50">
                <span className="text-2xl">📧</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Smart Job Tracking</h3>
                  <p className="text-sm text-muted-foreground">AI automatically detects and organizes job applications from your inbox</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-indigo-50/50">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Google Gemini AI</h3>
                  <p className="text-sm text-muted-foreground">Powered by advanced AI to understand application emails</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-green-50/50">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Google Sheets Export</h3>
                  <p className="text-sm text-muted-foreground">All applications synced to a spreadsheet for easy tracking</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-purple-50/50">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">OAuth2 authentication with read-only Gmail access</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 space-y-3">
              <Button
                onClick={handleLogin}
                disabled={loading}
                size="lg"
                className="w-full text-base font-semibold"
              >
                {loading ? 'Connecting...' : '🚀 Sign in with Google'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We only request read-only access to your Gmail
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Built with Next.js • Google Gemini • Google Sheets • Vercel</p>
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
