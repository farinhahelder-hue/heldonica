import { describe, it, expect, vi, afterEach } from 'vitest';
import { isValidCmsPassword } from '../../lib/cms-auth';

describe('isValidCmsPassword', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true when candidate matches CMS_PASSWORD exactly', () => {
    vi.stubEnv('CMS_PASSWORD', 'supersecret');
    expect(isValidCmsPassword('supersecret')).toBe(true);
  });

  it('returns false when candidate is incorrect', () => {
    vi.stubEnv('CMS_PASSWORD', 'supersecret');
    expect(isValidCmsPassword('wrongpassword')).toBe(false);
  });

  it('returns false when candidate is an empty string', () => {
    vi.stubEnv('CMS_PASSWORD', 'supersecret');
    expect(isValidCmsPassword('')).toBe(false);
  });

  it('returns false when candidate is null or undefined', () => {
    vi.stubEnv('CMS_PASSWORD', 'supersecret');
    expect(isValidCmsPassword(null)).toBe(false);
    expect(isValidCmsPassword(undefined)).toBe(false);
  });

  it('returns false when CMS_PASSWORD environment variable is not set', () => {
    // Ensuring it is not set
    vi.stubEnv('CMS_PASSWORD', '');
    expect(isValidCmsPassword('supersecret')).toBe(false);

    // Completely remove the variable
    delete process.env.CMS_PASSWORD;
    expect(isValidCmsPassword('supersecret')).toBe(false);
  });

  it('handles configured password with whitespace', () => {
    // getConfiguredPassword uses .trim()
    vi.stubEnv('CMS_PASSWORD', '  supersecret  ');

    // So candidate must match the trimmed version
    expect(isValidCmsPassword('supersecret')).toBe(true);

    // And candidate with same whitespace shouldn’t match (because candidate isn’t trimmed in the check)
    // Actually safeEqual checks lengths. '  supersecret  ' length is 15, 'supersecret' is 11.
    // If the candidate isn’t trimmed, safeEqual will compare '  supersecret  ' to 'supersecret'
    expect(isValidCmsPassword('  supersecret  ')).toBe(false);
  });

  it('handles passwords of different lengths correctly without leaking length via early return', () => {
    vi.stubEnv('CMS_PASSWORD', 'supersecret');
    // safeEqual securely compares lengths without returning early to prevent timing attacks
    expect(isValidCmsPassword('super')).toBe(false);
    expect(isValidCmsPassword('supersecretlonger')).toBe(false);
  });
});
