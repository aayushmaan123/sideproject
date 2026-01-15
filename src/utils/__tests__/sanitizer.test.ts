/**
 * Unit tests for sanitizer utility
 */

import { sanitizeText, normalizeCase } from '../sanitizer';

describe('Sanitizer', () => {
  describe('sanitizeText', () => {
    test('should trim whitespace at start and end', () => {
      const result = sanitizeText('  hello world  ');
      expect(result).toBe('hello world');
    });

    test('should collapse multiple consecutive spaces', () => {
      const result = sanitizeText('hello    world');
      expect(result).toBe('hello world');
    });

    test('should collapse tabs and newlines into single spaces', () => {
      const result = sanitizeText('hello\t\t\nworld');
      expect(result).toBe('hello world');
    });

    test('should remove script tags with content', () => {
      const result = sanitizeText('<script>alert("xss")</script>hello');
      expect(result).toBe('hello');
    });

    test('should remove script tags with attributes', () => {
      const result = sanitizeText('<script type="text/javascript">alert("xss")</script>hello');
      expect(result).toBe('hello');
    });

    test('should remove HTML tags', () => {
      const result = sanitizeText('<div>hello</div>');
      expect(result).toBe('hello');
    });

    test('should remove multiple HTML tags', () => {
      const result = sanitizeText('<p><strong>hello</strong> <em>world</em></p>');
      expect(result).toBe('hello world');
    });

    test('should handle malicious input with script tag', () => {
      const result = sanitizeText("<script>alert('x')</script>");
      expect(result).toBe('');
    });

    test('should remove script tags mixed with text', () => {
      const result = sanitizeText('before<script>bad code</script>after');
      expect(result).toBe('beforeafter');
    });

    test('should handle complex malicious input', () => {
      const result = sanitizeText('<img src=x onerror="alert(1)">');
      expect(result).toBe('');
    });

    test('should remove null bytes', () => {
      const result = sanitizeText('hello\x00world');
      expect(result).toBe('helloworld');
    });

    test('should remove control characters', () => {
      const result = sanitizeText('hello\x01\x02world');
      expect(result).toBe('helloworld');
    });

    test('should handle empty string', () => {
      const result = sanitizeText('');
      expect(result).toBe('');
    });

    test('should handle whitespace-only string', () => {
      const result = sanitizeText('   \t\n   ');
      expect(result).toBe('');
    });

    test('should preserve normal text unchanged', () => {
      const result = sanitizeText('This is normal text.');
      expect(result).toBe('This is normal text.');
    });

    test('should handle text with numbers and punctuation', () => {
      const result = sanitizeText('Price: $19.99! Order now.');
      expect(result).toBe('Price: $19.99! Order now.');
    });

    test('should combine all sanitization rules', () => {
      const result = sanitizeText('  <script>bad</script>  hello   world  <div>test</div>  ');
      expect(result).toBe('hello world test');
    });

    test('should handle mixed content with scripts and HTML', () => {
      const input = '  <p>Hello</p>   <script>alert("xss")</script>   world   ';
      const result = sanitizeText(input);
      expect(result).toBe('Hello world');
    });

    test('should handle script tag with whitespace variations and remove angle brackets', () => {
      // Test edge case: malformed script tags with unusual whitespace
      // The multi-pass approach removes tags and then all remaining angle brackets
      const result = sanitizeText('<script\t\n bar>alert(1)</script\t\n bar>Hello');
      // Should remove all angle brackets making it safe
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      // The word "alert" may remain but without script context it's harmless
      expect(result).toContain('Hello');
    });

    test('should handle malformed and nested script tags', () => {
      const result = sanitizeText('<<script>alert(1)</script>script>alert(2)<</script>/script>Hello');
      // Multiple passes should remove all tags and angle brackets
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).toContain('Hello');
    });
  });

  describe('normalizeCase', () => {
    test('should convert text to lowercase', () => {
      const result = normalizeCase('HELLO WORLD');
      expect(result).toBe('hello world');
    });

    test('should handle mixed case', () => {
      const result = normalizeCase('HeLLo WoRLd');
      expect(result).toBe('hello world');
    });

    test('should preserve already lowercase text', () => {
      const result = normalizeCase('hello world');
      expect(result).toBe('hello world');
    });
  });
});
