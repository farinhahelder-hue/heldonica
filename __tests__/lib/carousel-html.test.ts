import { describe, it, expect } from 'vitest';
import { buildImageHtml } from '@/lib/carousel-html';

describe('carousel-html utilities', () => {
  describe('buildImageHtml', () => {
    it('should return empty string if url is empty', () => {
      expect(buildImageHtml('')).toBe('');
    });

    it('should return empty string if url is just whitespaces', () => {
      expect(buildImageHtml('   ')).toBe('');
    });

    it('should return empty string if url is null/undefined (typed as string but runtime safety)', () => {
      // @ts-expect-error testing runtime behavior
      expect(buildImageHtml(null)).toBe('');
      // @ts-expect-error testing runtime behavior
      expect(buildImageHtml(undefined)).toBe('');
    });

    it('should build correct HTML for a valid URL, trimming whitespaces', () => {
      const url = '  https://example.com/image.jpg  ';
      const expectedHtml = `<img src="https://example.com/image.jpg" alt="" loading="lazy" />`;
      expect(buildImageHtml(url)).toBe(expectedHtml);
    });

    it('should escape HTML characters in the URL to prevent XSS', () => {
      const url = 'https://example.com/image.jpg" onerror="alert(1)';
      const expectedHtml = `<img src="https://example.com/image.jpg&quot; onerror=&quot;alert(1)" alt="" loading="lazy" />`;
      expect(buildImageHtml(url)).toBe(expectedHtml);
    });
  });
});
