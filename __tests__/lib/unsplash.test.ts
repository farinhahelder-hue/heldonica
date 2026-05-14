import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  searchUnsplash,
  getRandomPhoto,
  getInstagramUrl,
  getCredit,
  UNSPLASH_CONFIG,
  UnsplashPhoto
} from '../../lib/unsplash';

describe('Unsplash API Tests', () => {
  const mockPhoto: UnsplashPhoto = {
    id: 'test-id',
    urls: {
      raw: 'raw-url',
      full: 'full-url',
      regular: 'regular-url',
      small: 'small-url',
      thumb: 'thumb-url',
    },
    alt_description: 'Test alt',
    description: 'Test description',
    user: {
      name: 'John Doe',
      username: 'johndoe',
    },
    likes: 10,
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('searchUnsplash', () => {
    it('should fetch photos with correct configuration', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [mockPhoto] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const query = 'nature';
      const perPage = 5;
      const results = await searchUnsplash(query, perPage);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_CONFIG.accessKey}`,
          },
        }
      );
      expect(results).toEqual([mockPhoto]);
    });

    it('should return empty array on API error', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
      });
      vi.stubGlobal('fetch', mockFetch);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const results = await searchUnsplash('nature');

      expect(results).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return empty array when fetch throws an error', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const results = await searchUnsplash('nature');

      expect(results).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unsplash search error:', expect.any(Error));
    });
  });

  describe('getRandomPhoto', () => {
    it('should return the first photo from search results', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [mockPhoto] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await getRandomPhoto('nature');

      expect(result).toEqual(mockPhoto);
    });

    it('should return null if no photos found', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await getRandomPhoto('nature');

      expect(result).toBeNull();
    });
  });

  describe('getInstagramUrl', () => {
    it('should return the regular url', () => {
      const url = getInstagramUrl(mockPhoto);
      expect(url).toBe('regular-url');
    });
  });

  describe('getCredit', () => {
    it('should return correctly formatted credit string', () => {
      const credit = getCredit(mockPhoto);
      expect(credit).toBe('Photo by John Doe @johndoe');
    });
  });
});
