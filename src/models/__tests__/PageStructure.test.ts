/**
 * Unit tests for PageStructure model
 */

import { PageStructure } from '../PageStructure';
import { sequelize } from '../../database/config';
import { v4 as uuidv4 } from 'uuid';
import { PageStructureData } from '../../types/page-structure';

describe('PageStructure Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await PageStructure.destroy({ where: {}, truncate: true });
  });

  describe('Model Creation', () => {
    it('should create a valid page structure', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();
      const pageId = uuidv4();
      const sectionId = uuidv4();

      const structure: PageStructureData = {
        session_id: sessionId,
        template_id: templateId,
        pages: [
          {
            page_id: pageId,
            name: 'Home',
            slug: '/',
            sections: [
              {
                section_id: sectionId,
                type: 'hero',
                order: 1,
                required_features: ['homepage'],
                content_hints: 'Main hero section with welcome message',
              },
            ],
          },
        ],
        generated_at: new Date(),
      };

      const pageStructure = await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure,
      });

      expect(pageStructure.id).toBeDefined();
      expect(pageStructure.session_id).toBe(sessionId);
      expect(pageStructure.template_id).toBe(templateId);
      expect(pageStructure.structure.pages).toHaveLength(1);
      expect(pageStructure.structure.pages[0].name).toBe('Home');
    });

    it('should auto-generate UUID for id', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const structure: PageStructureData = {
        session_id: sessionId,
        template_id: templateId,
        pages: [
          {
            page_id: uuidv4(),
            name: 'Home',
            slug: '/',
            sections: [],
          },
        ],
        generated_at: new Date(),
      };

      const pageStructure = await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure,
      });

      expect(pageStructure.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should auto-generate timestamps', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const structure: PageStructureData = {
        session_id: sessionId,
        template_id: templateId,
        pages: [
          {
            page_id: uuidv4(),
            name: 'Home',
            slug: '/',
            sections: [],
          },
        ],
        generated_at: new Date(),
      };

      const pageStructure = await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure,
      });

      expect(pageStructure.createdAt).toBeInstanceOf(Date);
      expect(pageStructure.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Validation', () => {
    it('should reject invalid session_id', async () => {
      const structure: PageStructureData = {
        session_id: uuidv4(),
        template_id: uuidv4(),
        pages: [
          {
            page_id: uuidv4(),
            name: 'Home',
            slug: '/',
            sections: [],
          },
        ],
        generated_at: new Date(),
      };

      await expect(
        PageStructure.create({
          session_id: 'invalid-uuid',
          template_id: uuidv4(),
          structure,
        })
      ).rejects.toThrow();
    });

    it('should reject invalid template_id', async () => {
      const structure: PageStructureData = {
        session_id: uuidv4(),
        template_id: uuidv4(),
        pages: [
          {
            page_id: uuidv4(),
            name: 'Home',
            slug: '/',
            sections: [],
          },
        ],
        generated_at: new Date(),
      };

      await expect(
        PageStructure.create({
          session_id: uuidv4(),
          template_id: 'invalid-uuid',
          structure,
        })
      ).rejects.toThrow();
    });

    it('should reject structure without pages array', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const invalidStructure = {
        session_id: sessionId,
        template_id: templateId,
        generated_at: new Date(),
      } as unknown as PageStructureData;

      await expect(
        PageStructure.create({
          session_id: sessionId,
          template_id: templateId,
          structure: invalidStructure,
        })
      ).rejects.toThrow('Pages must be an array');
    });

    it('should reject empty pages array', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const structure: PageStructureData = {
        session_id: sessionId,
        template_id: templateId,
        pages: [],
        generated_at: new Date(),
      };

      await expect(
        PageStructure.create({
          session_id: sessionId,
          template_id: templateId,
          structure,
        })
      ).rejects.toThrow('Pages array cannot be empty');
    });

    it('should reject page without page_id', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const structure = {
        session_id: sessionId,
        template_id: templateId,
        pages: [
          {
            name: 'Home',
            slug: '/',
            sections: [],
          },
        ],
        generated_at: new Date(),
      } as unknown as PageStructureData;

      await expect(
        PageStructure.create({
          session_id: sessionId,
          template_id: templateId,
          structure,
        })
      ).rejects.toThrow('Page 0 must have a valid page_id');
    });

    it('should reject page without name', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const structure = {
        session_id: sessionId,
        template_id: templateId,
        pages: [
          {
            page_id: uuidv4(),
            slug: '/',
            sections: [],
          },
        ],
        generated_at: new Date(),
      } as unknown as PageStructureData;

      await expect(
        PageStructure.create({
          session_id: sessionId,
          template_id: templateId,
          structure,
        })
      ).rejects.toThrow('Page 0 must have a valid name');
    });

    it('should reject slug not starting with /', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const structure: PageStructureData = {
        session_id: sessionId,
        template_id: templateId,
        pages: [
          {
            page_id: uuidv4(),
            name: 'About',
            slug: 'about',  // Invalid: should be /about
            sections: [],
          },
        ],
        generated_at: new Date(),
      };

      await expect(
        PageStructure.create({
          session_id: sessionId,
          template_id: templateId,
          structure,
        })
      ).rejects.toThrow('Page 0 slug must start with /');
    });

    it('should reject section with invalid order', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const structure = {
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
                order: 0,  // Invalid: must be >= 1
                required_features: [],
                content_hints: 'Test',
              },
            ],
          },
        ],
        generated_at: new Date(),
      } as unknown as PageStructureData;

      await expect(
        PageStructure.create({
          session_id: sessionId,
          template_id: templateId,
          structure,
        })
      ).rejects.toThrow('Page 0, Section 0 must have a valid order >= 1');
    });

    it('should reject section without required_features array', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const structure = {
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
                content_hints: 'Test',
              },
            ],
          },
        ],
        generated_at: new Date(),
      } as unknown as PageStructureData;

      await expect(
        PageStructure.create({
          session_id: sessionId,
          template_id: templateId,
          structure,
        })
      ).rejects.toThrow('Page 0, Section 0 required_features must be an array');
    });
  });

  describe('Unique Constraint', () => {
    it('should enforce unique session_id + template_id', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const structure: PageStructureData = {
        session_id: sessionId,
        template_id: templateId,
        pages: [
          {
            page_id: uuidv4(),
            name: 'Home',
            slug: '/',
            sections: [],
          },
        ],
        generated_at: new Date(),
      };

      // First creation should succeed
      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure,
      });

      // Second creation with same session_id and template_id should fail
      await expect(
        PageStructure.create({
          session_id: sessionId,
          template_id: templateId,
          structure: {
            ...structure,
            generated_at: new Date(),
          },
        })
      ).rejects.toThrow();
    });

    it('should allow different template_id for same session_id', async () => {
      const sessionId = uuidv4();
      const templateId1 = uuidv4();
      const templateId2 = uuidv4();

      const structure1: PageStructureData = {
        session_id: sessionId,
        template_id: templateId1,
        pages: [
          {
            page_id: uuidv4(),
            name: 'Home',
            slug: '/',
            sections: [],
          },
        ],
        generated_at: new Date(),
      };

      const structure2: PageStructureData = {
        session_id: sessionId,
        template_id: templateId2,
        pages: [
          {
            page_id: uuidv4(),
            name: 'Home',
            slug: '/',
            sections: [],
          },
        ],
        generated_at: new Date(),
      };

      // Both should succeed
      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId1,
        structure: structure1,
      });

      await PageStructure.create({
        session_id: sessionId,
        template_id: templateId2,
        structure: structure2,
      });

      const count = await PageStructure.count({ where: { session_id: sessionId } });
      expect(count).toBe(2);
    });
  });

  describe('Complex Page Structures', () => {
    it('should handle multiple pages with multiple sections', async () => {
      const sessionId = uuidv4();
      const templateId = uuidv4();

      const structure: PageStructureData = {
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
                required_features: ['homepage'],
                content_hints: 'Hero section',
              },
              {
                section_id: uuidv4(),
                type: 'features',
                order: 2,
                required_features: ['features'],
                content_hints: 'Features section',
              },
            ],
          },
          {
            page_id: uuidv4(),
            name: 'About',
            slug: '/about',
            sections: [
              {
                section_id: uuidv4(),
                type: 'about',
                order: 1,
                required_features: ['about'],
                content_hints: 'About us',
              },
            ],
          },
        ],
        generated_at: new Date(),
      };

      const pageStructure = await PageStructure.create({
        session_id: sessionId,
        template_id: templateId,
        structure,
      });

      expect(pageStructure.structure.pages).toHaveLength(2);
      expect(pageStructure.structure.pages[0].sections).toHaveLength(2);
      expect(pageStructure.structure.pages[1].sections).toHaveLength(1);
    });
  });
});
