/**
 * Stage 4.4.2: Page Content Generation API Tests
 */

import request from 'supertest';
import express, { Application } from 'express';
import { sequelize } from '../../database/config';
import { Requirement } from '../../models/Requirement';
import { Template } from '../../models/Template';
import { PageStructure } from '../../models/PageStructure';
import { PageContent } from '../../models/PageContent';
import contentRoutes from '../content';

// Ensure all models are loaded
[Requirement, Template, PageStructure, PageContent];

const app: Application = express();
app.use(express.json());
app.use('/api/content', contentRoutes);

describe('Stage 4.4.2: Content Generation Routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Requirement.destroy({ where: {} });
    await Template.destroy({ where: {} });
    await PageStructure.destroy({ where: {} });
    await PageContent.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/content/generate', () => {
    it('should generate content successfully for e-commerce', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';
      const templateId = '987e6543-e21b-12d3-a456-426614174999';

      // Create requirement
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['product catalog', 'shopping cart'],
        target_audience: 'general public',
        design_preferences: 'modern and clean',
        additional_notes: 'Test notes',
        extracted_at: new Date(),
        version_number: 1
      });

      // Create template
      await Template.create({
        id: templateId,
        name: 'E-Commerce Store',
        business_types: ['e-commerce', 'retail'],
        supported_features: ['product catalog', 'shopping cart', 'payment integration'],
        design_tags: ['modern', 'clean'],
        description: 'E-commerce template',
        preview_image_url: 'https://example.com/preview.jpg'
      });

      // Create page structure
      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure: {
          session_id: sessionId,
          template_id: templateId,
          pages: [
            {
              page_id: 'page-1',
              name: 'Home',
              slug: '/',
              sections: [
                {
                  section_id: 'section-1',
                  type: 'hero',
                  order: 1,
                  required_features: ['homepage'],
                  content_hints: 'Hero section'
                },
                {
                  section_id: 'section-2',
                  type: 'features',
                  order: 2,
                  required_features: ['product catalog', 'shopping cart'],
                  content_hints: 'Features section'
                }
              ]
            }
          ],
          generated_at: new Date()
        }
      });

      const response = await request(app)
        .post('/api/content/generate')
        .send({ session_id: sessionId, template_id: templateId });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('session_id', sessionId);
      expect(response.body).toHaveProperty('template_id', templateId);
      expect(response.body).toHaveProperty('content_count');
      expect(response.body.content_count).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('contents');
      expect(Array.isArray(response.body.contents)).toBe(true);
      expect(response.body).toHaveProperty('message', 'Content generated successfully');
    });

    it('should return existing content if already generated (idempotent)', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';
      const templateId = '987e6543-e21b-12d3-a456-426614174999';

      // Create requirement
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['product catalog'],
        target_audience: 'general public',
        design_preferences: 'modern',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1
      });

      // Create template
      await Template.create({
        id: templateId,
        name: 'E-Commerce Store',
        business_types: ['e-commerce'],
        supported_features: ['product catalog'],
        design_tags: ['modern'],
        description: 'Test template',
        preview_image_url: 'https://example.com/preview.jpg'
      });

      // Create page structure
      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure: {
          session_id: sessionId,
          template_id: templateId,
          pages: [
            {
              page_id: 'page-1',
              name: 'Home',
              slug: '/',
              sections: [
                {
                  section_id: 'section-1',
                  type: 'hero',
                  order: 1,
                  required_features: [],
                  content_hints: 'Hero'
                }
              ]
            }
          ],
          generated_at: new Date()
        }
      });

      // Create existing content
      await PageContent.create({
        session_id: sessionId,
        template_id: templateId,
        page_slug: '/',
        section_type: 'hero',
        content_json: {
          headline: 'Test',
          subheadline: 'Test subheadline',
          cta_text: 'Click',
          cta_url: '/test'
        }
      });

      const response = await request(app)
        .post('/api/content/generate')
        .send({ session_id: sessionId, template_id: templateId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Content already generated');
      expect(response.body.content_count).toBe(1);
    });

    it('should return 400 for invalid session_id', async () => {
      const response = await request(app)
        .post('/api/content/generate')
        .send({
          session_id: 'invalid-uuid',
          template_id: '987e6543-e21b-12d3-a456-426614174999'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('session_id');
    });

    it('should return 400 for invalid template_id', async () => {
      const response = await request(app)
        .post('/api/content/generate')
        .send({
          session_id: '123e4567-e89b-12d3-a456-426614174000',
          template_id: 'invalid-uuid'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('template_id');
    });

    it('should return 404 when requirement not found', async () => {
      const templateId = '987e6543-e21b-12d3-a456-426614174999';

      await Template.create({
        id: templateId,
        name: 'Test Template',
        business_types: ['test'],
        supported_features: ['test'],
        design_tags: ['test'],
        description: 'Test',
        preview_image_url: 'https://example.com/preview.jpg'
      });

      const response = await request(app)
        .post('/api/content/generate')
        .send({
          session_id: '123e4567-e89b-12d3-a456-426614174000',
          template_id: templateId
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Requirement not found');
    });

    it('should return 404 when template not found', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';

      await Requirement.create({
        session_id: sessionId,
        business_type: 'test',
        key_features: ['test'],
        target_audience: 'test',
        design_preferences: 'test',
        additional_notes: 'test',
        extracted_at: new Date(),
        version_number: 1
      });

      const response = await request(app)
        .post('/api/content/generate')
        .send({
          session_id: sessionId,
          template_id: '987e6543-e21b-12d3-a456-426614174999'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Template not found');
    });

    it('should return 404 when page structure not found', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';
      const templateId = '987e6543-e21b-12d3-a456-426614174999';

      await Requirement.create({
        session_id: sessionId,
        business_type: 'test',
        key_features: ['test'],
        target_audience: 'test',
        design_preferences: 'test',
        additional_notes: 'test',
        extracted_at: new Date(),
        version_number: 1
      });

      await Template.create({
        id: templateId,
        name: 'Test Template',
        business_types: ['test'],
        supported_features: ['test'],
        design_tags: ['test'],
        description: 'Test',
        preview_image_url: 'https://example.com/preview.jpg'
      });

      const response = await request(app)
        .post('/api/content/generate')
        .send({ session_id: sessionId, template_id: templateId });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Page structure not found');
    });
  });

  describe('GET /api/content/:session_id/:template_id', () => {
    it('should retrieve all content successfully', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';
      const templateId = '987e6543-e21b-12d3-a456-426614174999';

      // Create content
      await PageContent.create({
        session_id: sessionId,
        template_id: templateId,
        page_slug: '/',
        section_type: 'hero',
        content_json: {
          headline: 'Welcome',
          subheadline: 'Test',
          cta_text: 'Get Started',
          cta_url: '/signup'
        }
      });

      await PageContent.create({
        session_id: sessionId,
        template_id: templateId,
        page_slug: '/',
        section_type: 'features',
        content_json: {
          title: 'Features',
          features: []
        }
      });

      const response = await request(app)
        .get(`/api/content/${sessionId}/${templateId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('session_id', sessionId);
      expect(response.body).toHaveProperty('template_id', templateId);
      expect(response.body).toHaveProperty('content_count', 2);
      expect(response.body).toHaveProperty('contents');
      expect(Array.isArray(response.body.contents)).toBe(true);
      expect(response.body.contents).toHaveLength(2);
    });

    it('should return 400 for invalid session_id', async () => {
      const response = await request(app)
        .get('/api/content/invalid-uuid/987e6543-e21b-12d3-a456-426614174999');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('session_id');
    });

    it('should return 400 for invalid template_id', async () => {
      const response = await request(app)
        .get('/api/content/123e4567-e89b-12d3-a456-426614174000/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('template_id');
    });

    it('should return 404 when content not found', async () => {
      const response = await request(app)
        .get('/api/content/123e4567-e89b-12d3-a456-426614174000/987e6543-e21b-12d3-a456-426614174999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Content not found');
    });
  });

  describe('Integration: Generate and Retrieve Flow', () => {
    it('should generate content and then retrieve it', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';
      const templateId = '987e6543-e21b-12d3-a456-426614174999';

      // Setup data
      await Requirement.create({
        session_id: sessionId,
        business_type: 'portfolio',
        key_features: ['gallery', 'projects'],
        target_audience: 'creative professionals',
        design_preferences: 'elegant and artistic',
        additional_notes: 'Test portfolio',
        extracted_at: new Date(),
        version_number: 1
      });

      await Template.create({
        id: templateId,
        name: 'Portfolio Template',
        business_types: ['portfolio', 'creative'],
        supported_features: ['gallery', 'projects'],
        design_tags: ['elegant', 'artistic'],
        description: 'Portfolio template',
        preview_image_url: 'https://example.com/preview.jpg'
      });

      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure: {
          session_id: sessionId,
          template_id: templateId,
          pages: [
            {
              page_id: 'page-1',
              name: 'Home',
              slug: '/',
              sections: [
                {
                  section_id: 'section-1',
                  type: 'hero',
                  order: 1,
                  required_features: [],
                  content_hints: 'Hero'
                }
              ]
            }
          ],
          generated_at: new Date()
        }
      });

      // Generate content
      const generateResponse = await request(app)
        .post('/api/content/generate')
        .send({ session_id: sessionId, template_id: templateId });

      expect(generateResponse.status).toBe(201);

      // Retrieve content
      const retrieveResponse = await request(app)
        .get(`/api/content/${sessionId}/${templateId}`);

      expect(retrieveResponse.status).toBe(200);
      expect(retrieveResponse.body.contents).toHaveLength(generateResponse.body.content_count);
    });

    it('should handle multiple templates for same session', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';
      const templateId1 = '987e6543-e21b-12d3-a456-426614174111';
      const templateId2 = '987e6543-e21b-12d3-a456-426614174222';

      // Create requirement
      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['blog'],
        target_audience: 'readers',
        design_preferences: 'modern',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1
      });

      // Create two templates
      await Template.create({
        id: templateId1,
        name: 'Template 1',
        business_types: ['blog'],
        supported_features: ['blog'],
        design_tags: ['modern'],
        description: 'Test 1',
        preview_image_url: 'https://example.com/preview1.jpg'
      });

      await Template.create({
        id: templateId2,
        name: 'Template 2',
        business_types: ['blog'],
        supported_features: ['blog'],
        design_tags: ['modern'],
        description: 'Test 2',
        preview_image_url: 'https://example.com/preview2.jpg'
      });

      // Create page structures
      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId1,
        structure: {
          session_id: sessionId,
          template_id: templateId1,
          pages: [
            {
              page_id: 'page-1',
              name: 'Home',
              slug: '/',
              sections: [{ section_id: 's1', type: 'hero', order: 1, required_features: [], content_hints: '' }]
            }
          ],
          generated_at: new Date()
        }
      });

      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId2,
        structure: {
          session_id: sessionId,
          template_id: templateId2,
          pages: [
            {
              page_id: 'page-1',
              name: 'Home',
              slug: '/',
              sections: [{ section_id: 's1', type: 'hero', order: 1, required_features: [], content_hints: '' }]
            }
          ],
          generated_at: new Date()
        }
      });

      // Generate content for both
      const response1 = await request(app)
        .post('/api/content/generate')
        .send({ session_id: sessionId, template_id: templateId1 });

      const response2 = await request(app)
        .post('/api/content/generate')
        .send({ session_id: sessionId, template_id: templateId2 });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);

      // Retrieve content for each template
      const retrieve1 = await request(app)
        .get(`/api/content/${sessionId}/${templateId1}`);

      const retrieve2 = await request(app)
        .get(`/api/content/${sessionId}/${templateId2}`);

      expect(retrieve1.status).toBe(200);
      expect(retrieve2.status).toBe(200);
      expect(retrieve1.body.contents).not.toEqual(retrieve2.body.contents);
    });
  });
});
