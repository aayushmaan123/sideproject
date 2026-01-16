/**
 * Type definitions for Page Content Generation
 * Stage 4.4.2
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
 * Union type for all possible content types
 */
export type ContentJSON = 
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
 * Supported section types
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
  'cta'
] as const;

export type SectionType = typeof SECTION_TYPES[number];
