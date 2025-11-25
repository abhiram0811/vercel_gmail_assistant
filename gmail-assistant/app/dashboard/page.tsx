/**
 * Dashboard Page
 * Main interface for searching and indexing emails
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchResult, IndexStats } from '@/lib/types';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">📧 Gmail Assistant</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Index Statistics</h2>
              <p className="text-3xl font-bold text-indigo-600">
                {stats?.totalRecordCount || 0}
              </p>
              <p className="text-sm text-gray-600">Emails indexed</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleIndex}
                disabled={indexing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {indexing ? 'Indexing...' : "Index Today's Emails"}
              </button>
              <button
                onClick={handleJobTrack}
                disabled={tracking}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tracking ? 'Tracking...' : '📊 Track Job Applications'}
              </button>
              <a
                href={`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                📋 View Sheet
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <p>{success}</p>
          </div>
        )}

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch}>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search your emails
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., project updates, meeting invitations, payment confirmations"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              💡 Search by meaning, not just keywords! Try "emails about work projects" or "meeting invites"
            </p>
          </form>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results ({results.length})
            </h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {result.metadata.subject}
                      </h3>
                      <p className="text-sm text-gray-600">
                        From: {result.metadata.from}
                      </p>
                      <p className="text-sm text-gray-500">
                        {result.metadata.date}
                      </p>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded">
                      {(result.score * 100).toFixed(1)}% match
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mt-2">
                    {result.metadata.snippet}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
