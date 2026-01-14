"""
Requirement API endpoints.

This module provides REST API endpoints for extracting and retrieving
structured website requirements from AI conversations in Stage 2.4.3.
"""

from uuid import UUID

from fastapi import APIRouter, status, HTTPException

from app.core.logging import get_logger
from app.core.exceptions import NotFoundException, ValidationException
from app.core.ai_exceptions import (
    LLMProviderException,
    LLMTimeoutException,
    LLMValidationException
)
from app.schemas.requirement import (
    ExtractedRequirementsResponse,
    WebsiteRequirement
)
from app.services.requirement_service import requirement_service

logger = get_logger(__name__)

router = APIRouter(prefix="/requirement", tags=["requirements"])


@router.post(
    "/extract",
    status_code=status.HTTP_200_OK,
    response_model=ExtractedRequirementsResponse,
    summary="Extract requirements from AI conversation",
    description="Analyze AI conversation and extract structured website requirements"
)
async def extract_requirements(
    session_id: UUID,
    ai_response: str
) -> ExtractedRequirementsResponse:
    """
    Extract structured website requirements from AI conversation.
    
    This endpoint analyzes the AI conversation context and extracts
    structured information about the website being built, including
    business type, key features, target audience, and design preferences.
    
    Args:
        session_id: The session identifier
        ai_response: The AI response to analyze for requirement extraction
        
    Returns:
        ExtractedRequirementsResponse with extracted requirements
        
    Raises:
        HTTPException 404: Session not found
        HTTPException 422: Validation error (empty ai_response)
        HTTPException 500: LLM provider error
        HTTPException 503: LLM timeout error
    """
    try:
        logger.info(f"Extracting requirements for session: {session_id}")
        
        # Delegate to service layer
        requirements = await requirement_service.extract_requirements(
            session_id=session_id,
            ai_response=ai_response
        )
        
        logger.info(
            f"Requirements extracted successfully for session {session_id}: "
            f"business_type={requirements.business_type}"
        )
        
        return ExtractedRequirementsResponse(
            requirements=requirements,
            message="Requirements successfully extracted from conversation"
        )
        
    except NotFoundException as e:
        logger.warning(f"Session not found: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValidationException as e:
        logger.warning(f"Validation error extracting requirements: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except LLMTimeoutException as e:
        logger.error(f"LLM timeout during requirement extraction: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service timeout - please try again"
        )
    except (LLMProviderException, LLMValidationException) as e:
        logger.error(f"LLM error during requirement extraction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI service error - please try again"
        )


@router.get(
    "/{session_id}",
    status_code=status.HTTP_200_OK,
    response_model=WebsiteRequirement,
    summary="Get requirements for session",
    description="Retrieve stored website requirements for a specific session"
)
async def get_requirements(session_id: UUID) -> WebsiteRequirement:
    """
    Get stored website requirements for a session.
    
    Retrieves the extracted website requirements associated with
    the specified session ID.
    
    Args:
        session_id: The session identifier
        
    Returns:
        WebsiteRequirement object with extracted information
        
    Raises:
        HTTPException 404: Session not found or no requirements extracted
    """
    try:
        logger.info(f"Retrieving requirements for session: {session_id}")
        
        # Get requirements from service
        requirements = await requirement_service.get_requirements(session_id)
        
        if requirements is None:
            logger.warning(
                f"No requirements found for session: {session_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No requirements found for session {session_id}"
            )
        
        logger.info(
            f"Requirements retrieved for session {session_id}: "
            f"business_type={requirements.business_type}"
        )
        
        return requirements
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(
            f"Error retrieving requirements for session {session_id}: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving requirements"
        )
