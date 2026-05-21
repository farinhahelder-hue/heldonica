import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../../lib/sanitize-html';

describe('sanitizeHtml', () => {
  describe('null/undefined handling', () => {
    it('should return empty string for null input', () => {
      expect(sanitizeHtml(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(sanitizeHtml(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });
  });

  describe('HTML sanitization', () => {
    it('should sanitize HTML and remove script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('<script>');
      expect(result).toContain('<p>Hello</p>');
    });

    it('should sanitize HTML and remove style tags', () => {
      const html = '<p>Test</p><style>.evil{display:none}</style>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('<style>');
      expect(result).toContain('<p>Test</p>');
    });

    it('should sanitize HTML and remove iframe tags', () => {
      const html = '<p>Test</p><iframe src="evil.com"></iframe>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('<iframe>');
      expect(result).toContain('<p>Test</p>');
    });

    it('should sanitize HTML and remove object tags', () => {
      const html = '<p>Test</p><object data="evil.swf"></object>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('<object>');
      expect(result).toContain('<p>Test</p>');
    });

    it('should sanitize HTML and remove embed tags', () => {
      const html = '<p>Test</p><embed src="evil.swf">';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('<embed>');
      expect(result).toContain('<p>Test</p>');
    });
  });

  describe('valid HTML preservation', () => {
    it('should preserve basic HTML tags', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<p>');
      expect(result).toContain('</p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('</strong>');
    });

    it('should preserve links', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<a href=');
    });

    it('should preserve images', () => {
      const html = '<img src="image.jpg" alt="Test">';
      const result = sanitizeHtml(html);
      expect(result).toContain('<img');
    });

    it('should preserve lists', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item 1</li>');
    });

    it('should preserve headings', () => {
      const html = '<h1>Title</h1><h2>Subtitle</h2>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<h2>Subtitle</h2>');
    });
  });

  describe('special characters', () => {
    it('should handle HTML with special characters', () => {
      const html = '<p>&quot;Quote&quot; &amp; &lt;less than&gt;</p>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<p>');
    });

    it('should handle HTML with non-Latin characters', () => {
      const html = '<p>日本語</p>';
      const result = sanitizeHtml(html);
      expect(result).toContain('日本語');
    });
  });
});