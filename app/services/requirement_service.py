"""
Requirement extraction service.

This module provides a service for extracting structured website requirements
from AI conversation responses. It uses LLM to analyze conversation context
and extract key information about the website being built.
"""

import json
import threading
from typing import Dict, Optional
from uuid import UUID

from app.core.ai_exceptions import (
    AIException,
    LLMProviderException,
    LLMTimeoutException,
    LLMValidationException
)
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger
from app.schemas.requirement import WebsiteRequirement
from app.services.llm_client import llm_client
from app.services.prompt_loader import prompt_loader
from app.services.session_service import session_service

logger = get_logger(__name__)


class RequirementService:
    """
    Service for extracting structured requirements from conversation.
    
    This service uses LLM to analyze AI responses and conversation context
    to extract structured website requirements. It maintains a thread-safe
    mapping of session IDs to requirements.
    """
    
    def __init__(self, temperature: float = 0.3):
        """
        Initialize the requirement service.
        
        Args:
            temperature: LLM temperature for requirement extraction (default: 0.3)
                        Lower temperature for more deterministic extraction
        """
        self._requirements: Dict[UUID, WebsiteRequirement] = {}
        self._lock = threading.RLock()
        self.temperature = temperature
        
        logger.info(
            f"RequirementService initialized (temperature={temperature})"
        )
    
    async def extract_requirements(
        self,
        session_id: UUID,
        ai_response: str
    ) -> WebsiteRequirement:
        """
        Extract structured requirements from AI response using LLM.
        
        This method analyzes the full conversation context using an LLM
        to extract structured information about the website being built.
        
        Args:
            session_id: The session identifier
            ai_response: The AI-generated response to analyze
            
        Returns:
            WebsiteRequirement object with extracted information
            
        Raises:
            NotFoundException: If session does not exist
            ValidationException: If ai_response is empty
            LLMProviderException: If LLM provider encounters an error
            LLMTimeoutException: If LLM request times out
            LLMValidationException: If LLM response is invalid
        """
        # Validate input
        if not ai_response or not ai_response.strip():
            raise ValidationException("AI response cannot be empty")
        
        # Verify session exists (raises NotFoundException if not found)
        session = await session_service.get_session(session_id)
        
        logger.info(f"Extracting requirements for session: {session_id}")
        
        # Build conversation context for LLM
        conversation_context = self._build_conversation_context(session)
        
        # Create or update requirement using LLM extraction
        try:
            # Load specialized extraction prompt
            extraction_prompt = prompt_loader.load_prompt("requirement", "v1")
            
            # Build messages for LLM
            messages = [
                {
                    "role": "user",
                    "content": f"Extract structured requirements from this conversation:\n\n{conversation_context}"
                }
            ]
            
            # Call LLM with low temperature for deterministic extraction
            logger.info(f"Calling LLM for requirement extraction (session: {session_id})")
            llm_response = await llm_client.complete(
                system_prompt=extraction_prompt,
                messages=messages,
                temperature=self.temperature,
                max_tokens=500
            )
            
            # Parse LLM response as JSON
            extracted_data = self._parse_llm_response(llm_response.content)
            
            # Create requirement from extracted data
            requirement = WebsiteRequirement(
                session_id=session_id,
                business_type=extracted_data.get("business_type"),
                key_features=extracted_data.get("key_features", []),
                target_audience=extracted_data.get("target_audience"),
                design_preferences=extracted_data.get("design_preferences"),
                additional_notes=extracted_data.get("additional_notes")
            )
            
            # Store requirement (thread-safe)
            with self._lock:
                self._requirements[session_id] = requirement
            
            logger.info(
                f"Requirements extracted for session {session_id}: "
                f"business_type={requirement.business_type}, "
                f"features={len(requirement.key_features)}, "
                f"tokens={llm_response.tokens_used}"
            )
            
            return requirement
            
        except (LLMProviderException, LLMTimeoutException, LLMValidationException) as e:
            # Re-raise LLM exceptions as-is
            logger.error(f"LLM error during requirement extraction: {e}")
            raise
        except AIException as e:
            # Re-raise other AI exceptions
            logger.error(f"AI error during requirement extraction: {e}")
            raise
        except Exception as e:
            # Wrap unexpected errors
            logger.error(
                f"Unexpected error extracting requirements for session {session_id}: {e}",
                exc_info=True
            )
            raise LLMValidationException(
                f"Failed to extract requirements: {type(e).__name__}",
                details={"error": str(e), "session_id": str(session_id)}
            )
    
    async def get_requirements(self, session_id: UUID) -> Optional[WebsiteRequirement]:
        """
        Get extracted requirements for a session.
        
        Args:
            session_id: The session identifier
            
        Returns:
            WebsiteRequirement if exists, None otherwise
        """
        with self._lock:
            return self._requirements.get(session_id)
    
    def _build_conversation_context(self, session) -> str:
        """
        Build conversation context string from session messages.
        
        Args:
            session: The session containing messages
            
        Returns:
            String representation of conversation
        """
        context_parts = []
        for message in session.messages:
            role = "User" if message.role.value == "user" else "AI"
            context_parts.append(f"{role}: {message.content}")
        
        return "\n".join(context_parts)
    
    def _parse_llm_response(self, llm_content: str) -> Dict:
        """
        Parse LLM response as JSON.
        
        Args:
            llm_content: The LLM-generated content to parse
            
        Returns:
            Parsed dictionary with requirement fields
            
        Raises:
            LLMValidationException: If response is not valid JSON
        """
        try:
            # Clean up the response (remove markdown code blocks if present)
            content = llm_content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            # Parse JSON
            data = json.loads(content)
            
            # Validate required structure
            if not isinstance(data, dict):
                raise LLMValidationException(
                    "LLM response is not a JSON object",
                    details={"response": llm_content[:200]}
                )
            
            # Ensure key_features is a list
            if "key_features" in data and not isinstance(data["key_features"], list):
                data["key_features"] = []
            
            return data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            raise LLMValidationException(
                f"Invalid JSON in LLM response: {e}",
                details={"response": llm_content[:200], "error": str(e)}
            )
        except LLMValidationException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error parsing LLM response: {e}")
            raise LLMValidationException(
                f"Failed to parse LLM response: {type(e).__name__}",
                details={"error": str(e)}
            )


# Global requirement service instance
requirement_service = RequirementService()
