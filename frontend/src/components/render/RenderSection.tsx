/**
 * Stage 5.1.3: Dynamic Section Renderer
 * 
 * Main component that renders any section type based on RenderSection schema.
 * Delegates to specific section components based on section_type.
 */

import React from 'react';
import type { RenderSection as RenderSectionType } from '../../types/render-schema';
import {
  isHeroContent,
  isFeaturesContent,
  isPricingContent,
  isTestimonialsContent,
  isAboutContent,
  isContactContent,
  isFAQContent,
  isProductCatalogContent,
  isMenuContent,
  isGalleryContent,
  isBlogContent,
  isCTAContent,
} from '../../types/render-schema';

// Section renderers
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { PricingSection } from './sections/PricingSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { AboutSection } from './sections/AboutSection';
import { ContactSection } from './sections/ContactSection';
import { FAQSection } from './sections/FAQSection';
import { ProductCatalogSection } from './sections/ProductCatalogSection';
import { MenuSection } from './sections/MenuSection';
import { GallerySection } from './sections/GallerySection';
import { BlogSection } from './sections/BlogSection';
import { CTASection } from './sections/CTASection';

interface RenderSectionProps {
  section: RenderSectionType;
}

/**
 * RenderSection component
 * 
 * Dynamically renders a section based on its type using type guards
 * for type-safe content handling.
 */
export const RenderSection: React.FC<RenderSectionProps> = ({ section }) => {
  const { content, layout_hints } = section;

  // Apply layout hints as className for styling
  const layoutClasses = [
    layout_hints.background_color ? `bg-${layout_hints.background_color}` : '',
    layout_hints.text_alignment ? `text-${layout_hints.text_alignment}` : '',
    layout_hints.padding ? `padding-${layout_hints.padding}` : '',
    layout_hints.full_width ? 'full-width' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Type-safe rendering using type guards
  if (isHeroContent(content)) {
    return (
      <div className={`section section-hero ${layoutClasses}`} data-section-id={section.section_id}>
        <HeroSection content={content} />
      </div>
    );
  }

  if (isFeaturesContent(content)) {
    return (
      <div className={`section section-features ${layoutClasses}`} data-section-id={section.section_id}>
        <FeaturesSection content={content} />
      </div>
    );
  }

  if (isPricingContent(content)) {
    return (
      <div className={`section section-pricing ${layoutClasses}`} data-section-id={section.section_id}>
        <PricingSection content={content} />
      </div>
    );
  }

  if (isTestimonialsContent(content)) {
    return (
      <div className={`section section-testimonials ${layoutClasses}`} data-section-id={section.section_id}>
        <TestimonialsSection content={content} />
      </div>
    );
  }

  if (isAboutContent(content)) {
    return (
      <div className={`section section-about ${layoutClasses}`} data-section-id={section.section_id}>
        <AboutSection content={content} />
      </div>
    );
  }

  if (isContactContent(content)) {
    return (
      <div className={`section section-contact ${layoutClasses}`} data-section-id={section.section_id}>
        <ContactSection content={content} />
      </div>
    );
  }

  if (isFAQContent(content)) {
    return (
      <div className={`section section-faq ${layoutClasses}`} data-section-id={section.section_id}>
        <FAQSection content={content} />
      </div>
    );
  }

  if (isProductCatalogContent(content)) {
    return (
      <div className={`section section-product-catalog ${layoutClasses}`} data-section-id={section.section_id}>
        <ProductCatalogSection content={content} />
      </div>
    );
  }

  if (isMenuContent(content)) {
    return (
      <div className={`section section-menu ${layoutClasses}`} data-section-id={section.section_id}>
        <MenuSection content={content} />
      </div>
    );
  }

  if (isGalleryContent(content)) {
    return (
      <div className={`section section-gallery ${layoutClasses}`} data-section-id={section.section_id}>
        <GallerySection content={content} />
      </div>
    );
  }

  if (isBlogContent(content)) {
    return (
      <div className={`section section-blog ${layoutClasses}`} data-section-id={section.section_id}>
        <BlogSection content={content} />
      </div>
    );
  }

  if (isCTAContent(content)) {
    return (
      <div className={`section section-cta ${layoutClasses}`} data-section-id={section.section_id}>
        <CTASection content={content} />
      </div>
    );
  }

  // Fallback for unknown section types
  console.warn(`Unknown section type: ${section.section_type}`);
  return (
    <div className={`section section-unknown ${layoutClasses}`} data-section-id={section.section_id}>
      <p>Unknown section type: {section.section_type}</p>
    </div>
  );
};
