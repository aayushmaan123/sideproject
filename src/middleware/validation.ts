/**
 * Input Validation Middleware
 * Validates session_id and text fields according to Stage 4.1.1 requirements
 */

import { Request, Response, NextFunction } from 'express';
import { validateSessionId, validateText } from '../utils/validator';
import { Logger } from '../utils/logger';
import { ErrorResponse } from '../types';

/**
 * Middleware to validate incoming input requests
 * Checks that session_id and text fields are present, valid, and meet requirements
 * Returns HTTP 400 with JSON error message if validation fails
 */
export function validateInput(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void {
  const { session_id, text } = req.body;

  // Validate session_id
  const sessionIdValidation = validateSessionId(session_id);
  if (!sessionIdValidation.isValid) {
    Logger.logInvalidRequest(
      session_id,
      sessionIdValidation.error || 'Invalid session_id',
      'Validation failed'
    );

    res.status(400).json({
      error: `Invalid input: ${sessionIdValidation.error}`,
    });
    return;
  }

  // Validate text
  const textValidation = validateText(text);
  if (!textValidation.isValid) {
    Logger.logInvalidRequest(
      session_id,
      textValidation.error || 'Invalid text',
      'Validation failed'
    );

    res.status(400).json({
      error: `Invalid input: ${textValidation.error}`,
    });
    return;
  }

  // If all validations pass, continue to next middleware
  next();
}
