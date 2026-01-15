/**
 * Type definitions for AI requirement extraction
 */

export interface ExtractRequest {
  session_id: string;
  text: string;
  original_text?: string;
}

export interface ExtractedRequirements {
  session_id: string;
  business_type: string;
  key_features: string[];
  target_audience: string;
  design_preferences: string;
  additional_notes: string;
  extracted_at: string;
}

export interface AIServiceResponse {
  business_type?: string;
  key_features?: string[];
  target_audience?: string;
  design_preferences?: string;
  additional_notes?: string;
}
