/**
 * Stage 5.1.3: RenderPage Component
 * 
 * Renders a complete page with all its sections.
 */

import React from 'react';
import type { RenderPage as RenderPageType } from '../../types/render-schema';
import { RenderSection } from './RenderSection';

interface RenderPageProps {
  page: RenderPageType;
}

/**
 * RenderPage component
 * 
 * Renders all sections of a page in order.
 */
export const RenderPage: React.FC<RenderPageProps> = ({ page }) => {
  // Sort sections by order to ensure correct rendering sequence
  const sortedSections = [...page.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="render-page" data-page-id={page.page_id} data-slug={page.slug}>
      {/* Page metadata for SEO */}
      <title>{page.title}</title>
      
      {/* Render all sections */}
      <div className="page-sections">
        {sortedSections.map((section) => (
          <RenderSection key={section.section_id} section={section} />
        ))}
      </div>
    </div>
  );
};
