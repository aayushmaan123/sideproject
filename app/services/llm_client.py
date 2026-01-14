"""
LLM client abstraction for provider-agnostic AI interactions.

This module provides a clean interface for calling Large Language Models
with support for multiple providers (OpenAI, Anthropic, etc.).
"""

import asyncio
from typing import Any, Dict, List, Optional
from abc import ABC, abstractmethod

from openai import AsyncOpenAI
from openai import APIError, APITimeoutError, RateLimitError

from app.core.config import settings
from app.core.ai_exceptions import (
    LLMProviderException,
    LLMTimeoutException,
    LLMValidationException
)
from app.core.logging import get_logger

logger = get_logger(__name__)


class LLMResponse:
    """
    Structured response from an LLM.
    
    Attributes:
        content: The text response from the LLM
        model: The model that generated the response
        tokens_used: Number of tokens used (if available)
        metadata: Additional provider-specific metadata
    """
    
    def __init__(
        self,
        content: str,
        model: str,
        tokens_used: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.content = content
        self.model = model
        self.tokens_used = tokens_used
        self.metadata = metadata or {}
    
    def __repr__(self) -> str:
        return f"LLMResponse(model={self.model}, content_length={len(self.content)}, tokens={self.tokens_used})"


class LLMClient(ABC):
    """
    Abstract base class for LLM client implementations.
    
    This enables swapping providers without changing consuming code.
    """
    
    @abstractmethod
    async def complete(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> LLMResponse:
        """
        Generate a completion from the LLM.
        
        Args:
            system_prompt: System prompt to set context
            messages: List of conversation messages with 'role' and 'content'
            temperature: Sampling temperature (0.0 to 2.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            LLMResponse containing the generated text and metadata
            
        Raises:
            LLMProviderException: If provider encounters an error
            LLMTimeoutException: If request times out
            LLMValidationException: If response is invalid
        """
        pass


class OpenAIClient(LLMClient):
    """
    OpenAI-specific LLM client implementation.
    
    Supports GPT-4, GPT-3.5, and other OpenAI models.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[int] = None
    ):
        """
        Initialize OpenAI client.
        
        Args:
            api_key: OpenAI API key (defaults to settings.LLM_API_KEY)
            model: Model name (defaults to settings.LLM_MODEL)
            timeout: Request timeout in seconds (defaults to settings.LLM_TIMEOUT)
        """
        self.api_key = api_key or settings.LLM_API_KEY
        self.model = model or settings.LLM_MODEL
        self.timeout = timeout or settings.LLM_TIMEOUT
        
        # Initialize async OpenAI client
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            timeout=self.timeout
        )
        
        logger.info(f"OpenAI client initialized: model={self.model}, timeout={self.timeout}s")
    
    async def complete(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> LLMResponse:
        """
        Generate a completion using OpenAI's API.
        
        Args:
            system_prompt: System prompt to set context
            messages: List of conversation messages with 'role' and 'content'
            temperature: Sampling temperature (0.0 to 2.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            LLMResponse containing the generated text and metadata
            
        Raises:
            LLMProviderException: If OpenAI API encounters an error
            LLMTimeoutException: If request times out
            LLMValidationException: If response is invalid
        """
        # Validate inputs
        if not system_prompt or not system_prompt.strip():
            raise LLMValidationException("System prompt cannot be empty")
        
        if not messages:
            raise LLMValidationException("Messages list cannot be empty")
        
        # Build full message list with system prompt
        full_messages = [{"role": "system", "content": system_prompt}]
        full_messages.extend(messages)
        
        # Log request (no sensitive content)
        logger.info(f"OpenAI request: model={self.model}, messages={len(full_messages)}, temp={temperature}")
        
        try:
            # Make API call
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=full_messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # Extract response content
            if not response.choices or len(response.choices) == 0:
                raise LLMValidationException("No choices in OpenAI response")
            
            content = response.choices[0].message.content
            
            if not content or not content.strip():
                raise LLMValidationException("Empty content in OpenAI response")
            
            # Extract metadata
            tokens_used = None
            if hasattr(response, 'usage') and response.usage:
                tokens_used = response.usage.total_tokens
            
            metadata = {
                "finish_reason": response.choices[0].finish_reason if response.choices else None,
                "prompt_tokens": response.usage.prompt_tokens if hasattr(response, 'usage') and response.usage else None,
                "completion_tokens": response.usage.completion_tokens if hasattr(response, 'usage') and response.usage else None,
            }
            
            # Log success (no content)
            logger.info(f"OpenAI response: tokens={tokens_used}, finish_reason={metadata['finish_reason']}")
            
            return LLMResponse(
                content=content.strip(),
                model=self.model,
                tokens_used=tokens_used,
                metadata=metadata
            )
            
        except APITimeoutError as e:
            logger.error(f"OpenAI request timed out: {e}")
            raise LLMTimeoutException(
                timeout_seconds=self.timeout,
                details={"error": str(e)}
            )
        
        except RateLimitError as e:
            logger.error(f"OpenAI rate limit exceeded: {e}")
            raise LLMProviderException(
                message="Rate limit exceeded",
                provider="openai",
                details={"error": str(e)}
            )
        
        except APIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise LLMProviderException(
                message=str(e),
                provider="openai",
                details={"status_code": e.status_code if hasattr(e, 'status_code') else None}
            )
        
        except Exception as e:
            logger.error(f"Unexpected error in OpenAI client: {e}", exc_info=True)
            raise LLMProviderException(
                message=f"Unexpected error: {type(e).__name__}",
                provider="openai",
                details={"error": str(e)}
            )


def create_llm_client(provider: Optional[str] = None) -> LLMClient:
    """
    Factory function to create an LLM client based on provider.
    
    Args:
        provider: Provider name (openai, anthropic, etc.)
                 Defaults to settings.LLM_PROVIDER
    
    Returns:
        LLMClient instance for the specified provider
        
    Raises:
        ValueError: If provider is not supported
    """
    provider = provider or settings.LLM_PROVIDER
    provider = provider.lower()
    
    if provider == "openai":
        return OpenAIClient()
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")


# Global LLM client instance
llm_client = create_llm_client()
