/**
 * Integration tests for the extract API endpoint
 */

import request from 'supertest';
import app from '../../index';

describe('POST /api/extract', () => {
  const validSessionId = '123e4567-e89b-12d3-a456-426614174000';

  describe('Valid extractions', () => {
    test('should extract requirements from e-commerce input', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: 'I want to build an online store to sell handmade jewelry',
        })
        .expect(200);

      expect(response.body).toHaveProperty('session_id', validSessionId);
      expect(response.body).toHaveProperty('business_type');
      expect(response.body).toHaveProperty('key_features');
      expect(Array.isArray(response.body.key_features)).toBe(true);
      expect(response.body.key_features.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('target_audience');
      expect(response.body).toHaveProperty('design_preferences');
      expect(response.body).toHaveProperty('additional_notes');
      expect(response.body).toHaveProperty('extracted_at');
      
      // Verify extracted_at is valid ISO 8601 timestamp
      expect(() => new Date(response.body.extracted_at)).not.toThrow();
    });

    test('should extract requirements from blog input', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: 'I need a blog for writing about travel and photography',
        })
        .expect(200);

      expect(response.body.business_type).toBe('blog');
      expect(response.body.key_features).toContain('blog section');
    });

    test('should extract requirements from portfolio input', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: 'Create a portfolio to showcase my design projects',
        })
        .expect(200);

      expect(response.body.business_type).toBe('portfolio');
    });

    test('should handle input with specific features', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: 'I want a website with contact form and payment integration',
        })
        .expect(200);

      expect(response.body.key_features).toContain('contact form');
      expect(response.body.key_features).toContain('payment integration');
    });

    test('should apply default values for minimal input', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: 'I need a website',
        })
        .expect(200);

      expect(response.body.business_type).toBe('general website');
      expect(response.body.key_features).toContain('homepage');
      expect(response.body.target_audience).toBe('general public');
      expect(response.body.design_preferences).toBe('modern and clean');
    });

    test('should handle business website input', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: 'I need a company website for my consulting business',
        })
        .expect(200);

      expect(response.body.business_type).toBe('business website');
    });
  });

  describe('Validation errors', () => {
    test('should reject missing session_id', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          text: 'some text',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('session_id is required');
    });

    test('should reject invalid session_id format', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: 'not-a-uuid',
          text: 'some text',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('valid UUID format');
    });

    test('should reject missing text', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('text is required');
    });

    test('should reject empty text', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: '',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('text cannot be empty');
    });
  });

  describe('Response structure', () => {
    test('should return all required fields with correct types', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: 'I want to build a modern e-commerce store',
        })
        .expect(200);

      // Check all fields exist
      expect(response.body).toHaveProperty('session_id');
      expect(response.body).toHaveProperty('business_type');
      expect(response.body).toHaveProperty('key_features');
      expect(response.body).toHaveProperty('target_audience');
      expect(response.body).toHaveProperty('design_preferences');
      expect(response.body).toHaveProperty('additional_notes');
      expect(response.body).toHaveProperty('extracted_at');

      // Check types
      expect(typeof response.body.session_id).toBe('string');
      expect(typeof response.body.business_type).toBe('string');
      expect(Array.isArray(response.body.key_features)).toBe(true);
      expect(typeof response.body.target_audience).toBe('string');
      expect(typeof response.body.design_preferences).toBe('string');
      expect(typeof response.body.additional_notes).toBe('string');
      expect(typeof response.body.extracted_at).toBe('string');

      // Verify key_features is an array of strings
      response.body.key_features.forEach((feature: unknown) => {
        expect(typeof feature).toBe('string');
      });
    });

    test('should preserve session_id from request', async () => {
      const customSessionId = '987e6543-e21b-12d3-a456-426614174999';
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: customSessionId,
          text: 'Build a portfolio website',
        })
        .expect(200);

      expect(response.body.session_id).toBe(customSessionId);
    });

    test('should have valid ISO 8601 timestamp', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: 'Create a blog',
        })
        .expect(200);

      const timestamp = new Date(response.body.extracted_at);
      expect(timestamp.toISOString()).toBe(response.body.extracted_at);
      
      // Should be recent (within last 5 seconds)
      const now = new Date();
      const diff = now.getTime() - timestamp.getTime();
      expect(diff).toBeLessThan(5000);
    });
  });

  describe('Edge cases', () => {
    test('should handle very long text input', async () => {
      const longText = 'I want to build an e-commerce platform '.repeat(50);
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: longText,
        })
        .expect(200);

      expect(response.body).toHaveProperty('business_type');
      expect(response.body).toHaveProperty('key_features');
    });

    test('should handle text with multiple feature mentions', async () => {
      const response = await request(app)
        .post('/api/extract')
        .send({
          session_id: validSessionId,
          text: 'I need a website with contact form, payment system, photo gallery, and blog',
        })
        .expect(200);

      expect(response.body.key_features.length).toBeGreaterThan(2);
      expect(response.body.key_features).toContain('contact form');
    });
  });
});
