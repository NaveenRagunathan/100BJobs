'use client';

import { useEffect, useState } from 'react';
import { ProcessingProgress } from '@/types/results';

interface ProgressStreamProps {
  sessionId: string;
  query: string;
  onComplete: (results: any[]) => void;
  onError: (error: string) => void;
}

export default function ProgressStream({ sessionId, query, onComplete, onError }: ProgressStreamProps) {
  const [progress, setProgress] = useState<ProcessingProgress>({
    stage: 'parsing',
    message: 'Starting...',
    percentage: 0
  });

  useEffect(() => {
    const eventSource = new EventSource('/api/process');
    
    const startProcessing = async () => {
      try {
        const response = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, query })
        });

        if (!response.ok) {
          throw new Error('Failed to start processing');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                
                if (data.results) {
                  console.log('[FRONTEND] Received results:', data.results.length, 'candidates');
                  onComplete(data.results);
                } else {
                  console.log('[FRONTEND] Progress update:', data.stage, data.message);
                  setProgress(data);

                  if (data.stage === 'error') {
                    onError(data.message);
                  }
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } catch (error: any) {
        onError(error.message || 'Processing failed');
      }
    };

    startProcessing();

    return () => {
      eventSource.close();
    };
  }, [sessionId, query, onComplete, onError]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-500 ease-out"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 text-right">{Math.round(progress.percentage)}%</p>
          </div>

          {/* Status message */}
          <div className="flex items-center space-x-3">
            {progress.stage !== 'error' && progress.stage !== 'complete' && (
              <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            )}
            {progress.stage === 'complete' && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {progress.stage === 'error' && (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="text-sm font-medium text-gray-700">{progress.message}</p>
          </div>

          {/* Additional details */}
          {progress.currentBatch && progress.totalBatches && (
            <p className="text-xs text-gray-500">
              Processing batch {progress.currentBatch} of {progress.totalBatches}
            </p>
          )}
          {progress.candidatesProcessed !== undefined && progress.totalCandidates && (
            <p className="text-xs text-gray-500">
              {progress.candidatesProcessed} / {progress.totalCandidates} candidates
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
