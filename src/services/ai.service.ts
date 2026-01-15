/**
 * AI Service for extracting website requirements using OpenAI
 */

import OpenAI from 'openai';
import { AIServiceResponse } from '../types/extract';
import { Logger } from '../utils/logger';

export class AIService {
  private openai: OpenAI | null = null;
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  constructor() {
    // Initialize OpenAI client if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'test-key') {
      this.openai = new OpenAI({ apiKey });
    } else {
      Logger.info('OpenAI API key not found, using mock responses');
    }
  }

  /**
   * Extract website requirements from user input with retry logic
   */
  async extractRequirements(
    text: string,
    sessionId: string
  ): Promise<AIServiceResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          Logger.info(`Retry attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms`, {
            session_id: sessionId,
          });
          await this.sleep(delay);
        }

        const result = await this.performExtraction(text, sessionId);
        Logger.info('AI extraction successful', {
          session_id: sessionId,
          attempt: attempt + 1,
        });
        return result;
      } catch (error) {
        lastError = error as Error;
        Logger.error(`AI extraction attempt ${attempt + 1} failed`, error);
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }
      }
    }

    // All retries failed
    throw new Error(
      `Failed to extract requirements after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Perform the actual AI extraction
   */
  private async performExtraction(
    text: string,
    _sessionId: string
  ): Promise<AIServiceResponse> {
    // If no OpenAI client, use mock response
    if (!this.openai) {
      return this.getMockResponse(text);
    }

    const prompt = this.buildPrompt(text);
    
    const completion = await this.openai.chat.completions.create(
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting website requirements from user descriptions. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        timeout: 30000, // 30 second timeout
      }
    );

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON response
    try {
      const parsed = JSON.parse(content);
      return this.validateAIResponse(parsed);
    } catch (error) {
      Logger.error('Failed to parse AI response', { content, error });
      throw new Error('Invalid JSON response from AI');
    }
  }

  /**
   * Build the prompt for AI extraction
   */
  private buildPrompt(text: string): string {
    return `Extract website requirements from the following user input and return ONLY a JSON object with these fields:
- business_type: The type of business or website (e.g., "e-commerce", "blog", "portfolio")
- key_features: Array of key features requested (e.g., ["contact form", "product catalog", "payment integration"])
- target_audience: The intended audience for the website
- design_preferences: Any design style or preferences mentioned
- additional_notes: Any other relevant information

User input: "${text}"

Return ONLY the JSON object, no additional text or explanation.`;
  }

  /**
   * Validate AI response has expected structure
   */
  private validateAIResponse(response: unknown): AIServiceResponse {
    if (typeof response !== 'object' || response === null) {
      throw new Error('AI response is not an object');
    }

    const typed = response as Record<string, unknown>;
    
    return {
      business_type: this.getString(typed.business_type),
      key_features: this.getArray(typed.key_features),
      target_audience: this.getString(typed.target_audience),
      design_preferences: this.getString(typed.design_preferences),
      additional_notes: this.getString(typed.additional_notes),
    };
  }

  /**
   * Get mock response for testing/development
   */
  private getMockResponse(text: string): AIServiceResponse {
    // Simple keyword-based mock extraction
    const lowerText = text.toLowerCase();
    
    let businessType = 'general website';
    if (lowerText.includes('shop') || lowerText.includes('store') || lowerText.includes('ecommerce')) {
      businessType = 'e-commerce';
    } else if (lowerText.includes('blog') || lowerText.includes('article')) {
      businessType = 'blog';
    } else if (lowerText.includes('portfolio')) {
      businessType = 'portfolio';
    } else if (lowerText.includes('business') || lowerText.includes('company')) {
      businessType = 'business website';
    }

    const features: string[] = [];
    if (lowerText.includes('contact')) features.push('contact form');
    if (lowerText.includes('payment') || lowerText.includes('checkout')) features.push('payment integration');
    if (lowerText.includes('gallery') || lowerText.includes('photos')) features.push('image gallery');
    if (lowerText.includes('blog')) features.push('blog section');
    if (features.length === 0) features.push('homepage', 'about page');

    return {
      business_type: businessType,
      key_features: features,
      target_audience: 'general public',
      design_preferences: 'modern and clean',
      additional_notes: `Extracted from: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
    };
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // Don't retry on authentication or invalid request errors
      return (
        message.includes('authentication') ||
        message.includes('invalid') ||
        message.includes('unauthorized')
      );
    }
    return false;
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper to safely get string value
   */
  private getString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    return String(value);
  }

  /**
   * Helper to safely get array value
   */
  private getArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map(item => this.getString(item)).filter(s => s.length > 0);
    }
    return [];
  }
}
