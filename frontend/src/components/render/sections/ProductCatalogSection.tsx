/**
 * Product Catalog Section Renderer
 */

import React from 'react';
import type { ProductCatalogContent } from '../../../types/render-schema';

interface ProductCatalogSectionProps {
  content: ProductCatalogContent;
}

export const ProductCatalogSection: React.FC<ProductCatalogSectionProps> = ({ content }) => {
  const { title, subtitle, products } = content;

  return (
    <div className="product-catalog-section">
      <div className="catalog-header">
        <h2 className="catalog-title">{title}</h2>
        {subtitle && <p className="catalog-subtitle">{subtitle}</p>}
      </div>
      <div className="products-grid">
        {products.map((product, index) => (
          <div key={index} className="product-card">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="product-image"
              />
            )}
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <p className="product-price">{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
