"""
Conversation API endpoints.

This module provides REST API endpoints for conversation and session
management in Stage 2.1 and AI-powered conversations in Stage 2.3.
"""

from uuid import UUID

from fastapi import APIRouter, status, HTTPException

from app.core.logging import get_logger
from app.core.ai_exceptions import (
    LLMProviderException,
    LLMTimeoutException,
    LLMValidationException
)
from app.schemas.session import (
    AIMessageResponse,
    SendAIMessageRequest,
    SendMessageRequest,
    SessionResponse,
    StartConversationRequest,
)
from app.services.conversation_service import conversation_service
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


@router.post(
    "/message/ai",
    status_code=status.HTTP_200_OK,
    response_model=AIMessageResponse,
    summary="Send message and get AI response",
    description="Send a user message to a session and receive an AI-generated response (Stage 2.3)"
)
async def send_ai_message(request: SendAIMessageRequest) -> AIMessageResponse:
    """
    Send a message and get an AI response.
    
    This endpoint (Stage 2.3):
    1. Appends the user message to the session
    2. Calls the LLM to generate a response
    3. Appends the AI response to the session
    4. Returns the AI response and updated session state
    
    Args:
        request: Request containing session_id and user_message
        
    Returns:
        AIMessageResponse with AI response, session, model, and tokens
        
    Raises:
        NotFoundException: If session does not exist (404)
        ValidationException: If user_message is invalid (422)
        HTTPException: If LLM provider errors occur (500/503)
    """
    logger.info(f"Processing AI message for session: {request.session_id}")
    
    try:
        # Process message through conversation service
        llm_response = await conversation_service.process_user_message(
            session_id=request.session_id,
            user_message=request.user_message
        )
        
        # Get updated session
        session = await session_service.get_session(request.session_id)
        
        # Return structured response
        return AIMessageResponse(
            ai_response=llm_response.content,
            session=session,
            model=llm_response.model,
            tokens_used=llm_response.tokens_used
        )
        
    except LLMTimeoutException as e:
        logger.error(f"LLM timeout for session {request.session_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "LLM request timed out",
                "message": str(e.message),
                "timeout_seconds": e.details.get("timeout_seconds")
            }
        )
    
    except LLMValidationException as e:
        logger.error(f"LLM validation error for session {request.session_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Invalid LLM response",
                "message": str(e.message)
            }
        )
    
    except LLMProviderException as e:
        logger.error(f"LLM provider error for session {request.session_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "LLM provider error",
                "message": str(e.message),
                "provider": e.details.get("provider")
            }
        )

