/**
 * Tests for Render Assembly Service
 */

import { RenderAssemblyService } from '../render-assembly.service';
import { Requirement } from '../../models/Requirement';
import { Template } from '../../models/Template';
import { PageStructure } from '../../models/PageStructure';
import { PageContent } from '../../models/PageContent';
import { sequelize } from '../../database/config';

describe('RenderAssemblyService', () => {
  let service: RenderAssemblyService;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(() => {
    service = new RenderAssemblyService();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('assembleRenderSchema', () => {
    it('should assemble complete render schema for e-commerce', async () => {
      const session_id = '123e4567-e89b-12d3-a456-426614174000';
      const template_id = '987e6543-e21b-12d3-a456-426614174001';

      // Create requirement
      await Requirement.create({
        session_id,
        business_type: 'e-commerce',
        key_features: ['product catalog', 'shopping cart'],
        target_audience: 'online shoppers',
        design_preferences: 'modern and clean',
        additional_notes: 'Building an online store for handmade jewelry',
        extracted_at: new Date(),
        version_number: 1
      });

      // Create template
      await Template.create({
        id: template_id,
        name: 'E-Commerce Store',
        business_types: ['e-commerce', 'online store'],
        supported_features: ['product catalog', 'shopping cart', 'payment integration'],
        design_tags: ['modern', 'clean', 'professional'],
        description: 'Full-featured online store',
        preview_image_url: 'https://example.com/ecommerce.jpg'
      });

      // Create page structure
      await PageStructure.create({
        session_id,
        template_id,
        structure: {
          session_id,
          template_id,
          pages: [
            {
              page_id: 'page-1',
              name: 'Home',
              slug: '/',
              sections: [
                {
                  section_id: 'sec-1',
                  type: 'hero',
                  order: 1,
                  required_features: ['homepage'],
                  content_hints: 'Hero section'
                },
                {
                  section_id: 'sec-2',
                  type: 'features',
                  order: 2,
                  required_features: ['product catalog'],
                  content_hints: 'Features section'
                }
              ]
            }
          ],
          generated_at: new Date()
        }
      });

      // Create page content
      await PageContent.create({
        session_id,
        template_id,
        page_slug: '/',
        section_type: 'hero',
        content_json: {
          headline: 'Discover Amazing Products',
          subheadline: 'Shop our curated collection',
          cta_text: 'Shop Now',
          cta_url: '/products'
        }
      });

      await PageContent.create({
        session_id,
        template_id,
        page_slug: '/',
        section_type: 'features',
        content_json: {
          title: 'Our Features',
          features: [
            {
              icon: 'grid',
              title: 'Product Catalog',
              description: 'Browse our products'
            }
          ]
        }
      });

      // Assemble
      const result = await service.assembleRenderSchema(session_id, template_id);

      // Verify structure
      expect(result.render_version).toBe('1.0');
      expect(result.site_metadata.industry).toBe('e-commerce');
      expect(result.site_metadata.selected_template.name).toBe('E-Commerce Store');
      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].slug).toBe('/');
      expect(result.pages[0].title).toBe('Home');
      expect(result.pages[0].sections).toHaveLength(2);
      expect(result.pages[0].sections[0].section_type).toBe('hero');
      expect(result.pages[0].sections[0].layout_hints).toBeDefined();
    });

    it('should throw error when requirement not found', async () => {
      const session_id = 'nonexistent-session';
      const template_id = '987e6543-e21b-12d3-a456-426614174001';

      await expect(
        service.assembleRenderSchema(session_id, template_id)
      ).rejects.toThrow('No requirements found');
    });

    it('should throw error when template not found', async () => {
      const session_id = '123e4567-e89b-12d3-a456-426614174000';
      const template_id = 'nonexistent-template';

      await Requirement.create({
        session_id,
        business_type: 'general',
        key_features: ['homepage'],
        target_audience: 'general',
        design_preferences: 'modern',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1
      });

      await expect(
        service.assembleRenderSchema(session_id, template_id)
      ).rejects.toThrow('Template');
    });

    it('should throw error when page structure not found', async () => {
      const session_id = '123e4567-e89b-12d3-a456-426614174002';
      const template_id = '987e6543-e21b-12d3-a456-426614174002';

      await Requirement.create({
        session_id,
        business_type: 'general',
        key_features: ['homepage'],
        target_audience: 'general',
        design_preferences: 'modern',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1
      });

      await Template.create({
        id: template_id,
        name: 'Test Template',
        business_types: ['general'],
        supported_features: ['homepage'],
        design_tags: ['modern'],
        description: 'Test',
        preview_image_url: 'https://example.com/test.jpg'
      });

      await expect(
        service.assembleRenderSchema(session_id, template_id)
      ).rejects.toThrow('No page structure found');
    });

    it('should generate correct layout hints for different section types', async () => {
      const session_id = '123e4567-e89b-12d3-a456-426614174003';
      const template_id = '987e6543-e21b-12d3-a456-426614174003';

      await Requirement.create({
        session_id,
        business_type: 'blog',
        key_features: ['blog posts'],
        target_audience: 'readers',
        design_preferences: 'minimal and clean',
        additional_notes: '',
        extracted_at: new Date(),
        version_number: 1
      });

      await Template.create({
        id: template_id,
        name: 'Blog Template',
        business_types: ['blog'],
        supported_features: ['blog posts'],
        design_tags: ['minimal'],
        description: 'Blog',
        preview_image_url: 'https://example.com/blog.jpg'
      });

      await PageStructure.create({
        session_id,
        template_id,
        structure: {
          session_id,
          template_id,
          pages: [
            {
              page_id: 'page-1',
              name: 'Home',
              slug: '/',
              sections: [
                {
                  section_id: 'sec-1',
                  type: 'hero',
                  order: 1,
                  required_features: [],
                  content_hints: ''
                }
              ]
            }
          ],
          generated_at: new Date()
        }
      });

      await PageContent.create({
        session_id,
        template_id,
        page_slug: '/',
        section_type: 'hero',
        content_json: {
          headline: 'Welcome',
          subheadline: 'Blog',
          cta_text: 'Read',
          cta_url: '/posts'
        }
      });

      const result = await service.assembleRenderSchema(session_id, template_id);

      const heroSection = result.pages[0].sections[0];
      expect(heroSection.layout_hints.text_alignment).toBe('center');
      expect(heroSection.layout_hints.background_color).toBe('primary');
      expect(heroSection.layout_hints.padding).toBe('small'); // 'minimal' preference
      expect(heroSection.layout_hints.full_width).toBe(true);
    });
  });
});
