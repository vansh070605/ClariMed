# ClariMed AI

## Project Overview
ClariMed AI is an Explainable Healthcare Copilot designed to help patients understand complex medical reports through advanced artificial intelligence, securely and accurately.

## Problem Statement
Medical reports are notoriously difficult for patients to understand. They are filled with clinical jargon, raw biomarker values, and complex terminology that leave patients confused and anxious, often requiring them to wait for a doctor's appointment just to get a basic summary of their own health data.

## Solution
ClariMed AI bridges the gap between raw medical data and patient understanding by combining:
- **OCR (Optical Character Recognition)**: To extract text directly from PDFs and image scans of medical reports.
- **Medical NLP (Natural Language Processing)**: To accurately identify and extract structured medical entities like biomarkers, ranges, and test names.
- **RAG (Retrieval-Augmented Generation)**: To ground AI explanations in authoritative medical guidelines (WHO, NIH).
- **Clinical Insights**: To recognize evidence-based patterns across multiple biomarkers.
- **Health Copilot**: To provide personalized, educational observations on historical health data.
- **Explainability**: To ensure every insight generated is accompanied by the underlying source evidence and a calibrated confidence score.

## Architecture Overview
The system relies on a scalable, containerized architecture that separates concerns between processing, reasoning, and presentation:
1. **Extraction Pipeline**: Ingests files, runs OCR, and extracts entities via SciSpaCy.
2. **Reasoning Pipeline**: LangChain/LangGraph orchestrated agents that retrieve evidence and generate insights.
3. **Safety Pipeline**: A strict compliance layer that filters out any diagnostic language to ensure the tool remains strictly educational.

## Technology Stack
**Frontend:**
- Next.js 15
- TypeScript
- TailwindCSS

**Backend:**
- FastAPI
- PostgreSQL
- Qdrant

**AI:**
- LangChain
- LangGraph
- Gemini

## Development Roadmap
✅ Phase 1 – Infrastructure Setup
🚧 Phase 2 – Authentication & User Management
⬜ Phase 3 – Report Upload & Metadata Storage
⬜ Phase 4 – OCR Pipeline
⬜ Phase 5 – Medical Entity Extraction
⬜ Phase 6 – RAG
⬜ Phase 7 – Simplification
⬜ Phase 8 – Clinical Insights
⬜ Phase 9 – Trend Analysis
⬜ Phase 9.5 – Health Copilot
⬜ Phase 10 – Knowledge Graph
⬜ Phase 11 – Graph-RAG
⬜ Phase 12 – LangGraph
⬜ Phase 13 – Deployment & Monitoring

## Local Development
ClariMed AI is fully containerized. To spin up the entire development environment (Frontend, Backend, Postgres, and Qdrant):

```bash
docker compose up --build
```

### Current Status
**Phase 1 is complete.** Infrastructure, databases, and core application skeletons are operational.

## Development Branch Workflow
We follow a structured Git branching strategy to ensure stability:
- `main` → Stable milestones only (Production-ready states).
- `develop` → Active development and integration branch.

**Future Feature Branches:**
Branch off of `develop` for specific features:
- `feature/auth`
- `feature/uploads`
- `feature/rag`
- `feature/graph-rag`

Merge feature branches back into `develop` via Pull Requests.
