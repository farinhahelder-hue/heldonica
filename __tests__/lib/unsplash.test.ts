import { describe, it, expect } from 'vitest';
import { getCredit, UnsplashPhoto } from '../../lib/unsplash';

describe('unsplash', () => {
  describe('getCredit', () => {
    it('should return correctly formatted credit string with user name', () => {
      const mockPhoto = {
        id: '123',
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
          name: 'Jane Doe',
          username: 'janedoe',
        },
        likes: 10,
      } as UnsplashPhoto;

      const result = getCredit(mockPhoto);
      expect(result).toBe('Photo de Jane Doe sur Unsplash');
    });

    it('should handle names with special characters', () => {
      const mockPhoto = {
        id: '124',
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
          name: 'Jean-Luc Picard',
          username: 'jlp',
        },
        likes: 42,
      } as UnsplashPhoto;

      const result = getCredit(mockPhoto);
      expect(result).toBe('Photo de Jean-Luc Picard sur Unsplash');
    });

    it('should handle names with accented characters', () => {
      const mockPhoto = {
        id: '125',
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
          name: 'Amélie Poulain',
          username: 'amelie',
        },
        likes: 100,
      } as UnsplashPhoto;

      const result = getCredit(mockPhoto);
      expect(result).toBe('Photo de Amélie Poulain sur Unsplash');
    });

    it('should handle empty name strings', () => {
      const mockPhoto = {
        id: '126',
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
          name: '',
          username: 'unknown',
        },
        likes: 0,
      } as UnsplashPhoto;

      const result = getCredit(mockPhoto);
      expect(result).toBe('Photo de  sur Unsplash');
    });
  });
});
