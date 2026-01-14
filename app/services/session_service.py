"""
Session service for managing conversation state.

This module provides a thread-safe in-memory session store for
Stage 2.1 conversation state management. No AI logic included.
"""

import threading
from datetime import datetime, timezone
from typing import Dict, Optional
from uuid import UUID

from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger
from app.schemas.session import Message, MessageRole, Session, SessionStatus

logger = get_logger(__name__)


class SessionService:
    """
    Thread-safe in-memory session store.
    
    Manages conversation sessions without any AI or database logic.
    Provides CRUD operations for session state management.
    """
    
    def __init__(self):
        """Initialize the session service with thread-safe storage."""
        self._sessions: Dict[UUID, Session] = {}
        self._lock = threading.RLock()
        logger.info("SessionService initialized (in-memory store)")
    
    async def create_session(self, initial_message: str) -> Session:
        """
        Create a new conversation session.
        
        Args:
            initial_message: The user's first message
            
        Returns:
            Newly created session with the initial message
            
        Raises:
            ValidationException: If initial_message is empty
        """
        if not initial_message or not initial_message.strip():
            raise ValidationException("Initial message cannot be empty")
        
        # Create new session
        session = Session()
        
        # Add initial user message
        user_message = Message(
            role=MessageRole.USER,
            content=initial_message.strip()
        )
        session.messages.append(user_message)
        
        # Store session
        with self._lock:
            self._sessions[session.session_id] = session
        
        logger.info(f"Created session: {session.session_id}")
        return session
    
    async def get_session(self, session_id: UUID) -> Session:
        """
        Retrieve a session by ID.
        
        Args:
            session_id: The session identifier
            
        Returns:
            The requested session
            
        Raises:
            NotFoundException: If session does not exist
        """
        with self._lock:
            session = self._sessions.get(session_id)
        
        if not session:
            raise NotFoundException(
                f"Session not found",
                details={"session_id": str(session_id)}
            )
        
        return session
    
    async def add_message(self, session_id: UUID, message_content: str) -> Session:
        """
        Add a user message to an existing session.
        
        Args:
            session_id: The session identifier
            message_content: The user's message content
            
        Returns:
            Updated session with the new message
            
        Raises:
            NotFoundException: If session does not exist
            ValidationException: If message is empty
        """
        if not message_content or not message_content.strip():
            raise ValidationException("Message content cannot be empty")
        
        # Get session (will raise NotFoundException if not found)
        session = await self.get_session(session_id)
        
        # Create new message
        user_message = Message(
            role=MessageRole.USER,
            content=message_content.strip()
        )
        
        # Update session
        with self._lock:
            session.messages.append(user_message)
            session.updated_at = datetime.now(timezone.utc)
        
        logger.info(f"Added message to session: {session_id}")
        return session
    
    async def update_session(
        self,
        session_id: UUID,
        status: Optional[SessionStatus] = None,
        structured_requirements: Optional[Dict] = None
    ) -> Session:
        """
        Update session metadata.
        
        Args:
            session_id: The session identifier
            status: New session status (optional)
            structured_requirements: Updated requirements data (optional)
            
        Returns:
            Updated session
            
        Raises:
            NotFoundException: If session does not exist
        """
        session = await self.get_session(session_id)
        
        with self._lock:
            if status is not None:
                session.status = status
            
            if structured_requirements is not None:
                session.structured_requirements = structured_requirements
            
            session.updated_at = datetime.now(timezone.utc)
        
        logger.info(f"Updated session: {session_id}")
        return session
    
    async def list_sessions(self) -> Dict[UUID, Session]:
        """
        List all sessions (debug/admin only).
        
        Returns:
            Dictionary of all sessions by session_id
        """
        with self._lock:
            return dict(self._sessions)
    
    def get_session_count(self) -> int:
        """
        Get the total number of sessions.
        
        Returns:
            Number of sessions in the store
        """
        with self._lock:
            return len(self._sessions)


# Global session service instance
session_service = SessionService()
