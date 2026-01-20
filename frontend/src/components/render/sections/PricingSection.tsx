/**
 * Pricing Section Renderer
 */

import React from 'react';
import type { PricingContent } from '../../../types/render-schema';

interface PricingSectionProps {
  content: PricingContent;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ content }) => {
  const { title, subtitle, plans } = content;

  return (
    <div className="pricing-section">
      <div className="pricing-header">
        <h2 className="pricing-title">{title}</h2>
        {subtitle && <p className="pricing-subtitle">{subtitle}</p>}
      </div>
      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`pricing-card ${plan.highlighted ? 'pricing-card-highlighted' : ''}`}
          >
            <h3 className="plan-name">{plan.name}</h3>
            <div className="plan-price">
              <span className="price-amount">{plan.price}</span>
              <span className="price-period">/{plan.billing_period}</span>
            </div>
            <ul className="plan-features">
              {plan.features.map((feature, fidx) => (
                <li key={fidx}>{feature}</li>
              ))}
            </ul>
            <a href={plan.cta_url} className="plan-cta btn btn-primary">
              {plan.cta_text}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
