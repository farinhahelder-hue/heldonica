import { describe, it, expect, vi, afterEach } from 'vitest';
import { isValidCmsPassword } from '../../lib/cms-auth';

/**
 * isValidCmsPassword est asynchrone : elle compare en temps constant via
 * crypto.subtle. Les assertions omettaient `await` et comparaient donc une
 * promesse a un booleen — les onze echouaient, sur le chemin qui garde le CMS.
 *
 * Le piege reste ouvert : ecrit avec toBeTruthy(), le meme oubli aurait rendu
 * les tests verts en permanence, une promesse etant toujours vraie.
 */
describe('isValidCmsPassword', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true when candidate matches CMS_PASSWORD exactly', async () => {
    vi.stubEnv('CMS_PASSWORD', 'supersecret');
    expect(await isValidCmsPassword('supersecret')).toBe(true);
  });

  it('returns false when candidate is incorrect', async () => {
    vi.stubEnv('CMS_PASSWORD', 'supersecret');
    expect(await isValidCmsPassword('wrongpassword')).toBe(false);
  });

  it('returns false when candidate is an empty string', async () => {
    vi.stubEnv('CMS_PASSWORD', 'supersecret');
    expect(await isValidCmsPassword('')).toBe(false);
  });

  it('returns false when candidate is null or undefined', async () => {
    vi.stubEnv('CMS_PASSWORD', 'supersecret');
    expect(await isValidCmsPassword(null)).toBe(false);
    expect(await isValidCmsPassword(undefined)).toBe(false);
  });

  it('returns false when CMS_PASSWORD environment variable is not set', async () => {
    // Ensuring it is not set
    vi.stubEnv('CMS_PASSWORD', '');
    expect(await isValidCmsPassword('supersecret')).toBe(false);

    // Completely remove the variable
    delete process.env.CMS_PASSWORD;
    expect(await isValidCmsPassword('supersecret')).toBe(false);
  });

  it('handles configured password with whitespace', async () => {
    // getConfiguredPassword uses .trim()
    vi.stubEnv('CMS_PASSWORD', '  supersecret  ');

    // So candidate must match the trimmed version
    expect(await isValidCmsPassword('supersecret')).toBe(true);

    // And candidate with same whitespace shouldn’t match (because candidate isn’t trimmed in the check)
    // Actually safeEqual checks lengths. '  supersecret  ' length is 15, 'supersecret' is 11.
    // If the candidate isn’t trimmed, safeEqual will compare '  supersecret  ' to 'supersecret'
    expect(await isValidCmsPassword('  supersecret  ')).toBe(false);
  });

  it('handles passwords of different lengths correctly without leaking length via early return', async () => {
    vi.stubEnv('CMS_PASSWORD', 'supersecret');
    // safeEqual securely compares lengths without returning early to prevent timing attacks
    expect(await isValidCmsPassword('super')).toBe(false);
    expect(await isValidCmsPassword('supersecretlonger')).toBe(false);
  });
});
