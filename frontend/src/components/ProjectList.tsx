import React, { useState } from 'react';
import { FolderPlus, Folder, Trash2, FileText } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';

export function ProjectList() {
  const {
    projects,
    currentProject,
    selectProject,
    createProject,
    deleteProject,
    loading,
  } = useProject();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const project = await createProject(newName.trim(), newDescription.trim() || undefined);
      setNewName('');
      setNewDescription('');
      setShowCreate(false);
      selectProject(project.id);
    } catch {
      // Error is handled by context
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(id);
      } catch {
        // Error is handled by context
      }
    }
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Projects</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FolderPlus size={18} />
          New Project
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 border-b border-gray-200 bg-white">
          <input
            type="text"
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!newName.trim() || loading}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setNewName('');
                setNewDescription('');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm text-center">
            No projects yet. Create one to get started.
          </div>
        ) : (
          <ul className="py-2">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  onClick={() => selectProject(project.id)}
                  className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-100 transition-colors ${
                    currentProject?.id === project.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''
                  }`}
                >
                  <Folder
                    size={20}
                    className={currentProject?.id === project.id ? 'text-blue-600' : 'text-gray-400'}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-gray-800 truncate">{project.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <FileText size={12} />
                      {project.document_count} documents
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
