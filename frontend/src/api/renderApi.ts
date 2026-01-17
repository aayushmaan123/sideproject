/**
 * Stage 5.1.2: Render API Service
 * 
 * Service for fetching RenderSchema from backend Stage 4.5 API.
 * Handles GET /api/render/:session_id/:template_id endpoint.
 */

import { apiClient } from './client';
import type { ApiResponse } from '../types/api.types';
import type { RenderSchema } from '../types/render-schema';

/**
 * Render API response from backend
 */
export interface RenderApiResponse {
  session_id: string;
  template_id: string;
  render_schema: RenderSchema;
}

/**
 * Error response from render API
 */
export interface RenderApiError {
  error: string;
}

/**
 * Fetch render-ready schema from backend
 * 
 * @param sessionId - Session UUID
 * @param templateId - Template UUID
 * @returns Promise<ApiResponse<RenderSchema>>
 * 
 * @example
 * const result = await getRenderSchema('session-uuid', 'template-uuid');
 * if (result.data) {
 *   console.log('Pages:', result.data.pages.length);
 * } else if (result.error) {
 *   console.error('Error:', result.error.message);
 * }
 */
export async function getRenderSchema(
  sessionId: string,
  templateId: string
): Promise<ApiResponse<RenderSchema>> {
  try {
    // Validate input
    if (!sessionId || typeof sessionId !== 'string') {
      return {
        data: undefined,
        error: {
          message: 'Invalid session_id: must be a non-empty string',
          status: 400,
        },
      };
    }

    if (!templateId || typeof templateId !== 'string') {
      return {
        data: undefined,
        error: {
          message: 'Invalid template_id: must be a non-empty string',
          status: 400,
        },
      };
    }

    // Call backend API
    const response = await apiClient.get<RenderSchema>(`/api/render/${sessionId}/${templateId}`);

    // Return result
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch render schema';
    console.error('[RenderAPI] Error fetching render schema:', error);
    
    // Return error response
    return {
      data: undefined,
      error: {
        message: errorMessage,
        status: 500,
      },
    };
  }
}

/**
 * Mock render schema for testing/fallback
 * This is used when backend is unavailable
 */
export function getMockRenderSchema(): RenderSchema {
  return {
    render_version: '1.0',
    site_metadata: {
      business_name: 'Demo Business',
      industry: 'E-commerce',
      selected_template: {
        id: 'template-mock-uuid',
        name: 'Modern E-commerce Template',
      },
      design_preferences: 'Modern and minimal with clean aesthetics',
      render_version: '1.0',
    },
    pages: [
      {
        page_id: 'page-home-uuid',
        slug: '/',
        title: 'Home',
        sections: [
          {
            section_id: 'section-hero-uuid',
            section_type: 'hero',
            order: 1,
            content: {
              headline: 'Welcome to Our Store',
              subheadline: 'Discover amazing products at great prices',
              cta_text: 'Shop Now',
              cta_url: '/products',
            },
            layout_hints: {
              background_color: 'primary',
              text_alignment: 'center',
              padding: 'large',
              full_width: true,
            },
          },
          {
            section_id: 'section-features-uuid',
            section_type: 'features',
            order: 2,
            content: {
              title: 'Why Choose Us',
              subtitle: 'We offer the best products and service',
              features: [
                {
                  icon: '🚚',
                  title: 'Free Shipping',
                  description: 'On all orders over $50',
                },
                {
                  icon: '💳',
                  title: 'Secure Payment',
                  description: 'Safe and secure checkout',
                },
                {
                  icon: '🔄',
                  title: 'Easy Returns',
                  description: '30-day return policy',
                },
              ],
            },
            layout_hints: {
              background_color: 'light',
              text_alignment: 'center',
              padding: 'large',
            },
          },
        ],
      },
    ],
  };
}
