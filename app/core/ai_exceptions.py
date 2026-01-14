"""
AI-specific exception classes.

This module defines exceptions related to LLM and AI operations.
"""

from typing import Any, Dict, Optional

from app.core.exceptions import BaseAppException


class AIException(BaseAppException):
    """
    Base exception for AI-related errors.
    
    All AI/LLM exceptions should inherit from this class.
    """
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=500,
            details=details
        )


class LLMProviderException(AIException):
    """Exception raised when LLM provider encounters an error."""
    
    def __init__(self, message: str, provider: str = "unknown", details: Optional[Dict[str, Any]] = None):
        error_details = details or {}
        error_details["provider"] = provider
        super().__init__(
            message=f"LLM provider error: {message}",
            details=error_details
        )


class LLMTimeoutException(AIException):
    """Exception raised when LLM request times out."""
    
    def __init__(self, timeout_seconds: int, details: Optional[Dict[str, Any]] = None):
        error_details = details or {}
        error_details["timeout_seconds"] = timeout_seconds
        super().__init__(
            message=f"LLM request timed out after {timeout_seconds} seconds",
            details=error_details
        )


class LLMValidationException(AIException):
    """Exception raised when LLM response fails validation."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=f"LLM response validation failed: {message}",
            details=details
        )


class PromptLoadException(AIException):
    """Exception raised when prompt file cannot be loaded."""
    
    def __init__(self, prompt_name: str, reason: str, details: Optional[Dict[str, Any]] = None):
        error_details = details or {}
        error_details["prompt_name"] = prompt_name
        super().__init__(
            message=f"Failed to load prompt '{prompt_name}': {reason}",
            details=error_details
        )
