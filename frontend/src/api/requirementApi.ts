import { apiClient } from './client';
import type {
  ExtractRequirementRequest,
  ExtractRequirementResponse,
  GetRequirementResponse,
  ApiResponse,
} from '../types/api.types';
import type { WebsiteRequirements } from '../types/requirement.types';

/**
 * Mock requirements for testing without backend
 */
const getMockRequirements = (sessionId: string): WebsiteRequirements => {
  return {
    session_id: sessionId,
    business_type: 'E-commerce Store',
    key_features: [
      'Product catalog',
      'Shopping cart',
      'Payment integration',
      'User authentication',
      'Order management',
    ],
    target_audience: 'Young professionals aged 25-40',
    design_preferences: 'Modern and minimal with clean aesthetics',
    additional_notes: 'Mobile-first design approach required',
    extracted_at: new Date().toISOString(),
  };
};

/**
 * Extract requirements from conversation
 * Falls back to mock if backend is unavailable
 */
export async function extractRequirements(
  sessionId: string
): Promise<ApiResponse<ExtractRequirementResponse>> {
  const request: ExtractRequirementRequest = {
    session_id: sessionId,
  };

  // Try real API first
  const response = await apiClient.post<ExtractRequirementResponse>(
    '/requirement/extract',
    request
  );

  // If API fails, use mock response (MOCK FALLBACK)
  if (response.error) {
    console.warn('Backend unavailable, using mock requirements:', response.error.message);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      data: {
        session_id: sessionId,
        requirements: getMockRequirements(sessionId),
      },
    };
  }

  return response;
}

/**
 * Get requirements by session ID
 * Falls back to mock if backend is unavailable
 */
export async function getRequirements(
  sessionId: string
): Promise<ApiResponse<GetRequirementResponse>> {
  // Try real API first
  const response = await apiClient.get<GetRequirementResponse>(
    `/requirement/${sessionId}`
  );

  // If API fails, use mock response (MOCK FALLBACK)
  if (response.error) {
    console.warn('Backend unavailable, using mock requirements:', response.error.message);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: {
        session_id: sessionId,
        requirements: getMockRequirements(sessionId),
      },
    };
  }

  return response;
}

export const requirementApi = {
  extractRequirements,
  getRequirements,
};
