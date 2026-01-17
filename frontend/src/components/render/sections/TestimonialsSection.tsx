/**
 * Testimonials Section Renderer
 */

import React from 'react';
import type { TestimonialsContent } from '../../../types/render-schema';

interface TestimonialsSectionProps {
  content: TestimonialsContent;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ content }) => {
  const { title, subtitle, testimonials } = content;

  return (
    <div className="testimonials-section">
      <div className="testimonials-header">
        <h2 className="testimonials-title">{title}</h2>
        {subtitle && <p className="testimonials-subtitle">{subtitle}</p>}
      </div>
      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            {testimonial.avatar_url && (
              <img
                src={testimonial.avatar_url}
                alt={testimonial.author}
                className="testimonial-avatar"
              />
            )}
            <blockquote className="testimonial-quote">"{testimonial.quote}"</blockquote>
            <div className="testimonial-author">
              <p className="author-name">{testimonial.author}</p>
              <p className="author-role">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
