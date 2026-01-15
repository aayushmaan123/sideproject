/**
 * Sanitization utilities for user input
 * Handles trimming, space collapsing, and removing unsafe characters
 */

/**
 * Sanitize user text input according to Stage 4.1.1 requirements:
 * 1. Trim whitespace at the start and end
 * 2. Collapse multiple consecutive spaces into a single space
 * 3. Strip unsupported characters (HTML tags, script tags)
 * 4. Remove emojis and other special characters that may break parsing
 * 
 * @param text - The raw user input text
 * @returns Sanitized text ready for AI processing
 */
export function sanitizeText(text: string): string {
  // Step 1: Trim whitespace at the start and end
  let sanitized = text.trim();

  // Step 2: Strip HTML tags and script tags to prevent XSS
  // Remove <script> tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Step 3: Remove potentially dangerous characters
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Step 4: Remove emojis and special unicode characters
  // Remove emoji ranges (most common ranges)
  sanitized = sanitized.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
  sanitized = sanitized.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Misc Symbols and Pictographs
  sanitized = sanitized.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport and Map
  sanitized = sanitized.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Flags
  sanitized = sanitized.replace(/[\u{2600}-\u{26FF}]/gu, '');   // Misc symbols
  sanitized = sanitized.replace(/[\u{2700}-\u{27BF}]/gu, '');   // Dingbats

  // Step 5: Collapse multiple consecutive spaces (including tabs and newlines) into a single space
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Step 6: Final trim to remove any leading/trailing spaces from previous operations
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Convert text to lowercase for preprocessing (if needed by AI system)
 * This is optional and can be applied based on requirements
 * 
 * @param text - The text to normalize
 * @returns Lowercase version of the text
 */
export function normalizeCase(text: string): string {
  return text.toLowerCase();
}
