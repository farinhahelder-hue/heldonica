import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isValidCmsPassword } from '../../lib/cms-auth';

describe('isValidCmsPassword', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('when CMS_PASSWORD is not set', () => {
    beforeEach(() => {
      vi.stubEnv('CMS_PASSWORD', '');
    });

    it('returns false for null', () => {
      expect(isValidCmsPassword(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidCmsPassword(undefined)).toBe(false);
    });

    it('returns false for any string', () => {
      expect(isValidCmsPassword('some-password')).toBe(false);
    });
  });

  describe('when CMS_PASSWORD is set', () => {
    beforeEach(() => {
      vi.stubEnv('CMS_PASSWORD', 'secret123');
    });

    it('returns true when candidate matches exactly', () => {
      expect(isValidCmsPassword('secret123')).toBe(true);
    });

    it('returns false when candidate does not match', () => {
      expect(isValidCmsPassword('wrong-password')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidCmsPassword(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidCmsPassword(undefined)).toBe(false);
    });

    it('returns false for partial match', () => {
      expect(isValidCmsPassword('secret')).toBe(false);
      expect(isValidCmsPassword('secret1234')).toBe(false);
    });
  });

  describe('when CMS_PASSWORD has whitespace', () => {
    beforeEach(() => {
      vi.stubEnv('CMS_PASSWORD', '  secret123  ');
    });

    it('returns true when candidate matches the trimmed password', () => {
      expect(isValidCmsPassword('secret123')).toBe(true);
    });

    it('returns false when candidate includes the whitespace', () => {
      expect(isValidCmsPassword('  secret123  ')).toBe(false);
    });
  });
});
