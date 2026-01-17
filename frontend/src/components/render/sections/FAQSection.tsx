/**
 * FAQ Section Renderer
 */

import React from 'react';
import type { FAQContent } from '../../../types/render-schema';

interface FAQSectionProps {
  content: FAQContent;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ content }) => {
  const { title, subtitle, questions } = content;

  return (
    <div className="faq-section">
      <div className="faq-header">
        <h2 className="faq-title">{title}</h2>
        {subtitle && <p className="faq-subtitle">{subtitle}</p>}
      </div>
      <div className="faq-list">
        {questions.map((item, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{item.question}</h3>
            <p className="faq-answer">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
