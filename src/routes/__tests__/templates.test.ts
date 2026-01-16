/**
 * Template Selection API Tests
 */

import request from 'supertest';
import app from '../../index';
import { sequelize } from '../../database/config';
import { Template } from '../../models/Template';
import { Requirement } from '../../models/Requirement';
import { v4 as uuidv4 } from 'uuid';

describe('Template Selection API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Seed test templates
    await Template.create({
      name: 'E-Commerce Template',
      business_types: ['e-commerce', 'online store'],
      supported_features: ['product catalog', 'shopping cart', 'payment integration'],
      design_tags: ['modern', 'professional'],
      description: 'E-commerce template',
      preview_image_url: 'https://example.com/ecommerce.jpg',
    });

    await Template.create({
      name: 'Restaurant Template',
      business_types: ['restaurant', 'food service'],
      supported_features: ['menu', 'reservations', 'online ordering'],
      design_tags: ['elegant', 'food-focused'],
      description: 'Restaurant template',
      preview_image_url: 'https://example.com/restaurant.jpg',
    });

    await Template.create({
      name: 'Blog Template',
      business_types: ['blog', 'content'],
      supported_features: ['blog posts', 'categories', 'comments'],
      design_tags: ['minimalist', 'clean'],
      description: 'Blog template',
      preview_image_url: 'https://example.com/blog.jpg',
    });
  });

  afterEach(async () => {
    await Requirement.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await Template.destroy({ where: {}, truncate: true });
    await sequelize.close();
  });

  describe('GET /api/templates/select/:session_id', () => {
    it('should return top 3 matching templates by default', async () => {
      const sessionId = uuidv4();
      
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

      const response = await request(app).get(`/api/templates/select/${sessionId}`);

      expect(response.status).toBe(200);
      expect(response.body.session_id).toBe(sessionId);
      expect(response.body.selected_templates).toBeInstanceOf(Array);
      expect(response.body.selected_templates.length).toBeLessThanOrEqual(3);
      expect(response.body.selected_templates[0].template_id).toBeDefined();
      expect(response.body.selected_templates[0].name).toBeDefined();
      expect(response.body.selected_templates[0].score).toBeDefined();
      expect(response.body.selected_templates[0].match_reasons).toBeDefined();
      expect(response.body.selected_templates[0].preview_image_url).toBeDefined();
      expect(response.body.selected_templates[0].description).toBeDefined();
    });

    it('should return limited number of templates when limit specified', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['blog posts'],
        target_audience: 'readers',
        design_preferences: 'clean',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const response = await request(app).get(`/api/templates/select/${sessionId}?limit=1`);

      expect(response.status).toBe(200);
      expect(response.body.selected_templates.length).toBe(1);
    });

    it('should return templates sorted by score (highest first)', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'restaurant',
        key_features: ['menu', 'reservations'],
        target_audience: 'diners',
        design_preferences: 'elegant',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const response = await request(app).get(`/api/templates/select/${sessionId}`);

      expect(response.status).toBe(200);
      expect(response.body.selected_templates[0].name).toBe('Restaurant Template');
      
      // Verify sorting
      const scores = response.body.selected_templates.map((t: { score: number }) => t.score);
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    });

    it('should include match reasons in response', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['shopping cart'],
        target_audience: 'shoppers',
        design_preferences: 'modern',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const response = await request(app).get(`/api/templates/select/${sessionId}`);

      expect(response.status).toBe(200);
      expect(response.body.selected_templates[0].match_reasons).toBeInstanceOf(Array);
      expect(response.body.selected_templates[0].match_reasons.length).toBeGreaterThan(0);
      
      const reason = response.body.selected_templates[0].match_reasons[0];
      expect(reason.category).toBeDefined();
      expect(reason.matched).toBeDefined();
      expect(reason.score).toBeDefined();
    });

    it('should return 400 for invalid session_id format', async () => {
      const response = await request(app).get('/api/templates/select/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('session_id must be a valid UUID format');
    });

    it('should return 400 for invalid limit parameter', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['blog posts'],
        target_audience: 'readers',
        design_preferences: 'clean',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const response = await request(app).get(`/api/templates/select/${sessionId}?limit=20`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('limit must be a number between 1 and 10');
    });

    it('should return 400 for non-numeric limit parameter', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['blog posts'],
        target_audience: 'readers',
        design_preferences: 'clean',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const response = await request(app).get(`/api/templates/select/${sessionId}?limit=abc`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('limit must be a number between 1 and 10');
    });

    it('should return 404 when no requirements found for session', async () => {
      const sessionId = uuidv4();

      const response = await request(app).get(`/api/templates/select/${sessionId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('No requirements found for this session');
    });

    it('should use latest version when multiple versions exist', async () => {
      const sessionId = uuidv4();
      
      // Version 1 - blog
      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['blog posts'],
        target_audience: 'readers',
        design_preferences: 'clean',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      // Version 2 - e-commerce (latest)
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['shopping cart'],
        target_audience: 'shoppers',
        design_preferences: 'modern',
        additional_notes: 'Updated',
        extracted_at: new Date(),
        version_number: 2,
      });

      const response = await request(app).get(`/api/templates/select/${sessionId}`);

      expect(response.status).toBe(200);
      // Should match e-commerce (v2), not blog (v1)
      expect(response.body.selected_templates[0].name).toBe('E-Commerce Template');
    });

    it('should handle edge case with limit=10 (max)', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'general',
        key_features: ['contact form'],
        target_audience: 'general',
        design_preferences: 'simple',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const response = await request(app).get(`/api/templates/select/${sessionId}?limit=10`);

      expect(response.status).toBe(200);
      // Should return all templates (3 in test db)
      expect(response.body.selected_templates.length).toBe(3);
    });

    it('should return all required fields for each template', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['product catalog'],
        target_audience: 'shoppers',
        design_preferences: 'modern',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const response = await request(app).get(`/api/templates/select/${sessionId}`);

      expect(response.status).toBe(200);
      
      const template = response.body.selected_templates[0];
      expect(template).toHaveProperty('template_id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('score');
      expect(template).toHaveProperty('match_reasons');
      expect(template).toHaveProperty('preview_image_url');
      expect(template).toHaveProperty('description');
      
      expect(typeof template.template_id).toBe('string');
      expect(typeof template.name).toBe('string');
      expect(typeof template.score).toBe('number');
      expect(Array.isArray(template.match_reasons)).toBe(true);
      expect(typeof template.preview_image_url).toBe('string');
      expect(typeof template.description).toBe('string');
    });
  });
});
