/**
 * Template Model Tests
 */

import { Template } from '../Template';
import { sequelize } from '../../database/config';
import { seedTemplates } from '../../database/seedTemplates';

describe('Template Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await Template.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Creation', () => {
    it('should create a template with valid data', async () => {
      const template = await Template.create({
        name: 'Test Template',
        business_types: ['e-commerce', 'retail'],
        supported_features: ['shopping cart', 'payment'],
        design_tags: ['modern', 'clean'],
        description: 'A test template',
        preview_image_url: 'https://example.com/test.jpg',
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Test Template');
      expect(template.business_types).toEqual(['e-commerce', 'retail']);
      expect(template.supported_features).toEqual(['shopping cart', 'payment']);
      expect(template.design_tags).toEqual(['modern', 'clean']);
      expect(template.description).toBe('A test template');
      expect(template.preview_image_url).toBe('https://example.com/test.jpg');
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it('should auto-generate UUID for id', async () => {
      const template = await Template.create({
        name: 'Test',
        business_types: ['test'],
        supported_features: ['test'],
        design_tags: ['test'],
        description: 'Test',
        preview_image_url: 'https://example.com/test.jpg',
      });

      expect(template.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  });

  describe('Validation', () => {
    it('should reject empty name', async () => {
      await expect(
        Template.create({
          name: '',
          business_types: ['test'],
          supported_features: ['test'],
          design_tags: ['test'],
          description: 'Test',
          preview_image_url: 'https://example.com/test.jpg',
        })
      ).rejects.toThrow('Template name cannot be empty');
    });

    it('should reject empty business_types array', async () => {
      await expect(
        Template.create({
          name: 'Test',
          business_types: [],
          supported_features: ['test'],
          design_tags: ['test'],
          description: 'Test',
          preview_image_url: 'https://example.com/test.jpg',
        })
      ).rejects.toThrow('business_types cannot be empty');
    });

    it('should reject non-lowercase business_types', async () => {
      await expect(
        Template.create({
          name: 'Test',
          business_types: ['E-Commerce'],
          supported_features: ['test'],
          design_tags: ['test'],
          description: 'Test',
          preview_image_url: 'https://example.com/test.jpg',
        })
      ).rejects.toThrow('All business_types must be lowercase and trimmed');
    });

    it('should reject business_types with whitespace', async () => {
      await expect(
        Template.create({
          name: 'Test',
          business_types: [' e-commerce '],
          supported_features: ['test'],
          design_tags: ['test'],
          description: 'Test',
          preview_image_url: 'https://example.com/test.jpg',
        })
      ).rejects.toThrow('All business_types must be lowercase and trimmed');
    });

    it('should reject empty supported_features array', async () => {
      await expect(
        Template.create({
          name: 'Test',
          business_types: ['test'],
          supported_features: [],
          design_tags: ['test'],
          description: 'Test',
          preview_image_url: 'https://example.com/test.jpg',
        })
      ).rejects.toThrow('supported_features cannot be empty');
    });

    it('should reject non-lowercase supported_features', async () => {
      await expect(
        Template.create({
          name: 'Test',
          business_types: ['test'],
          supported_features: ['Shopping Cart'],
          design_tags: ['test'],
          description: 'Test',
          preview_image_url: 'https://example.com/test.jpg',
        })
      ).rejects.toThrow('All supported_features must be lowercase and trimmed');
    });

    it('should reject empty design_tags array', async () => {
      await expect(
        Template.create({
          name: 'Test',
          business_types: ['test'],
          supported_features: ['test'],
          design_tags: [],
          description: 'Test',
          preview_image_url: 'https://example.com/test.jpg',
        })
      ).rejects.toThrow('design_tags cannot be empty');
    });

    it('should reject non-lowercase design_tags', async () => {
      await expect(
        Template.create({
          name: 'Test',
          business_types: ['test'],
          supported_features: ['test'],
          design_tags: ['Modern'],
          description: 'Test',
          preview_image_url: 'https://example.com/test.jpg',
        })
      ).rejects.toThrow('All design_tags must be lowercase and trimmed');
    });

    it('should reject empty description', async () => {
      await expect(
        Template.create({
          name: 'Test',
          business_types: ['test'],
          supported_features: ['test'],
          design_tags: ['test'],
          description: '',
          preview_image_url: 'https://example.com/test.jpg',
        })
      ).rejects.toThrow('Description cannot be empty');
    });

    it('should reject invalid preview_image_url', async () => {
      await expect(
        Template.create({
          name: 'Test',
          business_types: ['test'],
          supported_features: ['test'],
          design_tags: ['test'],
          description: 'Test',
          preview_image_url: 'not-a-url',
        })
      ).rejects.toThrow('Preview image URL must be a valid URL');
    });

    it('should reject empty preview_image_url', async () => {
      await expect(
        Template.create({
          name: 'Test',
          business_types: ['test'],
          supported_features: ['test'],
          design_tags: ['test'],
          description: 'Test',
          preview_image_url: '',
        })
      ).rejects.toThrow('Preview image URL cannot be empty');
    });
  });

  describe('Template Seeding', () => {
    it('should seed 5 templates', async () => {
      await seedTemplates();
      const count = await Template.count();
      expect(count).toBe(5);
    });

    it('should not seed if templates already exist', async () => {
      await seedTemplates();
      const count1 = await Template.count();
      
      await seedTemplates(); // Try seeding again
      const count2 = await Template.count();
      
      expect(count1).toBe(count2);
      expect(count2).toBe(5);
    });

    it('should seed templates with correct data', async () => {
      await seedTemplates();
      
      const restaurant = await Template.findOne({ where: { name: 'Modern Restaurant' } });
      expect(restaurant).toBeDefined();
      expect(restaurant?.business_types).toContain('restaurant');
      expect(restaurant?.supported_features).toContain('menu');
      expect(restaurant?.design_tags).toContain('modern');
    });

    it('should seed all 5 realistic templates', async () => {
      await seedTemplates();
      
      const names = ['Modern Restaurant', 'Creative Portfolio', 'E-Commerce Store', 'SaaS Landing Page', 'Personal Blog'];
      
      for (const name of names) {
        const template = await Template.findOne({ where: { name } });
        expect(template).toBeDefined();
        expect(template?.business_types.length).toBeGreaterThan(0);
        expect(template?.supported_features.length).toBeGreaterThan(0);
        expect(template?.design_tags.length).toBeGreaterThan(0);
      }
    });

    it('should have lowercase and trimmed values in seeded data', async () => {
      await seedTemplates();
      
      const templates = await Template.findAll();
      
      templates.forEach((template) => {
        template.business_types.forEach((type) => {
          expect(type).toBe(type.toLowerCase().trim());
        });
        template.supported_features.forEach((feature) => {
          expect(feature).toBe(feature.toLowerCase().trim());
        });
        template.design_tags.forEach((tag) => {
          expect(tag).toBe(tag.toLowerCase().trim());
        });
      });
    });
  });
});
