/**
 * Contact Section Renderer
 */

import React from 'react';
import type { ContactContent } from '../../../types/render-schema';

interface ContactSectionProps {
  content: ContactContent;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ content }) => {
  const { title, description, contact_info } = content;

  return (
    <div className="contact-section">
      <div className="contact-header">
        <h2 className="contact-title">{title}</h2>
        <p className="contact-description">{description}</p>
      </div>
      <div className="contact-info">
        {contact_info.email && (
          <div className="contact-item">
            <span className="contact-label">Email:</span>
            <a href={`mailto:${contact_info.email}`} className="contact-value">
              {contact_info.email}
            </a>
          </div>
        )}
        {contact_info.phone && (
          <div className="contact-item">
            <span className="contact-label">Phone:</span>
            <a href={`tel:${contact_info.phone}`} className="contact-value">
              {contact_info.phone}
            </a>
          </div>
        )}
        {contact_info.address && (
          <div className="contact-item">
            <span className="contact-label">Address:</span>
            <p className="contact-value">{contact_info.address}</p>
          </div>
        )}
      </div>
    </div>
  );
};
