import { useState, useCallback } from 'react';
import type { WebsiteRequirements } from '../types/requirement.types';
import type { ApiError } from '../types/api.types';
import { requirementApi } from '../api/requirementApi';

/**
 * Hook to manage website requirements
 */
export function useRequirements(sessionId: string) {
  const [requirements, setRequirements] = useState<WebsiteRequirements | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Extract requirements from conversation
   */
  const extractRequirements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await requirementApi.extractRequirements(sessionId);

      if (response.error) {
        setError(response.error);
        setIsLoading(false);
        return;
      }

      if (response.data) {
        setRequirements(response.data.requirements);
      }
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'Failed to extract requirements',
        details: err,
      };
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  /**
   * Fetch existing requirements
   */
  const fetchRequirements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await requirementApi.getRequirements(sessionId);

      if (response.error) {
        setError(response.error);
        setIsLoading(false);
        return;
      }

      if (response.data) {
        setRequirements(response.data.requirements);
      }
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'Failed to fetch requirements',
        details: err,
      };
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  /**
   * Clear requirements
   */
  const clearRequirements = useCallback(() => {
    setRequirements(null);
    setError(null);
  }, []);

  return {
    requirements,
    isLoading,
    error,
    extractRequirements,
    fetchRequirements,
    clearRequirements,
  };
}
