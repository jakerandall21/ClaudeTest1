import React from 'react';
import { FileText, Trash2, RefreshCw, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DocumentList() {
  const { documents, currentProject, deleteDocument, loading } = useProject();

  if (!currentProject) {
    return (
      <div className="text-center py-8 text-gray-500">
        Select a project to view documents
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText size={48} className="mx-auto mb-3 opacity-50" />
        <p>No documents yet</p>
        <p className="text-sm mt-1">Upload files to get started</p>
      </div>
    );
  }

  const handleDelete = async (id: string, filename: string) => {
    if (window.confirm(`Delete "${filename}"? This action cannot be undone.`)) {
      try {
        await deleteDocument(id);
      } catch {
        // Error handled by context
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">
          Documents ({documents.length})
        </h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {documents.map((doc) => (
          <li key={doc.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50">
            <FileText size={24} className="text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800 truncate">{doc.filename}</span>
                {doc.status === 'processing' && (
                  <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                    <Loader size={12} className="animate-spin" />
                    Processing
                  </span>
                )}
                {doc.status === 'ready' && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle size={12} />
                    Ready
                  </span>
                )}
                {doc.status === 'error' && (
                  <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    <AlertCircle size={12} />
                    Error
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span>{formatFileSize(doc.file_size)}</span>
                <span>{doc.chunk_count} chunks</span>
                <span>{formatDate(doc.upload_date)}</span>
              </div>
              {doc.error_message && (
                <div className="text-sm text-red-600 mt-1">{doc.error_message}</div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleDelete(doc.id, doc.filename)}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                title="Delete document"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
