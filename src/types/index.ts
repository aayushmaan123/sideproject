/**
 * Type definitions for the AI Website Builder backend
 */

export interface InputRequest {
  session_id: string;
  text: string;
}

export interface SanitizedInput {
  session_id: string;
  text: string;
  original_text: string;
}

export interface ErrorResponse {
  error: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
