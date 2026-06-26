# ClariMed Production Deployment Guide

This document provides a comprehensive blueprint and checklist for deploying ClariMed in production environments. ClariMed is designed as a decoupled full-stack application (FastAPI backend + Next.js frontend).

---

## 1. Production Prerequisites Checklist

Before executing any deployment actions, verify that the following infrastructure services and credentials are ready:

- [ ] **PostgreSQL Database:** Staging/Production PostgreSQL database instance (v15+) with connection credentials.
- [ ] **Vector Database (Qdrant):** A deployed Qdrant instance (local cluster or Qdrant Cloud) with API key authorization.
- [ ] **Google Gemini API Key:** Active API credentials for the Google GenAI SDK.
- [ ] **Custom Domains & DNS:** Dedicated subdomains for the client (e.g. `app.clarimed.example.com`) and the API (e.g. `api.clarimed.example.com`).
- [ ] **SSL/TLS Certificates:** SSL certs ready (or managed automatically via LetsEncrypt / Cloudflare).
- [ ] **Docker Engine & Compose:** Installed on target servers if using containerized virtual machine deployment.

---

## 2. Environment Configurations

All production credentials must be set via the runtime environment (never committed directly to GitHub).

### Backend Production Environment (`backend/.env`)

| Variable | Description | Recommended Production Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://[user]:[pass]@[host]:5432/[dbname]?sslmode=require` |
| `QDRANT_HOST` | Qdrant host URL | `https://your-qdrant-instance.qdrant.io` (or cloud instance) |
| `QDRANT_PORT` | Qdrant connection port | `6333` (or `443` for cloud over TLS) |
| `QDRANT_API_KEY` | Qdrant authorization key | A secure token generated via Qdrant Console |
| `GEMINI_API_KEY` | Google Gemini API Key | Your Gemini developer token |
| `JWT_SECRET` | Secret key for JWT hashing | Run `openssl rand -hex 32` to generate a 256-bit secure key |
| `UPLOAD_DIR` | Path to save temporary files | `/app/uploads` (for Docker) or `/tmp` |
| `ENVIRONMENT` | Target execution context | `production` (enforces secure flags on HTTP cookies) |
| `BACKEND_CORS_ORIGINS` | Permitted cross-origin endpoints | `["https://app.clarimed.example.com"]` (strictly limits frontend domain access) |

### Frontend Production Environment (`frontend/.env.production`)

| Variable | Description | Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Deployed URL of FastAPI backend | `https://api.clarimed.example.com` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL of FastAPI backend | `wss://api.clarimed.example.com` |

---

## 3. Database Setups & Migrations

For production databases (such as **Neon**, **Supabase**, or **AWS RDS**):

1. **Verify Connection over SSL:** Confirm that your connection string includes `sslmode=require` (or similar depending on target hosting).
2. **Apply Database Migrations:**
   Run the Alembic migrations from your local management container or CI/CD deployment runner targeting the production database URL:
   ```bash
   DATABASE_URL="postgresql://user:password@production-db-host:5432/dbname?sslmode=require" alembic upgrade head
   ```
3. **Database Pooling:** Ensure database connection pooling is optimized on the hosting environment (e.g. using PgBouncer for serverless environments like Neon or Supabase to prevent connection limit exhaustion).

---

## 4. Backend Deployment Models

### Option A: Railway (or Render) Serverless Host
This is the simplest hosting path for the FastAPI backend:
1. Connect your repository to **Railway/Render**.
2. Set the root directory of the application component to `/backend`.
3. Set the buildpack/runtime context to Python 3.11.
4. Add all environment variables from Section 2 in the Railway/Render Environment tab.
5. Set the Start Command to:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4
   ```
6. Set up the Health Check path to `/health` to allow automatic recovery in case of processes failing.

### Option B: Docker Container on VM (AWS EC2 / DigitalOcean)
We provide a [Dockerfile](file:///e:/CODING/ClariMed/backend/Dockerfile) in the backend folder.
1. Build the production image:
   ```bash
   docker build -t clarimed-backend:latest ./backend
   ```
2. Run the container, binding database parameters and persisting uploads:
   ```bash
   docker run -d \
     --name clarimed-backend \
     -p 8000:8000 \
     -v clarimed_uploads:/app/uploads \
     --env-file .env.production \
     clarimed-backend:latest
   ```

---

## 5. Frontend Deployment Models

### Option A: Vercel (Recommended)
Next.js applications compile and optimize automatically when running on Vercel:
1. Connect your GitHub repository to Vercel.
2. Select `/frontend` as the **Root Directory**.
3. Vercel automatically detects the Next.js framework configuration.
4. Configure the environment variables in the settings tab:
   - `NEXT_PUBLIC_API_URL` = `https://api.clarimed.example.com`
   - `NEXT_PUBLIC_WS_URL` = `wss://api.clarimed.example.com`
5. Trigger **Deploy**. Vercel will optimize your client bundle, hydrate styles, and host the client globally.

### Option B: Docker / Self-Hosted
A [Dockerfile](file:///e:/CODING/ClariMed/frontend/Dockerfile) is included for containerized Next.js hosting.
1. Build the image:
   ```bash
   docker build -t clarimed-frontend:latest ./frontend
   ```
2. Run container:
   ```bash
   docker run -d -p 3000:3000 --env-file .env.production clarimed-frontend:latest
   ```

---

## 6. Security and Hardening Guidelines

Before finalizing your deployment, review the following production security checklist:

- [ ] **Cookie Security:** Double check that `ENVIRONMENT` is set to `production` in the backend variables. When set to `production`, the backend enforces `secure=True` (HTTPS only) on JWT access tokens.
- [ ] **CORS Scoping:** Restrict `BACKEND_CORS_ORIGINS` to the exact frontend domain. Never allow `*` (wildcards) in production.
- [ ] **Limit Swagger Documentation:** In `backend/app/main.py`, disable Swagger UI (`docs_url=None`, `redoc_url=None`) when in production to mitigate potential vector scans of your routes:
  ```python
  # e.g., main.py initialization
  app = FastAPI(
      title="ClariMed AI API",
      docs_url=None if settings.ENVIRONMENT == "production" else "/docs",
      redoc_url=None if settings.ENVIRONMENT == "production" else "/redoc"
  )
  ```
- [ ] **AWS S3 / Cloud Blob Storage Migration:** Replace the local `/uploads` directory with a secure cloud storage solution (such as encrypted Amazon S3 buckets) to store medical reports safely.
- [ ] **Enable Rate Limiting:** Introduce rate-limiting middleware (such as `slowapi` or an Nginx/Cloudflare WAF proxy layer) on endpoints like `/auth/login` and `/reports/upload` to prevent Denial of Service (DoS) and brute-force vulnerabilities.
- [ ] **Audit Trail:** Maintain database logs of all read/write events referencing patient records to prepare the platform for HIPAA compliance audits.
