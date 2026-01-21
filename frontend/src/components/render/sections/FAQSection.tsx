/**
 * FAQ Section Renderer with Accordion Functionality
 */

import React, { useState } from 'react';
import type { FAQContent } from '../../../types/render-schema';

interface FAQSectionProps {
  content: FAQContent;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ content }) => {
  const { title, subtitle, questions } = content;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number): void => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle(index);
    }
  };

  return (
    <div className="faq-section">
      <div className="faq-header">
        <h2 className="faq-title">{title}</h2>
        {subtitle && <p className="faq-subtitle">{subtitle}</p>}
      </div>
      <div className="faq-list">
        {questions.map((item, index) => {
          const isExpanded = expandedIndex === index;
          const answerId = `faq-answer-${index}`;
          const questionId = `faq-question-${index}`;

          return (
            <div key={index} className="faq-item">
              <button
                id={questionId}
                className="faq-question"
                onClick={() => handleToggle(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-expanded={isExpanded}
                aria-controls={answerId}
                type="button"
              >
                <span>{item.question}</span>
                <span className={`faq-icon${isExpanded ? ' open' : ''}`} aria-hidden="true">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>
              <div
                id={answerId}
                className={`faq-answer${isExpanded ? ' open' : ''}`}
                aria-hidden={!isExpanded}
                aria-labelledby={questionId}
                role="region"
              >
                <div className="faq-answer-content">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
