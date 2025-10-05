'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import QueryInput from '@/components/QueryInput';
import ProgressStream from '@/components/ProgressStream';
import ResultsDisplay from '@/components/ResultsDisplay';
import { FinalSelection } from '@/types/results';

export default function HomePage() {
  const [stage, setStage] = useState<'upload' | 'query' | 'processing' | 'results'>('upload');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [results, setResults] = useState<FinalSelection[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = (data: { sessionId: string; stats: any }) => {
    setSessionId(data.sessionId);
    setError(null);
    setStage('query');
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setStage('upload');
  };

  const handleQuerySubmit = (query: string) => {
    if (!sessionId) {
      setError('Please upload a file first');
      return;
    }
    setCurrentQuery(query);
    setError(null);
    setStage('processing');
  };

  const handleProcessingComplete = (newResults: FinalSelection[]) => {
    setResults(newResults);
    setError(null);
    setStage('results');
  };

  const handleProcessingError = (errorMessage: string) => {
    setError(errorMessage);
    setStage('query');
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to export results');
    }
  };

  const handleShowMore = () => {
    // For demo purposes, we'll just show more from the existing results
    // In a real implementation, this would trigger another API call
    console.log('Showing more candidates...');
  };

  const resetToUpload = () => {
    setStage('upload');
    setSessionId(null);
    setResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-primary-600">100BJobs</div>
              <div className="text-sm text-gray-600">AI-Powered Candidate Matching</div>
            </div>
            {stage !== 'upload' && (
              <button
                onClick={resetToUpload}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Upload stage */}
          {stage === 'upload' && (
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Find Your Perfect Candidates
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Upload your candidate data and let AI find the best matches for your requirements.
                  Supports JSON files up to 50MB with automatic field detection.
                </p>
              </div>
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
          )}

          {/* Query stage */}
          {stage === 'query' && sessionId && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What are you looking for?
                </h2>
                <p className="text-gray-600">
                  Describe the role, skills, and requirements in natural language
                </p>
              </div>
              <QueryInput
                onSubmit={handleQuerySubmit}
                disabled={!sessionId}
              />
              <div className="text-center text-sm text-gray-500 space-y-2">
                <p>Examples:</p>
                <div className="space-y-1">
                  <p>• "I need 2 senior frontend engineers with React experience"</p>
                  <p>• "Looking for a backend engineer proficient in Node.js and 1 UX designer"</p>
                  <p>• "Find 3 full-stack developers with 3+ years experience in the San Francisco area"</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing stage */}
          {stage === 'processing' && sessionId && (
            <ProgressStream
              sessionId={sessionId}
              query={currentQuery}
              onComplete={handleProcessingComplete}
              onError={handleProcessingError}
            />
          )}

          {/* Results stage */}
          {stage === 'results' && results.length > 0 && (
            <ResultsDisplay
              results={results}
              onShowMore={handleShowMore}
              onExport={handleExport}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>Built for fast, accurate candidate matching using advanced AI analysis</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
