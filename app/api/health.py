"""
Health check endpoints.

This module provides health check endpoints for monitoring and
service discovery.
"""

from typing import Dict
from fastapi import APIRouter, status
from datetime import datetime

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    response_model=Dict[str, str],
    summary="Health Check",
    description="Returns the health status of the application"
)
async def health_check() -> Dict[str, str]:
    """
    Check application health.
    
    Returns:
        Dictionary containing health status, environment, and timestamp
    """
    return {
        "status": "healthy",
        "environment": settings.ENV,
        "app_name": settings.APP_NAME,
        "timestamp": datetime.utcnow().isoformat()
    }
