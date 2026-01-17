/**
 * Hero Section Renderer
 */

import React from 'react';
import type { HeroContent } from '../../../types/render-schema';

interface HeroSectionProps {
  content: HeroContent;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content }) => {
  const { headline, subheadline, cta_text, cta_url } = content;

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-headline">{headline}</h1>
        <p className="hero-subheadline">{subheadline}</p>
        <a href={cta_url} className="hero-cta btn btn-primary">
          {cta_text}
        </a>
      </div>
    </div>
  );
};
