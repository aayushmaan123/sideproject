/**
 * Blog Section Renderer
 */

import React from 'react';
import type { BlogContent } from '../../../types/render-schema';

interface BlogSectionProps {
  content: BlogContent;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ content }) => {
  const { title, subtitle, posts } = content;

  return (
    <div className="blog-section">
      <div className="blog-header">
        <h2 className="blog-title">{title}</h2>
        {subtitle && <p className="blog-subtitle">{subtitle}</p>}
      </div>
      <div className="blog-grid">
        {posts.map((post, index) => (
          <div key={index} className="blog-card">
            {post.image_url && (
              <img src={post.image_url} alt={post.title} className="blog-image" />
            )}
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-category">{post.category}</span>
                <span className="blog-date">{post.date}</span>
              </div>
              <h3 className="blog-post-title">{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
              <p className="blog-author">By {post.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
