import { describe, it, expect } from 'vitest';
import { getReadingTime, formatReadingTime, getFormattedReadingTime } from '@/lib/readingTime';

describe('readingTime utility', () => {
  describe('getReadingTime', () => {
    it('should return 0 for null, undefined, or empty string', () => {
      expect(getReadingTime(null)).toBe(0);
      expect(getReadingTime(undefined)).toBe(0);
      expect(getReadingTime('')).toBe(0);
    });

    it('should return minimum 1 minute for short text', () => {
      expect(getReadingTime('Short text')).toBe(1);
    });

    it('should calculate reading time based on 200 words per minute', () => {
      // Create a string with 400 words
      const text = Array(400).fill('word').join(' ');
      expect(getReadingTime(text)).toBe(2);

      // Create a string with 201 words (should round up)
      const text2 = Array(201).fill('word').join(' ');
      expect(getReadingTime(text2)).toBe(2);
    });

    it('should ignore HTML tags when calculating words', () => {
      const htmlText = '<p>This is a <strong>short</strong> text with some <a href="#">HTML tags</a>.</p>';
      // "This is a short text with some HTML tags." -> 9 words -> 1 minute
      expect(getReadingTime(htmlText)).toBe(1);
    });
  });

  describe('formatReadingTime', () => {
    it('should return "Moins d\'une minute de lecture" for minutes < 1', () => {
      expect(formatReadingTime(0)).toBe("Moins d’une minute de lecture");
      expect(formatReadingTime(-1)).toBe("Moins d’une minute de lecture");
      expect(formatReadingTime(0.5)).toBe("Moins d’une minute de lecture");
    });

    it('should return "1 minute de lecture" for exactly 1 minute', () => {
      expect(formatReadingTime(1)).toBe("1 minute de lecture");
    });

    it('should return "X minutes de lecture" and ceil for minutes > 1', () => {
      expect(formatReadingTime(2)).toBe("2 minutes de lecture");
      expect(formatReadingTime(5)).toBe("5 minutes de lecture");
      expect(formatReadingTime(2.1)).toBe("3 minutes de lecture");
    });
  });

  describe('getFormattedReadingTime', () => {
    it('should return "Moins d\'une minute de lecture" for null or empty content', () => {
      expect(getFormattedReadingTime(null)).toBe("Moins d’une minute de lecture");
      expect(getFormattedReadingTime('')).toBe("Moins d’une minute de lecture");
    });

    it('should format minimum reading time for short text', () => {
      expect(getFormattedReadingTime('Short text')).toBe("1 minute de lecture");
    });

    it('should format longer text reading time correctly', () => {
      const text = Array(400).fill('word').join(' ');
      expect(getFormattedReadingTime(text)).toBe("2 minutes de lecture");
    });
  });
});
