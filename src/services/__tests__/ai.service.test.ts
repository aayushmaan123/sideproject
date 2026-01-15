/**
 * Unit tests for AI Service
 */

import { AIService } from '../ai.service';

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    // Use mock mode (no API key)
    delete process.env.OPENAI_API_KEY;
    aiService = new AIService();
  });

  describe('extractRequirements', () => {
    test('should extract requirements from e-commerce input', async () => {
      const result = await aiService.extractRequirements(
        'I want to build an online shop for selling clothes',
        'test-session-1'
      );

      expect(result).toHaveProperty('business_type');
      expect(result.business_type).toBe('e-commerce');
      expect(result).toHaveProperty('key_features');
      expect(Array.isArray(result.key_features)).toBe(true);
      expect(result.key_features!.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('target_audience');
      expect(result).toHaveProperty('design_preferences');
      expect(result).toHaveProperty('additional_notes');
    });

    test('should extract requirements from blog input', async () => {
      const result = await aiService.extractRequirements(
        'I need a blog to write articles about technology',
        'test-session-2'
      );

      expect(result.business_type).toBe('blog');
      expect(result.key_features!).toContain('blog section');
    });

    test('should extract requirements from portfolio input', async () => {
      const result = await aiService.extractRequirements(
        'Create a portfolio website to showcase my work',
        'test-session-3'
      );

      expect(result.business_type).toBe('portfolio');
      expect(Array.isArray(result.key_features)).toBe(true);
    });

    test('should handle input with contact form mention', async () => {
      const result = await aiService.extractRequirements(
        'I want a website with a contact form',
        'test-session-4'
      );

      expect(result.key_features!).toContain('contact form');
    });

    test('should handle input with payment mention', async () => {
      const result = await aiService.extractRequirements(
        'Need online payment and checkout functionality',
        'test-session-5'
      );

      expect(result.key_features!).toContain('payment integration');
    });

    test('should handle input with gallery mention', async () => {
      const result = await aiService.extractRequirements(
        'I need a photo gallery for my photography',
        'test-session-6'
      );

      expect(result.key_features!).toContain('image gallery');
    });

    test('should provide default features for generic input', async () => {
      const result = await aiService.extractRequirements(
        'I want a website',
        'test-session-7'
      );

      expect(result.business_type).toBe('general website');
      expect(result.key_features!).toContain('homepage');
      expect(result.key_features!).toContain('about page');
    });

    test('should handle long input text', async () => {
      const longText = 'I want to build a comprehensive e-commerce platform '.repeat(20);
      const result = await aiService.extractRequirements(
        longText,
        'test-session-8'
      );

      expect(result).toHaveProperty('business_type');
      expect(result).toHaveProperty('key_features');
      expect(Array.isArray(result.key_features)).toBe(true);
    });

    test('should return all required fields', async () => {
      const result = await aiService.extractRequirements(
        'Build a business website',
        'test-session-9'
      );

      expect(result).toHaveProperty('business_type');
      expect(result).toHaveProperty('key_features');
      expect(result).toHaveProperty('target_audience');
      expect(result).toHaveProperty('design_preferences');
      expect(result).toHaveProperty('additional_notes');
      
      expect(typeof result.business_type).toBe('string');
      expect(Array.isArray(result.key_features)).toBe(true);
      expect(typeof result.target_audience).toBe('string');
      expect(typeof result.design_preferences).toBe('string');
      expect(typeof result.additional_notes).toBe('string');
    });
  });
});
