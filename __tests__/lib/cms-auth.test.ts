import { describe, it, expect, vi, afterEach } from 'vitest';
import { clearCmsSessionResponse, CMS_SESSION_COOKIE } from '@/lib/cms-auth';
import { NextResponse } from 'next/server';

// Mock next/server
vi.mock('next/server', () => {
  const setMock = vi.fn();
  return {
    NextResponse: {
      json: vi.fn().mockImplementation((body, init) => ({
        body,
        status: init?.status,
        cookies: {
          set: setMock,
        },
      })),
    },
  };
});

describe('clearCmsSessionResponse', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('should create a response with default status and body, and clear the session cookie', () => {
    const response = clearCmsSessionResponse();

    // Check if NextResponse.json was called with default arguments
    expect(NextResponse.json).toHaveBeenCalledWith({ ok: true }, { status: 200 });

    // @ts-expect-error Mocked response type
    expect(response.cookies.set).toHaveBeenCalledWith({
      name: CMS_SESSION_COOKIE,
      value: '',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
  });

  it('should create a response with custom status and body', () => {
    const customBody = { message: 'custom' };
    const response = clearCmsSessionResponse(400, customBody);

    expect(NextResponse.json).toHaveBeenCalledWith(customBody, { status: 400 });

    // @ts-expect-error Mocked response type
    expect(response.cookies.set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: CMS_SESSION_COOKIE,
        value: '',
        maxAge: 0,
      })
    );
  });

  it('should set secure to true when NODE_ENV is production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const response = clearCmsSessionResponse();

    // @ts-expect-error Mocked response type
    expect(response.cookies.set).toHaveBeenCalledWith(
      expect.objectContaining({
        secure: true,
      })
    );
  });
});
