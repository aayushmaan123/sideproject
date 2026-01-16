/**
 * Template Seeding
 * 
 * Seeds the database with realistic website templates
 */

import { Template } from '../models/Template';
import { Logger } from '../utils/logger';

/**
 * Template seed data
 */
export const templateSeedData = [
  {
    name: 'Modern Restaurant',
    business_types: ['restaurant', 'food service', 'cafe'],
    supported_features: ['menu', 'reservations', 'online ordering', 'contact form', 'gallery', 'location map'],
    design_tags: ['modern', 'elegant', 'food-focused', 'responsive'],
    description: 'A beautiful template for restaurants and cafes with menu display, reservation system, and online ordering capabilities.',
    preview_image_url: 'https://example.com/templates/restaurant.jpg',
  },
  {
    name: 'Creative Portfolio',
    business_types: ['portfolio', 'photography', 'creative'],
    supported_features: ['gallery', 'projects showcase', 'contact form', 'blog', 'testimonials'],
    design_tags: ['minimalist', 'creative', 'visual-heavy', 'clean'],
    description: 'Perfect for photographers, designers, and creative professionals to showcase their work with stunning galleries and project pages.',
    preview_image_url: 'https://example.com/templates/portfolio.jpg',
  },
  {
    name: 'E-Commerce Store',
    business_types: ['e-commerce', 'online store', 'retail'],
    supported_features: ['product catalog', 'shopping cart', 'payment integration', 'user accounts', 'reviews', 'search'],
    design_tags: ['modern', 'professional', 'conversion-focused', 'responsive'],
    description: 'Complete online store solution with product catalog, shopping cart, secure checkout, and customer account management.',
    preview_image_url: 'https://example.com/templates/ecommerce.jpg',
  },
  {
    name: 'SaaS Landing Page',
    business_types: ['saas', 'software', 'technology'],
    supported_features: ['landing page', 'pricing tables', 'feature showcase', 'testimonials', 'contact form', 'newsletter signup'],
    design_tags: ['modern', 'professional', 'tech-focused', 'conversion-optimized'],
    description: 'High-converting landing page template for SaaS products with pricing tables, feature highlights, and customer testimonials.',
    preview_image_url: 'https://example.com/templates/saas.jpg',
  },
  {
    name: 'Personal Blog',
    business_types: ['blog', 'personal website', 'content'],
    supported_features: ['blog posts', 'categories', 'tags', 'comments', 'search', 'author bio', 'social sharing'],
    design_tags: ['minimalist', 'readable', 'content-focused', 'clean'],
    description: 'Clean and readable blog template focused on content with category organization, commenting, and social media integration.',
    preview_image_url: 'https://example.com/templates/blog.jpg',
  },
];

/**
 * Seed templates into database
 */
export async function seedTemplates(): Promise<void> {
  try {
    // Check if templates already exist
    const count = await Template.count();
    
    if (count > 0) {
      Logger.info('Templates already seeded', { count });
      return;
    }

    // Seed templates
    Logger.info('Seeding templates...');
    
    for (const templateData of templateSeedData) {
      await Template.create(templateData);
    }

    const newCount = await Template.count();
    Logger.info('Templates seeded successfully', { count: newCount });
  } catch (error) {
    Logger.error('Failed to seed templates', error);
    throw error;
  }
}
