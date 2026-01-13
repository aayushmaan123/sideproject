"""
Application configuration management using Pydantic Settings.

This module provides centralized configuration management with environment
variable support. All settings can be overridden via environment variables
or a .env file.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Attributes:
        ENV: Application environment (development, staging, production)
        DEBUG: Enable debug mode
        APP_NAME: Application name
        ALLOWED_ORIGINS: List of allowed CORS origins
        LOG_LEVEL: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    
    ENV: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "AI Website Builder"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    LOG_LEVEL: str = "INFO"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
