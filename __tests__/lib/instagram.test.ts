import { describe, it, expect, vi, afterEach } from 'vitest';
import { isInstagramConfigured } from '@/lib/instagram';

describe('instagram', () => {
  describe('isInstagramConfigured', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return true when both variables are set', () => {
      vi.stubEnv('IG_ACCESS_TOKEN', 'token123');
      vi.stubEnv('IG_ACCOUNT_ID', 'account123');

      expect(isInstagramConfigured()).toBe(true);
    });

    it('should return false when only token is set', () => {
      vi.stubEnv('IG_ACCESS_TOKEN', 'token123');
      vi.stubEnv('IG_ACCOUNT_ID', '');

      expect(isInstagramConfigured()).toBe(false);
    });

    it('should return false when only business account id is set', () => {
      vi.stubEnv('IG_ACCESS_TOKEN', '');
      vi.stubEnv('IG_ACCOUNT_ID', 'account123');

      expect(isInstagramConfigured()).toBe(false);
    });

    it('should return false when neither is set', () => {
      vi.stubEnv('IG_ACCESS_TOKEN', '');
      vi.stubEnv('IG_ACCOUNT_ID', '');

      expect(isInstagramConfigured()).toBe(false);
    });
  });
});
