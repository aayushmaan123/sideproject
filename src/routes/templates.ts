/**
 * Template Selection Routes
 * 
 * API endpoints for template selection based on requirements
 */

import express, { Request, Response, Router } from 'express';
import { TemplateMatcherService } from '../services/template-matcher.service';
import { validateSessionId } from '../utils/validator';
import { Logger } from '../utils/logger';

const router: Router = express.Router();

/**
 * GET /api/templates/select/:session_id
 * 
 * Select best matching templates for a session's requirements
 * 
 * Query parameters:
 * - limit (optional): Number of templates to return (default: 3)
 */
router.get('/templates/select/:session_id', async (req: Request, res: Response) => {
  const { session_id } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3;

  try {
    // Validate session_id
    const sessionValidation = validateSessionId(session_id);
    if (!sessionValidation.isValid) {
      Logger.info('Invalid session_id in template selection request', {
        session_id,
        error: sessionValidation.error,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(400).json({
        error: `Invalid input: ${sessionValidation.error}`,
      });
    }

    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 10) {
      Logger.info('Invalid limit in template selection request', {
        session_id,
        limit: req.query.limit,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(400).json({
        error: 'Invalid input: limit must be a number between 1 and 10',
      });
    }

    // Get top matching templates
    const matches = await TemplateMatcherService.getTopMatches(session_id, limit);

    Logger.info('Template selection successful', {
      session_id,
      limit,
      templatesReturned: matches.length,
      topScore: matches[0]?.score || 0,
    });

    return res.status(200).json({
      session_id,
      selected_templates: matches.map((match) => ({
        template_id: match.template_id,
        name: match.name,
        score: match.score,
        match_reasons: match.match_reasons,
        preview_image_url: match.preview_image_url,
        description: match.description,
      })),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific errors
    if (errorMessage.includes('No requirements found')) {
      Logger.info('No requirements found for session', {
        session_id,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(404).json({
        error: 'No requirements found for this session',
      });
    }

    if (errorMessage.includes('No templates available')) {
      Logger.error('No templates available in database', {
        session_id,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(500).json({
        error: 'No templates available. Please seed templates first.',
      });
    }

    // Generic error handling
    Logger.error('Failed to select templates', {
      session_id,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
    
    return res.status(500).json({
      error: `Failed to select templates: ${errorMessage}`,
    });
  }
});

export default router;
