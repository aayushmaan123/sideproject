import { ENV } from '../config/env';
import type { ApiError, ApiResponse } from '../types/api.types';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  timeout: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  timeout: 30000,  // 30 seconds
};

/**
 * Generic API client with error handling, retry logic, and timeout
 */
class ApiClient {
  private baseURL: string;
  private retryConfig: RetryConfig;

  constructor(baseURL: string, retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.baseURL = baseURL;
    this.retryConfig = retryConfig;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw err;
    }
  }

  /**
   * Make a fetch request with error handling, retry logic, and timeout
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await this.fetchWithTimeout(
        url,
        defaultOptions,
        this.retryConfig.timeout
      );
      
      if (!response.ok) {
        // Retry on server errors (5xx) or rate limiting (429)
        if ((response.status >= 500 || response.status === 429) && 
            retryCount < this.retryConfig.maxRetries) {
          const delay = this.retryConfig.baseDelay * Math.pow(2, retryCount);
          console.warn(`Request failed (${response.status}), retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
          await this.sleep(delay);
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          details: errorData,
        };
        return { error };
      }

      const data = await response.json();
      return { data };
    } catch (err) {
      // Retry on network errors
      if (retryCount < this.retryConfig.maxRetries) {
        const delay = this.retryConfig.baseDelay * Math.pow(2, retryCount);
        console.warn(`Network error, retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
        await this.sleep(delay);
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      const error: ApiError = {
        message: err instanceof Error ? err.message : 'Network error occurred',
        details: err,
      };
      return { error };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

export const apiClient = new ApiClient(ENV.API_BASE_URL);
