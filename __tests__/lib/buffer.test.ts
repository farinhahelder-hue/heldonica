import { describe, it, expect } from 'vitest';
import { getBufferComposerUrl, getBufferPostUrl } from '../../lib/buffer';

describe('Buffer Integration', () => {
  describe('getBufferComposerUrl', () => {
    it('should generate base URL when no profileId is provided', () => {
      const url = getBufferComposerUrl();
      expect(url).toBe('https://buffer.com/app/compose');
    });

    it('should append profileId when provided', () => {
      const url = getBufferComposerUrl('12345');
      expect(url).toBe('https://buffer.com/app/compose?profile=12345');
    });
  });

  describe('getBufferPostUrl', () => {
    it('should generate URL with text only', () => {
      const text = 'Hello world!';
      const url = getBufferPostUrl(text);
      expect(url).toBe('https://buffer.com/app/compose?text=Hello%20world!');
    });

    it('should generate URL with text and profileId', () => {
      const text = 'Hello world!';
      const profileId = '12345';
      const url = getBufferPostUrl(text, profileId);
      expect(url).toBe('https://buffer.com/app/compose?text=Hello%20world!&profile=12345');
    });

    it('should correctly URL-encode the text', () => {
      const text = 'Check out this amazing post: https://example.com/?foo=bar&baz=qux #awesome';
      const url = getBufferPostUrl(text);
      expect(url).toBe('https://buffer.com/app/compose?text=Check%20out%20this%20amazing%20post%3A%20https%3A%2F%2Fexample.com%2F%3Ffoo%3Dbar%26baz%3Dqux%20%23awesome');
    });
  });
});
