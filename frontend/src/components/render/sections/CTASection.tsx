/**
 * CTA Section Renderer
 */

import React from 'react';
import type { CTAContent } from '../../../types/render-schema';

interface CTASectionProps {
  content: CTAContent;
}

export const CTASection: React.FC<CTASectionProps> = ({ content }) => {
  const { headline, description, cta_text, cta_url } = content;

  return (
    <div className="cta-section">
      <div className="cta-content">
        <h2 className="cta-headline">{headline}</h2>
        <p className="cta-description">{description}</p>
        <a href={cta_url} className="cta-button btn btn-primary">
          {cta_text}
        </a>
      </div>
    </div>
  );
};
