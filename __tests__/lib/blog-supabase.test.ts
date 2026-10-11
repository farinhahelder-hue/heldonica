import { describe, it, expect } from 'vitest';
import { formatDate, getExcerpt, BlogPost } from '../../lib/blog-supabase';

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

    // Une date UTC de fin de journée bascule au lendemain à Paris. Ces deux cas
    // l'attendaient en UTC : ils passaient en CI, qui y tourne, et échouaient
    // sur une machine française. C'est bien le basculement qu'on vérifie ici.
    it('bascule au 1er janvier suivant pour un 31 décembre à 23h59 UTC', () => {
      const result = formatDate('2099-12-31T23:59:59Z');
      expect(result).toBe('1 janvier 2100');
    });

    it('should handle first day of year', () => {
      const result = formatDate('2024-01-01T00:00:00Z');
      expect(result).toContain('2024');
    });

    it('bascule aussi pour le dernier jour de 2024', () => {
      const result = formatDate('2024-12-31T23:59:59Z');
      expect(result).toBe('1 janvier 2025');
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

  describe('error handling', () => {
    it('should return empty string for invalid date format', () => {
      expect(formatDate('invalid-date')).toBe('');
    });
  });
});

const mockPost = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: 1,
  slug: 'test-post',
  title: 'Test Post',
  excerpt: null,
  content: null,
  category: 'Travel',
  tags: [],
  featured_image: null,
  author: 'Author',
  published: true,
  published_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('getExcerpt', () => {
  it('should return existing excerpt if present', () => {
    const post = mockPost({ excerpt: 'This is a custom excerpt.' });
    expect(getExcerpt(post)).toBe('This is a custom excerpt.');
  });

  it('should trim existing excerpt', () => {
    const post = mockPost({ excerpt: '  This is a custom excerpt with spaces.  ' });
    expect(getExcerpt(post)).toBe('This is a custom excerpt with spaces.');
  });

  it('should generate excerpt from content if excerpt is null', () => {
    const post = mockPost({ excerpt: null, content: 'This is the post content.' });
    expect(getExcerpt(post)).toBe('This is the post content.');
  });

  it('should generate excerpt from content if excerpt is empty', () => {
    const post = mockPost({ excerpt: '', content: 'This is the post content.' });
    expect(getExcerpt(post)).toBe('This is the post content.');
  });

  it('should generate excerpt from content if excerpt is only whitespace', () => {
    const post = mockPost({ excerpt: '   ', content: 'This is the post content.' });
    expect(getExcerpt(post)).toBe('This is the post content.');
  });

  it('should strip HTML tags from content', () => {
    const post = mockPost({ content: '<p>This is <strong>bold</strong> and <a href="#">linked</a> content.</p>' });
    expect(getExcerpt(post)).toBe('This is bold and linked content.');
  });

  it('should limit excerpt to default maxLength (160) and add ellipsis', () => {
    const longContent = 'A'.repeat(200);
    const post = mockPost({ content: longContent });
    const excerpt = getExcerpt(post);
    expect(excerpt.length).toBe(160 + 1); // 160 chars + 1 ellipsis char
    expect(excerpt.endsWith('\u2026')).toBe(true);
  });

  it('should limit excerpt to custom maxLength and add ellipsis', () => {
    const longContent = 'A'.repeat(100);
    const post = mockPost({ content: longContent });
    const excerpt = getExcerpt(post, 50);
    expect(excerpt.length).toBe(50 + 1);
    expect(excerpt.endsWith('\u2026')).toBe(true);
  });

  it('should not cut words in half when truncating', () => {
    const post = mockPost({ content: 'This is a long sentence that should be cut off without splitting a word in half.' });
    const excerpt = getExcerpt(post, 50);
    expect(excerpt).toBe('This is a long sentence that should be cut off\u2026');
  });

  it('should return empty string if both excerpt and content are null', () => {
    const post = mockPost({ excerpt: null, content: null });
    expect(getExcerpt(post)).toBe('');
  });

  it('should return empty string if both excerpt and content are empty', () => {
    const post = mockPost({ excerpt: '', content: '' });
    expect(getExcerpt(post)).toBe('');
  });
});
