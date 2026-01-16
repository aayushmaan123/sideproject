/**
 * Template Matcher Service Tests
 */

import { TemplateMatcherService } from '../template-matcher.service';
import { Template } from '../../models/Template';
import { Requirement } from '../../models/Requirement';
import { sequelize } from '../../database/config';
import { v4 as uuidv4 } from 'uuid';

describe('TemplateMatcherService', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Seed templates for testing
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
    await Template.destroy({ where: {}, truncate: true });
    await Requirement.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('matchTemplates', () => {
    it('should match e-commerce requirements to e-commerce template with highest score', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['product catalog', 'shopping cart', 'payment'],
        target_audience: 'online shoppers',
        design_preferences: 'modern',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const matches = await TemplateMatcherService.matchTemplates(sessionId);

      expect(matches.length).toBe(3);
      expect(matches[0].name).toBe('E-Commerce Template');
      expect(matches[0].score).toBeGreaterThan(0);
      expect(matches[0].match_reasons.length).toBeGreaterThan(0);
    });

    it('should match restaurant requirements to restaurant template', async () => {
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

      const matches = await TemplateMatcherService.matchTemplates(sessionId);

      expect(matches[0].name).toBe('Restaurant Template');
      expect(matches[0].score).toBeGreaterThan(0);
    });

    it('should match blog requirements to blog template', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['blog posts', 'categories'],
        target_audience: 'readers',
        design_preferences: 'minimalist clean',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const matches = await TemplateMatcherService.matchTemplates(sessionId);

      expect(matches[0].name).toBe('Blog Template');
    });

    it('should calculate correct scores based on matches', async () => {
      const sessionId = uuidv4();
      
      // Create requirement that matches e-commerce perfectly
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['product catalog', 'shopping cart', 'payment integration'],
        target_audience: 'shoppers',
        design_preferences: 'modern professional',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const matches = await TemplateMatcherService.matchTemplates(sessionId);
      const ecommerceMatch = matches.find((m) => m.name === 'E-Commerce Template');

      expect(ecommerceMatch).toBeDefined();
      // Should have: +3 for business type, +2 for each feature (6), +1 for each design tag (2) = 11
      expect(ecommerceMatch!.score).toBeGreaterThanOrEqual(9);
    });

    it('should include match reasons in results', async () => {
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

      const matches = await TemplateMatcherService.matchTemplates(sessionId);
      const ecommerceMatch = matches[0];

      expect(ecommerceMatch.match_reasons).toBeDefined();
      expect(ecommerceMatch.match_reasons.length).toBeGreaterThan(0);
      
      const businessTypeReason = ecommerceMatch.match_reasons.find((r) => r.category === 'business_type');
      expect(businessTypeReason).toBeDefined();
      expect(businessTypeReason!.score).toBe(3);
    });

    it('should use latest version when multiple versions exist', async () => {
      const sessionId = uuidv4();
      
      // Create version 1 - blog
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

      // Create version 2 - e-commerce (latest)
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['shopping cart'],
        target_audience: 'shoppers',
        design_preferences: 'modern',
        additional_notes: 'Updated to e-commerce',
        extracted_at: new Date(),
        version_number: 2,
      });

      const matches = await TemplateMatcherService.matchTemplates(sessionId);

      // Should match e-commerce (version 2), not blog (version 1)
      expect(matches[0].name).toBe('E-Commerce Template');
    });

    it('should throw error when no requirements found', async () => {
      const sessionId = uuidv4();
      
      await expect(TemplateMatcherService.matchTemplates(sessionId)).rejects.toThrow(
        'No requirements found for this session'
      );
    });

    it('should return all templates sorted by score', async () => {
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

      const matches = await TemplateMatcherService.matchTemplates(sessionId);

      expect(matches.length).toBe(3);
      // Verify sorting (each subsequent score should be <= previous)
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i].score).toBeLessThanOrEqual(matches[i - 1].score);
      }
    });
  });

  describe('getTopMatches', () => {
    it('should return top 3 matches by default', async () => {
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

      const matches = await TemplateMatcherService.getTopMatches(sessionId);

      expect(matches.length).toBe(3);
    });

    it('should return limited number of matches when specified', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'restaurant',
        key_features: ['menu'],
        target_audience: 'diners',
        design_preferences: 'elegant',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const matches = await TemplateMatcherService.getTopMatches(sessionId, 1);

      expect(matches.length).toBe(1);
      expect(matches[0].name).toBe('Restaurant Template');
    });

    it('should return highest scoring templates first', async () => {
      const sessionId = uuidv4();
      
      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['blog posts', 'categories'],
        target_audience: 'readers',
        design_preferences: 'minimalist',
        additional_notes: 'Test',
        extracted_at: new Date(),
        version_number: 1,
      });

      const matches = await TemplateMatcherService.getTopMatches(sessionId, 2);

      expect(matches.length).toBe(2);
      expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
    });
  });
});
