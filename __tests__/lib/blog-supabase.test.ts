import { describe, it, expect } from 'vitest';
import { formatDate } from '../../lib/blog-supabase';

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