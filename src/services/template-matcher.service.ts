/**
 * Template Matcher Service
 * 
 * Matches website requirements to templates based on business type, features, and design preferences
 */

import { Template } from '../models/Template';
import { Requirement } from '../models/Requirement';
import { Logger } from '../utils/logger';

/**
 * Match reason interface
 */
export interface MatchReason {
  category: 'business_type' | 'feature' | 'design_tag';
  matched: string;
  score: number;
}

/**
 * Template match result interface
 */
export interface TemplateMatch {
  template_id: string;
  name: string;
  score: number;
  match_reasons: MatchReason[];
  preview_image_url: string;
  description: string;
}

/**
 * Template Matcher Service
 */
export class TemplateMatcherService {
  // Scoring weights
  private static readonly BUSINESS_TYPE_SCORE = 3;
  private static readonly FEATURE_SCORE = 2;
  private static readonly DESIGN_TAG_SCORE = 1;

  /**
   * Get the latest requirement for a session
   */
  private static async getLatestRequirement(sessionId: string): Promise<Requirement | null> {
    try {
      const requirements = await Requirement.findAll({
        where: { session_id: sessionId },
        order: [['version_number', 'DESC']],
        limit: 1,
      });

      return requirements.length > 0 ? requirements[0] : null;
    } catch (error) {
      Logger.error('Failed to fetch latest requirement', error);
      throw error;
    }
  }

  /**
   * Calculate match score for a template against requirements
   */
  private static calculateScore(
    template: Template,
    requirement: Requirement
  ): { score: number; reasons: MatchReason[] } {
    const reasons: MatchReason[] = [];
    let totalScore = 0;

    // Normalize requirement data to lowercase for comparison
    const reqBusinessType = requirement.business_type.toLowerCase().trim();
    const reqFeatures = requirement.key_features.map((f) => f.toLowerCase().trim());
    const reqDesignPrefs = requirement.design_preferences.toLowerCase().trim().split(/[\s,]+/);

    // Score business type matches
    if (template.business_types.some((type) => reqBusinessType.includes(type) || type.includes(reqBusinessType))) {
      const matchedType = template.business_types.find(
        (type) => reqBusinessType.includes(type) || type.includes(reqBusinessType)
      );
      if (matchedType) {
        totalScore += this.BUSINESS_TYPE_SCORE;
        reasons.push({
          category: 'business_type',
          matched: matchedType,
          score: this.BUSINESS_TYPE_SCORE,
        });
      }
    }

    // Score feature matches
    template.supported_features.forEach((feature) => {
      if (reqFeatures.some((reqFeature) => reqFeature.includes(feature) || feature.includes(reqFeature))) {
        totalScore += this.FEATURE_SCORE;
        reasons.push({
          category: 'feature',
          matched: feature,
          score: this.FEATURE_SCORE,
        });
      }
    });

    // Score design tag matches
    template.design_tags.forEach((tag) => {
      if (reqDesignPrefs.some((pref) => pref.includes(tag) || tag.includes(pref))) {
        totalScore += this.DESIGN_TAG_SCORE;
        reasons.push({
          category: 'design_tag',
          matched: tag,
          score: this.DESIGN_TAG_SCORE,
        });
      }
    });

    return { score: totalScore, reasons };
  }

  /**
   * Match templates to requirements and return ranked results
   */
  public static async matchTemplates(sessionId: string): Promise<TemplateMatch[]> {
    try {
      Logger.info('Starting template matching', { sessionId });

      // Get latest requirement
      const requirement = await this.getLatestRequirement(sessionId);
      
      if (!requirement) {
        throw new Error('No requirements found for this session');
      }

      // Get all templates
      const templates = await Template.findAll();

      if (templates.length === 0) {
        throw new Error('No templates available');
      }

      // Calculate scores for each template
      const matches: TemplateMatch[] = templates.map((template) => {
        const { score, reasons } = this.calculateScore(template, requirement);
        
        return {
          template_id: template.id,
          name: template.name,
          score,
          match_reasons: reasons,
          preview_image_url: template.preview_image_url,
          description: template.description,
        };
      });

      // Sort by score (highest first)
      matches.sort((a, b) => b.score - a.score);

      Logger.info('Template matching completed', {
        sessionId,
        totalTemplates: templates.length,
        topScore: matches[0]?.score || 0,
      });

      return matches;
    } catch (error) {
      Logger.error('Failed to match templates', error);
      throw error;
    }
  }

  /**
   * Get top N template matches
   */
  public static async getTopMatches(sessionId: string, limit = 3): Promise<TemplateMatch[]> {
    const matches = await this.matchTemplates(sessionId);
    return matches.slice(0, limit);
  }
}
