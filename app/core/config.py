"""
Application configuration management using Pydantic Settings.

This module provides centralized configuration management with environment
variable support. All settings can be overridden via environment variables
or a .env file.
"""

from typing import List, Union
from pydantic import field_validator
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
    ALLOWED_ORIGINS: Union[List[str], str] = "http://localhost:3000,http://localhost:8000"
    LOG_LEVEL: str = "INFO"
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse ALLOWED_ORIGINS from comma-separated string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
