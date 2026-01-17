/**
 * About Section Renderer
 */

import React from 'react';
import type { AboutContent } from '../../../types/render-schema';

interface AboutSectionProps {
  content: AboutContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content }) => {
  const { title, description, team_section } = content;

  return (
    <div className="about-section">
      <div className="about-header">
        <h2 className="about-title">{title}</h2>
        <p className="about-description">{description}</p>
      </div>
      {team_section && (
        <div className="team-section">
          <h3 className="team-title">{team_section.title}</h3>
          <div className="team-grid">
            {team_section.members.map((member, index) => (
              <div key={index} className="team-member-card">
                {member.avatar_url && (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="member-avatar"
                  />
                )}
                <h4 className="member-name">{member.name}</h4>
                <p className="member-role">{member.role}</p>
                <p className="member-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
