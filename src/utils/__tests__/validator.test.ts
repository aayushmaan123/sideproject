/**
 * Unit tests for validator utility
 */

import { validateSessionId, validateText } from '../validator';

describe('Validator', () => {
  describe('validateSessionId', () => {
    test('should accept valid UUID v4', () => {
      const result = validateSessionId('123e4567-e89b-12d3-a456-426614174000');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept valid UUID v1', () => {
      const result = validateSessionId('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject missing session_id (undefined)', () => {
      const result = validateSessionId(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('session_id is required');
    });

    test('should reject missing session_id (null)', () => {
      const result = validateSessionId(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('session_id is required');
    });

    test('should reject non-string session_id (number)', () => {
      const result = validateSessionId(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('session_id must be a string');
    });

    test('should reject non-string session_id (object)', () => {
      const result = validateSessionId({ id: '123' });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('session_id must be a string');
    });

    test('should reject empty string session_id', () => {
      const result = validateSessionId('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('session_id cannot be empty');
    });

    test('should reject invalid UUID format', () => {
      const result = validateSessionId('not-a-uuid');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('session_id must be a valid UUID format');
    });

    test('should reject malformed UUID', () => {
      const result = validateSessionId('123e4567-e89b-12d3-a456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('session_id must be a valid UUID format');
    });
  });

  describe('validateText', () => {
    test('should accept valid non-empty text', () => {
      const result = validateText('Hello, world!');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept text with only spaces (before trimming)', () => {
      const result = validateText('  text with spaces  ');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject missing text (undefined)', () => {
      const result = validateText(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('text is required');
    });

    test('should reject missing text (null)', () => {
      const result = validateText(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('text is required');
    });

    test('should reject non-string text (number)', () => {
      const result = validateText(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('text must be a string');
    });

    test('should reject non-string text (object)', () => {
      const result = validateText({ text: 'hello' });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('text must be a string');
    });

    test('should reject non-string text (array)', () => {
      const result = validateText(['hello', 'world']);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('text must be a string');
    });

    test('should reject empty string', () => {
      const result = validateText('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('text cannot be empty');
    });

    test('should reject whitespace-only string', () => {
      const result = validateText('   \t\n  ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('text cannot be empty');
    });
  });
});
