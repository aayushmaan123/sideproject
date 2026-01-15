/**
 * Validation utilities for input data
 * Validates session_id (UUID format) and text fields
 */

import { validate as uuidValidate } from 'uuid';
import { ValidationResult } from '../types';

/**
 * Validate that session_id exists, is a string, and matches UUID format
 * 
 * @param sessionId - The session_id to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateSessionId(sessionId: unknown): ValidationResult {
  // Check if session_id exists
  if (sessionId === undefined || sessionId === null) {
    return {
      isValid: false,
      error: 'session_id is required',
    };
  }

  // Check if session_id is a string
  if (typeof sessionId !== 'string') {
    return {
      isValid: false,
      error: 'session_id must be a string',
    };
  }

  // Check if session_id is empty
  if (sessionId.trim() === '') {
    return {
      isValid: false,
      error: 'session_id cannot be empty',
    };
  }

  // Validate UUID format (v4 is most common, but accept any valid UUID)
  if (!uuidValidate(sessionId)) {
    return {
      isValid: false,
      error: 'session_id must be a valid UUID format',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validate that text exists, is a string, and is not empty
 * 
 * @param text - The text to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateText(text: unknown): ValidationResult {
  // Check if text exists
  if (text === undefined || text === null) {
    return {
      isValid: false,
      error: 'text is required',
    };
  }

  // Check if text is a string
  if (typeof text !== 'string') {
    return {
      isValid: false,
      error: 'text must be a string',
    };
  }

  // Check if text is empty (after trimming whitespace)
  if (text.trim() === '') {
    return {
      isValid: false,
      error: 'text cannot be empty',
    };
  }

  return {
    isValid: true,
  };
}
