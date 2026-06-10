import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPerplexityUrl, getSonarUrl, openPerplexityForCaption } from '@/lib/perplexity-caption';

describe('perplexity-caption', () => {
  describe('getPerplexityUrl', () => {
    it('should generate URL without topic and style', () => {
      const url = getPerplexityUrl({});
      const expectedPrompt = `Generate an engaging Instagram caption for a travel/photography post.\n\nPlease provide:\n1. A short caption (under 2200 characters)\n2. 5-10 relevant hashtags\n3. A call-to-action`;
      expect(url).toBe(`https://perplexity.ai?q=${encodeURIComponent(expectedPrompt)}`);
    });

    it('should generate URL with topic', () => {
      const url = getPerplexityUrl({ topic: 'Paris' });
      const expectedPrompt = `Generate an engaging Instagram caption for a travel/photography post. The photo is about: Paris.\n\nPlease provide:\n1. A short caption (under 2200 characters)\n2. 5-10 relevant hashtags\n3. A call-to-action`;
      expect(url).toBe(`https://perplexity.ai?q=${encodeURIComponent(expectedPrompt)}`);
    });

    it('should generate URL with style', () => {
      const url = getPerplexityUrl({ style: 'funny' });
      const expectedPrompt = `Generate an engaging Instagram caption for a travel/photography post. Style: funny.\n\nPlease provide:\n1. A short caption (under 2200 characters)\n2. 5-10 relevant hashtags\n3. A call-to-action`;
      expect(url).toBe(`https://perplexity.ai?q=${encodeURIComponent(expectedPrompt)}`);
    });

    it('should generate URL with topic and style', () => {
      const url = getPerplexityUrl({ topic: 'Paris', style: 'funny' });
      const expectedPrompt = `Generate an engaging Instagram caption for a travel/photography post. The photo is about: Paris. Style: funny.\n\nPlease provide:\n1. A short caption (under 2200 characters)\n2. 5-10 relevant hashtags\n3. A call-to-action`;
      expect(url).toBe(`https://perplexity.ai?q=${encodeURIComponent(expectedPrompt)}`);
    });
  });

  describe('getSonarUrl', () => {
    it('should generate Sonar URL', () => {
      const url = getSonarUrl({ topic: 'Paris', style: 'funny' });
      const expectedPrompt = `Generate an engaging Instagram caption for a travel/photography post. The photo is about: Paris. Style: funny.\n\nPlease provide:\n1. A short caption (under 2200 characters)\n2. 5-10 relevant hashtags\n3. A call-to-action`;
      expect(url).toBe(`https://perplexity.ai/sonar?=${encodeURIComponent(expectedPrompt)}`);
    });
  });

  describe('openPerplexityForCaption', () => {
    let originalWindow: any;

    beforeEach(() => {
      // Mock window.open
      originalWindow = global.window;
      // @ts-ignore
      global.window = { open: vi.fn() };
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('should open correct URL when request is provided', () => {
      openPerplexityForCaption({ topic: 'London' });

      const expectedPrompt = `Generate an engaging Instagram caption for a travel/photography post. The photo is about: London.\n\nPlease provide:\n1. A short caption (under 2200 characters)\n2. 5-10 relevant hashtags\n3. A call-to-action`;
      const expectedUrl = `https://perplexity.ai?q=${encodeURIComponent(expectedPrompt)}`;

      expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank');
    });

    it('should handle undefined request', () => {
      openPerplexityForCaption();

      const expectedPrompt = `Generate an engaging Instagram caption for a travel/photography post.\n\nPlease provide:\n1. A short caption (under 2200 characters)\n2. 5-10 relevant hashtags\n3. A call-to-action`;
      const expectedUrl = `https://perplexity.ai?q=${encodeURIComponent(expectedPrompt)}`;

      expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank');
    });
  });
});
