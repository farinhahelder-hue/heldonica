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

describe('getExcerpt', () => {
  const basePost = {
    id: 1,
    slug: 'test',
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
  } as BlogPost;

  it('should return excerpt if it is provided and not empty', () => {
    const post = { ...basePost, excerpt: 'Explicit excerpt.', content: 'Some longer content.' };
    expect(getExcerpt(post)).toBe('Explicit excerpt.');
  });

  it('should return trimmed excerpt if it has surrounding whitespace', () => {
    const post = { ...basePost, excerpt: '  Explicit excerpt.  ', content: 'Content.' };
    expect(getExcerpt(post)).toBe('Explicit excerpt.');
  });

  it('should fall back to content if excerpt is null', () => {
    const post = { ...basePost, excerpt: null, content: 'Fallback content.' };
    expect(getExcerpt(post)).toBe('Fallback content.');
  });

  it('should fall back to content if excerpt is empty string', () => {
    const post = { ...basePost, excerpt: '', content: 'Fallback content.' };
    expect(getExcerpt(post)).toBe('Fallback content.');
  });

  it('should fall back to content if excerpt is only whitespace', () => {
    const post = { ...basePost, excerpt: '   ', content: 'Fallback content.' };
    expect(getExcerpt(post)).toBe('Fallback content.');
  });

  it('should strip HTML tags from content', () => {
    const post = { ...basePost, excerpt: null, content: '<p>Content with <strong>HTML</strong> tags.</p>' };
    expect(getExcerpt(post)).toBe('Content with HTML tags.');
  });

  it('should handle missing content', () => {
    const post = { ...basePost, excerpt: null, content: null };
    expect(getExcerpt(post)).toBe('');
  });

  it('should truncate content longer than maxLength at a word boundary', () => {
    const content = 'This is a very long piece of content that exceeds the maximum length of the excerpt. It should be truncated nicely at a word boundary without cutting a word in half.';
    const post = { ...basePost, excerpt: null, content };
    const excerpt = getExcerpt(post, 50);

    expect(excerpt.length).toBeLessThanOrEqual(51); // 50 + ellipsis
    expect(excerpt).toBe('This is a very long piece of content that exceeds\u2026');
  });

  it('should return full content if it is exactly maxLength', () => {
    const post = { ...basePost, excerpt: null, content: 'Exactly 20 chars str' };
    expect(getExcerpt(post, 20)).toBe('Exactly 20 chars str');
  });

  it('should return full content if it is shorter than maxLength', () => {
    const post = { ...basePost, excerpt: null, content: 'Short content.' };
    expect(getExcerpt(post, 50)).toBe('Short content.');
  });

  it('should handle edge cases where truncation would split a word', () => {
    const post = { ...basePost, excerpt: null, content: 'One two three four' };
    const excerpt = getExcerpt(post, 11); // 'One two thr' -> should truncate back to 'One two'
    expect(excerpt).toBe('One two\u2026');
  });
});
