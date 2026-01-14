"""
FastAPI Application Entry Point

This is the main application file for the AI Website Builder backend.
It configures the FastAPI app, middleware, exception handlers, and routes.

Stage 1: Stable Backend Foundation
- No AI integration yet
- No database connections yet
- No authentication yet
- Clean, production-ready structure
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator, Dict

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from app.api.conversation import router as conversation_router
from app.api.health import router as health_router
from app.api.requirement import router as requirement_router
from app.core.config import settings
from app.core.exceptions import (
    BaseAppException,
    base_exception_handler,
    general_exception_handler,
)
from app.core.logging import get_logger, setup_logging

# Configure logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager.
    
    Handles startup and shutdown events:
    - Startup: Initialize resources, connections, etc.
    - Shutdown: Clean up resources
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME}")
    logger.info(f"Environment: {settings.ENV}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Production-ready FastAPI backend for AI Website Builder",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(BaseAppException, base_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include API routers
app.include_router(health_router)
app.include_router(conversation_router)
app.include_router(requirement_router)


@app.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=Dict[str, str],
    summary="Root Endpoint",
    description="Welcome message and basic API information"
)
async def root() -> Dict[str, str]:
    """
    Root endpoint providing welcome message and API information.
    
    Returns:
        Dictionary with welcome message and next steps
    """
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": "0.1.0",
        "stage": "Stage 2.1: Session & Conversation State Management",
        "status": "operational",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
