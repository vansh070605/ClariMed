# ClariMed AI Architecture

ClariMed AI is designed with a scalable, production-grade architecture that prioritizes an MVP approach while ensuring readiness for future advanced capabilities like Graph-RAG and Multi-Agent Orchestration.

## System Components

### 1. Frontend (Next.js 15)
Provides the user interface for report upload, dashboard visualization, and health trend tracking.

### 2. Backend (FastAPI)
The core orchestration layer that handles API requests, database interactions, and the AI workflow.

### 3. Databases
- **PostgreSQL**: Stores relational data (`Users`, `Reports`, `ReportMetadata`, `MedicalEntities`, `MedicalFindings`, `AnalysisHistory`, `KnowledgeSource`).
- **Qdrant**: Stores vector embeddings for the RAG Knowledge Base.

### 4. AI & ML Pipeline
- **Multimodal Processing**: Image enhancement and routing.
- **OCR & Parsing**: PyMuPDF, pdfplumber, and Tesseract for text extraction.
- **Medical NLP**: SciSpaCy for extracting structured medical entities.
- **RAG & Embeddings**: Abstracted embedding layer (defaults to BAAI/bge-small-en-v1.5) for semantic search against medical guidelines.
- **LLM**: Gemini API for reasoning and generation.

## AI Workflow (Pipeline)
1. **Extraction Agent**: OCR, parsing, and entity extraction.
2. **Medical Reasoning Agent**: Risk analysis and evidence retrieval via RAG.
3. **Clinical Insight Engine**: Pattern-based inference system.
4. **Health Copilot**: Generates personalized, historical health observations.
5. **Explanation Agent**: Translates medical jargon into plain-English summaries.
6. **Confidence Framework**: Calibrates confidence scores (High/Medium/Low).
7. **Compliance Layer**: Ensures outputs are strictly educational and non-diagnostic.
8. **Final Response**: Delivered to the user frontend.

## Deployment Strategy
The application uses **Docker Compose** to containerize the entire stack, ensuring consistent environments across development and production, and isolating heavy ML dependencies (like SciSpaCy) from the host machine.
