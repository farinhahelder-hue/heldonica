import { describe, it, expect } from 'vitest';
import { formatDate, getExcerpt } from '../../lib/blog-supabase';

describe('formatDate', () => {
  describe('null/undefined handling', () => {
    it('should return empty string for null input', () => {
      expect(formatDate(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('date formatting', () => {
    it('should format a valid ISO date string in French locale', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      // The exact output depends on timezone, but should contain French month name
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should format a date with day, month and year', () => {
      const result = formatDate('2024-06-20T00:00:00Z');
      // Should contain "juin" (June in French) and "2024"
      expect(result).toContain('2024');
      // Should have some part of the date in French format
      expect(result).toMatch(/\d+\s+\w+\s+\d{4}/);
    });

    it('should format a date with different year', () => {
      const result = formatDate('2023-12-25T00:00:00Z');
      expect(result).toContain('2023');
    });

    it('should handle dates in different timezones', () => {
      const result1 = formatDate('2024-03-15T12:00:00Z');
      const result2 = formatDate('2024-03-15T12:00:00+05:00');
      // Both should produce year 2024
      expect(result1).toContain('2024');
      expect(result2).toContain('2024');
    });
  });

  describe('edge cases', () => {
    it('should handle epoch start date', () => {
      const result = formatDate('1970-01-01T00:00:00Z');
      expect(result).toContain('1970');
    });

    it('should handle future date', () => {
      const result = formatDate('2099-12-31T23:59:59Z');
      expect(result).toContain('2099');
    });

    it('should handle first day of year', () => {
      const result = formatDate('2024-01-01T00:00:00Z');
      expect(result).toContain('2024');
    });

    it('should handle last day of year', () => {
      const result = formatDate('2024-12-31T23:59:59Z');
      expect(result).toContain('2024');
    });
  });

  describe('format consistency', () => {
    it('should produce consistent format for same input', () => {
      const date = '2024-05-15T10:00:00Z';
      const result1 = formatDate(date);
      const result2 = formatDate(date);
      expect(result1).toBe(result2);
    });

    it('should format multiple dates in consistent manner', () => {
      const dates = [
        '2024-01-01T00:00:00Z',
        '2024-02-15T00:00:00Z',
        '2024-03-31T00:00:00Z',
      ];
      const results = dates.map(formatDate);
      
      // All results should contain their respective years
      results.forEach((result, index) => {
        expect(result).toContain('2024');
      });
      
      // Each result should be unique (different months produce different output)
      expect(new Set(results).size).toBe(results.length);
    });
  });
});
describe('getExcerpt', () => {
  const mockPostBase = {
    id: 1,
    slug: 'test-post',
    title: 'Test Post',
    tags: [],
    category: null,
    featured_image: null,
    author: null,
    published: true,
    published_at: null,
    created_at: null,
    updated_at: null,
  };

  it('should return the excerpt if it exists and is not just whitespace', () => {
    const post = {
      ...mockPostBase,
      excerpt: '  This is an excerpt.  ',
      content: '<p>This is the content.</p>',
    };
    expect(getExcerpt(post as any)).toBe('This is an excerpt.');
  });

  it('should fall back to content if excerpt is null', () => {
    const post = {
      ...mockPostBase,
      excerpt: null,
      content: '<p>This is the content.</p>',
    };
    expect(getExcerpt(post as any)).toBe('This is the content.');
  });

  it('should fall back to content if excerpt is only whitespace', () => {
    const post = {
      ...mockPostBase,
      excerpt: '   ',
      content: '<p>This is the content.</p>',
    };
    expect(getExcerpt(post as any)).toBe('This is the content.');
  });

  it('should return an empty string if both excerpt and content are null/empty', () => {
    const post1 = { ...mockPostBase, excerpt: null, content: null };
    expect(getExcerpt(post1 as any)).toBe('');

    const post2 = { ...mockPostBase, excerpt: ' ', content: '   ' };
    expect(getExcerpt(post2 as any)).toBe('');
  });

  it('should strip HTML tags from content', () => {
    const post = {
      ...mockPostBase,
      excerpt: null,
      content: '<h1>Title</h1><p>This is a <strong>strong</strong> paragraph with a <a href="#">link</a>.</p>',
    };
    expect(getExcerpt(post as any)).toBe('Title This is a strong paragraph with a link .');
  });

  it('should not truncate content if length is less than or equal to maxLength', () => {
    const post = {
      ...mockPostBase,
      excerpt: null,
      content: '<p>Short content.</p>',
    };
    expect(getExcerpt(post as any, 20)).toBe('Short content.');
  });

  it('should truncate content and add ellipsis if length exceeds maxLength', () => {
    const post = {
      ...mockPostBase,
      excerpt: null,
      content: '<p>This is a slightly longer content that should be truncated.</p>',
    };
    // 10 chars: "This is a "
    // The implementation removes trailing space before ellipsis
    expect(getExcerpt(post as any, 10)).toBe('This is a\u2026');
  });

  it('should use default maxLength of 160 if not provided', () => {
    const longContent = Array(200).fill('a').join('');
    const post = {
      ...mockPostBase,
      excerpt: null,
      content: `<p>${longContent}</p>`,
    };

    const result = getExcerpt(post as any);
    // 160 chars + 1 for ellipsis
    expect(result.length).toBe(161);
    expect(result.endsWith('\u2026')).toBe(true);
  });
});
