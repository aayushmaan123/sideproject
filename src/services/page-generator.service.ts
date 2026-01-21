/**
 * Page Generator Service
 * 
 * Generates deterministic page structures based on templates and requirements
 * Stage 4.4.1.2
 */

import { v4 as uuidv4 } from 'uuid';
import { Page, Section, PageStructureData } from '../types/page-structure';
import { Requirement } from '../models/Requirement';
import { Template } from '../models/Template';
import { Logger } from '../utils/logger';

/**
 * Page generation rules based on business types
 */
const BUSINESS_TYPE_PAGES: Record<string, string[]> = {
  'e-commerce': ['Home', 'Products', 'Cart', 'Checkout', 'Contact'],
  'restaurant': ['Home', 'Menu', 'Reservations', 'Contact', 'About'],
  'cafe': ['Home', 'Menu', 'Contact', 'About'],
  'portfolio': ['Home', 'Projects', 'About', 'Contact'],
  'photography': ['Home', 'Gallery', 'Portfolio', 'About', 'Contact'],
  'creative': ['Home', 'Work', 'About', 'Contact'],
  'saas': ['Home', 'Features', 'Pricing', 'Docs', 'Contact'],
  'software': ['Home', 'Features', 'Pricing', 'Contact'],
  'tech': ['Home', 'Products', 'About', 'Contact'],
  'blog': ['Home', 'Posts', 'Categories', 'About', 'Contact'],
  'personal': ['Home', 'About', 'Blog', 'Contact'],
  'content': ['Home', 'Articles', 'About', 'Contact'],
  'default': ['Home', 'About', 'Services', 'Contact'],
};

/**
 * Section types based on features
 */
const FEATURE_SECTIONS: Record<string, string> = {
  'homepage': 'hero',
  'hero': 'hero',
  'menu': 'menu',
  'products': 'product-catalog',
  'product catalog': 'product-catalog',
  'gallery': 'gallery',
  'portfolio': 'gallery',
  'projects': 'gallery',
  'testimonials': 'testimonials',
  'pricing': 'pricing',
  'features': 'features',
  'contact': 'contact',
  'contact form': 'contact',
  'about': 'about',
  'team': 'about',
  'blog': 'blog',
  'posts': 'blog',
  'cta': 'cta',
  'faq': 'faq',
  'questions': 'faq',
};

/**
 * Page Generator Service
 */
export class PageGeneratorService {
  /**
   * Generate page structure from requirement and template
   */
  async generatePageStructure(
    sessionId: string,
    templateId: string
  ): Promise<PageStructureData> {
    try {
      Logger.info('Generating page structure', { sessionId, templateId });

      // Fetch latest requirement
      const requirement = await Requirement.findOne({
        where: { session_id: sessionId },
        order: [['version_number', 'DESC']],
      });

      if (!requirement) {
        throw new Error(`No requirement found for session ${sessionId}`);
      }

      // Fetch template
      const template = await Template.findByPk(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      Logger.info('Found requirement and template', {
        sessionId,
        templateId,
        businessType: requirement.business_type,
        templateName: template.name,
      });

      // Generate pages based on business type
      const pages = this.generatePages(requirement, template);

      const structure: PageStructureData = {
        session_id: sessionId,
        template_id: templateId,
        pages,
        generated_at: new Date(),
      };

      Logger.info('Page structure generated successfully', {
        sessionId,
        templateId,
        pageCount: pages.length,
        sectionCount: pages.reduce((sum, p) => sum + p.sections.length, 0),
      });

      return structure;
    } catch (error) {
      Logger.error('Failed to generate page structure', error);
      throw error;
    }
  }

  /**
   * Generate pages based on business type and template
   */
  private generatePages(requirement: Requirement, template: Template): Page[] {
    const businessType = requirement.business_type.toLowerCase().trim();
    const features = requirement.key_features.map((f) => f.toLowerCase().trim());
    const designPrefs = requirement.design_preferences.toLowerCase().trim();

    // Determine page list based on business type
    let pageNames: string[] = [];

    // Check if business type matches template business types
    for (const templateBizType of template.business_types) {
      if (BUSINESS_TYPE_PAGES[templateBizType]) {
        pageNames = BUSINESS_TYPE_PAGES[templateBizType];
        break;
      }
    }

    // Fallback to requirement business type
    if (pageNames.length === 0 && BUSINESS_TYPE_PAGES[businessType]) {
      pageNames = BUSINESS_TYPE_PAGES[businessType];
    }

    // Final fallback to default
    if (pageNames.length === 0) {
      pageNames = BUSINESS_TYPE_PAGES['default'];
    }

    // Generate pages
    const pages: Page[] = pageNames.map((pageName) => {
      const slug = pageName === 'Home' ? '/' : `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;

      return {
        page_id: uuidv4(),
        name: pageName,
        slug,
        sections: this.generateSections(pageName, features, designPrefs),
      };
    });

    return pages;
  }

  /**
   * Generate sections for a page
   */
  private generateSections(
    pageName: string,
    requiredFeatures: string[],
    designPrefs: string
  ): Section[] {
    const sections: Section[] = [];
    let order = 1;

    // Always add hero section for Home page
    if (pageName === 'Home') {
      sections.push({
        section_id: uuidv4(),
        type: 'hero',
        order: order++,
        required_features: ['homepage'],
        content_hints: `Main hero section with ${designPrefs} design. Welcome message and primary call-to-action.`,
      });
    }

    // Map features to sections based on page name
    const pageLower = pageName.toLowerCase();

    // Add sections based on required features
    for (const feature of requiredFeatures) {
      const featureLower = feature.toLowerCase().trim();
      const sectionType = FEATURE_SECTIONS[featureLower];

      // Check if this section belongs to this page
      const belongsToPage =
        (pageLower === 'home' && ['hero', 'features', 'testimonials', 'cta'].includes(sectionType || '')) ||
        (pageLower === 'products' && ['product-catalog'].includes(sectionType || '')) ||
        (pageLower === 'menu' && sectionType === 'menu') ||
        (pageLower === 'gallery' && sectionType === 'gallery') ||
        (pageLower === 'projects' && sectionType === 'gallery') ||
        (pageLower === 'portfolio' && sectionType === 'gallery') ||
        (pageLower === 'pricing' && sectionType === 'pricing') ||
        (pageLower === 'features' && sectionType === 'features') ||
        (pageLower === 'posts' && sectionType === 'blog') ||
        (pageLower === 'about' && sectionType === 'about') ||
        (pageLower === 'contact' && sectionType === 'contact') ||
        (pageLower === 'faq' && sectionType === 'faq') ||
        (pageLower === 'home' && sectionType === 'faq');

      if (sectionType && belongsToPage) {
        // Avoid duplicate sections
        if (!sections.some(s => s.type === sectionType)) {
          sections.push({
            section_id: uuidv4(),
            type: sectionType,
            order: order++,
            required_features: [featureLower],
            content_hints: this.generateContentHint(sectionType, feature, designPrefs),
          });
        }
      }
    }

    // Add default sections if none generated
    if (sections.length === 0) {

      // Changed fallback to 'about' instead of generic 'content' which is invalid?
      // Wait, 'content' is definitely not in SECTION_TYPES.
      // Let's use 'about' or 'features' as safe defaults? Or maybe just 'hero' if home.
      // If none generated, we used to add 'content'. 'content' IS NOT IN SECTION_TYPES.
      // 'blog', 'about', 'contact' are valid. 
      // Let's use 'about' as a safe default for non-home pages.
      const safeDefault = pageLower === 'home' ? 'hero' : 'about';

      sections.push({
        section_id: uuidv4(),
        type: safeDefault,
        order: 1,
        required_features: [],
        content_hints: `${pageName} page content with ${designPrefs} design.`,
      });
    }

    // Add call-to-action section for Home page if not already present
    if (pageName === 'Home' && !sections.some(s => s.type === 'cta')) {
      sections.push({
        section_id: uuidv4(),
        type: 'cta',
        order: order++,
        required_features: [],
        content_hints: `Call-to-action section encouraging user engagement with ${designPrefs} design.`,
      });
    }

    return sections;
  }

  /**
   * Generate content hint for a section
   */
  private generateContentHint(sectionType: string, feature: string, designPrefs: string): string {
    const hints: Record<string, string> = {
      'hero': `Hero banner with compelling headline and ${designPrefs} visual design`,
      'features': `Showcase key features: ${feature} with ${designPrefs} layout`,
      'product-catalog': `Product grid displaying ${feature} with ${designPrefs} cards`,
      'menu': `Menu display for ${feature} with ${designPrefs} presentation`,
      'gallery': `Image gallery showcasing ${feature} with ${designPrefs} grid layout`,
      'testimonials': `Customer testimonials with ${designPrefs} layout`,
      'pricing': `Pricing tiers for ${feature} with ${designPrefs} comparison table`,
      'contact': `Contact form with ${designPrefs} design for user inquiries`,
      'about': `About section describing ${feature} with ${designPrefs} storytelling`,
      'blog': `Blog post grid for ${feature} with ${designPrefs} cards`,
      'cta': `Call-to-action encouraging engagement with ${designPrefs} button design`,
      'faq': `Frequency asked questions for ${feature} with ${designPrefs} accordion style`,
    };

    return hints[sectionType] || `${sectionType} section for ${feature} with ${designPrefs} design`;
  }
}

export default new PageGeneratorService();
