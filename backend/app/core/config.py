from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "ClariMed AI API"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/clarimed"
    QDRANT_URL: str = "http://localhost:6333"
    GEMINI_API_KEY: str = "[GCP_API_KEY]"
    JWT_SECRET: str = "[ENCRYPTION_KEY]"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    UPLOAD_DIR: str = "/app/uploads"

    class Config:
        env_file = ".env"


settings = Settings()
