/**
 * Stage 4.5.3: Render API Endpoint
 * 
 * Read-only endpoint that returns the complete, frontend-ready
 * render schema for a session and template.
 */

import express from 'express';
import { RenderAssemblyService } from '../services/render-assembly.service';
import { validate as uuidValidate } from 'uuid';
import { Logger } from '../utils/logger';

const router = express.Router();
const renderService = new RenderAssemblyService();

/**
 * GET /api/render/:session_id/:template_id
 * 
 * Returns the complete, frontend-ready render schema.
 * This is the final handoff from backend to frontend.
 * 
 * Response: RenderSchema JSON
 * Errors: 400 (invalid input), 404 (data not found), 500 (server error)
 */
router.get('/render/:session_id/:template_id', async (req, res) => {
  const { session_id, template_id } = req.params;

  try {
    // Validate UUIDs
    if (!uuidValidate(session_id)) {
      Logger.error('Invalid session_id format', new Error('Invalid UUID'));
      return res.status(400).json({ error: 'Invalid input: session_id must be a valid UUID' });
    }

    if (!uuidValidate(template_id)) {
      Logger.error('Invalid template_id format', new Error('Invalid UUID'));
      return res.status(400).json({ error: 'Invalid input: template_id must be a valid UUID' });
    }

    Logger.info('Assembling render schema', { session_id, template_id });

    // Assemble render schema
    const renderSchema = await renderService.assembleRenderSchema(session_id, template_id);

    Logger.info('Render schema assembled successfully', { session_id, pages_count: renderSchema.pages.length });

    // Return complete render schema
    return res.status(200).json(renderSchema);
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('No')) {
      Logger.error('Data not found for render', error);
      return res.status(404).json({ error: error.message });
    }

    Logger.error('Error assembling render schema', error);
    return res.status(500).json({ error: 'Internal server error while assembling render schema' });
  }
});

export default router;
