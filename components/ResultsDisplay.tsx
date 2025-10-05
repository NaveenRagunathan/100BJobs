'use client';

import { useState } from 'react';
import { FinalSelection } from '@/types/results';
import CandidateCard from './CandidateCard';

interface ResultsDisplayProps {
  results: FinalSelection[];
  onShowMore?: () => void;
  onExport: () => void;
}

export default function ResultsDisplay({ results, onShowMore, onExport }: ResultsDisplayProps) {
  const [visibleCount, setVisibleCount] = useState(5);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 5);
    if (onShowMore) onShowMore();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Top {results.length} Candidate{results.length !== 1 ? 's' : ''}
        </h2>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm flex items-center space-x-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.slice(0, visibleCount).map((result, index) => (
          <CandidateCard key={result.candidate.id} selection={result} index={index} />
        ))}
      </div>

      {/* Show more button */}
      {visibleCount < results.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleShowMore}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Show 5 More Candidates ({results.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
