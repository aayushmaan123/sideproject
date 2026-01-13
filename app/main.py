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

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.exceptions import (
    BaseAppException,
    base_exception_handler,
    http_exception_handler,
    general_exception_handler
)
from app.api.health import router as health_router

# Configure logging
setup_logging()
logger = get_logger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Production-ready FastAPI backend for AI Website Builder",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
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


@app.on_event("startup")
async def startup_event():
    """
    Application startup event handler.
    
    Executes when the application starts. Useful for:
    - Initializing database connections (future)
    - Loading ML models (future)
    - Setting up background tasks (future)
    """
    logger.info(f"Starting {settings.APP_NAME}")
    logger.info(f"Environment: {settings.ENV}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info("Application startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event handler.
    
    Executes when the application shuts down. Useful for:
    - Closing database connections (future)
    - Cleanup tasks (future)
    """
    logger.info("Shutting down application")


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
        "stage": "Stage 1: Stable Backend Foundation",
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
