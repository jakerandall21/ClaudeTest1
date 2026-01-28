import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { searchApi } from '../services/api';
import type { SearchResponse } from '../types';

interface SearchBarProps {
  onResults: (results: SearchResponse | null) => void;
}

export function SearchBar({ onResults }: SearchBarProps) {
  const { currentProject } = useProject();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !currentProject) return;

    setSearching(true);
    setError(null);

    try {
      const results = await searchApi.search(currentProject.id, query.trim());
      onResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      onResults(null);
    } finally {
      setSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            currentProject
              ? 'Search your documents...'
              : 'Select a project to search'
          }
          disabled={!currentProject || searching}
          className="w-full px-4 py-3 pl-12 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <button
          type="submit"
          disabled={!query.trim() || !currentProject || searching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {searching ? (
            <>
              <Loader size={16} className="animate-spin" />
              Searching
            </>
          ) : (
            'Search'
          )}
        </button>
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
    </form>
  );
}
