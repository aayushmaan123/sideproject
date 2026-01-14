"""
Conversation service integrating LLM into conversation flow.

This module bridges session management (Stage 2.1) with LLM infrastructure (Stage 2.2)
to enable AI-powered conversations while maintaining thread safety and proper error handling.
"""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from app.core.ai_exceptions import (
    LLMProviderException,
    LLMTimeoutException,
    LLMValidationException
)
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger
from app.schemas.session import Message, MessageRole, Session
from app.services.llm_client import LLMResponse, llm_client
from app.services.prompt_loader import prompt_loader
from app.services.session_service import session_service

logger = get_logger(__name__)


class ConversationService:
    """
    Service for AI-powered conversation management.
    
    Integrates LLM calls into the conversation flow while maintaining
    thread safety and proper session state management.
    """
    
    def __init__(
        self,
        prompt_version: str = "v1",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ):
        """
        Initialize the conversation service.
        
        Args:
            prompt_version: Version of system prompt to use (default: "v1")
            temperature: LLM temperature for response generation (default: 0.7)
            max_tokens: Maximum tokens for LLM response (default: None)
        """
        self.prompt_version = prompt_version
        self.temperature = temperature
        self.max_tokens = max_tokens
        
        logger.info(
            f"ConversationService initialized: "
            f"prompt_version={prompt_version}, temperature={temperature}"
        )
    
    async def process_user_message(
        self,
        session_id: UUID,
        user_message: str
    ) -> LLMResponse:
        """
        Process a user message and generate an AI response.
        
        This method:
        1. Validates the session exists
        2. Appends the user message to the session
        3. Loads the system prompt
        4. Calls the LLM to generate a response
        5. Appends the AI response to the session
        6. Returns the structured LLM response
        
        Args:
            session_id: The session identifier
            user_message: The user's message content
            
        Returns:
            LLMResponse containing the AI-generated response
            
        Raises:
            NotFoundException: If session does not exist
            ValidationException: If user_message is empty
            LLMProviderException: If LLM provider encounters an error
            LLMTimeoutException: If LLM request times out
            LLMValidationException: If LLM response is invalid
        """
        # Validate input
        if not user_message or not user_message.strip():
            raise ValidationException("User message cannot be empty")
        
        # Get session (raises NotFoundException if not found)
        session = await session_service.get_session(session_id)
        
        logger.info(f"Processing user message for session: {session_id}")
        
        # Add user message to session
        session = await session_service.add_message(session_id, user_message)
        
        # Load system prompt
        try:
            system_prompt = prompt_loader.load_prompt("system", self.prompt_version)
        except Exception as e:
            logger.error(f"Failed to load system prompt: {e}")
            raise LLMValidationException(
                f"Failed to load system prompt: {str(e)}"
            )
        
        # Build conversation messages for LLM
        llm_messages = self._build_llm_messages(session)
        
        # Call LLM
        try:
            llm_response = await llm_client.complete(
                system_prompt=system_prompt,
                messages=llm_messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            logger.info(
                f"LLM response generated for session {session_id}: "
                f"tokens={llm_response.tokens_used}, model={llm_response.model}"
            )
            
        except (LLMProviderException, LLMTimeoutException, LLMValidationException) as e:
            # Re-raise LLM exceptions as-is
            logger.error(f"LLM error for session {session_id}: {e}")
            raise
        except Exception as e:
            # Wrap unexpected errors
            logger.error(f"Unexpected error calling LLM for session {session_id}: {e}", exc_info=True)
            raise LLMProviderException(
                message=f"Unexpected error: {type(e).__name__}",
                provider="unknown",
                details={"error": str(e)}
            )
        
        # Add AI response to session
        ai_message = Message(
            role=MessageRole.SYSTEM,
            content=llm_response.content
        )
        
        # Manually append system message to maintain thread safety
        with session_service._lock:
            session.messages.append(ai_message)
            session.updated_at = datetime.now(timezone.utc)
        
        logger.info(f"Added AI response to session: {session_id}")
        
        return llm_response
    
    def _build_llm_messages(self, session: Session) -> list[dict[str, str]]:
        """
        Build LLM message format from session messages.
        
        Converts session Message objects to the format expected by LLM client.
        
        Args:
            session: The session containing messages
            
        Returns:
            List of message dictionaries with 'role' and 'content'
        """
        llm_messages = []
        
        for message in session.messages:
            llm_messages.append({
                "role": message.role.value,
                "content": message.content
            })
        
        return llm_messages


# Global conversation service instance
conversation_service = ConversationService()
