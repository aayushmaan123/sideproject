/**
 * Requirements API Routes
 * Handles saving and retrieving website requirements from database
 */

import { Router, Request, Response } from 'express';
import { RequirementService } from '../services/requirement.service';
import { ExtractedRequirements } from '../types/extract';
import { Logger } from '../utils/logger';
import { validateSessionId } from '../utils/validator';

const router = Router();
const requirementService = new RequirementService();

/**
 * POST /api/requirements
 * Save website requirements to database with versioning
 * 
 * Request body (from Stage 4.1.2):
 * {
 *   "session_id": "string (UUID)",
 *   "business_type": "string",
 *   "key_features": ["string", ...],
 *   "target_audience": "string",
 *   "design_preferences": "string",
 *   "additional_notes": "string",
 *   "extracted_at": "ISO 8601 timestamp"
 * }
 * 
 * Success Response (201):
 * {
 *   "requirement_id": "string (UUID)",
 *   "version_number": number,
 *   "session_id": "string (UUID)",
 *   "message": "Requirement saved successfully"
 * }
 * 
 * Error Response (400/500):
 * {
 *   "error": "Error message"
 * }
 */
router.post(
  '/requirements',
  async (
    req: Request<object, unknown, ExtractedRequirements>,
    res: Response
  ): Promise<void> => {
    try {
      const data = req.body;

      // Validate required fields
      if (!data.session_id || !data.business_type || !data.key_features || !data.target_audience) {
        res.status(400).json({
          error: 'Invalid input: Missing required fields (session_id, business_type, key_features, target_audience)',
        });
        return;
      }

      // Validate session_id format
      const sessionValidation = validateSessionId(data.session_id);
      if (!sessionValidation.isValid) {
        res.status(400).json({
          error: `Invalid input: ${sessionValidation.error}`,
        });
        return;
      }

      // Validate key_features is an array
      if (!Array.isArray(data.key_features)) {
        res.status(400).json({
          error: 'Invalid input: key_features must be an array',
        });
        return;
      }

      Logger.info('Saving requirement to database', {
        session_id: data.session_id,
      });

      // Save to database with retry logic
      const result = await requirementService.saveRequirement(data);

      res.status(201).json({
        requirement_id: result.requirement_id,
        version_number: result.version_number,
        session_id: data.session_id,
        message: 'Requirement saved successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      Logger.error('Failed to save requirement', {
        error: errorMessage,
      });

      res.status(500).json({
        error: `Failed to save requirement: ${errorMessage}`,
      });
    }
  }
);

/**
 * GET /api/requirements/:session_id
 * Retrieve requirements for a session
 * 
 * Query Parameters:
 * - latest (optional): If "true", returns only the latest version
 * 
 * Success Response (200):
 * {
 *   "session_id": "string (UUID)",
 *   "requirements": [
 *     {
 *       "id": "string (UUID)",
 *       "session_id": "string (UUID)",
 *       "business_type": "string",
 *       "key_features": ["string", ...],
 *       "target_audience": "string",
 *       "design_preferences": "string",
 *       "additional_notes": "string",
 *       "extracted_at": "ISO 8601 timestamp",
 *       "version_number": number,
 *       "createdAt": "ISO 8601 timestamp",
 *       "updatedAt": "ISO 8601 timestamp"
 *     },
 *     ...
 *   ]
 * }
 * 
 * Error Response (400/404/500):
 * {
 *   "error": "Error message"
 * }
 */
router.get(
  '/requirements/:session_id',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { session_id } = req.params;
      const latest = req.query.latest === 'true';

      // Validate session_id format
      const sessionValidation = validateSessionId(session_id);
      if (!sessionValidation.isValid) {
        res.status(400).json({
          error: `Invalid input: ${sessionValidation.error}`,
        });
        return;
      }

      Logger.info('Retrieving requirements from database', {
        session_id,
        latest_only: latest,
      });

      const requirements = await requirementService.getRequirementsBySession(
        session_id,
        latest
      );

      if (requirements.length === 0) {
        res.status(404).json({
          error: 'No requirements found for this session',
        });
        return;
      }

      res.status(200).json({
        session_id,
        requirements: requirements.map((req) => ({
          id: req.id,
          session_id: req.session_id,
          business_type: req.business_type,
          key_features: req.key_features,
          target_audience: req.target_audience,
          design_preferences: req.design_preferences,
          additional_notes: req.additional_notes,
          extracted_at: req.extracted_at.toISOString(),
          version_number: req.version_number,
          createdAt: req.createdAt.toISOString(),
          updatedAt: req.updatedAt.toISOString(),
        })),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      Logger.error('Failed to retrieve requirements', {
        error: errorMessage,
      });

      res.status(500).json({
        error: `Failed to retrieve requirements: ${errorMessage}`,
      });
    }
  }
);

export default router;
