import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getBufferComposerUrl,
  getBufferPostUrl,
  openBufferComposer,
  isBufferConfigured
} from '../../lib/buffer';

describe('buffer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getBufferComposerUrl', () => {
    it('returns base url when no profileId is provided', () => {
      const url = getBufferComposerUrl();
      expect(url).toBe('https://buffer.com/app/compose');
    });

    it('returns url with profileId when provided', () => {
      const profileId = '12345';
      const url = getBufferComposerUrl(profileId);
      expect(url).toBe('https://buffer.com/app/compose?profile=12345');
    });
  });

  describe('getBufferPostUrl', () => {
    it('returns url with encoded text when no profileId is provided', () => {
      const text = 'Hello World & Friends!';
      const url = getBufferPostUrl(text);
      expect(url).toBe('https://buffer.com/app/compose?text=Hello%20World%20%26%20Friends!');
    });

    it('returns url with encoded text and profileId when provided', () => {
      const text = 'Hello World';
      const profileId = '67890';
      const url = getBufferPostUrl(text, profileId);
      expect(url).toBe('https://buffer.com/app/compose?text=Hello%20World&profile=67890');
    });
  });

  describe('openBufferComposer', () => {
    it('opens window with correct base url when no profileId is provided', () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('window', { open: mockOpen });

      openBufferComposer();

      expect(mockOpen).toHaveBeenCalledWith('https://buffer.com/app/compose', '_blank');
    });

    it('opens window with correct url when profileId is provided', () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('window', { open: mockOpen });

      const profileId = 'abcde';
      openBufferComposer(profileId);

      expect(mockOpen).toHaveBeenCalledWith('https://buffer.com/app/compose?profile=abcde', '_blank');
    });
  });

  describe('isBufferConfigured', () => {
    it('always returns true', () => {
      expect(isBufferConfigured()).toBe(true);
    });
  });
});
