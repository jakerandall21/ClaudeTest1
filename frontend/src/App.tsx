import React, { useState } from 'react';
import { Database, AlertCircle } from 'lucide-react';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import { ProjectList } from './components/ProjectList';
import { FileUpload } from './components/FileUpload';
import { DocumentList } from './components/DocumentList';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import type { SearchResponse } from './types';

function MainContent() {
  const { currentProject, error, clearError } = useProject();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'search'>('documents');

  return (
    <div className="flex h-screen bg-gray-100">
      <ProjectList />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={28} className="text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {currentProject ? currentProject.name : 'Chunk'}
                </h1>
                {currentProject && (
                  <p className="text-sm text-gray-500">
                    {currentProject.document_count} documents, {currentProject.chunk_count} chunks
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!currentProject ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Database size={64} className="mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                  Welcome to Chunk
                </h2>
                <p className="text-gray-500">
                  Select a project from the sidebar or create a new one to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search */}
              <SearchBar onResults={setSearchResults} />

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => {
                    setActiveTab('documents');
                    setSearchResults(null);
                  }}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'documents'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'search'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Search Results
                </button>
              </div>

              {/* Tab content */}
              {activeTab === 'documents' ? (
                <div className="space-y-6">
                  <FileUpload />
                  <DocumentList />
                </div>
              ) : (
                <SearchResults results={searchResults} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <MainContent />
    </ProjectProvider>
  );
}

export default App;
