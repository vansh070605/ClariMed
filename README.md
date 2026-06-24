# ClariMed AI

ClariMed AI is an Explainable Healthcare Copilot that helps patients understand medical reports using advanced OCR, RAG, and Clinical Pattern Recognition.

## 🚀 Features (MVP)
- **Report Upload & OCR**: Upload medical reports (PDF/images) for automated text extraction.
- **Medical Entity Extraction**: Extract structured entities (e.g., Hemoglobin, WBC) using SciSpaCy.
- **Explainable Insights**: Plain-English, patient-friendly explanations for medical jargon.
- **Longitudinal Health Tracking**: Track biomarker trends over time.
- **Health Copilot**: Personalized educational observations based on historical trends.
- **Compliance Layer**: Strict safeguards against generating medical diagnoses.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: FastAPI, Python 3.12
- **Databases**: PostgreSQL (Relational), Qdrant (Vector DB)
- **AI/ML**: LangChain, LangGraph, Gemini API, SciSpaCy, Tesseract OCR
- **Infrastructure**: Docker, Docker Compose

## 🐳 Getting Started

ClariMed AI runs fully containerized via Docker Compose.

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)

### Environment Setup
1. Copy the `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in the required API keys (e.g., `GEMINI_API_KEY`).

### Running the Application
1. Start the complete stack (Frontend, Backend, Postgres, Qdrant):
   ```bash
   docker-compose up --build
   ```
2. The services will be available at:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Qdrant Dashboard**: http://localhost:6333/dashboard

## 📁 Project Structure
- `frontend/`: Next.js 15 application.
- `backend/`: FastAPI application.
  - `app/`: Core application modules (auth, reports, OCR, RAG, etc.)
  - `tests/`: Pytest suite.
- `docker-compose.yml`: Local infrastructure orchestration.

## 🛑 Important Disclaimer
**ClariMed AI is for educational purposes only.** It does not provide medical diagnoses or professional medical advice. Always consult with a qualified healthcare professional regarding any medical condition or treatment.
