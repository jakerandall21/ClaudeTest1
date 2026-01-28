"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# Project schemas
class ProjectCreate(BaseModel):
    """Schema for creating a new project."""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    """Schema for project response."""

    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    document_count: int = 0
    chunk_count: int = 0

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Schema for list of projects response."""

    projects: list[ProjectResponse]


class ProjectDetailResponse(BaseModel):
    """Schema for detailed project response."""

    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    document_count: int = 0
    chunk_count: int = 0
    chunk_size: int
    chunk_overlap: int
    embedding_model: str

    class Config:
        from_attributes = True


# Document schemas
class DocumentResponse(BaseModel):
    """Schema for document response."""

    id: str
    filename: str
    content_type: str
    file_size: int
    upload_date: datetime
    chunk_count: int
    status: str
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """Schema for list of documents response."""

    documents: list[DocumentResponse]


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response."""

    documents: list[DocumentResponse]


# Search schemas
class SearchRequest(BaseModel):
    """Schema for search request."""

    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)
    threshold: float = Field(default=0.0, ge=0.0, le=1.0)


class SearchResultItem(BaseModel):
    """Schema for a single search result."""

    chunk_id: str
    document_id: str
    filename: str
    text: str
    similarity_score: float
    metadata: dict


class SearchResponse(BaseModel):
    """Schema for search response."""

    results: list[SearchResultItem]
    query_time_ms: int


# RAG schemas
class QueryRequest(BaseModel):
    """Schema for RAG query request."""

    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)
    conversation_id: Optional[str] = None


class Citation(BaseModel):
    """Schema for a citation in RAG response."""

    id: int
    document_id: str
    filename: str
    text: str
    page_number: Optional[int] = None


class QueryResponse(BaseModel):
    """Schema for RAG query response."""

    answer: str
    citations: list[Citation]
    conversation_id: str
    query_time_ms: int


# Error schemas
class ErrorResponse(BaseModel):
    """Schema for error response."""

    detail: str
