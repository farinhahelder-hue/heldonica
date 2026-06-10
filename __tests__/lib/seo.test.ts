import { describe, it, expect } from 'vitest';
import { parseHreflang } from '@/lib/seo';

describe('parseHreflang', () => {
  it('should return empty object for empty string', () => {
    expect(parseHreflang('')).toEqual({});
  });

  it('should parse a single valid part', () => {
    expect(parseHreflang('https://example.com/en|en')).toEqual({
      en: 'https://example.com/en'
    });
  });

  it('should parse multiple valid parts separated by newline', () => {
    expect(parseHreflang('https://example.com/en|en\nhttps://example.com/fr|fr')).toEqual({
      en: 'https://example.com/en',
      fr: 'https://example.com/fr'
    });
  });

  it('should trim whitespace around url and lang', () => {
    expect(parseHreflang(' https://example.com/en | en ')).toEqual({
      en: 'https://example.com/en'
    });
  });

  it('should handle parts with missing lang or url', () => {
    expect(parseHreflang('https://example.com|')).toEqual({});
    expect(parseHreflang('|en')).toEqual({});
  });

  it('should handle parts that do not contain a pipe', () => {
    expect(parseHreflang('invalidpart')).toEqual({});
  });

  it('should ignore empty lines', () => {
    expect(parseHreflang('https://example.com/en|en\n\nhttps://example.com/fr|fr')).toEqual({
      en: 'https://example.com/en',
      fr: 'https://example.com/fr'
    });
  });
});
