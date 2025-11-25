/**
 * Dashboard Page
 * Main interface for searching and indexing emails
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchResult, IndexStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [stats, setStats] = useState<IndexStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    loadStats();
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

  const loadStats = async () => {
    try {
      const response = await fetch('/api/emails/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    setSearching(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/emails/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, topK: 5 }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        if (data.data.results.length === 0) {
          setError('No results found. Try indexing some emails first!');
        }
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search emails');
    } finally {
      setSearching(false);
    }
  };

  const handleIndex = async () => {
    setIndexing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/emails/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'today', maxResults: 50 }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Successfully indexed ${data.data.indexed} emails!`);
        loadStats(); // Refresh stats
      } else {
        setError(data.error || 'Indexing failed');
      }
    } catch (error) {
      console.error('Indexing error:', error);
      setError('Failed to index emails');
    } finally {
      setIndexing(false);
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
          `✅ Job tracking complete! 
          📧 Processed: ${data.processed} emails
          🆕 New jobs: ${data.newJobs}
          🔄 Updated: ${data.updatedJobs}
          ⏭️ Skipped: ${data.skipped} (duplicate emails)
          🤖 Gemini calls: ${data.geminiCalls}`
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
        {/* Stats & Actions */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Job Applications
                </CardTitle>
                <CardDescription className="text-base mt-2">Track and manage your job search effortlessly</CardDescription>
              </div>
              <Badge variant="secondary" className="text-2xl px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg animate-pulse-glow">
                {stats?.totalRecordCount || 0} tracked
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleIndex}
                disabled={indexing}
                variant="default"
                size="lg"
                className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                {indexing ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Indexing...
                  </span>
                ) : (
                  '📥 Index Today\'s Emails'
                )}
              </Button>
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
                  '🎯 Track Job Applications'
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
                  � View Google Sheet
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert className="border-2 border-destructive/50 bg-destructive/10 backdrop-blur-sm shadow-lg animate-scale-in">
            <AlertDescription className="flex items-center gap-3 text-base">
              <span className="text-2xl">⚠️</span>
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

        {/* Search Box */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Search Emails</CardTitle>
            <CardDescription>Search your emails using AI-powered semantic search</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., project updates, meeting invitations, payment confirmations"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                >
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                💡 Search by meaning, not just keywords! Try "emails about work projects" or "meeting invites"
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>{results.length} emails found</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.map((result, index) => (
                <Card key={result.id} className="border-l-4 border-l-primary/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {result.metadata.subject}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span>From: {result.metadata.from}</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span>{result.metadata.date}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {(result.score * 100).toFixed(1)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {result.metadata.snippet}...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
