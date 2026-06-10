import { describe, it, expect } from 'vitest';
import { getSonarUrl, getPerplexityUrl, CaptionRequest } from '../../lib/perplexity-caption';

describe('perplexity-caption', () => {
  describe('getSonarUrl', () => {
    it('should generate a URL with base prompt when request is empty', () => {
      const request: CaptionRequest = {};
      const url = getSonarUrl(request);

      expect(url).toContain('https://sonar.perplexity.ai?q=');
      expect(url).toContain(encodeURIComponent('Generate an engaging Instagram caption for a travel/photography post.'));
      expect(url).toContain(encodeURIComponent('1. A short caption'));
    });

    it('should include topic in the prompt when provided', () => {
      const request: CaptionRequest = { topic: 'a sunny beach' };
      const url = getSonarUrl(request);

      expect(url).toContain(encodeURIComponent('The photo is about: a sunny beach.'));
    });

    it('should include style in the prompt when provided', () => {
      const request: CaptionRequest = { style: 'humorous' };
      const url = getSonarUrl(request);

      expect(url).toContain(encodeURIComponent('Style: humorous.'));
    });

    it('should include both topic and style in the prompt', () => {
      const request: CaptionRequest = { topic: 'mountains', style: 'poetic' };
      const url = getSonarUrl(request);

      expect(url).toContain(encodeURIComponent('The photo is about: mountains.'));
      expect(url).toContain(encodeURIComponent('Style: poetic.'));
    });
  });

  describe('getPerplexityUrl', () => {
    it('should generate a URL with https://perplexity.ai', () => {
      const request: CaptionRequest = { topic: 'city' };
      const url = getPerplexityUrl(request);

      expect(url).toContain('https://perplexity.ai?q=');
      expect(url).toContain(encodeURIComponent('The photo is about: city.'));
    });
  });
});
