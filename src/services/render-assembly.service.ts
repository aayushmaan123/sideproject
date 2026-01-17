/**
 * Stage 4.5.2: Render Assembly Service
 * 
 * Assembles data from all previous stages into a single,
 * frontend-ready RenderSchema.
 * 
 * Data Sources:
 * - Requirements (Stage 4.2)
 * - Templates (Stage 4.3)
 * - Page Structure (Stage 4.4.1)
 * - Page Content (Stage 4.4.2)
 */

import { Requirement } from '../models/Requirement';
import { Template } from '../models/Template';
import { PageStructure } from '../models/PageStructure';
import { PageContent } from '../models/PageContent';
import {
  RenderSchema,
  SiteMetadata,
  RenderPage,
  RenderSection,
  LayoutHints,
  SectionContent
} from '../types/render-schema';
import { Page } from '../types/page-structure';

/**
 * Render Assembly Service
 * Deterministic assembly of render-ready output
 */
export class RenderAssemblyService {
  /**
   * Assemble complete render schema
   * 
   * @param session_id - User session UUID
   * @param template_id - Selected template UUID
   * @returns Complete RenderSchema ready for frontend
   * @throws Error if required data is missing or inconsistent
   */
  async assembleRenderSchema(
    session_id: string,
    template_id: string
  ): Promise<RenderSchema> {
    // Fetch latest requirement
    const requirement = await this.fetchLatestRequirement(session_id);
    if (!requirement) {
      throw new Error(`No requirements found for session ${session_id}`);
    }

    // Fetch template
    const template = await Template.findByPk(template_id);
    if (!template) {
      throw new Error(`Template ${template_id} not found`);
    }

    // Fetch page structure
    const pageStructure = await PageStructure.findOne({
      where: { session_id, template_id }
    });
    if (!pageStructure) {
      throw new Error(`No page structure found for session ${session_id} and template ${template_id}`);
    }

    // Fetch all page content
    const pageContents = await PageContent.findAll({
      where: { session_id, template_id },
      order: [['page_slug', 'ASC']]
    });
    if (!pageContents || pageContents.length === 0) {
      throw new Error(`No page content found for session ${session_id} and template ${template_id}`);
    }

    // Assemble site metadata
    const siteMetadata = this.assembleSiteMetadata(requirement, template);

    // Assemble pages with content
    const pages = this.assemblePages(
      pageStructure.structure.pages,
      pageContents,
      requirement.design_preferences
    );

    // Return complete render schema
    return {
      render_version: '1.0',
      site_metadata: siteMetadata,
      pages
    };
  }

  /**
   * Fetch latest requirement version for session
   */
  private async fetchLatestRequirement(session_id: string): Promise<Requirement | null> {
    return await Requirement.findOne({
      where: { session_id },
      order: [['version_number', 'DESC']]
    });
  }

  /**
   * Assemble site metadata from requirement and template
   */
  private assembleSiteMetadata(
    requirement: Requirement,
    template: Template
  ): SiteMetadata {
    // Derive business name from additional_notes or use default
    let businessName = 'My Business';
    if (requirement.additional_notes) {
      const match = requirement.additional_notes.match(/(?:for|about|called)\s+([A-Z][a-zA-Z\s&]+)/i);
      if (match) {
        businessName = match[1].trim();
      }
    }

    return {
      business_name: businessName,
      industry: requirement.business_type,
      selected_template: {
        id: template.id,
        name: template.name
      },
      design_preferences: requirement.design_preferences,
      render_version: '1.0'
    };
  }

  /**
   * Assemble pages with content
   */
  private assemblePages(
    structurePages: Page[],
    pageContents: PageContent[],
    design_preferences: string
  ): RenderPage[] {
    // Group content by page slug
    const contentBySlug = new Map<string, PageContent[]>();
    for (const content of pageContents) {
      if (!contentBySlug.has(content.page_slug)) {
        contentBySlug.set(content.page_slug, []);
      }
      contentBySlug.get(content.page_slug)!.push(content);
    }

    // Assemble each page
    return structurePages.map(structurePage => {
      const pageContent = contentBySlug.get(structurePage.slug) || [];

      const sections = this.assembleSections(
        structurePage.sections,
        pageContent,
        design_preferences
      );

      return {
        page_id: structurePage.page_id,
        slug: structurePage.slug,
        title: structurePage.name,
        sections
      };
    });
  }

  /**
   * Assemble sections with content and layout hints
   */
  private assembleSections(
    structureSections: any[],
    pageContents: PageContent[],
    design_preferences: string
  ): RenderSection[] {
    // Create content map by section type
    const contentByType = new Map<string, SectionContent>();
    for (const content of pageContents) {
      contentByType.set(content.section_type, content.content_json as SectionContent);
    }

    // Assemble each section
    return structureSections.map(structureSection => {
      const content = contentByType.get(structureSection.type);
      if (!content) {
        throw new Error(`Missing content for section type: ${structureSection.type}`);
      }

      const layoutHints = this.generateLayoutHints(
        structureSection.type,
        structureSection.order,
        design_preferences
      );

      return {
        section_id: structureSection.section_id,
        section_type: structureSection.type,
        order: structureSection.order,
        content,
        layout_hints: layoutHints
      };
    });
  }

  /**
   * Generate layout hints based on section type and design preferences
   */
  private generateLayoutHints(
    sectionType: string,
    order: number,
    design_preferences: string
  ): LayoutHints {
    const hints: LayoutHints = {};

    // Background color based on order (alternating)
    if (order === 1) {
      hints.background_color = 'primary'; // First section (usually hero) gets primary
    } else if (order % 2 === 0) {
      hints.background_color = 'light';
    } else {
      hints.background_color = 'white';
    }

    // Text alignment based on section type
    if (sectionType === 'hero' || sectionType === 'cta') {
      hints.text_alignment = 'center';
    } else if (sectionType === 'testimonials' || sectionType === 'features') {
      hints.text_alignment = 'center';
    } else {
      hints.text_alignment = 'left';
    }

    // Padding based on section type
    if (sectionType === 'hero') {
      hints.padding = 'large';
    } else if (sectionType === 'cta' || sectionType === 'contact') {
      hints.padding = 'medium';
    } else {
      hints.padding = 'medium';
    }

    // Full width for certain sections
    if (sectionType === 'hero' || sectionType === 'gallery' || sectionType === 'product-catalog') {
      hints.full_width = true;
    } else {
      hints.full_width = false;
    }

    // Adjust for design preferences
    if (design_preferences && design_preferences.toLowerCase().includes('minimal')) {
      hints.padding = 'small';
    } else if (design_preferences && design_preferences.toLowerCase().includes('bold')) {
      hints.padding = 'large';
    }

    return hints;
  }
}
