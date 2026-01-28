# Chunk - Personal Vector Database Creator

A fast, intuitive web application that enables users to create personal knowledge bases from their files and documents, with powerful semantic search and RAG (Retrieval Augmented Generation) capabilities.

## Features

- **Project Management**: Create and organize multiple knowledge base projects
- **Document Upload**: Support for PDF, TXT, and Markdown files
- **Semantic Search**: Find relevant content using natural language queries
- **Citation Support**: Track sources with document and page references

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database for metadata
- **ChromaDB** - Vector database for embeddings
- **OpenAI** - Embeddings and LLM integration

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at http://localhost:5173 and will proxy API requests to the backend at http://localhost:8000.

## API Endpoints

### Projects
- `POST /api/projects` - Create a project
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update a project
- `DELETE /api/projects/{id}` - Delete a project

### Documents
- `POST /api/projects/{id}/documents` - Upload documents
- `GET /api/projects/{id}/documents` - List documents in a project
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete a document

### Search
- `POST /api/projects/{id}/search` - Semantic search
- `POST /api/projects/{id}/query` - RAG query (Phase 2)

## Project Structure

```
chunk/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Settings
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── routers/         # API endpoints
│   │   └── services/        # Business logic
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React context
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript types
│   └── package.json
└── data/                    # Created at runtime
    ├── chroma/              # Vector database
    ├── uploads/             # Uploaded files
    └── chunk.db             # SQLite database
```

## Development Roadmap

### Week 1: Backend Foundation (Current)
- [x] FastAPI project structure
- [x] SQLite database with SQLAlchemy
- [x] Project CRUD endpoints
- [x] Document upload endpoints
- [x] Basic error handling

### Week 2: Document Processing Pipeline
- [ ] PDF text extraction
- [ ] Text chunking service
- [ ] OpenAI embedding generation
- [ ] ChromaDB integration

### Week 3: Search Functionality
- [ ] Semantic search endpoint
- [ ] Vector similarity query
- [ ] Result formatting with metadata
- [ ] Citation generation

### Week 4: Frontend Core
- [x] React + TypeScript + Vite setup
- [x] Project list/create UI
- [x] File upload with drag-and-drop
- [x] Search interface
- [x] Results display with citations

### Week 5: Polish & Documentation
- [ ] Error handling UI
- [ ] Loading states
- [ ] Empty states
- [ ] Code comments
- [ ] Bug fixes

## License

MIT
