export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  document_count: number;
  chunk_count: number;
}

export interface ProjectDetail extends Project {
  chunk_size: number;
  chunk_overlap: number;
  embedding_model: string;
}

export interface Document {
  id: string;
  filename: string;
  content_type: string;
  file_size: number;
  upload_date: string;
  chunk_count: number;
  status: 'processing' | 'ready' | 'error';
  error_message: string | null;
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  filename: string;
  text: string;
  similarity_score: number;
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  query_time_ms: number;
}

export interface Citation {
  id: number;
  document_id: string;
  filename: string;
  text: string;
  page_number: number | null;
}

export interface QueryResponse {
  answer: string;
  citations: Citation[];
  conversation_id: string;
  query_time_ms: number;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}
