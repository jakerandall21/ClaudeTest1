"""SQLite database setup with SQLAlchemy."""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""

    pass


def get_database_url() -> str:
    """Get the database URL, ensuring the directory exists."""
    settings = get_settings()
    url = settings.database_url

    # Ensure the data directory exists
    if url.startswith("sqlite:///"):
        from pathlib import Path

        db_path = url.replace("sqlite:///", "")
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    return url


# Create engine with SQLite-specific settings
engine = create_engine(
    get_database_url(),
    connect_args={"check_same_thread": False},  # Needed for SQLite with FastAPI
    echo=False,
)


# Enable foreign key support for SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable foreign keys for SQLite connections."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
