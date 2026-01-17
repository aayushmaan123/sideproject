/**
 * Menu Section Renderer
 */

import React from 'react';
import type { MenuContent } from '../../../types/render-schema';

interface MenuSectionProps {
  content: MenuContent;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ content }) => {
  const { title, subtitle, categories, items } = content;

  return (
    <div className="menu-section">
      <div className="menu-header">
        <h2 className="menu-title">{title}</h2>
        {subtitle && <p className="menu-subtitle">{subtitle}</p>}
      </div>
      <div className="menu-content">
        {categories.map((category, index) => (
          <div key={index} className="menu-category">
            <h3 className="category-title">{category}</h3>
            <div className="menu-items">
              {items
                .filter((item) => item.category === category)
                .map((item, itemIndex) => (
                  <div key={itemIndex} className="menu-item">
                    <div className="item-header">
                      <h4 className="item-name">{item.name}</h4>
                      <span className="item-price">{item.price}</span>
                    </div>
                    <p className="item-description">{item.description}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
