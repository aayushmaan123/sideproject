/**
 * Unit tests for PageGeneratorService
 */

import { PageGeneratorService } from '../page-generator.service';
import { sequelize } from '../../database/config';
import { Requirement } from '../../models/Requirement';
import { Template } from '../../models/Template';
import { v4 as uuidv4 } from 'uuid';

describe('PageGeneratorService', () => {
  let service: PageGeneratorService;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    service = new PageGeneratorService();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Requirement.destroy({ where: {}, truncate: true });
    await Template.destroy({ where: {}, truncate: true });
  });

  describe('E-Commerce Page Generation', () => {
    it('should generate e-commerce pages with correct structure', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

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
        name: 'E-Commerce Store',
        business_types: ['e-commerce'],
        supported_features: ['product catalog', 'shopping cart', 'payment integration'],
        design_tags: ['modern', 'clean'],
        description: 'Online store template',
        preview_image_url: 'https://example.com/ecommerce.jpg',
      });

      const structure = await service.generatePageStructure(sessionId, templateId);

      expect(structure.session_id).toBe(sessionId);
      expect(structure.template_id).toBe(templateId);
      expect(structure.pages).toBeDefined();
      expect(structure.pages.length).toBeGreaterThan(0);
      expect(structure.generated_at).toBeInstanceOf(Date);

      // Should have typical e-commerce pages
      const pageNames = structure.pages.map((p) => p.name);
      expect(pageNames).toContain('Home');
      expect(pageNames).toContain('Products');
      expect(pageNames).toContain('Cart');
      expect(pageNames).toContain('Contact');

      // Home page should have sections
      const homePage = structure.pages.find((p) => p.name === 'Home');
      expect(homePage).toBeDefined();
      expect(homePage!.slug).toBe('/');
      expect(homePage!.sections.length).toBeGreaterThan(0);

      // Should have hero section on home page
      const heroSection = homePage!.sections.find((s) => s.type === 'hero');
      expect(heroSection).toBeDefined();
      expect(heroSection!.order).toBe(1);
    });

    it('should include product catalog section on products page', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      await Requirement.create({
        session_id: sessionId,
        business_type: 'e-commerce',
        key_features: ['product catalog'],
        target_audience: 'shoppers',
        design_preferences: 'elegant',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'Store',
        business_types: ['e-commerce'],
        supported_features: ['product catalog'],
        design_tags: ['elegant'],
        description: 'Store template',
        preview_image_url: 'https://example.com/store.jpg',
      });

      const structure = await service.generatePageStructure(sessionId, templateId);

      const productsPage = structure.pages.find((p) => p.name === 'Products');
      expect(productsPage).toBeDefined();
      
      const catalogSection = productsPage!.sections.find((s) => s.type === 'product-catalog');
      expect(catalogSection).toBeDefined();
      expect(catalogSection!.required_features).toContain('product catalog');
      expect(catalogSection!.content_hints).toContain('elegant');
    });
  });

  describe('Restaurant Page Generation', () => {
    it('should generate restaurant pages with menu', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      await Requirement.create({
        session_id: sessionId,
        business_type: 'restaurant',
        key_features: ['menu', 'reservations', 'contact form'],
        target_audience: 'diners',
        design_preferences: 'warm and inviting',
        additional_notes: 'Family-friendly',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'Restaurant Template',
        business_types: ['restaurant', 'cafe'],
        supported_features: ['menu', 'reservations', 'contact form'],
        design_tags: ['warm', 'inviting'],
        description: 'Restaurant template',
        preview_image_url: 'https://example.com/restaurant.jpg',
      });

      const structure = await service.generatePageStructure(sessionId, templateId);

      const pageNames = structure.pages.map((p) => p.name);
      expect(pageNames).toContain('Home');
      expect(pageNames).toContain('Menu');
      expect(pageNames).toContain('Reservations');

      const menuPage = structure.pages.find((p) => p.name === 'Menu');
      expect(menuPage).toBeDefined();
      expect(menuPage!.slug).toBe('/menu');

      const menuSection = menuPage!.sections.find((s) => s.type === 'menu');
      expect(menuSection).toBeDefined();
    });
  });

  describe('Portfolio Page Generation', () => {
    it('should generate portfolio pages with gallery', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      await Requirement.create({
        session_id: sessionId,
        business_type: 'portfolio',
        key_features: ['gallery', 'projects', 'testimonials'],
        target_audience: 'potential clients',
        design_preferences: 'minimalist',
        additional_notes: 'Showcase work',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'Portfolio',
        business_types: ['portfolio', 'creative'],
        supported_features: ['gallery', 'projects', 'testimonials'],
        design_tags: ['minimalist', 'clean'],
        description: 'Portfolio template',
        preview_image_url: 'https://example.com/portfolio.jpg',
      });

      const structure = await service.generatePageStructure(sessionId, templateId);

      const pageNames = structure.pages.map((p) => p.name);
      expect(pageNames).toContain('Projects');

      const projectsPage = structure.pages.find((p) => p.name === 'Projects');
      expect(projectsPage).toBeDefined();

      // Should have project showcase or portfolio grid
      const hasProjectSection = projectsPage!.sections.some(
        (s) => s.type === 'project-showcase' || s.type === 'portfolio-grid'
      );
      expect(hasProjectSection).toBe(true);
    });
  });

  describe('SaaS Page Generation', () => {
    it('should generate SaaS pages with pricing', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      await Requirement.create({
        session_id: sessionId,
        business_type: 'saas',
        key_features: ['pricing', 'features', 'testimonials'],
        target_audience: 'businesses',
        design_preferences: 'professional',
        additional_notes: 'B2B focused',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'SaaS Landing',
        business_types: ['saas', 'software'],
        supported_features: ['pricing', 'features', 'testimonials'],
        design_tags: ['professional', 'modern'],
        description: 'SaaS template',
        preview_image_url: 'https://example.com/saas.jpg',
      });

      const structure = await service.generatePageStructure(sessionId, templateId);

      const pageNames = structure.pages.map((p) => p.name);
      expect(pageNames).toContain('Pricing');
      expect(pageNames).toContain('Features');

      const pricingPage = structure.pages.find((p) => p.name === 'Pricing');
      expect(pricingPage).toBeDefined();

      const pricingSection = pricingPage!.sections.find((s) => s.type === 'pricing-table');
      expect(pricingSection).toBeDefined();
    });
  });

  describe('Blog Page Generation', () => {
    it('should generate blog pages with posts and categories', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      await Requirement.create({
        session_id: sessionId,
        business_type: 'blog',
        key_features: ['posts', 'categories', 'comments'],
        target_audience: 'readers',
        design_preferences: 'clean and readable',
        additional_notes: 'Content focused',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'Blog',
        business_types: ['blog', 'content'],
        supported_features: ['posts', 'categories', 'comments'],
        design_tags: ['clean', 'readable'],
        description: 'Blog template',
        preview_image_url: 'https://example.com/blog.jpg',
      });

      const structure = await service.generatePageStructure(sessionId, templateId);

      const pageNames = structure.pages.map((p) => p.name);
      expect(pageNames).toContain('Posts');
      expect(pageNames).toContain('Categories');
    });
  });

  describe('Default Fallback', () => {
    it('should use default pages for unknown business type', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      await Requirement.create({
        session_id: sessionId,
        business_type: 'unknown-type',
        key_features: ['homepage', 'contact form'],
        target_audience: 'general',
        design_preferences: 'standard',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'Generic',
        business_types: ['default'],
        supported_features: ['homepage', 'contact form'],
        design_tags: ['standard'],
        description: 'Generic template',
        preview_image_url: 'https://example.com/generic.jpg',
      });

      const structure = await service.generatePageStructure(sessionId, templateId);

      const pageNames = structure.pages.map((p) => p.name);
      expect(pageNames).toContain('Home');
      expect(pageNames).toContain('Contact');
      expect(structure.pages.length).toBeGreaterThan(0);
    });
  });

  describe('Home Page Sections', () => {
    it('should always include hero section on home page', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      await Requirement.create({
        session_id: sessionId,
        business_type: 'portfolio',
        key_features: ['gallery'],
        target_audience: 'visitors',
        design_preferences: 'artistic',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'Portfolio',
        business_types: ['portfolio'],
        supported_features: ['gallery'],
        design_tags: ['artistic'],
        description: 'Portfolio',
        preview_image_url: 'https://example.com/port.jpg',
      });

      const structure = await service.generatePageStructure(sessionId, templateId);

      const homePage = structure.pages.find((p) => p.name === 'Home');
      expect(homePage).toBeDefined();

      const heroSection = homePage!.sections.find((s) => s.type === 'hero');
      expect(heroSection).toBeDefined();
      expect(heroSection!.order).toBe(1);
      expect(heroSection!.content_hints).toContain('artistic');
    });

    it('should include call-to-action on home page', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      await Requirement.create({
        session_id: sessionId,
        business_type: 'saas',
        key_features: ['features'],
        target_audience: 'users',
        design_preferences: 'bold',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1,
      });

      await Template.create({
        id: templateId,
        name: 'SaaS',
        business_types: ['saas'],
        supported_features: ['features'],
        design_tags: ['bold'],
        description: 'SaaS',
        preview_image_url: 'https://example.com/saas2.jpg',
      });

      const structure = await service.generatePageStructure(sessionId, templateId);

      const homePage = structure.pages.find((p) => p.name === 'Home');
      expect(homePage).toBeDefined();

      const ctaSection = homePage!.sections.find((s) => s.type === 'call-to-action');
      expect(ctaSection).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when requirement not found', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      await Template.create({
        id: templateId,
        name: 'Template',
        business_types: ['default'],
        supported_features: ['homepage'],
        design_tags: ['clean'],
        description: 'Template',
        preview_image_url: 'https://example.com/template.jpg',
      });

      await expect(
        service.generatePageStructure(sessionId, templateId)
      ).rejects.toThrow(`No requirement found for session ${sessionId}`);
    });

    it('should throw error when template not found', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

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

      await expect(
        service.generatePageStructure(sessionId, templateId)
      ).rejects.toThrow(`Template ${templateId} not found`);
    });
  });

  describe('Version Handling', () => {
    it('should use latest requirement version', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      // Create version 1
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

      // Create version 2 (latest)
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
        description: 'Template',
        preview_image_url: 'https://example.com/template.jpg',
      });

      const structure = await service.generatePageStructure(sessionId, templateId);

      // Should generate e-commerce pages (from version 2), not blog pages
      const pageNames = structure.pages.map((p) => p.name);
      expect(pageNames).toContain('Products');
    });
  });
});
