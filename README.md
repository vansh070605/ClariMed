# ClariMed

## 1. Project Overview

**The Problem:**
- Medical reports are often written in highly technical jargon that patients struggle to understand.
- Biomarker trends are difficult to track manually across multiple PDFs.
- Long-term patient health data remains fragmented, making it hard to visualize improving or worsening conditions over time.

**The Solution:**
ClariMed is an Explainable Healthcare Copilot that transforms static PDF lab reports into actionable health intelligence. It converts reports into:
- Structured biomarker data
- Deterministic clinical interpretations
- Evidence-backed summaries
- Longitudinal health trends

## 2. Key Features

- **Secure Authentication:** HttpOnly Cookie-based JWT authentication with session hydration.
- **PDF Upload:** Drag-and-drop secure file uploading.
- **Deterministic Extraction:** Rule-based parser for structured extraction of biomarkers, values, units, and reference ranges.
- **Clinical Interpretation Engine:** Deterministic logic evaluating biomarker flags and severity without relying on AI hallucination.
- **Evidence-Based Summaries & AI Assistant:** Chatbot powered by Google Gemini SDK (`google-genai`), using context-aware clinical data with automatic model fallback (`gemini-2.5-flash` -> `gemini-1.5-flash` -> `gemini-2.0-flash`) for robust offline/free-tier execution.
- **Interactive Data Timelines**: Fluid longitudinal charting powered by Recharts (AreaChart), natively styled for light/dark modes.
- **Live Notification Hub**: Real-time toast alerts driven by backend WebSockets when lab documents finish processing.
- **Help Center Modal**: Interactive step-by-step portal walkthrough guide overlaying the page.
- **Customized Settings panel**: Tabs for editing Personal Profile, Security Passwords, Notification parameters, and default Measurement Standards (Metric vs US convencional) saved to `localStorage`.

## 3. Why Deterministic Before AI?

Many healthcare applications send raw medical data directly to LLMs, which introduces high risk for medical hallucinations and non-reproducible outcomes.

ClariMed instead strictly adheres to a deterministic pipeline:

```text
PDF → Extraction → Validation → Interpretation → Summary
```

By ensuring that the core data extraction and clinical flag evaluations are deterministic and rule-based, we guarantee:
- **Reliability:** The same PDF always produces the same parsed metrics.
- **Transparency:** The logic mapping abnormal flags relies entirely on documented reference ranges.
- **Reduced Hallucinations:** Any future LLM usage is strictly limited to translating *already structured* interpretations into human-readable tone.
- **Easier Debugging:** Pipeline stages are fully isolated.

## 4. Architecture Overview

For deep technical insights and flowcharts, please refer to the [Architecture Documentation](docs/architecture.md).

## 5. Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS v4
- shadcn/ui
- TanStack Query
- Recharts (Interactive charting)
- Framer Motion (Page animations)

**Backend:**
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- PyMuPDF
- Qdrant (Vector Database)
- Google GenAI SDK (Gemini client integration)

## 6. Setup Instructions

### Environment Configuration
1. Copy the root `.env.example` file and create a new **`.env`** file at the project root:
   ```bash
   cp .env.example .env
   ```
2. Configure your Google Gemini API Key inside `.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

### Option A: Running inside Docker (Recommended)
Make sure Docker Desktop is running, then launch the entire stack (Frontend, Backend, Postgres, Qdrant) with one command from the project root:
```bash
docker-compose up --build -d
```
- **Frontend URL**: `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied)
- **Backend API**: `http://localhost:8000`
- **Qdrant dashboard**: `http://localhost:6333`

---

### Option B: Local Host Development Startup

#### Backend Startup
1. Navigate to the backend directory and configure the environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate # or .\venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
2. Run database migrations:
   ```bash
   alembic upgrade head
   ```
3. Start local backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend Startup
1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
- Open `http://localhost:3000` to interact with the application locally.

## 7. API Overview

- **Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- **Reports:** `POST /reports/upload`, `GET /reports`, `GET /reports/{id}`
- **Intelligence:** `POST /reports/{id}/analyze`, `POST /reports/{id}/summarize`
- **Dashboard & Trends:** `GET /dashboard`, `GET /trends`, `GET /trends/history`
- **Chat:** `POST /chat`

*See [API Documentation](docs/api.md) for detailed payload structures.*

## 8. Future Roadmap

- **OCR Recovery Layer:** Adding Tesseract/AWS Textract for scanned image-based PDFs.
- **Multi-Lab Support:** Advanced parsers for varying vendor templates (Quest, LabCorp).
- **Cloud Storage:** S3 bucket integration replacing local ephemeral storage.
- **Provider Dashboard:** A secondary interface allowing doctors to view multi-patient aggregate data.
- **Production Monitoring:** Datadog/Sentry integration for observability.

