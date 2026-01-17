/**
 * Features Section Renderer
 */

import React from 'react';
import type { FeaturesContent } from '../../../types/render-schema';

interface FeaturesSectionProps {
  content: FeaturesContent;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ content }) => {
  const { title, subtitle, features } = content;

  return (
    <div className="features-section">
      <div className="features-header">
        <h2 className="features-title">{title}</h2>
        {subtitle && <p className="features-subtitle">{subtitle}</p>}
      </div>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
