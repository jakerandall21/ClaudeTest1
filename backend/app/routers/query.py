"""Search and RAG query endpoints."""

import time
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project
from app.schemas import (
    Citation,
    QueryRequest,
    QueryResponse,
    SearchRequest,
    SearchResponse,
    SearchResultItem,
)

router = APIRouter(tags=["query"])


@router.post("/api/projects/{project_id}/search", response_model=SearchResponse)
def search(
    project_id: str,
    request: SearchRequest,
    db: Session = Depends(get_db),
):
    """Semantic search within a project."""
    start_time = time.time()

    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id '{project_id}' not found",
        )

    # TODO: Implement actual vector search with ChromaDB
    # For now, return empty results
    results = []

    query_time_ms = int((time.time() - start_time) * 1000)

    return SearchResponse(results=results, query_time_ms=query_time_ms)


@router.post("/api/projects/{project_id}/query", response_model=QueryResponse)
def rag_query(
    project_id: str,
    request: QueryRequest,
    db: Session = Depends(get_db),
):
    """RAG query within a project."""
    start_time = time.time()

    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id '{project_id}' not found",
        )

    # Generate or use existing conversation ID
    conversation_id = request.conversation_id or str(uuid4())

    # TODO: Implement actual RAG with ChromaDB + OpenAI
    # For now, return a placeholder response
    answer = "RAG functionality will be implemented in Phase 2. Please use the search endpoint for now."
    citations = []

    query_time_ms = int((time.time() - start_time) * 1000)

    return QueryResponse(
        answer=answer,
        citations=citations,
        conversation_id=conversation_id,
        query_time_ms=query_time_ms,
    )
