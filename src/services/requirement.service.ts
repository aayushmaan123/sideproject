/**
 * Requirement Service
 * Handles database operations for requirements with retry logic
 */

import { Requirement } from '../models/Requirement';
import { Logger } from '../utils/logger';
import { ExtractedRequirements } from '../types/extract';

export class RequirementService {
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  /**
   * Save requirement to database with retry logic
   */
  async saveRequirement(data: ExtractedRequirements): Promise<{
    requirement_id: string;
    version_number: number;
  }> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          Logger.info(`Database retry attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms`, {
            session_id: data.session_id,
          });
          await this.sleep(delay);
        }

        const result = await this.performSave(data);
        Logger.info('Requirement saved successfully', {
          session_id: data.session_id,
          requirement_id: result.requirement_id,
          version_number: result.version_number,
          attempt: attempt + 1,
        });
        return result;
      } catch (error) {
        lastError = error as Error;
        Logger.error(`Database save attempt ${attempt + 1} failed`, error);
      }
    }

    // All retries failed
    throw new Error(
      `Failed to save requirement after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Perform the actual database save
   */
  private async performSave(data: ExtractedRequirements): Promise<{
    requirement_id: string;
    version_number: number;
  }> {
    // Get the next version number for this session
    const latestVersion = await Requirement.findOne({
      where: { session_id: data.session_id },
      order: [['version_number', 'DESC']],
    });

    const nextVersion = latestVersion ? latestVersion.version_number + 1 : 1;

    // Create new requirement record
    const requirement = await Requirement.create({
      session_id: data.session_id,
      business_type: data.business_type,
      key_features: data.key_features,
      target_audience: data.target_audience,
      design_preferences: data.design_preferences,
      additional_notes: data.additional_notes,
      extracted_at: new Date(data.extracted_at),
      version_number: nextVersion,
    });

    return {
      requirement_id: requirement.id,
      version_number: requirement.version_number,
    };
  }

  /**
   * Get all requirements for a session
   */
  async getRequirementsBySession(
    sessionId: string,
    latestOnly = false
  ): Promise<Requirement[]> {
    try {
      if (latestOnly) {
        const latest = await Requirement.findOne({
          where: { session_id: sessionId },
          order: [['version_number', 'DESC']],
        });
        return latest ? [latest] : [];
      }

      return await Requirement.findAll({
        where: { session_id: sessionId },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      Logger.error('Failed to retrieve requirements', {
        session_id: sessionId,
        error,
      });
      throw error;
    }
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
