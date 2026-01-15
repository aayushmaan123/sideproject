/**
 * Unit tests for Requirement model
 */

import { Requirement } from '../Requirement';
import { syncDatabase, closeConnection } from '../../database/config';
import { v4 as uuidv4 } from 'uuid';

describe('Requirement Model', () => {
  beforeAll(async () => {
    // Use in-memory database for testing
    await syncDatabase(true); // force: true to drop existing tables
  });

  afterAll(async () => {
    await closeConnection();
  });

  afterEach(async () => {
    // Clean up after each test
    await Requirement.destroy({ where: {}, truncate: true });
  });

  describe('Model Validation', () => {
    test('should create a valid requirement', async () => {
      const sessionId = uuidv4();
      const requirement = await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['shopping cart', 'payment integration'],
        target_audience: 'online shoppers',
        design_preferences: 'modern and clean',
        additional_notes: 'Focus on user experience',
        extracted_at: new Date(),
        version_number: 1,
      });

      expect(requirement.id).toBeDefined();
      expect(requirement.session_id).toBe(sessionId);
      expect(requirement.business_type).toBe('e-commerce');
      expect(requirement.key_features).toEqual(['shopping cart', 'payment integration']);
      expect(requirement.version_number).toBe(1);
    });

    test('should auto-generate UUID for id', async () => {
      const requirement = await Requirement.create({
        session_id: uuidv4(),
        business_type: 'blog',
        key_features: ['blog posts'],
        target_audience: 'readers',
        design_preferences: 'minimalist',
        additional_notes: '',
        extracted_at: new Date(),
      });

      expect(requirement.id).toBeDefined();
      expect(requirement.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    test('should default version_number to 1', async () => {
      const requirement = await Requirement.create({
        session_id: uuidv4(),
        business_type: 'portfolio',
        key_features: ['gallery'],
        target_audience: 'clients',
        design_preferences: 'artistic',
        additional_notes: '',
        extracted_at: new Date(),
      });

      expect(requirement.version_number).toBe(1);
    });

    test('should validate session_id is UUID', async () => {
      await expect(
        Requirement.create({
          session_id: 'not-a-uuid',
          business_type: 'blog',
          key_features: [],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date(),
        })
      ).rejects.toThrow();
    });

    test('should reject null session_id', async () => {
      await expect(
        Requirement.create({
          session_id: null as unknown as string,
          business_type: 'blog',
          key_features: [],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date(),
        })
      ).rejects.toThrow();
    });

    test('should reject empty business_type', async () => {
      await expect(
        Requirement.create({
          session_id: uuidv4(),
          business_type: '',
          key_features: [],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date(),
        })
      ).rejects.toThrow();
    });

    test('should reject non-array key_features', async () => {
      await expect(
        Requirement.create({
          session_id: uuidv4(),
          business_type: 'blog',
          key_features: 'not-an-array' as unknown as string[],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date(),
        })
      ).rejects.toThrow();
    });

    test('should reject key_features with non-string items', async () => {
      await expect(
        Requirement.create({
          session_id: uuidv4(),
          business_type: 'blog',
          key_features: [123, 'valid'] as unknown as string[],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date(),
        })
      ).rejects.toThrow();
    });

    test('should accept empty key_features array', async () => {
      const requirement = await Requirement.create({
        session_id: uuidv4(),
        business_type: 'blog',
        key_features: [],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: '',
        extracted_at: new Date(),
      });

      expect(requirement.key_features).toEqual([]);
    });

    test('should validate version_number is positive', async () => {
      await expect(
        Requirement.create({
          session_id: uuidv4(),
          business_type: 'blog',
          key_features: [],
          target_audience: 'readers',
          design_preferences: 'minimal',
          additional_notes: '',
          extracted_at: new Date(),
          version_number: 0,
        })
      ).rejects.toThrow();
    });
  });

  describe('Timestamps', () => {
    test('should auto-generate createdAt and updatedAt', async () => {
      const requirement = await Requirement.create({
        session_id: uuidv4(),
        business_type: 'blog',
        key_features: ['posts'],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: '',
        extracted_at: new Date(),
      });

      expect(requirement.createdAt).toBeInstanceOf(Date);
      expect(requirement.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt on modification', async () => {
      const requirement = await Requirement.create({
        session_id: uuidv4(),
        business_type: 'blog',
        key_features: ['posts'],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: '',
        extracted_at: new Date(),
      });

      const originalUpdatedAt = requirement.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      requirement.business_type = 'updated blog';
      await requirement.save();

      expect(requirement.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Versioning', () => {
    test('should allow multiple versions for same session', async () => {
      const sessionId = uuidv4();

      const v1 = await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['posts'],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      const v2 = await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['posts', 'comments'],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: 'Added comments',
        extracted_at: new Date(),
        version_number: 2,
      });

      expect(v1.version_number).toBe(1);
      expect(v2.version_number).toBe(2);
      expect(v1.session_id).toBe(v2.session_id);
    });

    test('should enforce unique session_id + version_number combination', async () => {
      const sessionId = uuidv4();

      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['posts'],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      // Try to create another version 1 for same session
      await expect(
        Requirement.create({
          session_id: sessionId,
          business_type: 'updated blog',
          key_features: ['posts', 'tags'],
          target_audience: 'readers',
          design_preferences: 'modern',
          additional_notes: '',
          extracted_at: new Date(),
          version_number: 1,
        })
      ).rejects.toThrow();
    });

    test('should retrieve all versions for a session', async () => {
      const sessionId = uuidv4();

      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['posts'],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['posts', 'comments'],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 2,
      });

      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['posts', 'comments', 'tags'],
        target_audience: 'readers',
        design_preferences: 'minimal',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 3,
      });

      const allVersions = await Requirement.findAll({
        where: { session_id: sessionId },
        order: [['version_number', 'ASC']],
      });

      expect(allVersions).toHaveLength(3);
      expect(allVersions[0].version_number).toBe(1);
      expect(allVersions[1].version_number).toBe(2);
      expect(allVersions[2].version_number).toBe(3);
    });
  });
});
