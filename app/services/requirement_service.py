"""
Requirement extraction service.

This module provides a service for extracting structured website requirements
from AI conversation responses. It uses LLM to analyze conversation context
and extract key information about the website being built.
"""

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
from app.schemas.session import WebsiteRequirement
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
        Extract structured requirements from AI response.
        
        This method analyzes the AI response and conversation context to
        extract structured information about the website being built.
        
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
        
        # Check if we already have requirements for this session
        with self._lock:
            existing_requirement = self._requirements.get(session_id)
        
        # For now, create a simple requirement structure
        # In a real implementation, this would call LLM to extract structured data
        # from the conversation history
        
        # Build conversation context for LLM
        conversation_context = self._build_conversation_context(session)
        
        # Create or update requirement
        try:
            # In a full implementation, we would:
            # 1. Load a specialized extraction prompt
            # 2. Call LLM with conversation context
            # 3. Parse LLM response into structured fields
            
            # For Stage 2.4.1, we'll create a basic requirement
            # that can be enhanced in later stages
            requirement = WebsiteRequirement(
                session_id=session_id,
                business_type=self._extract_business_type(conversation_context),
                key_features=self._extract_key_features(conversation_context),
                target_audience=None,  # To be extracted with LLM
                design_preferences=None,  # To be extracted with LLM
                additional_notes=f"Extracted from {len(session.messages)} messages"
            )
            
            # Store requirement
            with self._lock:
                self._requirements[session_id] = requirement
            
            logger.info(
                f"Requirements extracted for session {session_id}: "
                f"business_type={requirement.business_type}, "
                f"features={len(requirement.key_features)}"
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
    
    def _extract_business_type(self, context: str) -> Optional[str]:
        """
        Extract business type from conversation context.
        
        Simple keyword-based extraction. In production, this would use LLM.
        
        Args:
            context: Conversation context string
            
        Returns:
            Business type if detected, None otherwise
        """
        context_lower = context.lower()
        
        # Simple keyword matching (to be replaced with LLM extraction)
        business_types = {
            "bakery": ["bakery", "bakeries", "bake shop"],
            "restaurant": ["restaurant", "cafe", "bistro", "diner"],
            "portfolio": ["portfolio", "showcase", "personal site"],
            "ecommerce": ["shop", "store", "ecommerce", "e-commerce", "sell"],
            "blog": ["blog", "blogging", "articles"],
            "corporate": ["business", "company", "corporate", "enterprise"]
        }
        
        for btype, keywords in business_types.items():
            if any(keyword in context_lower for keyword in keywords):
                return btype
        
        return None
    
    def _extract_key_features(self, context: str) -> list[str]:
        """
        Extract key features from conversation context.
        
        Simple keyword-based extraction. In production, this would use LLM.
        
        Args:
            context: Conversation context string
            
        Returns:
            List of detected features
        """
        context_lower = context.lower()
        features = []
        
        # Simple keyword matching (to be replaced with LLM extraction)
        feature_keywords = {
            "menu": ["menu", "food items", "offerings"],
            "online ordering": ["order", "ordering", "cart", "checkout"],
            "contact form": ["contact", "contact form", "get in touch"],
            "gallery": ["gallery", "photos", "images", "showcase"],
            "blog": ["blog", "articles", "posts", "news"],
            "booking": ["booking", "reservation", "appointment"],
            "payment": ["payment", "pay", "checkout", "stripe"],
            "reviews": ["reviews", "testimonials", "feedback"]
        }
        
        for feature, keywords in feature_keywords.items():
            if any(keyword in context_lower for keyword in keywords):
                if feature not in features:
                    features.append(feature)
        
        return features


# Global requirement service instance
requirement_service = RequirementService()
