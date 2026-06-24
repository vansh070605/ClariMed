# Deployment Guide

ClariMed is designed as a decoupled full-stack application.

## Local Development

The fastest way to run ClariMed locally is via Docker Compose.

```bash
docker-compose up -d
```
*This spins up PostgreSQL and the FastAPI backend.*

## Production Deployment

### 1. Database: Neon (or Supabase)
We recommend Serverless Postgres platforms like Neon or Supabase.
- Create a new project.
- Copy the Connection String and set it as `DATABASE_URL`.
- Run migrations from your local machine targeting the remote DB:
  `DATABASE_URL="postgres://..." alembic upgrade head`

### 2. Backend: Railway (or Render)
- Connect your GitHub repository to Railway.
- Set the root directory to `backend/`.
- Railway will automatically detect the Python environment.
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 3. Frontend: Vercel
- Connect your GitHub repository to Vercel.
- Set the Root Directory to `frontend/`.
- Next.js will automatically be detected and optimized.

---

## Environment Variables Reference

### Backend `.env`

```env
# Database Connection String
DATABASE_URL=postgresql://user:pass@host:5432/db

# Secret key for JWT hashing. Generate via `openssl rand -hex 32`
JWT_SECRET=your-secure-secret-here

# API Key for Gemini (Used for Evidence-Based Summaries)
GEMINI_API_KEY=your_gemini_api_key

# Temporary storage path for parsed PDFs
UPLOAD_DIR=./uploads

# Set to "production" to enforce Secure cookies for Auth
ENVIRONMENT=production
```

### Frontend `.env.local`

```env
# Point this to the deployed Railway backend URL
NEXT_PUBLIC_API_URL=https://clarimed-backend.up.railway.app
```
