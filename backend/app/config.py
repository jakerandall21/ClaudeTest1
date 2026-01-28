"""Application configuration using pydantic-settings."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # OpenAI
    openai_api_key: str = ""

    # Data directories
    chroma_persist_dir: str = "../data/chroma"
    upload_dir: str = "../data/uploads"
    database_url: str = "sqlite:///../data/chunk.db"

    # Chunking configuration
    chunk_size: int = 512
    chunk_overlap: int = 50

    # File upload limits
    max_file_size_mb: int = 50

    # Embedding model
    embedding_model: str = "text-embedding-3-small"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def max_file_size_bytes(self) -> int:
        """Get max file size in bytes."""
        return self.max_file_size_mb * 1024 * 1024

    def get_upload_path(self) -> Path:
        """Get the upload directory path, creating if needed."""
        path = Path(self.upload_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    def get_chroma_path(self) -> Path:
        """Get the ChromaDB directory path, creating if needed."""
        path = Path(self.chroma_persist_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
