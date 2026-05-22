import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getBufferComposerUrl,
  getBufferPostUrl,
  openBufferComposer,
  isBufferConfigured
} from '../../lib/buffer';

describe('buffer', () => {
  describe('getBufferComposerUrl', () => {
    it('should return base URL without profileId', () => {
      expect(getBufferComposerUrl()).toBe('https://buffer.com/app/compose');
    });

    it('should return URL with profile parameter when profileId is provided', () => {
      expect(getBufferComposerUrl('12345')).toBe('https://buffer.com/app/compose?profile=12345');
    });
  });

  describe('getBufferPostUrl', () => {
    it('should return URL with encoded text when no profileId is provided', () => {
      expect(getBufferPostUrl('Hello World')).toBe('https://buffer.com/app/compose?text=Hello%20World');
    });

    it('should return URL with encoded text and profile parameter when profileId is provided', () => {
      expect(getBufferPostUrl('Hello World', '12345')).toBe('https://buffer.com/app/compose?text=Hello%20World&profile=12345');
    });

    it('should properly encode special characters in text', () => {
      const textWithSpecialChars = 'Check this out! 🚀 #awesome & cool';
      const encodedText = encodeURIComponent(textWithSpecialChars);
      expect(getBufferPostUrl(textWithSpecialChars)).toBe(`https://buffer.com/app/compose?text=${encodedText}`);
    });
  });

  describe('openBufferComposer', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should open window with base URL when no profileId is provided', () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);

      openBufferComposer();

      expect(mockOpen).toHaveBeenCalledWith('https://buffer.com/app/compose', '_blank');
    });

    it('should open window with profile parameter when profileId is provided', () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);

      openBufferComposer('12345');

      expect(mockOpen).toHaveBeenCalledWith('https://buffer.com/app/compose?profile=12345', '_blank');
    });
  });

  describe('isBufferConfigured', () => {
    it('should return true', () => {
      expect(isBufferConfigured()).toBe(true);
    });
  });
});