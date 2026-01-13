"""
Centralized logging configuration.

This module provides structured logging with timestamps and configurable
log levels. Currently outputs to console only; file logging can be added
in future stages.
"""

import logging
import sys
from typing import Any

from app.core.config import settings


def setup_logging() -> None:
    """
    Configure application-wide logging.
    
    Sets up structured logging with:
    - Timestamps in ISO format
    - Log level from configuration
    - Console output with color support
    - Consistent format across the application
    """
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Create formatter with timestamp
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates
    root_logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Set log level for uvicorn loggers
    logging.getLogger("uvicorn").setLevel(log_level)
    logging.getLogger("uvicorn.access").setLevel(log_level)
    logging.getLogger("uvicorn.error").setLevel(log_level)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module.
    
    Args:
        name: Name of the module requesting the logger
        
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)
