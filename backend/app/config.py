from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────
    DATABASE_URL: str = "sqlite:///./scampurr.db"
    USE_SQLITE: bool = True

    # ── Firebase ──────────────────────────────────
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_MOCK_AUTH: bool = True

    # ── External APIs ─────────────────────────────
    GOOGLE_SAFE_BROWSING_API_KEY: Optional[str] = None
    VIRUSTOTAL_API_KEY: Optional[str] = None

    # ── ML Service ────────────────────────────────
    USE_MOCK_ML: bool = True
    MODEL_PATH: str = "model/scam_classifier.pkl"

    # ── URL Service ───────────────────────────────
    USE_MOCK_URL: bool = True

    # ── App ───────────────────────────────────────
    APP_NAME: str = "ScamPurr AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
