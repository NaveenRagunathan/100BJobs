'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export default function QueryInput({ onSubmit, disabled, isProcessing }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (query.trim() && !disabled && !isProcessing) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative bg-white rounded-lg shadow-lg border border-gray-200">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || isProcessing}
          placeholder="Describe who you want to hire (e.g., 'I need 2 senior frontend engineers with React experience and 1 backend engineer proficient in Node.js')"
          className="w-full px-4 py-3 pr-12 resize-none border-0 focus:outline-none rounded-lg text-gray-700 placeholder-gray-400"
          rows={1}
          style={{ minHeight: '60px', maxHeight: '200px' }}
        />
        
        <button
          onClick={handleSubmit}
          disabled={!query.trim() || disabled || isProcessing}
          className={`
            absolute right-3 bottom-3 p-2 rounded-lg transition-all
            ${query.trim() && !disabled && !isProcessing
              ? 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          title="Submit (Cmd/Ctrl + Enter)"
        >
          {isProcessing ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Press Cmd/Ctrl + Enter to submit
      </p>
    </div>
  );
}
