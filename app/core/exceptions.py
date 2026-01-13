"""
Custom exception classes and HTTP exception handlers.

This module defines application-specific exceptions and provides
FastAPI exception handlers for consistent error responses.
"""

from typing import Any, Dict
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class BaseAppException(Exception):
    """
    Base exception class for application-specific exceptions.
    
    All custom exceptions should inherit from this class to enable
    consistent error handling across the application.
    """
    
    def __init__(self, message: str, status_code: int = 500, details: Dict[str, Any] = None):
        """
        Initialize the exception.
        
        Args:
            message: Human-readable error message
            status_code: HTTP status code
            details: Additional error details
        """
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(BaseAppException):
    """Exception raised when input validation fails."""
    
    def __init__(self, message: str, details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )


class NotFoundException(BaseAppException):
    """Exception raised when a requested resource is not found."""
    
    def __init__(self, message: str, details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            details=details
        )


class ServiceException(BaseAppException):
    """Exception raised when a service operation fails."""
    
    def __init__(self, message: str, details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details
        )


async def base_exception_handler(request: Request, exc: BaseAppException) -> JSONResponse:
    """
    Handle custom application exceptions.
    
    Args:
        request: The incoming request
        exc: The exception that was raised
        
    Returns:
        JSON response with error details
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "details": exc.details,
            "path": str(request.url.path)
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle FastAPI HTTP exceptions.
    
    Args:
        request: The incoming request
        exc: The HTTP exception that was raised
        
    Returns:
        JSON response with error details
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "path": str(request.url.path)
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions.
    
    Args:
        request: The incoming request
        exc: The exception that was raised
        
    Returns:
        JSON response with generic error message
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "An unexpected error occurred",
            "path": str(request.url.path)
        }
    )
