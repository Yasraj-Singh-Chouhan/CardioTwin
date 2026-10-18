import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CardioTwin API"
    VERSION: str = "4.8b"
    DESCRIPTION: str = (
        "Physiologically-Grounded Digital Twin for Early Warning of Hypertensive Crisis "
        "in the Indian Population"
    )
    API_PREFIX: str = "/api"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = False
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",
    ]
    
    # Engine & Calibration Settings
    ENGINE_MODE: str = "LIVE_TWIN"
    REPLAY_BUFFER_DAYS: int = 7
    CRISIS_SBP_THRESHOLD: float = 180.0
    CRISIS_DBP_THRESHOLD: float = 120.0
    NOMINAL_TDI_THRESHOLD: float = 25.0
    ALERT_TDI_THRESHOLD: float = 50.0
    
    # Storage Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MOCKS_DIR: str = os.path.join(BASE_DIR, "mocks")
    DATA_DIR: str = os.path.join(BASE_DIR, "app", "data")
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'app', 'data', 'ehr.db')}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
