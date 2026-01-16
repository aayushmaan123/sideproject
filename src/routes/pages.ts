/**
 * Pages Routes
 * 
 * API endpoints for page structure generation
 * Stage 4.4.1.3
 */

import express, { Request, Response } from 'express';
import { validate as uuidValidate } from 'uuid';
import pageGeneratorService from '../services/page-generator.service';
import PageStructure from '../models/PageStructure';
import { Logger } from '../utils/logger';

const router = express.Router();

/**
 * POST /api/pages/generate
 * 
 * Generate and store page structure for a session and template
 * 
 * Request body:
 * {
 *   "session_id": "uuid",
 *   "template_id": "uuid"
 * }
 * 
 * Response:
 * {
 *   "page_structure_id": "uuid",
 *   "session_id": "uuid",
 *   "template_id": "uuid",
 *   "pages": [...],
 *   "generated_at": "ISO timestamp",
 *   "message": "Page structure generated successfully"
 * }
 */
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_id, template_id } = req.body;

    // Validate session_id
    if (!session_id || typeof session_id !== 'string') {
      Logger.error('Invalid request: missing or invalid session_id', {
        session_id,
      });
      res.status(400).json({
        error: 'Invalid input: session_id is required and must be a string',
      });
      return;
    }

    if (!uuidValidate(session_id)) {
      Logger.error('Invalid request: session_id is not a valid UUID', {
        session_id,
      });
      res.status(400).json({
        error: 'Invalid input: session_id must be a valid UUID',
      });
      return;
    }

    // Validate template_id
    if (!template_id || typeof template_id !== 'string') {
      Logger.error('Invalid request: missing or invalid template_id', {
        session_id,
        template_id,
      });
      res.status(400).json({
        error: 'Invalid input: template_id is required and must be a string',
      });
      return;
    }

    if (!uuidValidate(template_id)) {
      Logger.error('Invalid request: template_id is not a valid UUID', {
        session_id,
        template_id,
      });
      res.status(400).json({
        error: 'Invalid input: template_id must be a valid UUID',
      });
      return;
    }

    Logger.info('Generating page structure', { session_id, template_id });

    // Check if page structure already exists for this session + template
    const existing = await PageStructure.findOne({
      where: { session_id, template_id },
    });

    if (existing) {
      Logger.info('Page structure already exists, returning existing', {
        session_id,
        template_id,
        page_structure_id: existing.id,
      });
      
      res.status(200).json({
        page_structure_id: existing.id,
        session_id: existing.session_id,
        template_id: existing.template_id,
        pages: existing.structure.pages,
        generated_at: existing.structure.generated_at,
        message: 'Page structure already exists',
      });
      return;
    }

    // Generate page structure
    const structure = await pageGeneratorService.generatePageStructure(
      session_id,
      template_id
    );

    // Store in database
    const pageStructure = await PageStructure.create({
      session_id,
      template_id,
      structure,
    });

    Logger.info('Page structure stored successfully', {
      session_id,
      template_id,
      page_structure_id: pageStructure.id,
      pageCount: structure.pages.length,
    });

    res.status(201).json({
      page_structure_id: pageStructure.id,
      session_id: pageStructure.session_id,
      template_id: pageStructure.template_id,
      pages: structure.pages,
      generated_at: structure.generated_at,
      message: 'Page structure generated successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    
    // Handle specific error cases
    if (err.message.includes('No requirement found')) {
      Logger.error('Requirement not found', {
        error: err.message,
        session_id: req.body.session_id,
      });
      res.status(404).json({
        error: `Not found: ${err.message}`,
      });
      return;
    }

    if (err.message.includes('Template') && err.message.includes('not found')) {
      Logger.error('Template not found', {
        error: err.message,
        template_id: req.body.template_id,
      });
      res.status(404).json({
        error: `Not found: ${err.message}`,
      });
      return;
    }

    // General server error
    Logger.error('Failed to generate page structure', error);
    res.status(500).json({
      error: 'Failed to generate page structure',
    });
  }
});

/**
 * GET /api/pages/:session_id/:template_id
 * 
 * Retrieve stored page structure for a session and template
 * 
 * Response:
 * {
 *   "page_structure_id": "uuid",
 *   "session_id": "uuid",
 *   "template_id": "uuid",
 *   "pages": [...],
 *   "generated_at": "ISO timestamp"
 * }
 */
router.get('/:session_id/:template_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_id, template_id } = req.params;

    // Validate session_id
    if (!uuidValidate(session_id)) {
      Logger.error('Invalid session_id format', { session_id });
      res.status(400).json({
        error: 'Invalid input: session_id must be a valid UUID',
      });
      return;
    }

    // Validate template_id
    if (!uuidValidate(template_id)) {
      Logger.error('Invalid template_id format', { template_id });
      res.status(400).json({
        error: 'Invalid input: template_id must be a valid UUID',
      });
      return;
    }

    Logger.info('Retrieving page structure', { session_id, template_id });

    // Find page structure
    const pageStructure = await PageStructure.findOne({
      where: { session_id, template_id },
    });

    if (!pageStructure) {
      Logger.info('Page structure not found', { session_id, template_id });
      res.status(404).json({
        error: 'Page structure not found for this session and template',
      });
      return;
    }

    Logger.info('Page structure retrieved successfully', {
      session_id,
      template_id,
      page_structure_id: pageStructure.id,
    });

    res.status(200).json({
      page_structure_id: pageStructure.id,
      session_id: pageStructure.session_id,
      template_id: pageStructure.template_id,
      pages: pageStructure.structure.pages,
      generated_at: pageStructure.structure.generated_at,
    });
  } catch (error) {
    Logger.error('Failed to retrieve page structure', error);
    res.status(500).json({
      error: 'Failed to retrieve page structure',
    });
  }
});

export default router;
