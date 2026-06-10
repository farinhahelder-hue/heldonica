import { describe, it, expect } from 'vitest';
import { getReadingTime, formatReadingTime, getFormattedReadingTime } from '../../lib/readingTime';

describe('readingTime utility', () => {
  describe('getReadingTime', () => {
    it('should return 0 for null, undefined, or empty content', () => {
      expect(getReadingTime(null)).toBe(0);
      expect(getReadingTime(undefined)).toBe(0);
      expect(getReadingTime('')).toBe(0);
    });

    it('should return 1 minute for short content (< 200 words)', () => {
      expect(getReadingTime('Hello world')).toBe(1);

      // Generate exactly 100 words
      const hundredWords = Array(100).fill('word').join(' ');
      expect(getReadingTime(hundredWords)).toBe(1);
    });

    it('should calculate correct minutes for longer content (>= 200 words)', () => {
      // 200 words exactly should be 1 minute
      const twoHundredWords = Array(200).fill('word').join(' ');
      expect(getReadingTime(twoHundredWords)).toBe(1);

      // 201 words should round up to 2 minutes
      const twoHundredOneWords = Array(201).fill('word').join(' ');
      expect(getReadingTime(twoHundredOneWords)).toBe(2);

      // 450 words should round up to 3 minutes
      const fourHundredFiftyWords = Array(450).fill('word').join(' ');
      expect(getReadingTime(fourHundredFiftyWords)).toBe(3);
    });

    it('should strip HTML tags before counting words', () => {
      const htmlContent = '<p>Hello <strong>world</strong></p> <br/> <div>Just a test</div>';
      // plainText = ' Hello  world    Just a test ' -> 5 words
      expect(getReadingTime(htmlContent)).toBe(1);
    });

    it('should handle multiple spaces and line breaks correctly', () => {
      const spacingContent = 'Word1   \n\n Word2 \t Word3 \r\n Word4';
      // 4 words
      expect(getReadingTime(spacingContent)).toBe(1);
    });
  });

  describe('formatReadingTime', () => {
    it('should return empty string for 0 or negative minutes', () => {
      expect(formatReadingTime(0)).toBe('');
      expect(formatReadingTime(-1)).toBe('');
    });

    it('should format 1 minute without plural', () => {
      expect(formatReadingTime(1)).toBe('1 min de lecture');
    });

    it('should format > 1 minute with plural', () => {
      expect(formatReadingTime(2)).toBe('2 mins de lecture');
      expect(formatReadingTime(10)).toBe('10 mins de lecture');
    });
  });

  describe('getFormattedReadingTime', () => {
    it('should calculate and format correctly for valid text', () => {
      const text = Array(250).fill('word').join(' ');
      expect(getFormattedReadingTime(text)).toBe('2 mins de lecture');
    });

    it('should return empty string for empty content', () => {
      expect(getFormattedReadingTime(null)).toBe('');
      expect(getFormattedReadingTime(undefined)).toBe('');
      expect(getFormattedReadingTime('')).toBe('');
    });
  });
});
