import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import type { SearchResponse, SearchResult } from '../types';

interface SearchResultsProps {
  results: SearchResponse | null;
}

function ResultItem({ result }: { result: SearchResult }) {
  const [expanded, setExpanded] = useState(false);

  const scorePercent = Math.round(result.similarity_score * 100);
  const scoreColor =
    scorePercent >= 80
      ? 'text-green-600 bg-green-50'
      : scorePercent >= 60
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-gray-600 bg-gray-100';

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="px-4 py-3 bg-gray-50 flex items-center gap-3 cursor-pointer hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <FileText size={20} className="text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-800 truncate">{result.filename}</div>
          {result.metadata.page_number && (
            <div className="text-xs text-gray-500">Page {result.metadata.page_number as number}</div>
          )}
        </div>
        <span className={`px-2 py-1 text-sm font-medium rounded ${scoreColor}`}>
          {scorePercent}% match
        </span>
        {expanded ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </div>
      <div className={`px-4 py-3 bg-white ${expanded ? '' : 'line-clamp-3'}`}>
        <p className="text-gray-700 whitespace-pre-wrap">{result.text}</p>
      </div>
    </div>
  );
}

export function SearchResults({ results }: SearchResultsProps) {
  if (!results) {
    return null;
  }

  if (results.results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText size={48} className="mx-auto mb-3 opacity-50" />
        <p>No matching results found</p>
        <p className="text-sm mt-1">Try a different search query</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{results.results.length} results found</span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {results.query_time_ms}ms
        </span>
      </div>
      <div className="space-y-3">
        {results.results.map((result) => (
          <ResultItem key={result.chunk_id} result={result} />
        ))}
      </div>
    </div>
  );
}
