/**
 * Extract API Routes
 * Handles AI-powered requirement extraction from sanitized user input
 */

import { Router, Request, Response } from 'express';
import { validateInput } from '../middleware/validation';
import { AIService } from '../services/ai.service';
import { ExtractRequest, ExtractedRequirements } from '../types/extract';
import { ErrorResponse } from '../types';
import { Logger } from '../utils/logger';

const router = Router();
const aiService = new AIService();

/**
 * POST /api/extract
 * Extract structured website requirements from user input using AI
 * 
 * Request body (from Stage 4.1.1):
 * {
 *   "session_id": "string (UUID format)",
 *   "text": "string (sanitized)",
 *   "original_text": "string (optional)"
 * }
 * 
 * Success Response (200):
 * {
 *   "session_id": "string",
 *   "business_type": "string",
 *   "key_features": ["string", ...],
 *   "target_audience": "string",
 *   "design_preferences": "string",
 *   "additional_notes": "string",
 *   "extracted_at": "ISO 8601 timestamp"
 * }
 * 
 * Error Response (400/500):
 * {
 *   "error": "Failed to extract requirements: <reason>"
 * }
 */
router.post(
  '/extract',
  validateInput, // Reuse validation from Stage 4.1.1
  async (req: Request<object, ExtractedRequirements | ErrorResponse, ExtractRequest>, res: Response<ExtractedRequirements | ErrorResponse>): Promise<void> => {
    const { session_id, text } = req.body;

    try {
      Logger.info('Starting AI requirement extraction', {
        session_id,
        text_length: text.length,
      });

      // Call AI service with retry logic
      const aiResponse = await aiService.extractRequirements(text, session_id);

      // Apply fallback defaults if AI didn't extract certain fields
      const requirements: ExtractedRequirements = {
        session_id,
        business_type: aiResponse.business_type || 'general website',
        key_features: Array.isArray(aiResponse.key_features) && aiResponse.key_features.length > 0
          ? aiResponse.key_features
          : ['homepage', 'contact form'],
        target_audience: aiResponse.target_audience || 'general audience',
        design_preferences: aiResponse.design_preferences || 'modern and professional',
        additional_notes: aiResponse.additional_notes || '',
        extracted_at: new Date().toISOString(),
      };

      // Validate that all required fields are present and correct type
      if (!validateRequirements(requirements)) {
        throw new Error('Invalid requirements structure after extraction');
      }

      Logger.info('AI extraction completed successfully', {
        session_id,
        business_type: requirements.business_type,
        feature_count: requirements.key_features.length,
      });

      res.status(200).json(requirements);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      Logger.error('AI extraction failed', {
        session_id,
        error: errorMessage,
      });

      res.status(500).json({
        error: `Failed to extract requirements: ${errorMessage}`,
      });
    }
  }
);

/**
 * Validate requirements structure
 */
function validateRequirements(req: ExtractedRequirements): boolean {
  return (
    typeof req.session_id === 'string' &&
    typeof req.business_type === 'string' &&
    Array.isArray(req.key_features) &&
    typeof req.target_audience === 'string' &&
    typeof req.design_preferences === 'string' &&
    typeof req.additional_notes === 'string' &&
    typeof req.extracted_at === 'string'
  );
}

export default router;
