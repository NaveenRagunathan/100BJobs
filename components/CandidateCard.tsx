'use client';

import { useState } from 'react';
import { FinalSelection } from '@/types/results';

interface CandidateCardProps {
  selection: FinalSelection;
  index: number;
}

export default function CandidateCard({ selection, index }: CandidateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { candidate, matchPercentage, strengths, concerns, uniqueQualities, detailedReasoning, role, rank } = selection;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow animate-slide-up"
         style={{ animationDelay: `${index * 100}ms` }}>
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-primary-600">#{rank}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                <p className="text-sm text-gray-600">{role}</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">{matchPercentage}%</div>
            <p className="text-xs text-gray-500">Match</p>
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Email</p>
            <p className="text-sm font-medium text-gray-900">{candidate.email}</p>
          </div>
          {candidate.phone && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Phone</p>
              <p className="text-sm font-medium text-gray-900">{candidate.phone}</p>
            </div>
          )}
          {candidate.yearsOfExperience !== undefined && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Experience</p>
              <p className="text-sm font-medium text-gray-900">{candidate.yearsOfExperience} years</p>
            </div>
          )}
          {candidate.location && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Location</p>
              <p className="text-sm font-medium text-gray-900">{candidate.location}</p>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase mb-2">Top Skills</p>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.slice(0, 8).map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                {skill}
              </span>
            ))}
            {candidate.skills.length > 8 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{candidate.skills.length - 8} more
              </span>
            )}
          </div>
        </div>

        {/* Expand indicator */}
        <div className="flex items-center justify-center pt-2 border-t border-gray-200">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
            <span>{isExpanded ? 'Hide' : 'Show'} detailed analysis</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50 animate-fade-in">
          <div className="pt-6 space-y-6">
            {/* Detailed reasoning */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Why This Candidate?</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{detailedReasoning}</p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Strengths</h4>
              <ul className="space-y-2">
                {strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerns */}
            {concerns.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Points to Consider</h4>
                <ul className="space-y-2">
                  {concerns.map((concern, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm text-gray-700">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Unique qualities */}
            {uniqueQualities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">What Makes Them Stand Out</h4>
                <ul className="space-y-2">
                  {uniqueQualities.map((quality, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className="text-sm text-gray-700">{quality}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {candidate.portfolio && (
                <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>Portfolio</span>
                </a>
              )}
              {candidate.github && (
                <a href={candidate.github} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
              )}
              {candidate.linkedin && (
                <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
