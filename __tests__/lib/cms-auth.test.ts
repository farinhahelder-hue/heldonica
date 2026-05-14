import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCmsAuthStatus, CMS_SESSION_COOKIE } from '../../lib/cms-auth';

describe('cms-auth parseSessionPayload exception testing', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = {
      ...originalEnv,
      CMS_SESSION_SECRET: 'test-secret',
      CMS_PASSWORD: 'test-password',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('catches exception in parseSessionPayload', async () => {
    // To trigger the catch block in parseSessionPayload, we need verifyPayload to return true,
    // but JSON.parse(base64UrlDecode(encodedPayload)) to throw an error.

    // verifyPayload calls hexDecode(signature), crypto.subtle.importKey, and crypto.subtle.verify.
    // If we mock crypto.subtle.verify to always return true, and pass a valid hex signature.

    const mockVerify = vi.fn().mockResolvedValue(true);
    Object.defineProperty(globalThis, 'crypto', {
        value: {
            subtle: {
                importKey: vi.fn().mockResolvedValue({}),
                verify: mockVerify,
            }
        },
        writable: true
    });

    const mockRequest = {
      headers: new Headers({
        cookie: `${CMS_SESSION_COOKIE}=invalid-base64.00`, // encodedPayload = invalid-base64, signature = 00
      }),
    } as unknown as Request;

    const status = await getCmsAuthStatus(mockRequest);
    expect(status).toBe('unauthorized');
    expect(mockVerify).toHaveBeenCalled();
  });
});
