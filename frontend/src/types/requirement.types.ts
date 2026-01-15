// CRITICAL: These types MUST match backend schemas exactly
export interface WebsiteRequirements {
  session_id: string;
  business_type: string;
  key_features: string[];
  target_audience: string;
  design_preferences: string;
  additional_notes: string;
  extracted_at: string;
}
