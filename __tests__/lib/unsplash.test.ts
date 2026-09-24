import { describe, it, expect } from 'vitest'
import { getInstagramUrl, UnsplashPhoto } from '@/lib/unsplash'

describe('unsplash', () => {
  describe('getInstagramUrl', () => {
    it('should return instagram url if instagram_username exists', () => {
      // Mock UnsplashPhoto object
      const mockPhoto = {
        id: '1',
        urls: {
          raw: '',
          full: '',
          regular: '',
          small: '',
          thumb: '',
        },
        alt_description: '',
        description: '',
        user: {
          name: 'Test User',
          username: 'testuser',
          social: {
            instagram_username: 'test_insta'
          }
        },
        likes: 0
      } as any as UnsplashPhoto;

      const url = getInstagramUrl(mockPhoto);
      expect(url).toBe('https://instagram.com/test_insta');
    })

    it('should return empty string if instagram_username does not exist', () => {
      // Mock UnsplashPhoto object without instagram_username
      const mockPhoto = {
        id: '1',
        urls: {
          raw: '',
          full: '',
          regular: '',
          small: '',
          thumb: '',
        },
        alt_description: '',
        description: '',
        user: {
          name: 'Test User',
          username: 'testuser',
          social: {
            instagram_username: null
          }
        },
        likes: 0
      } as any as UnsplashPhoto;

      const url = getInstagramUrl(mockPhoto);
      expect(url).toBe('');
    })

    it('should return empty string if social object does not exist', () => {
      // Mock UnsplashPhoto object without social object
      const mockPhoto = {
        id: '1',
        urls: {
          raw: '',
          full: '',
          regular: '',
          small: '',
          thumb: '',
        },
        alt_description: '',
        description: '',
        user: {
          name: 'Test User',
          username: 'testuser'
        },
        likes: 0
      } as any as UnsplashPhoto;

      const url = getInstagramUrl(mockPhoto);
      expect(url).toBe('');
    })
  })
})
