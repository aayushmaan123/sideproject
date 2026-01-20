/**
 * Stage 5.1.1: Render-Ready Output Schema (Frontend)
 * 
 * Type definitions for consuming the backend RenderSchema API.
 * This schema defines the complete contract for rendering AI-generated websites.
 * 
 * Version: 1.0
 * Backend API: GET /api/render/:session_id/:template_id
 */

/**
 * Hero section content
 */
export interface HeroContent {
  headline: string;
  subheadline: string;
  cta_text: string;
  cta_url: string;
}

/**
 * Feature item in features section
 */
export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

/**
 * Features section content
 */
export interface FeaturesContent {
  title: string;
  subtitle?: string;
  features: FeatureItem[];
}

/**
 * Pricing plan in pricing section
 */
export interface PricingPlan {
  name: string;
  price: string;
  billing_period: string;
  features: string[];
  cta_text: string;
  cta_url: string;
  highlighted?: boolean;
}

/**
 * Pricing section content
 */
export interface PricingContent {
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
}

/**
 * Testimonial item
 */
export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  avatar_url?: string;
}

/**
 * Testimonials section content
 */
export interface TestimonialsContent {
  title: string;
  subtitle?: string;
  testimonials: TestimonialItem[];
}

/**
 * Team member in about section
 */
export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar_url?: string;
}

/**
 * About section content
 */
export interface AboutContent {
  title: string;
  description: string;
  team_section?: {
    title: string;
    members: TeamMember[];
  };
}

/**
 * Contact section content
 */
export interface ContactContent {
  title: string;
  description: string;
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

/**
 * FAQ item
 */
export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * FAQ section content
 */
export interface FAQContent {
  title: string;
  subtitle?: string;
  questions: FAQItem[];
}

/**
 * Product item for product catalog
 */
export interface ProductItem {
  name: string;
  description: string;
  price: string;
  image_url?: string;
}

/**
 * Product catalog section content
 */
export interface ProductCatalogContent {
  title: string;
  subtitle?: string;
  products: ProductItem[];
}

/**
 * Menu item for restaurant menu
 */
export interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
}

/**
 * Menu section content
 */
export interface MenuContent {
  title: string;
  subtitle?: string;
  categories: string[];
  items: MenuItem[];
}

/**
 * Gallery item
 */
export interface GalleryItem {
  title: string;
  description?: string;
  image_url: string;
  category?: string;
}

/**
 * Gallery section content
 */
export interface GalleryContent {
  title: string;
  subtitle?: string;
  items: GalleryItem[];
}

/**
 * Blog post item
 */
export interface BlogPostItem {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image_url?: string;
}

/**
 * Blog section content
 */
export interface BlogContent {
  title: string;
  subtitle?: string;
  posts: BlogPostItem[];
}

/**
 * Call-to-action section content
 */
export interface CTAContent {
  headline: string;
  description: string;
  cta_text: string;
  cta_url: string;
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
 * Supported section types (constant)
 */
export const SECTION_TYPES = [
  'hero',
  'features',
  'pricing',
  'testimonials',
  'about',
  'contact',
  'faq',
  'product-catalog',
  'menu',
  'gallery',
  'blog',
  'cta',
] as const;

export type SectionType = typeof SECTION_TYPES[number];

/**
 * Type guards for type-safe content handling
 * These ensure proper TypeScript narrowing when rendering sections
 */
export function isHeroContent(content: SectionContent): content is HeroContent {
  return 'headline' in content && 'subheadline' in content && 'cta_text' in content;
}

export function isFeaturesContent(content: SectionContent): content is FeaturesContent {
  return 'title' in content && 'features' in content && Array.isArray((content as FeaturesContent).features);
}

export function isPricingContent(content: SectionContent): content is PricingContent {
  return 'title' in content && 'plans' in content && Array.isArray((content as PricingContent).plans);
}

export function isTestimonialsContent(content: SectionContent): content is TestimonialsContent {
  return 'title' in content && 'testimonials' in content && Array.isArray((content as TestimonialsContent).testimonials);
}

export function isAboutContent(content: SectionContent): content is AboutContent {
  return 'title' in content && 'description' in content && 'team_section' in content;
}

export function isContactContent(content: SectionContent): content is ContactContent {
  return 'title' in content && 'description' in content && 'contact_info' in content;
}

export function isFAQContent(content: SectionContent): content is FAQContent {
  return 'title' in content && 'questions' in content && Array.isArray((content as FAQContent).questions);
}

export function isProductCatalogContent(content: SectionContent): content is ProductCatalogContent {
  return 'title' in content && 'products' in content && Array.isArray((content as ProductCatalogContent).products);
}

export function isMenuContent(content: SectionContent): content is MenuContent {
  return 'title' in content && 'categories' in content && 'items' in content;
}

export function isGalleryContent(content: SectionContent): content is GalleryContent {
  return 'title' in content && 'items' in content && Array.isArray((content as GalleryContent).items);
}

export function isBlogContent(content: SectionContent): content is BlogContent {
  return 'title' in content && 'posts' in content && Array.isArray((content as BlogContent).posts);
}

export function isCTAContent(content: SectionContent): content is CTAContent {
  return 'headline' in content && 'description' in content && 'cta' in content;
}

/**
 * Schema version validation
 */
export function isValidRenderSchema(data: unknown): data is RenderSchema {
  return (
    !!data &&
    typeof data === 'object' &&
    'render_version' in data &&
    'site_metadata' in data &&
    'pages' in data &&
    Array.isArray((data as RenderSchema).pages)
  );
}
