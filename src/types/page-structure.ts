/**
 * Type definitions for Page Structure Generation
 * Stage 4.4.1
 */

/**
 * Section within a page
 */
export interface Section {
  section_id: string;           // UUID
  type: string;                 // "hero", "features", "cta", etc.
  order: number;                // Display order (1, 2, 3...)
  required_features: string[];  // Features this section requires
  content_hints: string;        // Plain text guidance for frontend
}

/**
 * Page within a website structure
 */
export interface Page {
  page_id: string;              // UUID
  name: string;                 // "Home", "About", "Pricing", etc.
  slug: string;                 // "/", "/about", "/pricing", etc.
  sections: Section[];          // Ordered sections for this page
}

/**
 * Complete page structure for a website
 */
export interface PageStructureData {
  session_id: string;           // UUID - links to requirement
  template_id: string;          // UUID - links to template
  pages: Page[];                // Array of pages
  generated_at: Date;           // ISO timestamp
}
