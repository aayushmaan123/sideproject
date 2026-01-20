/**
 * Gallery Section Renderer
 */

import React from 'react';
import type { GalleryContent } from '../../../types/render-schema';

interface GallerySectionProps {
  content: GalleryContent;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ content }) => {
  const { title, subtitle, items } = content;

  return (
    <div className="gallery-section">
      <div className="gallery-header">
        <h2 className="gallery-title">{title}</h2>
        {subtitle && <p className="gallery-subtitle">{subtitle}</p>}
      </div>
      <div className="gallery-grid">
        {items.map((item, index) => (
          <div key={index} className="gallery-item">
            <img src={item.image_url} alt={item.title} className="gallery-image" />
            <div className="gallery-overlay">
              <h3 className="item-title">{item.title}</h3>
              {item.description && <p className="item-description">{item.description}</p>}
              {item.category && <span className="item-category">{item.category}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
