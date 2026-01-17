/**
 * Stage 4.5: Render-Ready Output Schema
 * 
 * This file defines the complete, frontend-safe contract for rendering
 * a website. All data from previous stages (Requirements, Templates,
 * Page Structure, Page Content) is assembled into this single schema.
 * 
 * Version: 1.0
 * Frontend Contract: This schema is the ONLY data structure the frontend
 * needs to render a complete website.
 */

import {
  HeroContent,
  FeaturesContent,
  PricingContent,
  TestimonialsContent,
  AboutContent,
  ContactContent,
  FAQContent,
  ProductCatalogContent,
  MenuContent,
  GalleryContent,
  BlogContent,
  CTAContent
} from './page-content';

/**
 * Layout hints for frontend styling
 * Provides guidance without prescribing exact implementation
 */
export interface LayoutHints {
  background_color?: string; // e.g., "light", "dark", "primary", "secondary"
  text_alignment?: 'left' | 'center' | 'right';
  padding?: 'none' | 'small' | 'medium' | 'large';
  full_width?: boolean; // Whether section should span full viewport width
}

/**
 * Content union type - all possible section content types
 */
export type SectionContent =
  | HeroContent
  | FeaturesContent
  | PricingContent
  | TestimonialsContent
  | AboutContent
  | ContactContent
  | FAQContent
  | ProductCatalogContent
  | MenuContent
  | GalleryContent
  | BlogContent
  | CTAContent;

/**
 * A single section within a page
 * Frontend-safe: no database IDs, clean structure
 */
export interface RenderSection {
  section_id: string; // UUID for frontend keying
  section_type: string; // "hero", "features", "pricing", etc.
  order: number; // Display order (1, 2, 3, ...)
  content: SectionContent; // Structured, type-specific content
  layout_hints: LayoutHints; // Styling guidance
}

/**
 * A single page in the website
 * Contains ordered sections ready for rendering
 */
export interface RenderPage {
  page_id: string; // UUID for frontend keying
  slug: string; // "/", "/about", "/pricing", etc.
  title: string; // "Home", "About Us", "Pricing", etc.
  sections: RenderSection[]; // Ordered array of sections
}

/**
 * Global site metadata
 * Business information and template selection
 */
export interface SiteMetadata {
  business_name: string; // Derived from requirement or default
  industry: string; // Derived from business_type
  selected_template: {
    id: string; // Template UUID
    name: string; // Template name
  };
  design_preferences: string; // User's design preferences
  render_version: string; // Schema version (currently "1.0")
}

/**
 * Complete render-ready schema
 * This is the SINGLE source of truth for frontend rendering
 */
export interface RenderSchema {
  render_version: string; // "1.0"
  site_metadata: SiteMetadata;
  pages: RenderPage[]; // Ordered array of pages
}

/**
 * Helper type guards for type-safe content handling
 */
export function isHeroContent(content: SectionContent): content is HeroContent {
  return 'headline' in content && 'subheadline' in content && 'cta_text' in content;
}

export function isFeaturesContent(content: SectionContent): content is FeaturesContent {
  return 'title' in content && 'features' in content && Array.isArray((content as any).features);
}

export function isPricingContent(content: SectionContent): content is PricingContent {
  return 'title' in content && 'plans' in content && Array.isArray((content as any).plans);
}

export function isTestimonialsContent(content: SectionContent): content is TestimonialsContent {
  return 'title' in content && 'testimonials' in content && Array.isArray((content as any).testimonials);
}

export function isAboutContent(content: SectionContent): content is AboutContent {
  return 'title' in content && 'description' in content && 'team_section' in content;
}

export function isContactContent(content: SectionContent): content is ContactContent {
  return 'title' in content && 'description' in content && 'contact_info' in content;
}

export function isFAQContent(content: SectionContent): content is FAQContent {
  return 'title' in content && 'questions' in content && Array.isArray((content as any).questions);
}

export function isProductCatalogContent(content: SectionContent): content is ProductCatalogContent {
  return 'title' in content && 'products' in content && Array.isArray((content as any).products);
}

export function isMenuContent(content: SectionContent): content is MenuContent {
  return 'title' in content && 'categories' in content && 'items' in content;
}

export function isGalleryContent(content: SectionContent): content is GalleryContent {
  return 'title' in content && 'items' in content && Array.isArray((content as any).items);
}

export function isBlogContent(content: SectionContent): content is BlogContent {
  return 'title' in content && 'posts' in content && Array.isArray((content as any).posts);
}

export function isCTAContent(content: SectionContent): content is CTAContent {
  return 'headline' in content && 'description' in content && 'cta' in content;
}
