/**
 * Input Sanitization Middleware
 * Sanitizes user text input before sending to AI requirement extraction
 */

import { Request, Response, NextFunction } from 'express';
import { sanitizeText } from '../utils/sanitizer';
import { Logger } from '../utils/logger';

/**
 * Middleware to sanitize user input
 * Applies sanitization rules:
 * - Trim whitespace
 * - Collapse multiple spaces
 * - Strip HTML/script tags
 * - Remove emojis and special characters
 * 
 * The sanitized text replaces req.body.text and original is stored in req.body.original_text
 */
export function sanitizeInput(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { session_id, text } = req.body;

  // Store original text for logging/debugging
  const originalText = text;

  // Apply sanitization
  const sanitizedText = sanitizeText(text);

  // Update request body with sanitized text
  req.body.text = sanitizedText;
  req.body.original_text = originalText;

  // Log the valid request with sanitization info
  Logger.logValidRequest(session_id, originalText, sanitizedText);

  // Continue to next middleware or route handler
  next();
}
