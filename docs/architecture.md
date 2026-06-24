# Architecture Documentation

This document maps out the system components and internal data flows of the ClariMed platform.

## System Architecture

The overarching system is built on a modern decoupled stack featuring Next.js (Frontend), FastAPI (Backend), and PostgreSQL (Database). 

```mermaid
graph TD
    A[User / Browser] -->|HTTP Requests| B[Next.js App Router]
    B -->|API Calls + HttpOnly Cookies| C[FastAPI Backend]
    C -->|SQLAlchemy ORM| D[(PostgreSQL)]
    
    subgraph Frontend
    B
    end
    
    subgraph Backend Services
    C
    D
    end
```

## Clinical Intelligence Pipeline

Rather than relying on non-deterministic LLMs to execute medical interpretation, ClariMed utilizes a fully deterministic processing pipeline before generating natural language summaries.

```mermaid
graph TD
    A[PDF Upload] --> B[PyMuPDF Parser]
    B --> C[Extraction Engine]
    C --> D[Schema Validation]
    D --> E[Clinical Interpretation]
    E --> F[Summary Generation]
    F --> G[Longitudinal Trend Analysis]

    subgraph Deterministic Layer
    B
    C
    D
    E
    end

    subgraph Aggregation Layer
    F
    G
    end
```

*(You can export these diagrams to create `docs/architecture.png` if needed using standard Mermaid tooling).*
