/**
 * Integration tests for requirements API endpoints
 */

import request from 'supertest';
import app from '../../index';
import { syncDatabase, closeConnection } from '../../database/config';
import { Requirement } from '../../models/Requirement';
import { v4 as uuidv4 } from 'uuid';

describe('Requirements API', () => {
  beforeAll(async () => {
    await syncDatabase(true); // Reset database
  });

  afterAll(async () => {
    await closeConnection();
  });

  afterEach(async () => {
    // Clean up after each test
    await Requirement.destroy({ where: {}, truncate: true });
  });

  describe('POST /api/requirements', () => {
    const validSessionId = uuidv4();

    test('should save valid requirement and return 201', async () => {
      const response = await request(app)
        .post('/api/requirements')
        .send({
          session_id: validSessionId,
          business_type: 'e-commerce',
          key_features: ['shopping cart', 'payment integration'],
          target_audience: 'online shoppers',
          design_preferences: 'modern and clean',
          additional_notes: 'Focus on user experience',
          extracted_at: new Date().toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('requirement_id');
      expect(response.body).toHaveProperty('version_number', 1);
      expect(response.body).toHaveProperty('session_id', validSessionId);
      expect(response.body).toHaveProperty('message');
    });

    test('should increment version number for same session', async () => {
      // First save
      const response1 = await request(app)
        .post('/api/requirements')
        .send({
          session_id: validSessionId,
          business_type: 'blog',
          key_features: ['posts'],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date().toISOString(),
        })
        .expect(201);

      expect(response1.body.version_number).toBe(1);

      // Second save (same session)
      const response2 = await request(app)
        .post('/api/requirements')
        .send({
          session_id: validSessionId,
          business_type: 'blog',
          key_features: ['posts', 'comments'],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: 'Added comments',
          extracted_at: new Date().toISOString(),
        })
        .expect(201);

      expect(response2.body.version_number).toBe(2);
    });

    test('should reject request with missing session_id', async () => {
      const response = await request(app)
        .post('/api/requirements')
        .send({
          business_type: 'blog',
          key_features: ['posts'],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date().toISOString(),
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject request with invalid session_id format', async () => {
      const response = await request(app)
        .post('/api/requirements')
        .send({
          session_id: 'not-a-uuid',
          business_type: 'blog',
          key_features: ['posts'],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date().toISOString(),
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('valid UUID format');
    });

    test('should reject request with missing business_type', async () => {
      const response = await request(app)
        .post('/api/requirements')
        .send({
          session_id: validSessionId,
          key_features: ['posts'],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date().toISOString(),
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject request with non-array key_features', async () => {
      const response = await request(app)
        .post('/api/requirements')
        .send({
          session_id: validSessionId,
          business_type: 'blog',
          key_features: 'not-an-array',
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date().toISOString(),
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('must be an array');
    });
  });

  describe('GET /api/requirements/:session_id', () => {
    const validSessionId = uuidv4();

    beforeEach(async () => {
      // Create test data
      await Requirement.create({
        session_id: validSessionId,
        business_type: 'blog',
        key_features: ['posts'],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Requirement.create({
        session_id: validSessionId,
        business_type: 'blog',
        key_features: ['posts', 'comments'],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: 'Added comments',
        extracted_at: new Date(),
        version_number: 2,
      });
    });

    test('should retrieve all versions for a session', async () => {
      const response = await request(app)
        .get(`/api/requirements/${validSessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('session_id', validSessionId);
      expect(response.body).toHaveProperty('requirements');
      expect(Array.isArray(response.body.requirements)).toBe(true);
      expect(response.body.requirements).toHaveLength(2);
      
      // Should be ordered by createdAt DESC (newest first)
      expect(response.body.requirements[0].version_number).toBe(2);
      expect(response.body.requirements[1].version_number).toBe(1);
    });

    test('should retrieve only latest version when latest=true', async () => {
      const response = await request(app)
        .get(`/api/requirements/${validSessionId}?latest=true`)
        .expect(200);

      expect(response.body.requirements).toHaveLength(1);
      expect(response.body.requirements[0].version_number).toBe(2);
      expect(response.body.requirements[0].key_features).toContain('comments');
    });

    test('should return 404 for non-existent session', async () => {
      const nonExistentSession = uuidv4();
      const response = await request(app)
        .get(`/api/requirements/${nonExistentSession}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No requirements found');
    });

    test('should return 400 for invalid session_id format', async () => {
      const response = await request(app)
        .get('/api/requirements/not-a-uuid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('valid UUID format');
    });

    test('should return correct structure for each requirement', async () => {
      const response = await request(app)
        .get(`/api/requirements/${validSessionId}`)
        .expect(200);

      const requirement = response.body.requirements[0];
      expect(requirement).toHaveProperty('id');
      expect(requirement).toHaveProperty('session_id');
      expect(requirement).toHaveProperty('business_type');
      expect(requirement).toHaveProperty('key_features');
      expect(requirement).toHaveProperty('target_audience');
      expect(requirement).toHaveProperty('design_preferences');
      expect(requirement).toHaveProperty('additional_notes');
      expect(requirement).toHaveProperty('extracted_at');
      expect(requirement).toHaveProperty('version_number');
      expect(requirement).toHaveProperty('createdAt');
      expect(requirement).toHaveProperty('updatedAt');
    });
  });

  describe('Integration: POST then GET', () => {
    test('should save and retrieve requirement successfully', async () => {
      const sessionId = uuidv4();

      // Save requirement
      const saveResponse = await request(app)
        .post('/api/requirements')
        .send({
          session_id: sessionId,
          business_type: 'portfolio',
          key_features: ['gallery', 'contact form'],
          target_audience: 'clients',
          design_preferences: 'elegant',
          additional_notes: 'Showcase previous work',
          extracted_at: new Date().toISOString(),
        })
        .expect(201);

      const requirementId = saveResponse.body.requirement_id;

      // Retrieve requirement
      const getResponse = await request(app)
        .get(`/api/requirements/${sessionId}`)
        .expect(200);

      expect(getResponse.body.requirements).toHaveLength(1);
      expect(getResponse.body.requirements[0].id).toBe(requirementId);
      expect(getResponse.body.requirements[0].business_type).toBe('portfolio');
      expect(getResponse.body.requirements[0].key_features).toEqual(['gallery', 'contact form']);
    });
  });
});
