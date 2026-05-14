import { describe, it, expect, vi, afterEach } from 'vitest';
import { getPerplexityUrl, getSonarUrl, openPerplexityForCaption } from '../../lib/perplexity-caption';

describe('perplexity-caption', () => {
  describe('getPerplexityUrl', () => {
    it('should generate URL with basic prompt for empty request', () => {
      const url = getPerplexityUrl({});
      expect(url).toContain('https://perplexity.ai?q=');

      const prompt = decodeURIComponent(url.split('?q=')[1]);
      expect(prompt).toContain('Generate an engaging Instagram caption for a travel/photography post.');
      expect(prompt).toContain('1. A short caption');
      expect(prompt).not.toContain('The photo is about:');
      expect(prompt).not.toContain('Style:');
    });

    it('should include topic when provided', () => {
      const url = getPerplexityUrl({ topic: 'Swiss Alps' });
      const prompt = decodeURIComponent(url.split('?q=')[1]);
      expect(prompt).toContain('The photo is about: Swiss Alps.');
    });

    it('should include style when provided', () => {
      const url = getPerplexityUrl({ style: 'humorous and brief' });
      const prompt = decodeURIComponent(url.split('?q=')[1]);
      expect(prompt).toContain('Style: humorous and brief.');
    });

    it('should include both topic and style when provided', () => {
      const url = getPerplexityUrl({ topic: 'Paris', style: 'romantic' });
      const prompt = decodeURIComponent(url.split('?q=')[1]);
      expect(prompt).toContain('The photo is about: Paris.');
      expect(prompt).toContain('Style: romantic.');
    });
  });

  describe('getSonarUrl', () => {
    it('should generate Sonar URL with prompt', () => {
      const url = getSonarUrl({ topic: 'Rome' });
      expect(url).toContain('https://perplexity.ai/sonar?=');

      const prompt = decodeURIComponent(url.split('sonar?=')[1]);
      expect(prompt).toContain('The photo is about: Rome.');
    });
  });

  describe('openPerplexityForCaption', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should open window with generated URL', () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);

      const request = { topic: 'test topic' };
      openPerplexityForCaption(request);

      expect(mockOpen).toHaveBeenCalledTimes(1);

      const calledUrl = mockOpen.mock.calls[0][0];
      const target = mockOpen.mock.calls[0][1];

      expect(calledUrl).toContain('https://perplexity.ai?q=');
      expect(decodeURIComponent(calledUrl)).toContain('test topic');
      expect(target).toBe('_blank');
    });

    it('should handle undefined request', () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);

      openPerplexityForCaption();

      expect(mockOpen).toHaveBeenCalledTimes(1);
      const calledUrl = mockOpen.mock.calls[0][0];
      expect(calledUrl).toContain('https://perplexity.ai?q=');
    });
  });
});
