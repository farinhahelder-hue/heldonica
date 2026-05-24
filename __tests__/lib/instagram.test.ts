import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { publishMediaContainer } from '../../lib/instagram';

describe('publishMediaContainer', () => {
  beforeEach(() => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', 'test-token');
    vi.stubEnv('INSTAGRAM_BUSINESS_ACCOUNT_ID', 'test-account-id');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return null if env vars are missing', async () => {
    vi.unstubAllEnvs();
    const result = await publishMediaContainer('test-container-id');
    expect(result).toBeNull();
  });

  it('should return null and log error if first fetch returns API error', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({ error: { message: 'Some API error' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await publishMediaContainer('test-container-id');

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Instagram publish error:', { message: 'Some API error' });
  });

  it('should return null and log error if fetch throws an exception', async () => {
    const mockError = new Error('Network failure');
    const mockFetch = vi.fn().mockRejectedValue(mockError);
    vi.stubGlobal('fetch', mockFetch);

    const result = await publishMediaContainer('test-container-id');

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Failed to publish to Instagram:', mockError);
  });

  it('should return an InstagramPost object on success', async () => {
    const mockFetch = vi.fn()
      // First fetch to publish container
      .mockResolvedValueOnce({
        json: async () => ({ id: 'published-post-id' }),
      })
      // Second fetch to get post details
      .mockResolvedValueOnce({
        json: async () => ({
          caption: 'Test caption',
          media_url: 'https://example.com/image.jpg',
          permalink: 'https://instagram.com/p/123',
          timestamp: '2023-01-01T00:00:00Z',
        }),
      });
    vi.stubGlobal('fetch', mockFetch);

    const result = await publishMediaContainer('test-container-id');

    expect(result).toEqual({
      id: 'published-post-id',
      caption: 'Test caption',
      mediaType: 'IMAGE',
      mediaUrl: 'https://example.com/image.jpg',
      permalink: 'https://instagram.com/p/123',
      timestamp: '2023-01-01T00:00:00Z',
    });
  });
});
