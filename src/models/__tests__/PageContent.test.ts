/**
 * Unit tests for PageContent model
 */

import { PageContent } from '../PageContent';
import { sequelize } from '../../database/config';
import { HeroContent, FeaturesContent, PricingContent } from '../../types/page-content';

describe('PageContent Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await PageContent.destroy({ where: {}, truncate: true });
  });

  describe('Model Creation', () => {
    it('should create a valid page content with hero content', async () => {
      const heroContent: HeroContent = {
        headline: 'Welcome to Our Store',
        subheadline: 'Discover amazing products',
        cta_text: 'Shop Now',
        cta_url: '/products',
      };

      const pageContent = await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'hero',
        content_json: heroContent,
      });

      expect(pageContent.id).toBeDefined();
      expect(pageContent.session_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(pageContent.template_id).toBe('987e6543-e21b-12d3-a456-426614174999');
      expect(pageContent.page_slug).toBe('/');
      expect(pageContent.section_type).toBe('hero');
      expect(pageContent.content_json).toEqual(heroContent);
      expect(pageContent.createdAt).toBeDefined();
      expect(pageContent.updatedAt).toBeDefined();
    });

    it('should create a valid page content with features content', async () => {
      const featuresContent: FeaturesContent = {
        title: 'Our Features',
        subtitle: 'What makes us special',
        features: [
          {
            icon: 'fast',
            title: 'Lightning Fast',
            description: 'Quick delivery guaranteed',
          },
          {
            icon: 'secure',
            title: 'Secure Payments',
            description: 'Your data is safe',
          },
        ],
      };

      const pageContent = await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'features',
        content_json: featuresContent,
      });

      expect(pageContent.section_type).toBe('features');
      expect(pageContent.content_json).toEqual(featuresContent);
    });

    it('should create a valid page content with pricing content', async () => {
      const pricingContent: PricingContent = {
        title: 'Pricing Plans',
        plans: [
          {
            name: 'Basic',
            price: '$9.99',
            billing_period: 'per month',
            features: ['Feature 1', 'Feature 2'],
            cta_text: 'Get Started',
            cta_url: '/signup',
          },
        ],
      };

      const pageContent = await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/pricing',
        section_type: 'pricing',
        content_json: pricingContent,
      });

      expect(pageContent.page_slug).toBe('/pricing');
      expect(pageContent.section_type).toBe('pricing');
      expect(pageContent.content_json).toEqual(pricingContent);
    });

    it('should auto-generate UUID for id', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      const pageContent = await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'hero',
        content_json: content,
      });

      expect(pageContent.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should auto-generate timestamps', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      const pageContent = await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'hero',
        content_json: content,
      });

      expect(pageContent.createdAt).toBeInstanceOf(Date);
      expect(pageContent.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Validation', () => {
    it('should reject invalid session_id (not UUID)', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      await expect(
        PageContent.create({
          session_id: 'not-a-uuid',
          template_id: '987e6543-e21b-12d3-a456-426614174999',
          page_slug: '/',
          section_type: 'hero',
          content_json: content,
        })
      ).rejects.toThrow();
    });

    it('should reject invalid template_id (not UUID)', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      await expect(
        PageContent.create({
          session_id: '123e4567-e89b-12d3-a456-426614174000',
          template_id: 'invalid-uuid',
          page_slug: '/',
          section_type: 'hero',
          content_json: content,
        })
      ).rejects.toThrow();
    });

    it('should reject empty page_slug', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      await expect(
        PageContent.create({
          session_id: '123e4567-e89b-12d3-a456-426614174000',
          template_id: '987e6543-e21b-12d3-a456-426614174999',
          page_slug: '',
          section_type: 'hero',
          content_json: content,
        })
      ).rejects.toThrow();
    });

    it('should reject page_slug not starting with /', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      await expect(
        PageContent.create({
          session_id: '123e4567-e89b-12d3-a456-426614174000',
          template_id: '987e6543-e21b-12d3-a456-426614174999',
          page_slug: 'about',
          section_type: 'hero',
          content_json: content,
        })
      ).rejects.toThrow('page_slug must start with /');
    });

    it('should reject invalid section_type', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      await expect(
        PageContent.create({
          session_id: '123e4567-e89b-12d3-a456-426614174000',
          template_id: '987e6543-e21b-12d3-a456-426614174999',
          page_slug: '/',
          section_type: 'invalid-type' as any,
          content_json: content,
        })
      ).rejects.toThrow();
    });

    it('should reject null content_json', async () => {
      await expect(
        PageContent.create({
          session_id: '123e4567-e89b-12d3-a456-426614174000',
          template_id: '987e6543-e21b-12d3-a456-426614174999',
          page_slug: '/',
          section_type: 'hero',
          content_json: null as any,
        })
      ).rejects.toThrow();
    });

    it('should reject empty content_json object', async () => {
      await expect(
        PageContent.create({
          session_id: '123e4567-e89b-12d3-a456-426614174000',
          template_id: '987e6543-e21b-12d3-a456-426614174999',
          page_slug: '/',
          section_type: 'hero',
          content_json: {} as any,
        })
      ).rejects.toThrow('Content JSON cannot be empty');
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique constraint on (session_id, template_id, page_slug, section_type)', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      // Create first content
      await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'hero',
        content_json: content,
      });

      // Try to create duplicate
      await expect(
        PageContent.create({
          session_id: '123e4567-e89b-12d3-a456-426614174000',
          template_id: '987e6543-e21b-12d3-a456-426614174999',
          page_slug: '/',
          section_type: 'hero',
          content_json: content,
        })
      ).rejects.toThrow();
    });

    it('should allow different section types on same page', async () => {
      const heroContent: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      const featuresContent: FeaturesContent = {
        title: 'Features',
        features: [],
      };

      // Create hero section
      await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'hero',
        content_json: heroContent,
      });

      // Create features section on same page - should succeed
      const pageContent2 = await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'features',
        content_json: featuresContent,
      });

      expect(pageContent2.id).toBeDefined();
    });

    it('should allow same section type on different pages', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      // Create hero on home page
      await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'hero',
        content_json: content,
      });

      // Create hero on about page - should succeed
      const pageContent2 = await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/about',
        section_type: 'hero',
        content_json: content,
      });

      expect(pageContent2.id).toBeDefined();
    });

    it('should allow same content for different templates', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      // Create with template 1
      await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'hero',
        content_json: content,
      });

      // Create with template 2 - should succeed
      const pageContent2 = await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '111e1111-e11b-11d1-a111-111111111111',
        page_slug: '/',
        section_type: 'hero',
        content_json: content,
      });

      expect(pageContent2.id).toBeDefined();
    });
  });

  describe('Querying', () => {
    it('should find content by session_id', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'hero',
        content_json: content,
      });

      const found = await PageContent.findAll({
        where: { session_id: '123e4567-e89b-12d3-a456-426614174000' },
      });

      expect(found).toHaveLength(1);
      expect(found[0].session_id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should find content by session_id and template_id', async () => {
      const content: HeroContent = {
        headline: 'Test',
        subheadline: 'Test',
        cta_text: 'Test',
        cta_url: '/test',
      };

      await PageContent.create({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        template_id: '987e6543-e21b-12d3-a456-426614174999',
        page_slug: '/',
        section_type: 'hero',
        content_json: content,
      });

      const found = await PageContent.findAll({
        where: { 
          session_id: '123e4567-e89b-12d3-a456-426614174000',
          template_id: '987e6543-e21b-12d3-a456-426614174999',
        },
      });

      expect(found).toHaveLength(1);
    });
  });
});
