import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// First, mock next/server since it's imported by cms-auth
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => {
      return {
        body,
        status: init?.status || 200,
        cookies: {
          set: vi.fn(),
        }
      };
    }),
  },
}));

import { getCmsAuthStatus, CMS_SESSION_COOKIE } from '../../lib/cms-auth';

describe('CMS Auth - parseSessionPayload error handling', () => {
  const secret = 'test-secret';

  beforeEach(() => {
    process.env.CMS_PASSWORD = 'test-password';
    process.env.CMS_SESSION_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.CMS_PASSWORD;
    delete process.env.CMS_SESSION_SECRET;
  });

  function hexEncode(buffer: ArrayBuffer) {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function createSignedToken(payloadStr: string) {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // We encode using basic base64url encoding without special JSON escaping
    const b64 = btoa(payloadStr)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    const signature = hexEncode(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(b64)));
    return `${b64}.${signature}`;
  }

  it('should catch JSON parse error and return unauthorized when payload is invalid JSON', async () => {
    // Valid base64, correct signature, but the payload inside is not valid JSON
    // This triggers the JSON.parse error inside parseSessionPayload's try-catch block
    const token = await createSignedToken('not a json object {');

    // Create a Request object simulating the Next.js req
    const req = new Request('http://localhost/', {
      headers: new Headers({
        'cookie': `${CMS_SESSION_COOKIE}=${token}`
      })
    });

    const status = await getCmsAuthStatus(req);
    expect(status).toBe('unauthorized');
  });

  it('should catch decodeURI / atob errors when payload is malformed base64', async () => {
    // Malformed base64 that causes error in base64UrlDecode during JSON.parse
    // We'll create a token where the payload part has an invalid base64 character (!)
    // and then manually sign it so it passes the signature check first.
    // This triggers the decodeURIComponent/escape/atob error inside parseSessionPayload's try-catch block
    const badEncodedPayload = 'invalid-base64!';

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = hexEncode(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(badEncodedPayload)));
    const token = `${badEncodedPayload}.${signature}`;

    const req = new Request('http://localhost/', {
      headers: new Headers({
        'cookie': `${CMS_SESSION_COOKIE}=${token}`
      })
    });

    const status = await getCmsAuthStatus(req);
    expect(status).toBe('unauthorized');
  });
});
