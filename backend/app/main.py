"""FastAPI application entry point for Chunk - Personal Vector Database Creator."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import create_tables
from app.routers import documents, projects, query


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler - runs on startup and shutdown."""
    # Startup: Create database tables
    create_tables()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Chunk",
    description="Personal Vector Database Creator - Create knowledge bases from your documents with semantic search and RAG capabilities.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected error occurred: {str(exc)}"},
    )


# Include routers
app.include_router(projects.router)
app.include_router(documents.router)
app.include_router(query.router)


@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "name": "Chunk",
        "description": "Personal Vector Database Creator",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
