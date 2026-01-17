/**
 * Stage 5.1.4: Preview Page
 * 
 * Page component that fetches RenderSchema from backend and displays
 * the dynamically generated website preview.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRenderSchema, getMockRenderSchema } from '../api/renderApi';
import type { RenderSchema } from '../types/render-schema';
import { RenderPage } from '../components/render/RenderPage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

/**
 * PreviewPage Component
 * 
 * Route: /preview/:session_id/:template_id
 * 
 * Fetches the complete RenderSchema from backend and renders the full website.
 */
export const PreviewPage: React.FC = () => {
  const { session_id, template_id } = useParams<{ session_id: string; template_id: string }>();
  const navigate = useNavigate();
  
  const [renderSchema, setRenderSchema] = useState<RenderSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    const fetchRenderSchema = async () => {
      // Validate params
      if (!session_id || !template_id) {
        setError('Missing session_id or template_id');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Attempt to fetch from backend
        const result = await getRenderSchema(session_id, template_id);

        if (result.data) {
          setRenderSchema(result.data);
          setUseMock(false);
        } else if (result.error) {
          console.warn('[PreviewPage] Backend unavailable, using mock data');
          // Fallback to mock data
          const mockData = getMockRenderSchema();
          setRenderSchema(mockData);
          setUseMock(true);
        }
      } catch (err: unknown) {
        console.error('[PreviewPage] Error fetching render schema:', err);
        // Fallback to mock data on error
        const mockData = getMockRenderSchema();
        setRenderSchema(mockData);
        setUseMock(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRenderSchema();
  }, [session_id, template_id]);

  // Loading state
  if (loading) {
    return (
      <div className="preview-page-container">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error && !renderSchema) {
    return (
      <div className="preview-page-container">
        <ErrorMessage message={error} />
        <button onClick={() => navigate('/requirements')}>
          Back to Requirements
        </button>
      </div>
    );
  }

  // No data state
  if (!renderSchema) {
    return (
      <div className="preview-page-container">
        <div className="preview-empty-state">
          <h2>No Preview Available</h2>
          <p>Unable to load website preview. Please try again.</p>
          <button onClick={() => navigate('/requirements')}>
            Back to Requirements
          </button>
        </div>
      </div>
    );
  }

  // Get home page (slug: "/")
  const homePage = renderSchema.pages.find((page) => page.slug === '/');

  if (!homePage) {
    return (
      <div className="preview-page-container">
        <div className="preview-empty-state">
          <h2>No Home Page Found</h2>
          <p>The website preview is missing a home page.</p>
          <button onClick={() => navigate('/requirements')}>
            Back to Requirements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-page-container">
      {/* Header with navigation */}
      <div className="preview-header">
        <div className="preview-header-content">
          <h1>{renderSchema.site_metadata.business_name}</h1>
          <button onClick={() => navigate('/requirements')} className="btn btn-secondary">
            ← Back to Requirements
          </button>
        </div>
        {useMock && (
          <div className="preview-mock-notice">
            <p>⚠️ Preview using mock data (backend unavailable)</p>
          </div>
        )}
      </div>

      {/* Render the home page */}
      <div className="preview-content">
        <RenderPage page={homePage} />
      </div>

      {/* Footer with metadata */}
      <div className="preview-footer">
        <p>
          Template: {renderSchema.site_metadata.selected_template.name} | Version:{' '}
          {renderSchema.render_version}
        </p>
      </div>
    </div>
  );
};
