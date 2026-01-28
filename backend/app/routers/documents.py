"""Document management endpoints."""

import os
import shutil
from typing import List
from uuid import uuid4

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Document, Project
from app.schemas import DocumentListResponse, DocumentResponse, DocumentUploadResponse

router = APIRouter(tags=["documents"])

ALLOWED_CONTENT_TYPES = {
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/markdown": ".md",
}


def validate_file(file: UploadFile) -> str:
    """Validate uploaded file and return content type."""
    settings = get_settings()

    # Check content type
    content_type = file.content_type or "application/octet-stream"

    # Also check by extension for reliability
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        content_type = "application/pdf"
    elif ext == ".txt":
        content_type = "text/plain"
    elif ext == ".md":
        content_type = "text/markdown"

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{content_type}' not supported. Allowed types: PDF, TXT, MD",
        )

    return content_type


async def save_upload_file(
    file: UploadFile, project_id: str, document_id: str
) -> tuple[str, int]:
    """Save uploaded file and return the path and size."""
    settings = get_settings()
    upload_dir = settings.get_upload_path() / project_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    ext = os.path.splitext(file.filename or "file")[1]
    file_path = upload_dir / f"{document_id}{ext}"

    # Save file
    file_size = 0
    async with aiofiles.open(file_path, "wb") as out_file:
        while chunk := await file.read(8192):
            file_size += len(chunk)
            if file_size > settings.max_file_size_bytes:
                await out_file.close()
                os.remove(file_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File size exceeds maximum allowed ({settings.max_file_size_mb}MB)",
                )
            await out_file.write(chunk)

    return str(file_path), file_size


@router.post(
    "/api/projects/{project_id}/documents",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_documents(
    project_id: str,
    files: List[UploadFile],
    db: Session = Depends(get_db),
):
    """Upload documents to a project."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id '{project_id}' not found",
        )

    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided",
        )

    uploaded_docs = []

    for file in files:
        # Validate file
        content_type = validate_file(file)

        # Generate document ID
        doc_id = str(uuid4())

        try:
            # Save file
            file_path, file_size = await save_upload_file(file, project_id, doc_id)

            # Create document record
            document = Document(
                id=doc_id,
                project_id=project_id,
                filename=file.filename or "unnamed",
                content_type=content_type,
                file_size=file_size,
                status="processing",
            )
            db.add(document)
            db.commit()
            db.refresh(document)

            uploaded_docs.append(
                DocumentResponse(
                    id=document.id,
                    filename=document.filename,
                    content_type=document.content_type,
                    file_size=document.file_size,
                    upload_date=document.upload_date,
                    chunk_count=document.chunk_count,
                    status=document.status,
                    error_message=document.error_message,
                )
            )

        except HTTPException:
            raise
        except Exception as e:
            # If file was partially created, clean up
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file '{file.filename}': {str(e)}",
            )

    return DocumentUploadResponse(documents=uploaded_docs)


@router.get(
    "/api/projects/{project_id}/documents",
    response_model=DocumentListResponse,
)
def list_documents(
    project_id: str,
    db: Session = Depends(get_db),
):
    """List all documents in a project."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id '{project_id}' not found",
        )

    documents = (
        db.query(Document)
        .filter(Document.project_id == project_id)
        .order_by(Document.upload_date.desc())
        .all()
    )

    return DocumentListResponse(
        documents=[
            DocumentResponse(
                id=doc.id,
                filename=doc.filename,
                content_type=doc.content_type,
                file_size=doc.file_size,
                upload_date=doc.upload_date,
                chunk_count=doc.chunk_count,
                status=doc.status,
                error_message=doc.error_message,
            )
            for doc in documents
        ]
    )


@router.get("/api/documents/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
):
    """Get a document by ID."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id '{document_id}' not found",
        )

    return DocumentResponse(
        id=document.id,
        filename=document.filename,
        content_type=document.content_type,
        file_size=document.file_size,
        upload_date=document.upload_date,
        chunk_count=document.chunk_count,
        status=document.status,
        error_message=document.error_message,
    )


@router.delete(
    "/api/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
):
    """Delete a document."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id '{document_id}' not found",
        )

    # Delete the file from disk
    settings = get_settings()
    upload_dir = settings.get_upload_path() / document.project_id
    for file in upload_dir.glob(f"{document_id}.*"):
        try:
            os.remove(file)
        except OSError:
            pass

    # Delete from database
    db.delete(document)
    db.commit()

    return None


@router.post(
    "/api/documents/{document_id}/reprocess",
    status_code=status.HTTP_202_ACCEPTED,
)
def reprocess_document(
    document_id: str,
    db: Session = Depends(get_db),
):
    """Reprocess a document (re-extract and re-embed)."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id '{document_id}' not found",
        )

    # Mark as processing
    document.status = "processing"
    document.error_message = None
    db.commit()

    # TODO: Add background task to reprocess the document

    return {"message": "Document reprocessing started", "document_id": document_id}
