/**
 * Input API Routes
 * Handles user input submission with validation and sanitization
 */

import { Router, Request, Response } from 'express';
import { validateInput } from '../middleware/validation';
import { sanitizeInput } from '../middleware/sanitization';
import { SanitizedInput } from '../types';

const router = Router();

/**
 * POST /api/input
 * Submit user input for AI requirement extraction
 * 
 * Request body:
 * {
 *   "session_id": "string (UUID format)",
 *   "text": "string (non-empty)"
 * }
 * 
 * Response (200):
 * {
 *   "session_id": "string",
 *   "text": "string (sanitized)",
 *   "original_text": "string"
 * }
 * 
 * Error Response (400):
 * {
 *   "error": "Invalid input: <reason>"
 * }
 * 
 * Note: Rate limiting should be implemented in production environments.
 * For Stage 4.1.1, basic validation and sanitization are the focus.
 */
router.post(
  '/input',
  validateInput,
  sanitizeInput,
  (req: Request, res: Response<SanitizedInput>): void => {
    const { session_id, text, original_text } = req.body;

    // At this point, input has been validated and sanitized
    // Return the sanitized output ready for Stage 4.1.2 (AI Requirement Extraction)
    res.status(200).json({
      session_id,
      text,
      original_text,
    });
  }
);

export default router;
