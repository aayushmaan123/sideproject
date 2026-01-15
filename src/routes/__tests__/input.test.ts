/**
 * Integration tests for the API endpoint
 */

import request from 'supertest';
import app from '../../index';

describe('POST /api/input', () => {
  const validSessionId = '123e4567-e89b-12d3-a456-426614174000';

  describe('Valid inputs', () => {
    test('should accept valid input and return sanitized text', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: 'I want to build a website',
        })
        .expect(200);

      expect(response.body).toHaveProperty('session_id', validSessionId);
      expect(response.body).toHaveProperty('text', 'I want to build a website');
      expect(response.body).toHaveProperty('original_text', 'I want to build a website');
    });

    test('should sanitize text with extra whitespace', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: '  hello    world  ',
        })
        .expect(200);

      expect(response.body.text).toBe('hello world');
      expect(response.body.original_text).toBe('  hello    world  ');
    });

    test('should sanitize text with HTML tags', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: '<p>Hello</p> world',
        })
        .expect(200);

      expect(response.body.text).toBe('Hello world');
    });

    test('should accept different valid UUID formats', async () => {
      const uuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: uuid,
          text: 'test',
        })
        .expect(200);

      expect(response.body.session_id).toBe(uuid);
    });
  });

  describe('Missing session_id', () => {
    test('should reject request without session_id', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          text: 'some text',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('session_id is required');
    });

    test('should reject request with null session_id', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: null,
          text: 'some text',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('session_id is required');
    });

    test('should reject request with empty session_id', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: '',
          text: 'some text',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('session_id');
    });
  });

  describe('Invalid session_id format', () => {
    test('should reject non-UUID session_id', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: 'not-a-uuid',
          text: 'some text',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('valid UUID format');
    });

    test('should reject numeric session_id', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: 123456,
          text: 'some text',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('session_id must be a string');
    });

    test('should reject malformed UUID', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: '123e4567-e89b-12d3',
          text: 'some text',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('valid UUID format');
    });
  });

  describe('Empty text', () => {
    test('should reject request without text field', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('text is required');
    });

    test('should reject request with null text', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: null,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('text is required');
    });

    test('should reject request with empty string text', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: '',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('text cannot be empty');
    });

    test('should reject request with whitespace-only text', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: '   \t\n   ',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('text cannot be empty');
    });

    test('should reject non-string text (number)', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: 12345,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('text must be a string');
    });
  });

  describe('Malicious input sanitization', () => {
    test('should sanitize script tag attack', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: "<script>alert('x')</script>",
        })
        .expect(200); // Script tag passes validation but gets sanitized to empty

      expect(response.body.text).toBe('');
      expect(response.body.original_text).toBe("<script>alert('x')</script>");
    });

    test('should sanitize script tag with content', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: '<script>alert("xss")</script>Hello',
        })
        .expect(200);

      expect(response.body.text).toBe('Hello');
      expect(response.body.text).not.toContain('script');
      expect(response.body.text).not.toContain('alert');
    });

    test('should sanitize HTML injection', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: '<img src=x onerror="alert(1)">Hello',
        })
        .expect(200);

      expect(response.body.text).toBe('Hello');
      expect(response.body.text).not.toContain('<');
      expect(response.body.text).not.toContain('>');
    });

    test('should handle complex malicious payload', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: '<div><script>bad()</script>Good text</div>',
        })
        .expect(200);

      expect(response.body.text).toBe('Good text');
    });

    test('should sanitize nested HTML', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: '<div><p><strong>Clean</strong> text</p></div>',
        })
        .expect(200);

      expect(response.body.text).toBe('Clean text');
    });
  });

  describe('Edge cases', () => {
    test('should handle very long text', async () => {
      const longText = 'a'.repeat(10000);
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: longText,
        })
        .expect(200);

      expect(response.body.text).toBe(longText);
    });

    test('should handle special characters', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: 'Price: $19.99! Discount: 20%',
        })
        .expect(200);

      expect(response.body.text).toBe('Price: $19.99! Discount: 20%');
    });

    test('should handle mixed valid content', async () => {
      const response = await request(app)
        .post('/api/input')
        .send({
          session_id: validSessionId,
          text: '  I want   a <b>professional</b>   website  ',
        })
        .expect(200);

      expect(response.body.text).toBe('I want a professional website');
    });
  });
});

describe('GET /health', () => {
  test('should return healthy status', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('service');
  });
});

describe('404 handler', () => {
  test('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown').expect(404);

    expect(response.body).toHaveProperty('error', 'Not Found');
  });
});
