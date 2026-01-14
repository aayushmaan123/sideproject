"""
Prompt loading and management service.

This module handles loading system prompts from versioned files,
providing a clean separation between code and prompt content.
"""

import os
from pathlib import Path
from typing import Dict, Optional

from app.core.ai_exceptions import PromptLoadException
from app.core.logging import get_logger

logger = get_logger(__name__)


class PromptLoader:
    """
    Service for loading and managing system prompts.
    
    Prompts are stored as versioned text files in app/prompts/
    and loaded on-demand. This allows prompt updates without code changes.
    """
    
    def __init__(self, prompts_dir: Optional[Path] = None):
        """
        Initialize the prompt loader.
        
        Args:
            prompts_dir: Directory containing prompt files. 
                        Defaults to app/prompts/
        """
        if prompts_dir is None:
            # Default to app/prompts/ relative to this file's location
            current_file = Path(__file__)
            app_dir = current_file.parent.parent
            prompts_dir = app_dir / "prompts"
        
        self.prompts_dir = prompts_dir
        self._cache: Dict[str, str] = {}
        
        logger.info(f"PromptLoader initialized with directory: {self.prompts_dir}")
    
    def load_prompt(self, prompt_name: str, version: str = "v1", use_cache: bool = True) -> str:
        """
        Load a prompt from file.
        
        Args:
            prompt_name: Name of the prompt (e.g., 'system')
            version: Version of the prompt (default: 'v1')
            use_cache: Whether to use cached prompts (default: True)
            
        Returns:
            The prompt content as a string
            
        Raises:
            PromptLoadException: If prompt file cannot be loaded
        """
        cache_key = f"{prompt_name}_{version}"
        
        # Check cache first
        if use_cache and cache_key in self._cache:
            logger.debug(f"Loading prompt from cache: {cache_key}")
            return self._cache[cache_key]
        
        # Construct file path
        filename = f"{prompt_name}_{version}.txt"
        file_path = self.prompts_dir / filename
        
        # Load from file
        try:
            if not file_path.exists():
                raise PromptLoadException(
                    prompt_name=cache_key,
                    reason=f"File not found: {file_path}",
                    details={"file_path": str(file_path)}
                )
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            if not content:
                raise PromptLoadException(
                    prompt_name=cache_key,
                    reason="File is empty",
                    details={"file_path": str(file_path)}
                )
            
            # Cache the content
            self._cache[cache_key] = content
            logger.info(f"Loaded prompt: {cache_key} ({len(content)} characters)")
            
            return content
            
        except PromptLoadException:
            # Re-raise our own exceptions
            raise
        except Exception as e:
            # Wrap unexpected errors
            raise PromptLoadException(
                prompt_name=cache_key,
                reason=str(e),
                details={"file_path": str(file_path), "error_type": type(e).__name__}
            )
    
    def clear_cache(self) -> None:
        """Clear the prompt cache."""
        self._cache.clear()
        logger.info("Prompt cache cleared")
    
    def list_available_prompts(self) -> list[str]:
        """
        List all available prompt files.
        
        Returns:
            List of prompt filenames
        """
        try:
            if not self.prompts_dir.exists():
                return []
            
            return [
                f.name for f in self.prompts_dir.iterdir()
                if f.is_file() and f.suffix == '.txt'
            ]
        except Exception as e:
            logger.error(f"Failed to list prompts: {e}")
            return []


# Global prompt loader instance
prompt_loader = PromptLoader()
