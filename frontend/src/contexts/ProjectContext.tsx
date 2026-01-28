import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Project, ProjectDetail, Document } from '../types';
import { projectApi, documentApi } from '../services/api';

interface ProjectContextType {
  projects: Project[];
  currentProject: ProjectDetail | null;
  documents: Document[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, name?: string, description?: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  uploadDocuments: (files: File[]) => Promise<Document[]>;
  deleteDocument: (id: string) => Promise<void>;
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectDetail | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectApi.list();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectApi.get(id);
      setCurrentProject(project);
      const docs = await documentApi.list(id);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select project');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectApi.create({ name, description });
      setProjects((prev) => [project, ...prev]);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, name?: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await projectApi.update(id, { name, description });
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
      if (currentProject?.id === id) {
        setCurrentProject((prev) => (prev ? { ...prev, ...updated } : null));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject?.id]);

  const deleteProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await projectApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
        setDocuments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject?.id]);

  const fetchDocuments = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    setError(null);
    try {
      const docs = await documentApi.list(currentProject.id);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const uploadDocuments = useCallback(async (files: File[]) => {
    if (!currentProject) throw new Error('No project selected');
    setLoading(true);
    setError(null);
    try {
      const uploaded = await documentApi.upload(currentProject.id, files);
      setDocuments((prev) => [...uploaded, ...prev]);
      return uploaded;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload documents');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const deleteDocument = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await documentApi.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        documents,
        loading,
        error,
        fetchProjects,
        selectProject,
        createProject,
        updateProject,
        deleteProject,
        fetchDocuments,
        uploadDocuments,
        deleteDocument,
        clearError,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
