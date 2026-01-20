import { apiClient } from './client';
import type {
  ConversationRequest,
  ConversationResponse,
  ApiResponse,
} from '../types/api.types';

/**
 * Mock conversation response for testing without backend
 */
const getMockResponse = (message: string): string => {
  // Simple mock responses based on keywords
  if (message.toLowerCase().includes('business') || message.toLowerCase().includes('company')) {
    return "Great! What type of business do you have? For example, is it an e-commerce store, a service business, a portfolio site, or something else?";
  }
  if (message.toLowerCase().includes('ecommerce') || message.toLowerCase().includes('store')) {
    return "Excellent! An e-commerce store. What kind of products will you be selling? And who is your target audience?";
  }
  if (message.toLowerCase().includes('feature')) {
    return "I understand you need those features. What design style do you prefer? Modern and minimal, colorful and vibrant, or professional and corporate?";
  }
  return "I understand. Could you tell me more about your requirements? I'll help you build the perfect website.";
};

/**
 * Send a message to the AI and get a response
 * Falls back to mock if backend is unavailable
 */
export async function sendMessage(
  sessionId: string,
  message: string
): Promise<ApiResponse<ConversationResponse>> {
  const request: ConversationRequest = {
    session_id: sessionId,
    message,
  };

  // Try real API first
  const response = await apiClient.post<ConversationResponse>(
    '/conversation/message/ai',
    request
  );

  // If API fails, use mock response (MOCK FALLBACK)
  if (response.error) {
    console.warn('Backend unavailable, using mock response:', response.error.message);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        session_id: sessionId,
        response: getMockResponse(message),
        timestamp: new Date().toISOString(),
      },
    };
  }

  return response;
}

export const conversationApi = {
  sendMessage,
};
