import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getPerplexityUrl,
  getSonarUrl,
  openPerplexityForCaption,
  CaptionRequest,
} from '../../lib/perplexity-caption';

describe('perplexity-caption', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('getPerplexityUrl', () => {
    it('should generate a default prompt URL when request is empty', () => {
      const url = getPerplexityUrl({});
      expect(url).toContain('https://perplexity.ai?q=');

      const params = new URLSearchParams(url.split('?')[1]);
      const prompt = params.get('q');
      expect(prompt).toContain('Generate an engaging Instagram caption for a travel/photography post.');
      expect(prompt).not.toContain('The photo is about:');
      expect(prompt).not.toContain('Style:');
    });

    it('should include topic in the prompt when provided', () => {
      const url = getPerplexityUrl({ topic: 'Swiss Alps' });
      const params = new URLSearchParams(url.split('?')[1]);
      const prompt = params.get('q');
      expect(prompt).toContain('The photo is about: Swiss Alps.');
    });

    it('should include style in the prompt when provided', () => {
      const url = getPerplexityUrl({ style: 'humorous' });
      const params = new URLSearchParams(url.split('?')[1]);
      const prompt = params.get('q');
      expect(prompt).toContain('Style: humorous.');
    });

    it('should include both topic and style in the prompt when provided', () => {
      const url = getPerplexityUrl({ topic: 'Paris', style: 'romantic' });
      const params = new URLSearchParams(url.split('?')[1]);
      const prompt = params.get('q');
      expect(prompt).toContain('The photo is about: Paris.');
      expect(prompt).toContain('Style: romantic.');
    });
  });

  describe('getSonarUrl', () => {
    it('should generate a default prompt URL starting with sonar?=', () => {
      const url = getSonarUrl({});
      expect(url).toContain('https://perplexity.ai/sonar?=');

      const query = url.split('?=')[1];
      const prompt = decodeURIComponent(query);
      expect(prompt).toContain('Generate an engaging Instagram caption for a travel/photography post.');
    });

    it('should include topic and style in the prompt when provided', () => {
      const url = getSonarUrl({ topic: 'London', style: 'professional' });
      const query = url.split('?=')[1];
      const prompt = decodeURIComponent(query);
      expect(prompt).toContain('The photo is about: London.');
      expect(prompt).toContain('Style: professional.');
    });
  });

  describe('openPerplexityForCaption', () => {
    it('should call window.open with the correct URL when no request is provided', () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('window', { open: mockOpen });

      openPerplexityForCaption();

      expect(mockOpen).toHaveBeenCalledTimes(1);
      const calledUrl = mockOpen.mock.calls[0][0];
      expect(calledUrl).toContain('https://perplexity.ai?q=');
      expect(mockOpen).toHaveBeenCalledWith(calledUrl, '_blank');
    });

    it('should call window.open with the correct URL when request is provided', () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('window', { open: mockOpen });

      const request: CaptionRequest = { topic: 'Mountains', style: 'adventurous' };
      openPerplexityForCaption(request);

      expect(mockOpen).toHaveBeenCalledTimes(1);
      const calledUrl = mockOpen.mock.calls[0][0];
      expect(calledUrl).toContain('https://perplexity.ai?q=');
      const params = new URLSearchParams(calledUrl.split('?')[1]);
      const prompt = params.get('q');
      expect(prompt).toContain('The photo is about: Mountains.');
      expect(prompt).toContain('Style: adventurous.');
      expect(mockOpen).toHaveBeenCalledWith(calledUrl, '_blank');
    });
  });
});
