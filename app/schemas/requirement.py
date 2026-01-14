"""
Requirement schemas for structured website requirements.

This module defines Pydantic models for website requirement extraction
and management in Stage 2.4.
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class WebsiteRequirement(BaseModel):
    """
    Structured website requirements extracted from conversation.
    
    This model captures key information about the website being built,
    extracted from the AI conversation flow.
    
    Attributes:
        session_id: The session this requirement belongs to
        business_type: Type of business (e.g., "bakery", "restaurant", "portfolio")
        key_features: List of requested features (e.g., "menu", "online ordering")
        target_audience: Intended audience for the website
        design_preferences: Design style preferences (e.g., "modern", "minimalist")
        additional_notes: Any other relevant information
        extracted_at: When requirements were extracted (UTC)
    """
    
    session_id: UUID = Field(..., description="Session identifier")
    business_type: Optional[str] = Field(None, description="Type of business")
    key_features: List[str] = Field(default_factory=list, description="Requested features")
    target_audience: Optional[str] = Field(None, description="Target audience")
    design_preferences: Optional[str] = Field(None, description="Design preferences")
    additional_notes: Optional[str] = Field(None, description="Additional notes")
    extracted_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When requirements were extracted (UTC)"
    )
    
    class Config:
        """Pydantic configuration."""
        
        json_schema_extra = {
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "business_type": "bakery",
                "key_features": ["menu", "online ordering", "contact form"],
                "target_audience": "local customers",
                "design_preferences": "modern and clean",
                "additional_notes": "Focus on mobile experience",
                "extracted_at": "2024-01-14T10:35:00.000000+00:00"
            }
        }


class ExtractedRequirementsResponse(BaseModel):
    """
    Response containing extracted website requirements.
    
    This is the standard response format for requirement extraction operations.
    
    Attributes:
        requirements: The extracted website requirements
        message: Optional status message
    """
    
    requirements: WebsiteRequirement = Field(..., description="Extracted requirements")
    message: Optional[str] = Field(
        None,
        description="Optional status or informational message"
    )
    
    class Config:
        """Pydantic configuration."""
        
        json_schema_extra = {
            "example": {
                "requirements": {
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                    "business_type": "bakery",
                    "key_features": ["menu", "online ordering", "contact form"],
                    "target_audience": "local customers",
                    "design_preferences": "modern and clean",
                    "additional_notes": "Focus on mobile experience",
                    "extracted_at": "2024-01-14T10:35:00.000000+00:00"
                },
                "message": "Requirements successfully extracted from conversation"
            }
        }
