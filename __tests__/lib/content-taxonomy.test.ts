import { describe, it, expect } from 'vitest';
import { getCategoryColor, getTravelStyleLabel, getCountryName } from '@/lib/content-taxonomy';

describe('Content Taxonomy Helpers', () => {
  describe('getCategoryColor', () => {
    it('returns the correct color for a valid category', () => {
      expect(getCategoryColor('destinations')).toBe('#1e40af');
      expect(getCategoryColor('guides')).toBe('#065f46');
    });

    it('returns the fallback color for an invalid category', () => {
      expect(getCategoryColor('invalid-category')).toBe('#666');
      expect(getCategoryColor('')).toBe('#666');
    });
  });

  describe('getTravelStyleLabel', () => {
    it('returns the correct label for a valid travel style', () => {
      expect(getTravelStyleLabel('slow-travel')).toBe('Slow Travel');
      expect(getTravelStyleLabel('adventure')).toBe('Aventure');
    });

    it('returns the fallback style string for an invalid travel style', () => {
      expect(getTravelStyleLabel('invalid-style')).toBe('invalid-style');
      expect(getTravelStyleLabel('')).toBe('');
    });
  });

  describe('getCountryName', () => {
    it('returns the correct name for a valid country code', () => {
      expect(getCountryName('FR')).toBe('France');
      expect(getCountryName('PT')).toBe('Portugal');
    });

    it('returns the fallback code string for an invalid country code', () => {
      expect(getCountryName('invalid-code')).toBe('invalid-code');
      expect(getCountryName('')).toBe('');
    });
  });
});
