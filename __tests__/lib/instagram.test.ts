import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isInstagramConfigured,
  createMediaContainer,
  publishMediaContainer,
  postToInstagram,
  getInstagramProfile,
  getRecentMedia,
} from '../../lib/instagram';

describe('Instagram Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('isInstagramConfigured', () => {
    it('returns true when both tokens are present', () => {
      process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token';
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID = 'test-id';
      expect(isInstagramConfigured()).toBe(true);
    });

    it('returns false when access token is missing', () => {
      delete process.env.INSTAGRAM_ACCESS_TOKEN;
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID = 'test-id';
      expect(isInstagramConfigured()).toBe(false);
    });

    it('returns false when business account id is missing', () => {
      process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token';
      delete process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
      expect(isInstagramConfigured()).toBe(false);
    });

    it('returns false when both are missing', () => {
      delete process.env.INSTAGRAM_ACCESS_TOKEN;
      delete process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
      expect(isInstagramConfigured()).toBe(false);
    });
  });

  describe('createMediaContainer', () => {
    const imageUrl = 'https://example.com/image.jpg';
    const caption = 'Test caption';

    beforeEach(() => {
      process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token';
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID = 'test-id';
    });

    it('returns null and warns when configuration is missing', async () => {
      delete process.env.INSTAGRAM_ACCESS_TOKEN;
      const result = await createMediaContainer(imageUrl, caption);
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('Instagram not configured');
    });

    it('returns media container id on successful creation', async () => {
      const mockResponse = { id: 'container-123' };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse))
      );

      const result = await createMediaContainer(imageUrl, caption);

      expect(fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/test-id/media',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            image_url: imageUrl,
            caption: caption,
            access_token: 'test-token',
          }),
        })
      );
      expect(result).toEqual({ id: 'container-123', status: 'OK' });
    });

    it('returns null and errors when API returns an error', async () => {
      const mockResponse = { error: { message: 'Invalid token' } };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse))
      );

      const result = await createMediaContainer(imageUrl, caption);

      expect(console.error).toHaveBeenCalledWith('Instagram API error:', mockResponse.error);
      expect(result).toBeNull();
    });

    it('returns null and errors when fetch throws an exception', async () => {
      const error = new Error('Network error');
      vi.mocked(fetch).mockRejectedValueOnce(error);

      const result = await createMediaContainer(imageUrl, caption);

      expect(console.error).toHaveBeenCalledWith('Failed to create Instagram media container:', error);
      expect(result).toBeNull();
    });
  });

  describe('publishMediaContainer', () => {
    const containerId = 'container-123';

    beforeEach(() => {
      process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token';
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID = 'test-id';
    });

    it('returns null when configuration is missing', async () => {
      delete process.env.INSTAGRAM_ACCESS_TOKEN;
      const result = await publishMediaContainer(containerId);
      expect(result).toBeNull();
    });

    it('returns post data on successful publish', async () => {
      const mockPublishResponse = { id: 'post-123' };
      const mockPostDetailsResponse = {
        caption: 'Published caption',
        media_url: 'https://example.com/published.jpg',
        permalink: 'https://instagram.com/p/123',
        timestamp: '2023-01-01T00:00:00Z',
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce(new Response(JSON.stringify(mockPublishResponse)))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockPostDetailsResponse)));

      const result = await publishMediaContainer(containerId);

      expect(fetch).toHaveBeenNthCalledWith(
        1,
        'https://graph.facebook.com/test-id/media_publish',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            creation_id: containerId,
            access_token: 'test-token',
          }),
        })
      );

      expect(fetch).toHaveBeenNthCalledWith(
        2,
        'https://graph.facebook.com/post-123',
        expect.objectContaining({
          headers: { access_token: 'test-token' },
        })
      );

      expect(result).toEqual({
        id: 'post-123',
        caption: 'Published caption',
        mediaType: 'IMAGE',
        mediaUrl: 'https://example.com/published.jpg',
        permalink: 'https://instagram.com/p/123',
        timestamp: '2023-01-01T00:00:00Z',
      });
    });

    it('returns null and errors when publish API returns an error', async () => {
      const mockResponse = { error: { message: 'Publish failed' } };
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse))
      );

      const result = await publishMediaContainer(containerId);

      expect(console.error).toHaveBeenCalledWith('Instagram publish error:', mockResponse.error);
      expect(result).toBeNull();
    });

    it('returns null and errors when fetch throws an exception', async () => {
      const error = new Error('Network error');
      vi.mocked(fetch).mockRejectedValueOnce(error);

      const result = await publishMediaContainer(containerId);

      expect(console.error).toHaveBeenCalledWith('Failed to publish to Instagram:', error);
      expect(result).toBeNull();
    });
  });

  describe('postToInstagram', () => {
    const imageUrl = 'https://example.com/image.jpg';
    const caption = 'Test caption';

    beforeEach(() => {
      process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token';
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID = 'test-id';
    });

    it('successfully creates and publishes media', async () => {
      // Mock createMediaContainer response
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'container-123' }))
      );

      // Mock publishMediaContainer first response (publish)
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'post-123' }))
      );

      // Mock publishMediaContainer second response (get details)
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({
          caption: 'Test caption',
          media_url: imageUrl,
          permalink: 'https://instagram.com/p/123',
          timestamp: '2023-01-01T00:00:00Z',
        }))
      );

      const result = await postToInstagram(imageUrl, caption);

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        id: 'post-123',
        caption: 'Test caption',
        mediaType: 'IMAGE',
        mediaUrl: imageUrl,
        permalink: 'https://instagram.com/p/123',
        timestamp: '2023-01-01T00:00:00Z',
      });
    });

    it('returns null and logs error if creation fails', async () => {
      // Mock createMediaContainer failing
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await postToInstagram(imageUrl, caption);

      expect(console.error).toHaveBeenCalledWith('Failed to create Instagram media container:', expect.any(Error));
      expect(console.error).toHaveBeenCalledWith('Failed to create media container');
      expect(result).toBeNull();
    });
  });

  describe('getInstagramProfile', () => {
    beforeEach(() => {
      process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token';
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID = 'test-id';
    });

    it('returns null when configuration is missing', async () => {
      delete process.env.INSTAGRAM_ACCESS_TOKEN;
      const result = await getInstagramProfile();
      expect(result).toBeNull();
    });

    it('returns profile data on successful fetch', async () => {
      const mockProfile = {
        id: '12345',
        username: 'test_user',
        account_type: 'BUSINESS',
        media_count: 100,
      };

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockProfile))
      );

      const result = await getInstagramProfile();

      expect(fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/me?fields=id,username,account_type,media_count&access_token=test-token'
      );
      expect(result).toEqual(mockProfile);
    });

    it('returns null and errors when fetch fails', async () => {
      const error = new Error('Network error');
      vi.mocked(fetch).mockRejectedValueOnce(error);

      const result = await getInstagramProfile();

      expect(console.error).toHaveBeenCalledWith('Failed to get Instagram profile:', error);
      expect(result).toBeNull();
    });
  });

  describe('getRecentMedia', () => {
    beforeEach(() => {
      process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token';
    });

    it('returns null when access token is missing', async () => {
      delete process.env.INSTAGRAM_ACCESS_TOKEN;
      const result = await getRecentMedia();
      expect(result).toBeNull();
    });

    it('returns media data on successful fetch', async () => {
      const mockMediaData = {
        data: [
          { id: '1', caption: 'Post 1' },
          { id: '2', caption: 'Post 2' },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockMediaData))
      );

      const result = await getRecentMedia(5);

      expect(fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=test-token&limit=5'
      );
      expect(result).toEqual(mockMediaData.data);
    });

    it('returns null and errors when fetch fails', async () => {
      const error = new Error('Network error');
      vi.mocked(fetch).mockRejectedValueOnce(error);

      const result = await getRecentMedia();

      expect(console.error).toHaveBeenCalledWith('Failed to get Instagram media:', error);
      expect(result).toBeNull();
    });
  });
});
