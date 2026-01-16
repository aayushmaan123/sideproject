/**
 * Unit tests for ContentGeneratorService
 */

import { ContentGeneratorService } from '../content-generator.service';
import { Requirement } from '../../models/Requirement';
import { Template } from '../../models/Template';
import { PageStructure } from '../../models/PageStructure';
import { sequelize } from '../../database/config';
import { v4 as uuidv4 } from 'uuid';

describe('ContentGeneratorService', () => {
  let service: ContentGeneratorService;
  let sessionId: string;
  let templateId: string;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    service = new ContentGeneratorService();
    sessionId = uuidv4();
    templateId = uuidv4();

    // Clean up
    await Requirement.destroy({ where: {}, truncate: true });
    await Template.destroy({ where: {}, truncate: true });
    await PageStructure.destroy({ where: {}, truncate: true });
  });

  describe('generateAllContent', () => {
    it('should generate content for e-commerce website', async () => {
      // Create requirement
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['product catalog', 'shopping cart', 'payment integration'],
        target_audience: 'online shoppers',
        design_preferences: 'modern and clean',
        additional_notes: 'Focus on user experience',
        extracted_at: new Date(),
        version_number: 1,
      });

      // Create template
      await Template.create({
        id: templateId,
        name: 'E-Commerce Template',
        business_types: ['e-commerce'],
        supported_features: ['product catalog', 'shopping cart'],
        design_tags: ['modern', 'clean'],
        description: 'Modern e-commerce template',
        preview_image_url: 'https://example.com/preview.jpg',
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
              page_id: uuidv4(),
              name: 'Home',
              slug: '/',
              sections: [
                {
                  section_id: uuidv4(),
                  type: 'hero',
                  order: 1,
                  required_features: [],
                  content_hints: 'Hero section',
                },
                {
                  section_id: uuidv4(),
                  type: 'features',
                  order: 2,
                  required_features: ['product catalog'],
                  content_hints: 'Features section',
                },
              ],
            },
          ],
          generated_at: new Date(),
        },
      });

      const content = await service.generateAllContent(sessionId, templateId);

      expect(content.has('/')).toBe(true);
      const homeContent = content.get('/');
      expect(homeContent?.has('hero')).toBe(true);
      expect(homeContent?.has('features')).toBe(true);

      const heroContent = homeContent?.get('hero');
      expect(heroContent).toHaveProperty('headline');
      expect(heroContent).toHaveProperty('subheadline');
      expect(heroContent).toHaveProperty('cta_text');
      expect(heroContent).toHaveProperty('cta_url');
      expect(heroContent.headline).toContain('Products');

      const featuresContent = homeContent?.get('features');
      expect(featuresContent).toHaveProperty('title');
      expect(featuresContent).toHaveProperty('features');
      expect(Array.isArray(featuresContent.features)).toBe(true);
      expect(featuresContent.features.length).toBe(3);
    });

    it('should generate content for restaurant website', async () => {
      await Requirement.create({
        session_id: sessionId,
        business_type: 'restaurant',
        key_features: ['menu', 'reservations', 'online ordering'],
        target_audience: 'food lovers',
        design_preferences: 'elegant and warm',
        additional_notes: 'Focus on ambiance',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'Restaurant Template',
        business_types: ['restaurant'],
        supported_features: ['menu', 'reservations'],
        design_tags: ['elegant'],
        description: 'Restaurant template',
        preview_image_url: 'https://example.com/preview.jpg',
      });

      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure: {
          session_id: sessionId,
          template_id: templateId,
          pages: [
            {
              page_id: uuidv4(),
              name: 'Home',
              slug: '/',
              sections: [
                {
                  section_id: uuidv4(),
                  type: 'hero',
                  order: 1,
                  required_features: [],
                  content_hints: 'Hero section',
                },
                {
                  section_id: uuidv4(),
                  type: 'menu',
                  order: 2,
                  required_features: ['menu'],
                  content_hints: 'Menu section',
                },
              ],
            },
          ],
          generated_at: new Date(),
        },
      });

      const content = await service.generateAllContent(sessionId, templateId);

      const homeContent = content.get('/');
      const heroContent = homeContent?.get('hero');
      expect(heroContent.headline).toContain('Culinary');

      const menuContent = homeContent?.get('menu');
      expect(menuContent).toHaveProperty('title');
      expect(menuContent).toHaveProperty('categories');
      expect(menuContent).toHaveProperty('items');
      expect(Array.isArray(menuContent.categories)).toBe(true);
      expect(Array.isArray(menuContent.items)).toBe(true);
    });

    it('should generate pricing content', async () => {
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
        name: 'SaaS Template',
        business_types: ['saas'],
        supported_features: ['pricing'],
        design_tags: ['professional'],
        description: 'SaaS template',
        preview_image_url: 'https://example.com/preview.jpg',
      });

      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure: {
          session_id: sessionId,
          template_id: templateId,
          pages: [
            {
              page_id: uuidv4(),
              name: 'Pricing',
              slug: '/pricing',
              sections: [
                {
                  section_id: uuidv4(),
                  type: 'pricing',
                  order: 1,
                  required_features: ['pricing'],
                  content_hints: 'Pricing section',
                },
              ],
            },
          ],
          generated_at: new Date(),
        },
      });

      const content = await service.generateAllContent(sessionId, templateId);

      const pricingPageContent = content.get('/pricing');
      const pricingContent = pricingPageContent?.get('pricing');
      
      expect(pricingContent).toHaveProperty('title');
      expect(pricingContent).toHaveProperty('plans');
      expect(Array.isArray(pricingContent.plans)).toBe(true);
      expect(pricingContent.plans.length).toBe(3);
      expect(pricingContent.plans[1].highlighted).toBe(true);
    });

    it('should generate testimonials content', async () => {
      await Requirement.create({
        session_id: sessionId,
        business_type: 'portfolio',
        key_features: ['gallery', 'testimonials'],
        target_audience: 'clients',
        design_preferences: 'creative',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'Portfolio Template',
        business_types: ['portfolio'],
        supported_features: ['gallery'],
        design_tags: ['creative'],
        description: 'Portfolio template',
        preview_image_url: 'https://example.com/preview.jpg',
      });

      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure: {
          session_id: sessionId,
          template_id: templateId,
          pages: [
            {
              page_id: uuidv4(),
              name: 'Home',
              slug: '/',
              sections: [
                {
                  section_id: uuidv4(),
                  type: 'testimonials',
                  order: 1,
                  required_features: [],
                  content_hints: 'Testimonials',
                },
              ],
            },
          ],
          generated_at: new Date(),
        },
      });

      const content = await service.generateAllContent(sessionId, templateId);

      const homeContent = content.get('/');
      const testimonialsContent = homeContent?.get('testimonials');
      
      expect(testimonialsContent).toHaveProperty('title');
      expect(testimonialsContent).toHaveProperty('testimonials');
      expect(Array.isArray(testimonialsContent.testimonials)).toBe(true);
      expect(testimonialsContent.testimonials.length).toBeGreaterThan(0);
      expect(testimonialsContent.testimonials[0]).toHaveProperty('quote');
      expect(testimonialsContent.testimonials[0]).toHaveProperty('author');
    });

    it('should throw error when requirement not found', async () => {
      await Template.create({
        id: templateId,
        name: 'Test Template',
        business_types: ['test'],
        supported_features: ['basic'],
        design_tags: ['simple'],
        description: 'Test',
        preview_image_url: 'https://example.com/preview.jpg',
      });

      await expect(
        service.generateAllContent(sessionId, templateId)
      ).rejects.toThrow('No requirement found');
    });

    it('should throw error when template not found', async () => {
      await Requirement.create({
        session_id: sessionId,
        business_type: 'test',
        key_features: [],
        target_audience: 'test',
        design_preferences: 'test',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      await expect(
        service.generateAllContent(sessionId, templateId)
      ).rejects.toThrow('Template');
    });

    it('should throw error when page structure not found', async () => {
      await Requirement.create({
        session_id: sessionId,
        business_type: 'test',
        key_features: [],
        target_audience: 'test',
        design_preferences: 'test',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'Test Template',
        business_types: ['test'],
        supported_features: ['basic'],
        design_tags: ['simple'],
        description: 'Test',
        preview_image_url: 'https://example.com/preview.jpg',
      });

      await expect(
        service.generateAllContent(sessionId, templateId)
      ).rejects.toThrow('No page structure found');
    });

    it('should use latest requirement version', async () => {
      // Create older version
      await Requirement.create({
        session_id: sessionId,
        business_type: 'old',
        key_features: ['old-feature'],
        target_audience: 'old audience',
        design_preferences: 'old style',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      // Create newer version
      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['product catalog'],
        target_audience: 'shoppers',
        design_preferences: 'modern',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 2,
      });

      await Template.create({
        id: templateId,
        name: 'Template',
        business_types: ['e-commerce'],
        supported_features: ['product catalog'],
        design_tags: ['modern'],
        description: 'Test',
        preview_image_url: 'https://example.com/preview.jpg',
      });

      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure: {
          session_id: sessionId,
          template_id: templateId,
          pages: [
            {
              page_id: uuidv4(),
              name: 'Home',
              slug: '/',
              sections: [
                {
                  section_id: uuidv4(),
                  type: 'hero',
                  order: 1,
                  required_features: [],
                  content_hints: 'Hero',
                },
              ],
            },
          ],
          generated_at: new Date(),
        },
      });

      const content = await service.generateAllContent(sessionId, templateId);

      const homeContent = content.get('/');
      const heroContent = homeContent?.get('hero');
      
      // Should use latest version (e-commerce)
      expect(heroContent.headline).toContain('Products');
    });
  });
});
