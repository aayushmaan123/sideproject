"""
Session and conversation schemas.

This module defines Pydantic models for session management and
conversation state tracking in Stage 2.1 and AI responses in Stage 2.3.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Any, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    """Message role enumeration."""
    
    USER = "user"
    SYSTEM = "system"


class SessionStatus(str, Enum):
    """Session status enumeration."""
    
    COLLECTING = "collecting"
    COMPLETED = "completed"


class Message(BaseModel):
    """
    Individual conversation message.
    
    Attributes:
        role: The role of the message sender (user or system)
        content: The message content
        timestamp: When the message was created (UTC)
    """
    
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "I want to build a website for my bakery",
                "timestamp": "2024-01-14T10:30:00.000000+00:00"
            }
        }


class Session(BaseModel):
    """
    Conversation session model.
    
    Tracks the complete state of a conversation session including
    messages, status, and structured requirements.
    
    Attributes:
        session_id: Unique identifier for the session
        created_at: When the session was created (UTC)
        updated_at: When the session was last updated (UTC)
        status: Current session status
        messages: Ordered list of conversation messages
        structured_requirements: Structured data extracted from conversation
    """
    
    session_id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: SessionStatus = SessionStatus.COLLECTING
    messages: List[Message] = Field(default_factory=list)
    structured_requirements: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "created_at": "2024-01-14T10:30:00.000000+00:00",
                "updated_at": "2024-01-14T10:35:00.000000+00:00",
                "status": "collecting",
                "messages": [
                    {
                        "role": "user",
                        "content": "I want to build a website",
                        "timestamp": "2024-01-14T10:30:00.000000+00:00"
                    }
                ],
                "structured_requirements": {}
            }
        }


class StartConversationRequest(BaseModel):
    """
    Request to start a new conversation.
    
    Attributes:
        initial_message: The user's first message to start the conversation
    """
    
    initial_message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User's initial message to start the conversation"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "initial_message": "I want to build a website for my bakery"
            }
        }


class SendMessageRequest(BaseModel):
    """
    Request to send a message in an existing conversation.
    
    Attributes:
        session_id: The session to add the message to
        message: The user's message content
    """
    
    session_id: UUID = Field(..., description="Session identifier")
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User's message content"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "message": "It should have a menu and online ordering"
            }
        }


class SessionResponse(BaseModel):
    """
    Response containing session state.
    
    This is the standard response format for session-related operations.
    """
    
    session: Session
    
    class Config:
        json_schema_extra = {
            "example": {
                "session": {
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                    "created_at": "2024-01-14T10:30:00.000000+00:00",
                    "updated_at": "2024-01-14T10:35:00.000000+00:00",
                    "status": "collecting",
                    "messages": [
                        {
                            "role": "user",
                            "content": "I want to build a website",
                            "timestamp": "2024-01-14T10:30:00.000000+00:00"
                        }
                    ],
                    "structured_requirements": {}
                }
            }
        }


class SendAIMessageRequest(BaseModel):
    """
    Request to send a message and get an AI response.
    
    Attributes:
        session_id: The session to add the message to
        user_message: The user's message content
    """
    
    session_id: UUID = Field(..., description="Session identifier")
    user_message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User's message content"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "user_message": "It should have a menu and online ordering"
            }
        }


class AIMessageResponse(BaseModel):
    """
    Response containing AI-generated message and updated session.
    
    Attributes:
        ai_response: The AI-generated response text
        session: The updated session with both user and AI messages
        model: The LLM model used
        tokens_used: Number of tokens consumed (if available)
    """
    
    ai_response: str = Field(..., description="AI-generated response")
    session: Session = Field(..., description="Updated session state")
    model: str = Field(..., description="LLM model used")
    tokens_used: Optional[int] = Field(None, description="Tokens consumed")
    
    class Config:
        json_schema_extra = {
            "example": {
                "ai_response": "Great! A bakery website with a menu and online ordering. What type of bakery do you run?",
                "session": {
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                    "created_at": "2024-01-14T10:30:00.000000+00:00",
                    "updated_at": "2024-01-14T10:35:00.000000+00:00",
                    "status": "collecting",
                    "messages": [
                        {
                            "role": "user",
                            "content": "I want to build a website",
                            "timestamp": "2024-01-14T10:30:00.000000+00:00"
                        },
                        {
                            "role": "system",
                            "content": "Great! What type of website are you building?",
                            "timestamp": "2024-01-14T10:31:00.000000+00:00"
                        }
                    ],
                    "structured_requirements": {}
                },
                "model": "gpt-4o-mini",
                "tokens_used": 150
            }
        }
