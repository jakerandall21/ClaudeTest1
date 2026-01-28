import axios from 'axios';
import type {
  Project,
  ProjectDetail,
  Document,
  SearchResponse,
  QueryResponse,
  CreateProjectData,
  UpdateProjectData,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Project API
export const projectApi = {
  list: async (): Promise<Project[]> => {
    const response = await api.get<{ projects: Project[] }>('/projects');
    return response.data.projects;
  },

  get: async (id: string): Promise<ProjectDetail> => {
    const response = await api.get<ProjectDetail>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Document API
export const documentApi = {
  list: async (projectId: string): Promise<Document[]> => {
    const response = await api.get<{ documents: Document[] }>(
      `/projects/${projectId}/documents`
    );
    return response.data.documents;
  },

  upload: async (projectId: string, files: File[]): Promise<Document[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<{ documents: Document[] }>(
      `/projects/${projectId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.documents;
  },

  get: async (id: string): Promise<Document> => {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  reprocess: async (id: string): Promise<void> => {
    await api.post(`/documents/${id}/reprocess`);
  },
};

// Search API
export const searchApi = {
  search: async (
    projectId: string,
    query: string,
    topK: number = 5,
    threshold: number = 0.0
  ): Promise<SearchResponse> => {
    const response = await api.post<SearchResponse>(
      `/projects/${projectId}/search`,
      {
        query,
        top_k: topK,
        threshold,
      }
    );
    return response.data;
  },

  query: async (
    projectId: string,
    query: string,
    topK: number = 5,
    conversationId?: string
  ): Promise<QueryResponse> => {
    const response = await api.post<QueryResponse>(
      `/projects/${projectId}/query`,
      {
        query,
        top_k: topK,
        conversation_id: conversationId,
      }
    );
    return response.data;
  },
};

export default api;
