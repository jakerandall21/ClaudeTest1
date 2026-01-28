import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
};

export function FileUpload() {
  const { currentProject, uploadDocuments, loading } = useProject();
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = React.useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: { file: File; errors: { message: string }[] }[]) => {
    setUploadError(null);

    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(
        (r) => `${r.file.name}: ${r.errors.map((e) => e.message).join(', ')}`
      );
      setUploadError(errors.join('\n'));
    }

    if (acceptedFiles.length > 0) {
      setPendingFiles((prev) => [...prev, ...acceptedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    disabled: !currentProject || loading,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;

    try {
      await uploadDocuments(pendingFiles);
      setPendingFiles([]);
      setUploadError(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  if (!currentProject) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center text-gray-500">
        Select a project to upload documents
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center">
          <Upload size={40} className={isDragActive ? 'text-blue-500' : 'text-gray-400'} />
          <p className="mt-2 text-gray-600">
            {isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to browse'}
          </p>
          <p className="mt-1 text-sm text-gray-500">Supports PDF, TXT, and MD files (max 50MB)</p>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <pre className="text-sm whitespace-pre-wrap">{uploadError}</pre>
        </div>
      )}

      {pendingFiles.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {pendingFiles.length} file(s) ready to upload
            </span>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {pendingFiles.map((file, index) => (
              <li key={index} className="px-4 py-3 flex items-center gap-3">
                <File size={20} className="text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{file.name}</div>
                  <div className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
