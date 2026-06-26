import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from jose import jwt, JWTError
from app.core.config import settings as core_settings


# --- Configuration ---
class Settings(BaseSettings):
    app_name: str = "ClariMed AI API"
    version: str = "1.0.0"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/clarimed"
    qdrant_url: str = "http://localhost:6333"
    gemini_api_key: str = ""
    allowed_origins: str = "http://localhost:3000,http://localhost:3001"

    class Config:
        env_file = ".env"


settings = Settings()

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# --- FastAPI Initialization ---
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Backend API for ClariMed AI - An Explainable Healthcare Copilot",
)

# CORS Configuration
origins = [
    origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---


@app.on_event("startup")
async def startup_event():
    logger.info("Starting up ClariMed AI API...")
    logger.info(f"CORS Allowed Origins: {origins}")
    # Add initializations for DB, Qdrant here later


@app.get("/")
def read_root():
    return {"message": "Welcome to ClariMed AI API"}


@app.get("/health")
def health_check():
    """Basic health check endpoint"""
    return {"status": "healthy", "version": settings.version}


@app.get("/health/deep")
def deep_health_check():
    """Deep health check to verify connections to Postgres, Qdrant, etc. (To be implemented)"""
    return {"status": "healthy", "database": "pending", "qdrant": "pending"}


# --- WebSockets ---
from app.websockets import manager


@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.cookies.get("access_token")
    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = jwt.decode(
            token, core_settings.JWT_SECRET, algorithms=[core_settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            # We don't expect messages from client for now, just keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


# --- Routes ---
from app.auth.router import router as auth_router
from app.reports.router import router as reports_router
from app.trends.router import router as trends_router
from app.dashboard.router import router as dashboard_router
from app.share.router import router as share_router
from app.chat.router import router as chat_router

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(reports_router, prefix="/reports", tags=["Reports"])
app.include_router(trends_router, prefix="/trends", tags=["Trends"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(share_router, prefix="/share", tags=["Share"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
