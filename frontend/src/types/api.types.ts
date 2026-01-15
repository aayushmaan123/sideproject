import type { WebsiteRequirements } from './requirement.types';

// API Error handling
export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// POST /conversation/message/ai
export interface ConversationRequest {
  session_id: string;
  message: string;
}

export interface ConversationResponse {
  session_id: string;
  response: string;
  timestamp?: string;
}

// POST /requirement/extract
export interface ExtractRequirementRequest {
  session_id: string;
}

export interface ExtractRequirementResponse {
  session_id: string;
  requirements: WebsiteRequirements;
}

// GET /requirement/{session_id}
export interface GetRequirementResponse {
  session_id: string;
  requirements: WebsiteRequirements;
}
