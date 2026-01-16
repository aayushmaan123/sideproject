/**
 * Stage 4.4.2: Page Content Generation API Routes
 * 
 * This file implements the API endpoints for generating and retrieving
 * page content for website sections.
 */

import express, { Request, Response } from 'express';
import { validate as uuidValidate } from 'uuid';
import { ContentGeneratorService } from '../services/content-generator.service';
import { PageContent } from '../models/PageContent';
import { Requirement } from '../models/Requirement';
import { Template } from '../models/Template';
import { PageStructure } from '../models/PageStructure';
import { Logger } from '../utils/logger';

const router = express.Router();
const contentGenerator = new ContentGeneratorService();

/**
 * POST /api/content/generate
 * Generates and stores content for all pages and sections
 * 
 * Request body:
 * {
 *   "session_id": "uuid",
 *   "template_id": "uuid"
 * }
 * 
 * Returns:
 * - 201: Content generated successfully
 * - 200: Content already exists (idempotent)
 * - 400: Invalid input
 * - 404: Missing requirements/template/page structure
 * - 500: Server error
 */
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_id, template_id } = req.body;

    // Validate UUIDs
    if (!session_id || !uuidValidate(session_id)) {
      Logger.error('Invalid session_id', { session_id });
      res.status(400).json({ error: 'Invalid input: session_id must be a valid UUID' });
      return;
    }

    if (!template_id || !uuidValidate(template_id)) {
      Logger.error('Invalid template_id', { template_id });
      res.status(400).json({ error: 'Invalid input: template_id must be a valid UUID' });
      return;
    }

    Logger.info('Content generation requested', { session_id, template_id });

    // Check if content already exists
    const existingContent = await PageContent.findAll({
      where: { session_id, template_id }
    });

    if (existingContent.length > 0) {
      Logger.info('Content already exists, returning existing content', {
        session_id,
        template_id,
        content_count: existingContent.length
      });

      res.status(200).json({
        session_id,
        template_id,
        content_count: existingContent.length,
        contents: existingContent.map(c => c.toJSON()),
        message: 'Content already generated'
      });
      return;
    }

    // Verify requirement exists
    const requirement = await Requirement.findOne({
      where: { session_id },
      order: [['version_number', 'DESC']]
    });

    if (!requirement) {
      Logger.error('Requirement not found', { session_id });
      res.status(404).json({ error: 'Requirement not found for session_id' });
      return;
    }

    // Verify template exists
    const template = await Template.findByPk(template_id);
    if (!template) {
      Logger.error('Template not found', { template_id });
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Verify page structure exists
    const pageStructure = await PageStructure.findOne({
      where: { session_id, template_id }
    });

    if (!pageStructure) {
      Logger.error('Page structure not found', { session_id, template_id });
      res.status(404).json({
        error: 'Page structure not found. Please generate page structure first using POST /api/pages/generate'
      });
      return;
    }

    // Generate content for all pages and sections
    const contentMap = await contentGenerator.generateAllContent(session_id, template_id);

    // Store all content
    const storedContents = [];
    for (const [pageSlug, sectionsMap] of contentMap.entries()) {
      for (const [sectionType, contentJson] of sectionsMap.entries()) {
        const stored = await PageContent.create({
          session_id,
          template_id,
          page_slug: pageSlug,
          section_type: sectionType,
          content_json: contentJson
        });
        storedContents.push(stored.toJSON());
      }
    }

    Logger.info('Content generated and stored successfully', {
      session_id,
      template_id,
      content_count: storedContents.length
    });

    res.status(201).json({
      session_id,
      template_id,
      content_count: storedContents.length,
      contents: storedContents,
      message: 'Content generated successfully'
    });
  } catch (error) {
    Logger.error('Error generating content', { error: (error as Error).message });
    res.status(500).json({ error: `Failed to generate content: ${(error as Error).message}` });
  }
});

/**
 * GET /api/content/:session_id/:template_id
 * Retrieves all generated content for a session and template
 * 
 * Returns:
 * - 200: Content retrieved successfully
 * - 400: Invalid input
 * - 404: Content not found
 * - 500: Server error
 */
router.get('/:session_id/:template_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_id, template_id } = req.params;

    // Validate UUIDs
    if (!uuidValidate(session_id)) {
      Logger.error('Invalid session_id', { session_id });
      res.status(400).json({ error: 'Invalid input: session_id must be a valid UUID' });
      return;
    }

    if (!uuidValidate(template_id)) {
      Logger.error('Invalid template_id', { template_id });
      res.status(400).json({ error: 'Invalid input: template_id must be a valid UUID' });
      return;
    }

    Logger.info('Content retrieval requested', { session_id, template_id });

    // Retrieve all content
    const contents = await PageContent.findAll({
      where: { session_id, template_id },
      order: [['page_slug', 'ASC'], ['section_type', 'ASC']]
    });

    if (contents.length === 0) {
      Logger.error('Content not found', { session_id, template_id });
      res.status(404).json({ error: 'Content not found for this session and template' });
      return;
    }

    Logger.info('Content retrieved successfully', {
      session_id,
      template_id,
      content_count: contents.length
    });

    res.status(200).json({
      session_id,
      template_id,
      content_count: contents.length,
      contents: contents.map(c => c.toJSON())
    });
  } catch (error) {
    Logger.error('Error retrieving content', { error: (error as Error).message });
    res.status(500).json({ error: `Failed to retrieve content: ${(error as Error).message}` });
  }
});

export default router;
