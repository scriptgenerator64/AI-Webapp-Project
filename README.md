# Document Manager

A full-stack document management application with a Flask backend and React-based frontend, featuring semantic search and AI-powered chat.

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   \`\`\`
   cd backend
   \`\`\`

2. Create a virtual environment:
   \`\`\`
   python -m venv venv
   \`\`\`

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

5. Create a `.env.conf` file with your OpenAI API key:
   \`\`\`
   OPENAI_API_KEY=your_api_key_here
   \`\`\`

6. Run the Flask application:
   \`\`\`
   python run.py
   \`\`\`

The backend will be available at http://localhost:5000.

### Frontend Setup

1. Navigate to the frontend directory:
   \`\`\`
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Create a `.env.local` file with:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   \`\`\`

4. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

The frontend will be available at http://localhost:3000.

## Features

- Organization management
- Document upload and management
- Document metadata viewing
- Semantic search across documents
- AI-powered document Q&A with source citations
- SQLite database with vector storage

## API Endpoints

### Organizations
- `GET /api/organizations` - List all organizations
- `POST /api/organizations` - Create a new organization
- `GET /api/organizations/<id>` - Get organization details
- `PUT /api/organizations/<id>` - Update organization
- `DELETE /api/organizations/<id>` - Delete organization

### Documents
- `GET /api/organizations/<id>/documents` - List all documents in an organization
- `POST /api/organizations/<id>/documents` - Upload a document to an organization
- `GET /api/documents/<id>` - Get document details
- `PUT /api/documents/<id>` - Update document metadata
- `DELETE /api/documents/<id>` - Delete document

### Search & AI
- `POST /api/search` - Search documents across organizations
- `POST /api/chat` - Chat with AI about documents

## Database

The application uses SQLite by default, with the database file stored in `backend/instance/document_manager.db`.
