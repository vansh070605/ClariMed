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
- **Evidence-Based Summaries:** Contextual, patient-friendly summaries mapping structured findings into readable assessments.
- **Longitudinal Trend Analysis:** Historic tracking of recurring biomarkers dynamically plotted.
- **Dashboard & Report History:** Complete KPI visualization of user data, upload history, and trending health metrics.

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
- TailwindCSS
- shadcn/ui
- TanStack Query
- Recharts

**Backend:**
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- PyMuPDF

## 6. Setup Instructions

### Backend Startup
```bash
cd backend
python -m venv venv
source venv/bin/activate # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt

# Start local server
uvicorn app.main:app --reload
```

### Database Migration
```bash
cd backend
alembic upgrade head
```

### Frontend Startup
```bash
cd frontend
npm install
npm run dev
```

### Docker Commands
```bash
# Navigate to backend directory
cd backend

# Copy and rename .env.example to .env
cp .env.example .env

# Edit .env with your local database credentials
# Example:
# POSTGRES_USER=myuser
# POSTGRES_PASSWORD=mypassword
# POSTGRES_SERVER=localhost
# POSTGRES_PORT=5432

# Navigate back to project root
cd ..

# Start backend using Docker Compose
docker-compose up -d --build
```

## 7. API Overview

- **Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- **Reports:** `POST /reports/upload`, `GET /reports`, `GET /reports/{id}`
- **Intelligence:** `POST /reports/{id}/analyze`, `POST /reports/{id}/summarize`
- **Dashboard & Trends:** `GET /dashboard`, `GET /trends`, `GET /trends/history`

*See [API Documentation](docs/api.md) for detailed payload structures.*

## 8. Future Roadmap

- **OCR Recovery Layer:** Adding Tesseract/AWS Textract for scanned image-based PDFs.
- **Multi-Lab Support:** Advanced parsers for varying vendor templates (Quest, LabCorp).
- **Cloud Storage:** S3 bucket integration replacing local ephemeral storage.
- **Provider Dashboard:** A secondary interface allowing doctors to view multi-patient aggregate data.
- **Production Monitoring:** Datadog/Sentry integration for observability.
