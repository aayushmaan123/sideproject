"""
Conversation API endpoints.

This module provides REST API endpoints for conversation and session
management in Stage 2.1. No AI logic - pure session state management.
"""

from uuid import UUID

from fastapi import APIRouter, status

from app.core.logging import get_logger
from app.schemas.session import (
    SendMessageRequest,
    SessionResponse,
    StartConversationRequest,
)
from app.services.session_service import session_service

logger = get_logger(__name__)

router = APIRouter(prefix="/conversation", tags=["conversation"])


@router.post(
    "/start",
    status_code=status.HTTP_201_CREATED,
    response_model=SessionResponse,
    summary="Start a new conversation",
    description="Create a new conversation session with an initial message"
)
async def start_conversation(request: StartConversationRequest) -> SessionResponse:
    """
    Start a new conversation session.
    
    Creates a new session and stores the user's initial message.
    Returns the session ID and current session state.
    
    Args:
        request: Request containing the initial message
        
    Returns:
        SessionResponse with the newly created session
    """
    logger.info("Starting new conversation")
    
    session = await session_service.create_session(request.initial_message)
    
    return SessionResponse(session=session)


@router.post(
    "/message",
    status_code=status.HTTP_200_OK,
    response_model=SessionResponse,
    summary="Send a message",
    description="Add a user message to an existing conversation session"
)
async def send_message(request: SendMessageRequest) -> SessionResponse:
    """
    Send a message in an existing conversation.
    
    Appends the user's message to the session and updates the timestamp.
    Returns the updated session state.
    
    Args:
        request: Request containing session_id and message
        
    Returns:
        SessionResponse with the updated session
        
    Raises:
        NotFoundException: If session does not exist
        ValidationException: If message is invalid
    """
    logger.info(f"Sending message to session: {request.session_id}")
    
    session = await session_service.add_message(
        request.session_id,
        request.message
    )
    
    return SessionResponse(session=session)


@router.get(
    "/{session_id}",
    status_code=status.HTTP_200_OK,
    response_model=SessionResponse,
    summary="Get conversation session",
    description="Retrieve the complete state of a conversation session"
)
async def get_conversation(session_id: UUID) -> SessionResponse:
    """
    Get a conversation session by ID.
    
    Returns the complete session state including all messages,
    status, and metadata.
    
    Args:
        session_id: The session identifier
        
    Returns:
        SessionResponse with the session data
        
    Raises:
        NotFoundException: If session does not exist
    """
    logger.info(f"Retrieving session: {session_id}")
    
    session = await session_service.get_session(session_id)
    
    return SessionResponse(session=session)
