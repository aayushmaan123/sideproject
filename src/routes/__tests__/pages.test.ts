/**
 * Integration tests for Pages routes
 */

import request from 'supertest';
import express from 'express';
import { sequelize } from '../../database/config';
import pagesRouter from '../pages';
import { Requirement } from '../../models/Requirement';
import { Template } from '../../models/Template';
import PageStructure from '../../models/PageStructure';
import { v4 as uuidv4 } from 'uuid';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/pages', pagesRouter);

describe('Pages Routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Requirement.destroy({ where: {}, truncate: true });
    await Template.destroy({ where: {}, truncate: true });
    await PageStructure.destroy({ where: {}, truncate: true });
  });

  describe('POST /api/pages/generate', () => {
    it('should generate and store page structure successfully', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      // Create requirement
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['product catalog', 'shopping cart'],
        target_audience: 'shoppers',
        design_preferences: 'modern',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      // Create template
      await Template.create({
        id: templateId,
        name: 'E-Commerce',
        business_types: ['e-commerce'],
        supported_features: ['product catalog', 'shopping cart'],
        design_tags: ['modern'],
        description: 'E-commerce template',
        preview_image_url: 'https://example.com/ecom.jpg',
      });

      const response = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: sessionId, template_id: templateId });

      expect(response.status).toBe(201);
      expect(response.body.page_structure_id).toBeDefined();
      expect(response.body.session_id).toBe(sessionId);
      expect(response.body.template_id).toBe(templateId);
      expect(response.body.pages).toBeDefined();
      expect(Array.isArray(response.body.pages)).toBe(true);
      expect(response.body.pages.length).toBeGreaterThan(0);
      expect(response.body.generated_at).toBeDefined();
      expect(response.body.message).toBe('Page structure generated successfully');
    });

    it('should return existing page structure if already generated', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      // Create requirement
      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['posts'],
        target_audience: 'readers',
        design_preferences: 'clean',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      // Create template
      await Template.create({
        id: templateId,
        name: 'Blog',
        business_types: ['blog'],
        supported_features: ['posts'],
        design_tags: ['clean'],
        description: 'Blog template',
        preview_image_url: 'https://example.com/blog.jpg',
      });

      // First request - should create
      const firstResponse = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: sessionId, template_id: templateId });

      expect(firstResponse.status).toBe(201);
      const firstId = firstResponse.body.page_structure_id;

      // Second request - should return existing
      const secondResponse = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: sessionId, template_id: templateId });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.page_structure_id).toBe(firstId);
      expect(secondResponse.body.message).toBe('Page structure already exists');
    });

    it('should return 400 for missing session_id', async () => {
      const response = await request(app)
        .post('/api/pages/generate')
        .send({ template_id: uuidv4() });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('session_id is required');
    });

    it('should return 400 for invalid session_id format', async () => {
      const response = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: 'invalid-uuid', template_id: uuidv4() });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be a valid UUID');
    });

    it('should return 400 for missing template_id', async () => {
      const response = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: uuidv4() });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('template_id is required');
    });

    it('should return 400 for invalid template_id format', async () => {
      const response = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: uuidv4(), template_id: 'invalid-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be a valid UUID');
    });

    it('should return 404 when requirement not found', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      // Create template but no requirement
      await Template.create({
        id: templateId,
        name: 'Template',
        business_types: ['default'],
        supported_features: ['homepage'],
        design_tags: ['clean'],
        description: 'Template',
        preview_image_url: 'https://example.com/template.jpg',
      });

      const response = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: sessionId, template_id: templateId });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('No requirement found');
    });

    it('should return 404 when template not found', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      // Create requirement but no template
      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['posts'],
        target_audience: 'readers',
        design_preferences: 'simple',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      const response = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: sessionId, template_id: templateId });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Template');
      expect(response.body.error).toContain('not found');
    });

    it('should generate different structures for different templates', async () => {
      const sessionId = uuidv4();
      const templateId1 = uuidv4();
      const templateId2 = uuidv4();

      // Create requirement
      await Requirement.create({
        session_id: sessionId,
        business_type: 'portfolio',
        key_features: ['gallery', 'projects'],
        target_audience: 'clients',
        design_preferences: 'minimal',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      // Create two different templates
      await Template.create({
        id: templateId1,
        name: 'Portfolio A',
        business_types: ['portfolio'],
        supported_features: ['gallery', 'projects'],
        design_tags: ['minimal'],
        description: 'Portfolio A',
        preview_image_url: 'https://example.com/porta.jpg',
      });

      await Template.create({
        id: templateId2,
        name: 'Portfolio B',
        business_types: ['creative'],
        supported_features: ['gallery', 'projects'],
        design_tags: ['artistic'],
        description: 'Portfolio B',
        preview_image_url: 'https://example.com/portb.jpg',
      });

      // Generate for both templates
      const response1 = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: sessionId, template_id: templateId1 });

      const response2 = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: sessionId, template_id: templateId2 });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.page_structure_id).not.toBe(response2.body.page_structure_id);
      expect(response1.body.template_id).toBe(templateId1);
      expect(response2.body.template_id).toBe(templateId2);
    });
  });

  describe('GET /api/pages/:session_id/:template_id', () => {
    it('should retrieve existing page structure', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      // Create requirement and template
      await Requirement.create({
        session_id: sessionId,
        business_type: 'saas',
        key_features: ['pricing', 'features'],
        target_audience: 'businesses',
        design_preferences: 'professional',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'SaaS',
        business_types: ['saas'],
        supported_features: ['pricing', 'features'],
        design_tags: ['professional'],
        description: 'SaaS template',
        preview_image_url: 'https://example.com/saas.jpg',
      });

      // Generate page structure first
      await request(app)
        .post('/api/pages/generate')
        .send({ session_id: sessionId, template_id: templateId });

      // Now retrieve it
      const response = await request(app)
        .get(`/api/pages/${sessionId}/${templateId}`);

      expect(response.status).toBe(200);
      expect(response.body.page_structure_id).toBeDefined();
      expect(response.body.session_id).toBe(sessionId);
      expect(response.body.template_id).toBe(templateId);
      expect(response.body.pages).toBeDefined();
      expect(response.body.generated_at).toBeDefined();
    });

    it('should return 404 when page structure not found', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const response = await request(app)
        .get(`/api/pages/${sessionId}/${templateId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 for invalid session_id format', async () => {
      const response = await request(app)
        .get(`/api/pages/invalid-uuid/${uuidv4()}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be a valid UUID');
    });

    it('should return 400 for invalid template_id format', async () => {
      const response = await request(app)
        .get(`/api/pages/${uuidv4()}/invalid-uuid`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be a valid UUID');
    });
  });

  describe('Integration Flow', () => {
    it('should handle complete flow: generate → retrieve', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      // Create requirement and template
      await Requirement.create({
        session_id: sessionId,
        business_type: 'restaurant',
        key_features: ['menu', 'reservations', 'contact form'],
        target_audience: 'diners',
        design_preferences: 'warm and inviting',
        additional_notes: 'Family restaurant',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'Restaurant',
        business_types: ['restaurant'],
        supported_features: ['menu', 'reservations', 'contact form'],
        design_tags: ['warm', 'inviting'],
        description: 'Restaurant template',
        preview_image_url: 'https://example.com/restaurant.jpg',
      });

      // Generate
      const generateResponse = await request(app)
        .post('/api/pages/generate')
        .send({ session_id: sessionId, template_id: templateId });

      expect(generateResponse.status).toBe(201);
      const pageStructureId = generateResponse.body.page_structure_id;

      // Retrieve
      const retrieveResponse = await request(app)
        .get(`/api/pages/${sessionId}/${templateId}`);

      expect(retrieveResponse.status).toBe(200);
      expect(retrieveResponse.body.page_structure_id).toBe(pageStructureId);
      expect(retrieveResponse.body.pages).toEqual(generateResponse.body.pages);
    });
  });
});
