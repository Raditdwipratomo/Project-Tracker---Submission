import json
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env files."""

    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "Simple Task / Project Tracker API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: Literal["development", "test", "production"] = "development"

    DATABASE_URL: str
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("DATABASE_URL must not be empty")
        return cleaned

    @property
    def async_database_url(self) -> str:
        """Normalize standard PostgreSQL URLs to use the asyncpg driver."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            return "postgresql+asyncpg://" + url[len("postgres://") :]
        if url.startswith("postgresql://"):
            return "postgresql+asyncpg://" + url[len("postgresql://") :]
        return url

    @property
    def cors_origins(self) -> list[str]:
        """Parse ALLOWED_ORIGINS from either comma-separated string or JSON list."""
        raw = self.ALLOWED_ORIGINS.strip()
        if not raw:
            return []
        if raw.startswith("["):
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return [str(origin).strip() for origin in parsed if str(origin).strip()]
        return [origin.strip() for origin in raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings instance."""
    return Settings()
